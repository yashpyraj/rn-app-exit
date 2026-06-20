#import "AppExit.h"
#import <UIKit/UIKit.h>

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
// Uses UIApplication's "suspend" selector, which is the same action triggered
// when the user presses the Home button. This is not a documented public API,
// but has been stable across iOS versions and doesn't risk App Store rejection
// the same way exit() does.
RCT_EXPORT_METHOD(sendToBackground) {
  dispatch_async(dispatch_get_main_queue(), ^{
    UIApplication *app = [UIApplication sharedApplication];
    [app performSelector:@selector(suspend)];
  });
}


@end
