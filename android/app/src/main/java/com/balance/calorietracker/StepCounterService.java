package com.balance.calorietracker;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Keeps counting steps for as long as Android allows the process to live, including while the
 * app itself is backgrounded or the screen is off. This is the piece a plain web app / PWA can
 * never do — it only works here because it's real native code registered as a foreground service
 * reading the phone's low-power hardware step-counter sensor (Sensor.TYPE_STEP_COUNTER).
 *
 * Persisted state lives in SharedPreferences so the Capacitor plugin (and thus the web UI) can
 * read the latest total at any time without needing to bind to this service.
 */
public class StepCounterService extends Service implements SensorEventListener {

    public static final String PREFS_NAME = "pedometer_prefs";
    public static final String KEY_TODAY_STEPS = "today_steps";
    public static final String KEY_TODAY_WALK_MS = "today_walk_ms";
    public static final String KEY_TODAY_DATE = "today_date";
    public static final String KEY_LAST_RAW_VALUE = "last_raw_value";
    public static final String KEY_ENABLED = "pedometer_enabled"; // persisted so BootReceiver knows whether to auto-resume
    public static final String CHANNEL_ID = "pedometer_channel";
    public static final int NOTIFICATION_ID = 4241;
    public static final String ACTION_STOP = "com.balance.calorietracker.STOP_PEDOMETER";

    public static volatile boolean isServiceRunning = false;

    public static String dayKey() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    /** Never repaint the notification more often than this — one update per second is as
     *  fast as a human can read it, and faster than that just burns battery on binder calls. */
    private static final long MIN_NOTIFY_INTERVAL_MS = 1000L;

    /**
     * Шаги дальше этого промежутка друг от друга — уже не одна прогулка, а две.
     * Пауза длиннее десяти секунд во время ходьбы человеком не ощущается как ходьба,
     * поэтому такой разрыв во «время в движении» не засчитывается.
     */
    private static final long MAX_STEP_GAP_MS = 10_000L;

    private SharedPreferences prefs;
    private SensorManager sensorManager;
    private Sensor stepSensor;      // TYPE_STEP_COUNTER — cumulative since boot, authoritative
    private Sensor stepDetector;    // TYPE_STEP_DETECTOR — one event per step, delivered immediately
    private final Handler handler = new Handler(Looper.getMainLooper());
    private long lastNotifyAt = 0L;
    private int lastNotifiedSteps = -1;
    private boolean notifyScheduled = false;
    /** Steps already added from the detector that the next counter reading will also include. */
    private int detectorStepsSinceCounter = 0;
    /** Когда пришёл предыдущий шаг — из него складывается время в движении. */
    private long lastStepAt = 0L;

    @Override
    public void onCreate() {
        super.onCreate();
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
            stepDetector = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);
        }
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(@Nullable Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            prefs.edit().putBoolean(KEY_ENABLED, false).apply();
            stopSelf();
            return START_NOT_STICKY;
        }

        prefs.edit().putBoolean(KEY_ENABLED, true).apply();
        isServiceRunning = true;
        Notification notification = buildNotification(currentTodaySteps());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        if (stepSensor == null) {
            // No hardware step-counter on this device — nothing more we can do natively either.
            stopSelf();
            return START_NOT_STICKY;
        }

        // Two things used to make the number in the notification shade lag behind real walking:
        //
        //  1. SENSOR_DELAY_NORMAL let the sensor hub *batch* readings. The hardware step counter
        //     is a low-power chip that happily buffers events for seconds (or minutes with the
        //     screen off) before waking the CPU. The 4-argument overload sets maxReportLatencyUs
        //     explicitly to 0, which means "deliver as it happens, do not batch".
        //
        //  2. TYPE_STEP_COUNTER itself is an on-change sensor that many phones only refresh in
        //     chunks of several steps. TYPE_STEP_DETECTOR fires once per step with no buffering,
        //     so it is registered alongside purely to move the number forward immediately; the
        //     counter still reconciles the running total (see onSensorChanged).
        sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_FASTEST, 0);
        if (stepDetector != null) {
            sensorManager.registerListener(this, stepDetector, SensorManager.SENSOR_DELAY_FASTEST, 0);
        }

        // START_STICKY: if Android kills this process under memory pressure, it will try to
        // recreate and restart the service automatically (with a null intent) shortly after.
        return START_STICKY;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event == null) return;
        if (event.sensor.getType() == Sensor.TYPE_STEP_DETECTOR) {
            onStepDetected();
            return;
        }
        if (event.sensor.getType() != Sensor.TYPE_STEP_COUNTER) return;
        int rawValue = (int) event.values[0];

        rolloverIfNewDay();

        int lastRaw = prefs.getInt(KEY_LAST_RAW_VALUE, -1);
        int todaySteps = prefs.getInt(KEY_TODAY_STEPS, 0);

        if (lastRaw < 0) {
            // First reading we've ever seen (fresh install, or sensor baseline unknown yet) —
            // don't count a huge delta, just establish the baseline from here.
        } else {
            int delta = rawValue - lastRaw;
            if (delta > 0) {
                // The detector may already have credited some of these steps a moment ago —
                // count only what is left over, so a step is never counted twice.
                int alreadyCounted = Math.min(detectorStepsSinceCounter, delta);
                todaySteps += delta - alreadyCounted;
            } else if (delta < 0) {
                // Sensor value went backwards -> the device rebooted and the hardware counter
                // reset to zero. Whatever the new raw value is IS the step count since reboot.
                todaySteps += rawValue;
            }
        }

        detectorStepsSinceCounter = 0;
        prefs.edit()
                .putInt(KEY_TODAY_STEPS, todaySteps)
                .putInt(KEY_LAST_RAW_VALUE, rawValue)
                .apply();

        accumulateWalkTime();
        updateNotification(todaySteps);
    }

    /**
     * A single step, reported the instant it happens. Credits it right away so the shade shows
     * the new number immediately; the cumulative counter reconciles the total when it catches up.
     */
    private void onStepDetected() {
        rolloverIfNewDay();
        int todaySteps = prefs.getInt(KEY_TODAY_STEPS, 0) + 1;
        detectorStepsSinceCounter++;
        prefs.edit().putInt(KEY_TODAY_STEPS, todaySteps).apply();
        accumulateWalkTime();
        updateNotification(todaySteps);
    }

    /**
     * Копит время в движении: промежуток между двумя соседними шагами и есть время ходьбы,
     * если он достаточно короткий. Так минуты получаются из самих шагов, без отдельного
     * датчика и без таймера, который пришлось бы будить каждую минуту.
     */
    private void accumulateWalkTime() {
        long now = SystemClock.elapsedRealtime();
        if (lastStepAt > 0) {
            long gap = now - lastStepAt;
            if (gap > 0 && gap <= MAX_STEP_GAP_MS) {
                prefs.edit().putLong(KEY_TODAY_WALK_MS, prefs.getLong(KEY_TODAY_WALK_MS, 0L) + gap).apply();
            }
        }
        lastStepAt = now;
    }

    /**
     * Repaints the notification straight away, but at most once a second: a burst of steps
     * schedules a single trailing update instead of one binder call per step.
     */
    private void updateNotification(final int steps) {
        if (steps == lastNotifiedSteps) return;
        long now = SystemClock.elapsedRealtime();
        long sinceLast = now - lastNotifyAt;
        if (sinceLast >= MIN_NOTIFY_INTERVAL_MS) {
            notifyNow(steps);
        } else if (!notifyScheduled) {
            notifyScheduled = true;
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    notifyScheduled = false;
                    notifyNow(prefs.getInt(KEY_TODAY_STEPS, steps));
                }
            }, MIN_NOTIFY_INTERVAL_MS - sinceLast);
        }
    }

    private void notifyNow(int steps) {
        lastNotifyAt = SystemClock.elapsedRealtime();
        lastNotifiedSteps = steps;
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NOTIFICATION_ID, buildNotification(steps));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    private void rolloverIfNewDay() {
        String storedDay = prefs.getString(KEY_TODAY_DATE, null);
        String today = dayKey();
        if (!today.equals(storedDay)) {
            detectorStepsSinceCounter = 0;
            lastStepAt = 0L;
            prefs.edit()
                    .putString(KEY_TODAY_DATE, today)
                    .putInt(KEY_TODAY_STEPS, 0)
                    .putLong(KEY_TODAY_WALK_MS, 0L)
                    // Deliberately keep KEY_LAST_RAW_VALUE as-is: the hardware counter is cumulative
                    // since boot, so tomorrow's delta is still measured from today's last raw value.
                    .apply();
        }
    }

    private int currentTodaySteps() {
        rolloverIfNewDay();
        return prefs.getInt(KEY_TODAY_STEPS, 0);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Шагомер", NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Фоновый подсчёт шагов");
            channel.setShowBadge(false);
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification(int steps) {
        Intent openAppIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent contentPendingIntent = PendingIntent.getActivity(
                this, 0, openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent stopIntent = new Intent(this, StepCounterService.class).setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(
                this, 0, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Баланс — считаем шаги")
                .setContentText("Сегодня: " + steps + " шагов")
                .setSmallIcon(getApplicationInfo().icon)
                .setContentIntent(contentPendingIntent)
                .addAction(0, "Остановить", stopPendingIntent)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();
    }

    @Override
    public void onDestroy() {
        isServiceRunning = false;
        handler.removeCallbacksAndMessages(null);
        if (sensorManager != null) sensorManager.unregisterListener(this);
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
