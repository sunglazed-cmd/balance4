/**
 * Types for the custom Capacitor plugin that lives in
 * android/app/src/main/java/com/balance/calorietracker/PedometerPlugin.java.
 *
 * The bridge is injected into the WebView by the native shell at runtime, so it appears as
 * `window.Capacitor` rather than an npm import — declaring it here is what lets TypeScript
 * check these calls instead of trusting them. Keep the signatures in step with the @PluginMethod
 * methods on the Java side.
 */
export {};

interface PedometerPlugin {
  /** Steps recorded by the hardware sensor for the current calendar day (0 if the service hasn't run today). */
  getSteps(): Promise<{ steps: number; date: string }>;
  /** Starts the foreground service — keeps counting with the screen off or the app closed. */
  start(): Promise<void>;
  /** Stops the foreground service and dismisses its notification. */
  stop(): Promise<void>;
  /** Is the foreground service alive right now? */
  isRunning(): Promise<{ running: boolean }>;
  /** ACTIVITY_RECOGNITION (Android 10+) and POST_NOTIFICATIONS (Android 13+). */
  requestPermissions(): Promise<{ granted: boolean }>;
}

/** Встроенный плагин Capacitor: HTTP-запрос выполняет нативная часть, поэтому на него
 *  не распространяются CORS-правила WebView. */
interface CapacitorHttpPlugin {
  request(options: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    params?: Record<string, string>;
    /** Строка уходит в тело как есть; объект нативная часть кодирует сама. */
    data?: unknown;
    connectTimeout?: number;
    readTimeout?: number;
  }): Promise<{ status: number; data: unknown; headers: Record<string, string>; url: string }>;
}

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      Plugins?: { Pedometer?: PedometerPlugin; CapacitorHttp?: CapacitorHttpPlugin } & Record<string, unknown>;
    };
  }
}
