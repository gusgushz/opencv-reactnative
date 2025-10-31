package com.vifinsapublic

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.opencvwrapper.OpencvWrapperPackage
import com.opencvfunc.OpencvFuncPackage
import com.cameranative.CameraXPackage
import android.content.Intent
import android.os.Process
import android.util.Log
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import kotlin.system.exitProcess

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(OpencvWrapperPackage())
              add(OpencvFuncPackage())
              add(CameraXPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    setGlobalCrashHandler()
  }
  private fun setGlobalCrashHandler() {
    Thread.setDefaultUncaughtExceptionHandler { _, throwable ->
      Handler(Looper.getMainLooper()).post {
        Toast.makeText(applicationContext, "Error fatal: ${throwable.message}", Toast.LENGTH_SHORT).show()
      }

      val intent = Intent(applicationContext, MainActivity::class.java).apply {
        putExtra("isCrashed", true)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
      }
      startActivity(intent)

      Process.killProcess(Process.myPid())
      exitProcess(10)
    }
  }
}
