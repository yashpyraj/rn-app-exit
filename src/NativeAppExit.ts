import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Terminates the application process.
   * Android: kills the process via Process.killProcess.
   * iOS: calls exit(0). Note: Apple discourages this — avoid calling on iOS
   * if your app is on the App Store; prefer sendToBackground instead.
   */
  exitApp(): void;

  /**
   * Moves the app to the background without terminating the process.
   * Android: moveTaskToBack(true) — fully supported.
   * iOS: suspends the app via a private UIApplication selector — best effort.
   */
  sendToBackground(): void;

  /**
   * Returns compile-time constants about platform capabilities.
   */
  getConstants(): {
    /**
     * True where backgrounding uses a public, OS-sanctioned API (Android).
     * False on iOS, where it relies on a private selector — see the README.
     */
    isBackgroundSupported: boolean;
  };
}

// `get` rather than `getEnforcing`: this module resolves at import time, and
// throwing here would take down the whole bundle on any platform the native
// module is absent from (web, unsupported platforms, a build where autolinking
// did not run). Absence is reported at call time instead, with a fixable message.
export default TurboModuleRegistry.get<Spec>('AppExit');
