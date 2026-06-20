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
   * iOS: suspends the app via the UIApplication suspend selector — best effort.
   */
  sendToBackground(): void;

  /**
   * Returns compile-time constants about platform capabilities.
   */
  getConstants(): {
    /**
     * True on Android. iOS returns false because backgrounding is OS-controlled.
     */
    isBackgroundSupported: boolean;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('AppExit');
