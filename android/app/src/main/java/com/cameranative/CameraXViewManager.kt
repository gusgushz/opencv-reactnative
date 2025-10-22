package com.cameranative

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class CameraXViewManager(
    private val reactContext: ReactApplicationContext
) : SimpleViewManager<CameraXView>() {

    override fun getName(): String = "CameraXView"

    override fun createViewInstance(reactContext: ThemedReactContext): CameraXView {
        return CameraXView(reactContext)
    }

    override fun onDropViewInstance(view: CameraXView) {
        super.onDropViewInstance(view)
        view.closeCamera()
    }
}
