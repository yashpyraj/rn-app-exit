import { Platform } from 'react-native';
import NativeAppExit from './NativeAppExit';
import type { Spec } from './NativeAppExit';

export type AppExitOptions = {
  /**
   * When true, moves the app to background instead of terminating.
   * On iOS this suspends the app; on Android it calls moveTaskToBack.
   * Defaults to false (full exit).
   */
  background?: boolean;
};

const LINKING_ERROR =
  "The native module for 'rn-app-exit' could not be found. Make sure:\n\n" +
  Platform.select({
    ios: "  - you ran 'pod install' in the ios/ directory\n",
    android: '  - the Android build completed after installing the package\n',
    default: `  - 'rn-app-exit' supports iOS and Android; the current platform is '${Platform.OS}'\n`,
  }) +
  '  - you rebuilt the app (a Metro reload is not enough for native changes)\n' +
  '  - you are not running in Expo Go, which cannot load custom native modules';

/** Platforms with a native implementation of this module. */
const SUPPORTED_PLATFORMS = ['ios', 'android'];

const isSupportedPlatform = (): boolean =>
  SUPPORTED_PLATFORMS.includes(Platform.OS);

function requireNative(): Spec {
  if (!NativeAppExit) {
    throw new Error(LINKING_ERROR);
  }
  return NativeAppExit;
}

function warnUnsupported(method: string): void {
  if (__DEV__) {
    console.warn(
      `[rn-app-exit] ${method}() was called on '${Platform.OS}', which has no ` +
        'native implementation. This is a no-op. Guard the call with ' +
        'Platform.OS checks, or with AppExit.isAvailable.',
    );
  }
}

const AppExit = {
  /**
   * Whether the native module resolved on this platform.
   *
   * Use this to branch instead of try/catch — it never throws, and is false
   * on web, in Expo Go, and in builds where the native side was not rebuilt.
   */
  get isAvailable(): boolean {
    return NativeAppExit != null;
  },

  /**
   * True on Android, where moveTaskToBack is a public, first-class OS feature.
   *
   * False on iOS: sendToBackground() there relies on a *private* UIApplication
   * selector. It does work, but it is not a sanctioned API — see the README
   * before shipping it to the App Store.
   *
   * False on any platform where the native module is unavailable.
   */
  get isBackgroundSupported(): boolean {
    return NativeAppExit?.getConstants().isBackgroundSupported ?? false;
  },

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
   *
   * @throws if the native module is unavailable — check `isAvailable` first.
   */
  exitApp(): void {
    if (!isSupportedPlatform()) {
      warnUnsupported('exitApp');
      return;
    }
    requireNative().exitApp();
  },

  /**
   * Move the app to the background without terminating the process.
   *
   * Android: moveTaskToBack(true) — public API, reliable.
   * iOS: best-effort suspend via a private UIApplication selector.
   *
   * @throws if the native module is unavailable — check `isAvailable` first.
   */
  sendToBackground(): void {
    if (!isSupportedPlatform()) {
      warnUnsupported('sendToBackground');
      return;
    }
    requireNative().sendToBackground();
  },
};

export { AppExit };
export default AppExit;
