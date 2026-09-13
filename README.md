# rn-app-exit

> Exit or background your React Native app — with full **New Architecture (TurboModules)** support, written in **Kotlin** and **Objective-C++**.

[![CI](https://github.com/yashpyraj/rn-app-exit/actions/workflows/ci.yml/badge.svg)](https://github.com/yashpyraj/rn-app-exit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/rn-app-exit.svg)](https://www.npmjs.com/package/rn-app-exit)
[![npm downloads](https://img.shields.io/npm/dm/rn-app-exit.svg)](https://www.npmjs.com/package/rn-app-exit)
[![license](https://img.shields.io/npm/l/rn-app-exit.svg)](LICENSE)
[![platform](https://img.shields.io/badge/platform-android%20%7C%20ios-lightgrey.svg)](https://reactnative.dev)

---

## Why this package?

Most apps eventually need one of two things:

- **Hard exit** — a logout button, a kiosk reset, a session wipe that kills the process
- **Background** — a "minimize" button, a back-to-home UX without killing the process

The original `react-native-exit-app` only does the first, is written in Java/Objective-C, has no TurboModule support, and hasn't been maintained since 2021. This package does both, properly.

---

## Features

| | react-native-exit-app | **rn-app-exit** |
|---|---|---|
| Exit app | ✅ | ✅ |
| Send to background | ❌ | ✅ |
| Unified API | ❌ | ✅ |
| Capability flags | ❌ | ✅ |
| New Architecture (TurboModules) | ❌ | ✅ |
| Old Architecture | ✅ | ✅ |
| Language | Java / ObjC | **Kotlin / ObjC++** |
| Active maintenance | ❌ (2021) | ✅ |
| Min React Native | 0.60 | 0.68 |

---

## Installation

```sh
npm install rn-app-exit
```

### iOS

```sh
cd ios && pod install
```

### Android

No additional steps — auto-linked via React Native's autolinking.

---

## Usage

```tsx
import AppExit from 'rn-app-exit';
```

### Hard exit (kill the process)

```tsx
AppExit.exitApp();
```

Terminates the app process immediately. The app is removed from recents on Android. On iOS, use this only for non-App-Store builds (kiosks, enterprise, dev tooling) — Apple's HIG discourages `exit()` in consumer App Store apps.

### Send to background (keep process alive)

```tsx
AppExit.sendToBackground();
```

Moves the app to the background without terminating. The process stays alive in memory — the user can resume from the app switcher exactly where they left off.

- **Android**: calls `moveTaskToBack(true)` — native OS feature, fully reliable
- **iOS**: suspends via a **private** `UIApplication` selector — works on current iOS versions, but is not public API (see [iOS notes](#ios))

### Unified API

```tsx
// Hard exit (default)
AppExit.exit();

// Background instead of kill
AppExit.exit({ background: true });
```

The `exit()` method is the recommended API for most use cases. Pass `{ background: true }` to move to background instead of killing.

### Check capability at runtime

```tsx
// Is the native module linked at all? False on web, in Expo Go, or when the
// app was not rebuilt after install. Never throws.
if (!AppExit.isAvailable) return;

if (AppExit.isBackgroundSupported) {
  // Android — public OS API, reliable.
  AppExit.sendToBackground();
} else {
  // iOS — sendToBackground() still works, but via private API. Decide
  // explicitly whether you want that in a store build.
  AppExit.sendToBackground();
}
```

`isBackgroundSupported` answers *"is this a sanctioned API here?"*, not *"will the call do something?"* — on iOS it is `false` and the call still works.

---

## API Reference

### `AppExit.exit(options?)`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `options.background` | `boolean` | `false` | When `true`, sends to background instead of killing |

### `AppExit.exitApp()`

Kills the process.

| Platform | Implementation |
|---|---|
| Android | `activity.finish()` + `Process.killProcess(myPid())` |
| iOS | `exit(0)` |

> **iOS warning:** Apple's App Store review guidelines discourage programmatic exit. Prefer `sendToBackground()` in consumer iOS apps.

### `AppExit.sendToBackground()`

Moves the app to the background without terminating the process.

| Platform | Implementation |
|---|---|
| Android | `activity.moveTaskToBack(true)` |
| iOS | `UIApplication` suspend selector |

### `AppExit.isAvailable`

`boolean` — whether the native module resolved. `false` on web, in Expo Go, or in a build where the native side was not rebuilt. Reading it never throws, so it is safe to branch on before any other call.

### `AppExit.isBackgroundSupported`

`boolean` — `true` on Android, `false` on iOS and wherever the module is unavailable.

On Android, `moveTaskToBack` is a first-class OS feature. On iOS, backgrounding is managed by the OS and there is no public API — the package uses a best-effort approach that works on current iOS versions but is not a documented public API.

---

## TypeScript

Full TypeScript support is included. The exported types are:

```ts
type AppExitOptions = {
  background?: boolean;
};
```

The `Spec` interface for the native module is also exported from `rn-app-exit/src/NativeAppExit` if you need it.

---

## Platform notes

### Android

All three methods work as expected on Android API 21+. `sendToBackground()` behaves exactly like pressing the Home button — the task moves to the back stack and the process continues running.

### iOS

Apple does not provide a public API for programmatic backgrounding or exit in App Store apps. This package provides:

- `exitApp()` via `exit(0)` — works, but risks App Store rejection for consumer apps. Safe for enterprise/kiosk/dev builds.
- `sendToBackground()` via a **private** `UIApplication` selector. It has been stable across iOS releases, but it is not in the public headers, Apple does not guarantee it, and private-API use can itself be grounds for rejection. The call is guarded with `respondsToSelector:` and no-ops with a warning if the selector ever disappears. Treat this as a deliberate trade-off, not a safe default.

For App Store consumer apps, the recommended pattern is:

```tsx
// Show a "goodbye" screen or navigate home, then suspend
AppExit.sendToBackground();
```

---

## New Architecture

This package works on both architectures with no extra configuration. The JavaScript spec in `src/NativeAppExit.ts` drives React Native's codegen.

The two platforms get there differently, and it is worth being precise:

| Platform | Old Architecture | New Architecture |
|---|---|---|
| **Android** | `ReactContextBaseJavaModule` (`src/oldarch`) | codegen-generated TurboModule spec (`src/newarch`), selected by the `IS_NEW_ARCHITECTURE_ENABLED` build flag |
| **iOS** | `RCTBridgeModule` | the same `RCTBridgeModule`, run through React Native's **interop layer** |

So Android is a native TurboModule under the New Architecture; iOS is a bridge module that the New Architecture hosts via interop. Both work, and the JS API is identical — but iOS does not currently implement the codegen-generated ObjC++ spec directly. Contributions welcome.

---

## Common use cases

**Logout button that wipes state and exits:**
```tsx
async function handleLogout() {
  await clearUserSession();
  AppExit.exitApp();
}
```

**Kiosk reset button:**
```tsx
function KioskResetButton() {
  return (
    <Pressable onPress={() => AppExit.exit()}>
      <Text>Reset Kiosk</Text>
    </Pressable>
  );
}
```

**Minimize button (Android UX pattern):**
```tsx
function MinimizeButton() {
  return (
    <Pressable onPress={() => AppExit.sendToBackground()}>
      <Text>Go to Home</Text>
    </Pressable>
  );
}
```

**Hardware back button on Android to background instead of exit:**
```tsx
import { BackHandler } from 'react-native';

useEffect(() => {
  const sub = BackHandler.addEventListener('hardwareBackPress', () => {
    AppExit.sendToBackground();
    return true; // prevent default back behavior
  });
  return () => sub.remove();
}, []);
```

---

## License

MIT © 2025 pixelcube

---

## Contributing

Issues and PRs welcome at [github.com/yashpyraj/rn-app-exit](https://github.com/yashpyraj/rn-app-exit).
