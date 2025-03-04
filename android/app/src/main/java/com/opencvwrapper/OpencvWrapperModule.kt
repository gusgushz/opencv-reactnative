package com.opencvwrapper

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

import android.util.Log

import org.opencv.android.OpenCVLoader

class OpencvWrapperModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
    init {
    if (!OpenCVLoader.initLocal()) { // Inicializar OpenCV
      Log.e("OpenCVgus", "Unable to load OpenCV!")  
    } else {
      Log.d("OpenCVgus", "OpenCV loaded Successfully!")
    }
  }
  override fun getName(): String {
    return NAME
  }
  companion object {
    const val NAME = "OpencvWrapper"
  }
  @ReactMethod
  fun getOpenCVVersion(promise: Promise) {
    try{
      promise.resolve("OpenCV Version 4.11.0")
    } catch (e: Exception) {
      promise.reject("Error", e)
    }
  }
}