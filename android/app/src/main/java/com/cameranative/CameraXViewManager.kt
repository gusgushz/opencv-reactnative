package com.cameranative

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.cameranative.CameraXView

class CameraXViewManager : SimpleViewManager<CameraXView>() {

    override fun getName() = "CameraXView"

    override fun createViewInstance(reactContext: ThemedReactContext): CameraXView {
        return CameraXView(reactContext)
    }
}
