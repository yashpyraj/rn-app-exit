package com.appexitlib

import com.facebook.react.bridge.ReactApplicationContext

// New Architecture: extends the codegen-generated TurboModule spec.
// The codegen reads src/NativeAppExit.ts and produces RNAppExitSpec.
// This class bridges our module to that generated spec.
abstract class NativeAppExitSpec(context: ReactApplicationContext) :
  com.appexitlib.NativeRNAppExitSpec(context)
