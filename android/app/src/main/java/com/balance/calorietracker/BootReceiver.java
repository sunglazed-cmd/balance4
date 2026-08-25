package com.balance.calorietracker;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

/**
 * If the pedometer was running when the phone was last shut down/rebooted, restart the
 * foreground service automatically once the device boots back up — without the person needing
 * to open the app at all. This is the piece that makes background tracking survive a restart,
 * which is simply not achievable from a web app.
 */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;

        SharedPreferences prefs = context.getSharedPreferences(StepCounterService.PREFS_NAME, Context.MODE_PRIVATE);
        boolean wasEnabled = prefs.getBoolean(StepCounterService.KEY_ENABLED, false);
        if (!wasEnabled) return;

        Intent serviceIntent = new Intent(context, StepCounterService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
