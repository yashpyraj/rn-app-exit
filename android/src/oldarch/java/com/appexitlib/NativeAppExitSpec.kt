package com.appexitlib

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

// Old Architecture: a plain ReactContextBaseJavaModule with the same abstract
// interface so AppExitModule compiles identically in both architectures.
abstract class NativeAppExitSpec(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  abstract fun exitApp()
  abstract fun sendToBackground()
  abstract override fun getConstants(): Map<String, Any>?
}
