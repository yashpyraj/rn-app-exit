package com.appexitlib

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

// TurboReactPackage works for both Old and New Architecture:
// - Old arch: uses the standard module registry
// - New arch: provides TurboModule instances via JSI
class AppExitPackage : TurboReactPackage() {

  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? =
    if (name == AppExitModule.NAME) AppExitModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    mapOf(
      AppExitModule.NAME to ReactModuleInfo(
        _name = AppExitModule.NAME,
        _className = AppExitModule.NAME,
        _canOverrideExistingModule = false,
        _needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      )
    )
  }
}
