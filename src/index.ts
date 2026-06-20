import { Platform } from 'react-native';
import NativeAppExit from './NativeAppExit';

export type AppExitOptions = {
  /**
   * When true, moves the app to background instead of terminating.
   * On iOS this suspends the app; on Android it calls moveTaskToBack.
   * Defaults to false (full exit).
   */
  background?: boolean;
};

const constants = NativeAppExit.getConstants();

const AppExit = {
  /**
   * True on Android where moveTaskToBack is a first-class OS feature.
   * False on iOS — Apple controls backgrounding; there is no public API.
   */
  isBackgroundSupported: constants.isBackgroundSupported,

  /**
   * Exit or background the app.
   *
   * @example
   * // Hard exit
   * AppExit.exit();
   *
   * @example
   * // Send to background instead of killing
   * AppExit.exit({ background: true });
   */
  exit(options: AppExitOptions = {}): void {
    if (options.background) {
      AppExit.sendToBackground();
    } else {
      AppExit.exitApp();
    }
  },

  /**
   * Terminate the app process immediately.
   *
   * iOS warning: Apple guidelines discourage calling exit() from production
   * apps distributed via the App Store. Prefer sendToBackground() on iOS.
   */
  exitApp(): void {
    NativeAppExit.exitApp();
  },

  /**
   * Move the app to the background without terminating the process.
   *
   * Android: moveTaskToBack(true) — native and reliable.
   * iOS: best-effort suspend via UIApplication private selector.
   *      Not guaranteed to work across all iOS versions.
   */
  sendToBackground(): void {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      NativeAppExit.sendToBackground();
    }
  },
};

export { AppExit };
export default AppExit;
