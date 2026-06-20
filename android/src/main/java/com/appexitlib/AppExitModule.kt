package com.appexitlib

import android.os.Process
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = AppExitModule.NAME)
class AppExitModule(reactContext: ReactApplicationContext) : NativeAppExitSpec(reactContext) {

  override fun getName(): String = NAME

  override fun getConstants(): Map<String, Any> = mapOf(
    "isBackgroundSupported" to true
  )

  override fun exitApp() {
    // Finish the current activity first so the OS doesn't relaunch it,
    // then kill the process to ensure a clean exit on all Android versions.
    currentActivity?.finish()
    Process.killProcess(Process.myPid())
  }

  override fun sendToBackground() {
    // moveTaskToBack moves the entire task (all activities in the back stack)
    // to the background. The process lives on — the user can resume from recents.
    currentActivity?.moveTaskToBack(true)
  }

  companion object {
    const val NAME = "AppExit"
  }
}
