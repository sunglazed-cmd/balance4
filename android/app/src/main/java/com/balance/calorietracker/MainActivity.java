package com.balance.calorietracker;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PedometerPlugin.class);
        super.onCreate(savedInstanceState);

        // Deliberately no window-inset handling here.
        //
        // Android 15 (targetSdk 35+) draws the app edge-to-edge, behind the status and gesture
        // bars. Capacitor 8 already handles that in its built-in SystemBars plugin: it puts the
        // inset listener on the WebView's *parent* and hands the page the real values as the CSS
        // variables --safe-area-inset-top/right/bottom/left, which index.html uses for its padding.
        //
        // The earlier version of this file set the listener on the WebView itself and called
        // setPadding() on it. That is what killed vertical scrolling: padding a WebView shrinks
        // the area it draws into without extending its scroll range, so the page was clipped at
        // both ends with no way to reach the rest of it.
    }
}
