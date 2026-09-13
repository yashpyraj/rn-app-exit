#import "AppExit.h"
#import <UIKit/UIKit.h>
#import <React/RCTLog.h>
#import <objc/message.h>

@implementation AppExit

RCT_EXPORT_MODULE(AppExit)

// Expose compile-time constants to JS so callers can branch without platform checks.
- (NSDictionary *)constantsToExport {
  return @{
    // iOS does not have a public OS-level background API, so we surface this as false.
    // sendToBackground uses a best-effort private UIApplication selector that works
    // on current iOS versions but is not App Store guaranteed.
    @"isBackgroundSupported": @NO
  };
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

// Terminate the process.
// Apple's HIG recommends against calling exit() in App Store apps — iOS is designed
// to handle app lifecycle automatically. Prefer sendToBackground() in production.
// This exists for developer tooling, kiosks, or enterprise apps where hard exit is valid.
RCT_EXPORT_METHOD(exitApp) {
  dispatch_async(dispatch_get_main_queue(), ^{
    exit(0);
  });
}

// Suspend the app by sending it to the background.
// Uses UIApplication's "suspend" selector — the same action the Home button
// triggers. This is PRIVATE API: it is not in the public headers, Apple does
// not guarantee it across iOS versions, and using it can be grounds for App
// Store rejection. It is guarded and logged rather than assumed to work.
// See the README before shipping this path in a store build.
RCT_EXPORT_METHOD(sendToBackground) {
  dispatch_async(dispatch_get_main_queue(), ^{
    UIApplication *app = [UIApplication sharedApplication];

    // Resolved at runtime rather than with @selector(), which would raise
    // -Wundeclared-selector for a symbol that is not in the public headers.
    SEL suspendSelector = NSSelectorFromString(@"suspend");

    // Guard the call: `suspend` is private API and is not contractually
    // stable. If a future iOS drops it, no-op rather than crash the host app.
    if (![app respondsToSelector:suspendSelector]) {
      RCTLogWarn(@"[rn-app-exit] sendToBackground is unavailable on this iOS "
                  "version; the call was a no-op.");
      return;
    }

    // Cast to a typed function pointer instead of -performSelector:, which
    // leaks under ARC when the return type is unknown.
    ((void (*)(id, SEL))objc_msgSend)(app, suspendSelector);
  });
}


@end
