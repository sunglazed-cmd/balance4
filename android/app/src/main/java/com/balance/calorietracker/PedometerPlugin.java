package com.balance.calorietracker;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;
import java.util.List;

/**
 * Bridges the web app (index.html) to the native background step counter.
 *
 * JS side usage (once running inside the Capacitor shell — see the isNativePlatform() check
 * added to the web app):
 *   const { Pedometer } = window.Capacitor.Plugins;
 *   await Pedometer.requestPermissions();
 *   await Pedometer.start();
 *   const { steps } = await Pedometer.getSteps();
 *   await Pedometer.stop();
 */
@CapacitorPlugin(
        name = "Pedometer",
        permissions = {
                @Permission(strings = { Manifest.permission.ACTIVITY_RECOGNITION }, alias = "activity"),
                @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications")
        }
)
public class PedometerPlugin extends Plugin {

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(StepCounterService.PREFS_NAME, Context.MODE_PRIVATE);
    }

    @PluginMethod
    @Override
    public void requestPermissions(PluginCall call) {
        List<String> needed = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) needed.add("activity");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) needed.add("notifications");

        if (needed.isEmpty()) {
            // Older Android versions don't gate the step-counter sensor behind a runtime permission.
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        requestPermissionForAliases(needed.toArray(new String[0]), call, "permissionCallback");
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        boolean activityOk = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
                || getPermissionState("activity") == PermissionState.GRANTED;
        boolean notifOk = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
                || getPermissionState("notifications") == PermissionState.GRANTED;

        JSObject result = new JSObject();
        result.put("granted", activityOk && notifOk);
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        Intent intent = new Intent(getContext(), StepCounterService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Intent intent = new Intent(getContext(), StepCounterService.class);
        intent.setAction(StepCounterService.ACTION_STOP);
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void getSteps(PluginCall call) {
        String today = StepCounterService.dayKey();
        String storedDay = prefs().getString(StepCounterService.KEY_TODAY_DATE, null);
        // If the service hasn't run yet today (fresh install, or app opened before the service's
        // own day-rollover check fires), report 0 for today rather than yesterday's stale total.
        int steps = today.equals(storedDay) ? prefs().getInt(StepCounterService.KEY_TODAY_STEPS, 0) : 0;

        JSObject result = new JSObject();
        result.put("steps", steps);
        result.put("date", today);
        call.resolve(result);
    }

    @PluginMethod
    public void isRunning(PluginCall call) {
        JSObject result = new JSObject();
        result.put("running", StepCounterService.isServiceRunning);
        call.resolve(result);
    }
}
