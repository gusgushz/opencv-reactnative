package com.vifinsapublic

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle;
import com.zoontek.rnbootsplash.RNBootSplash

import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactInstanceManager
import android.util.Log

import android.app.Activity
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "testDoc"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootTheme) // ⬅️ initialize the splash screen
    super.onCreate(savedInstanceState) // super.onCreate(null) with react-native-screens
  }
  /**
   * Se llama cuando la app es eliminada del background (por MIUI, Android, etc.)
   * Aquí reprogramamos el reinicio automático.
   */
  fun onTaskRemoved(rootIntent: Intent?) {
    try {
      Log.w("MainActivity", "App eliminada del background — reiniciando")

      val restartIntent = Intent(applicationContext, MainActivity::class.java)
      restartIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

      val pendingIntent = PendingIntent.getActivity(
        applicationContext,
        0,
        restartIntent,
        PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
      )

      val alarmManager = applicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      alarmManager.set(
        AlarmManager.RTC,
        System.currentTimeMillis() + 500,
        pendingIntent
      )
    } catch (e: Exception) {
      Log.e("MainActivity", "Error al reiniciar la app: ${e.message}")
    }
  }
}
