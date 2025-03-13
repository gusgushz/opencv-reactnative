package com.opencvwrapper

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

//Imports para ver el listado de IDs de las camaras
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import android.hardware.camera2.CameraManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraAccessException
import android.content.res.Resources

import android.util.Log
import kotlinx.coroutines.*
// import android.util.Base64
// import android.graphics.Bitmap
// import android.graphics.BitmapFactory

import org.opencv.android.OpenCVLoader
import org.opencv.android.CameraActivity
import org.opencv.android.CameraBridgeViewBase
import org.opencv.android.JavaCameraView
import org.opencv.core.Mat
import org.opencv.core.Core
import org.opencv.core.CvType
import org.opencv.core.MatOfDouble
import org.opencv.core.MatOfPoint
import org.opencv.core.MatOfPoint2f
import org.opencv.core.Scalar
import org.opencv.core.Point
import org.opencv.core.Size
import org.opencv.imgproc.Imgproc
import org.opencv.imgproc.Moments
// import org.opencv.android.Utils
import org.opencv.objdetect.GraphicalCodeDetector
import org.opencv.objdetect.QRCodeDetector
import org.opencv.objdetect.QRCodeDetectorAruco

import java.io.FileNotFoundException

import android.view.View
import android.widget.FrameLayout
import android.view.ViewGroup
import android.view.ViewTreeObserver
import android.view.Gravity

class OpencvWrapperModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), CameraBridgeViewBase.CvCameraViewListener2 {

    private var mOpenCvCameraView: JavaCameraView? = null
    private var cameraContainer: FrameLayout? = null
    private var overlayViewTop: View? = null
    private var overlayViewBottom: View? = null
    private var overlayViewLeft: View? = null
    private var overlayViewRight: View? = null
    private var frameCounter = 0
    private var mark = 0
    private var border = -1
    private var marker = -1
    private var orientation = 0
    private var codeDetected = false
    
    private lateinit var detector: GraphicalCodeDetector // Usa QRCodeDetectorAruco() si necesitas Aruco
    private val lineColor = Scalar(255.0, 0.0, 0.0) // Rojo
    private val fontColor = Scalar(0.0, 0.0, 255.0) // Azul

    private var info: String? = null

    init {
      if (!OpenCVLoader.initLocal()) { // Inicializar OpenCV
        Log.e("OpenCVgus", "Unable to load OpenCV!")  
      } else {
        Log.d("OpenCVgus", "OpenCV loaded Successfully!")
        detector = QRCodeDetector() // Inicializar el detector de códigos QR
      }
    }

  override fun getName(): String {
    return NAME
  }
  companion object {
    const val NAME = "OpenCVWrapper"
    const val HOLO_NORTH = 0
    const val HOLO_EAST = 1
    const val HOLO_WEST = 2
    const val HOLO_SOUTH = 3
  }

  @ReactMethod
  fun getOpenCVVersion(promise: Promise) {
    try{
      promise.resolve("OpenCV Version 4.11.0")
    } catch (e: Exception) {
      promise.reject("Error", e)
    }
  }

  @ReactMethod
  fun startCamera(promise: Promise) {
    try {
      if (currentActivity == null) {
        promise.reject("ActivityError", "No activity found")
        return
      }

      val width  = Resources.getSystem().getDisplayMetrics().widthPixels;
      val height = Resources.getSystem().getDisplayMetrics().heightPixels;
      val activity = currentActivity!!
      activity.runOnUiThread {
        Log.d("Cameragus", "Initializing camera view...")
        // Crear un FrameLayout como contenedor para la cámara
        cameraContainer = FrameLayout(activity).apply {
            layoutParams = ViewGroup.LayoutParams(
              ViewGroup.LayoutParams.MATCH_PARENT,
              ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        // Inicializar la vista de la cámara
        // -1 y 0 para la cámara trasera, 1 para la cámara frontal
        // Se usa el tamaño del dispositivo para la vista de la cámara
        mOpenCvCameraView = JavaCameraView(activity, -1).apply {
          visibility = CameraBridgeViewBase.VISIBLE
          setCvCameraViewListener(this@OpencvJavalibraryModule)
          layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          )
        }

        // Aplicar transformación de escala y rotación
        mOpenCvCameraView?.viewTreeObserver?.addOnGlobalLayoutListener {
            mOpenCvCameraView?.apply {
                scaleX = 1.5f    // Ajusta el escalado para llenar la pantalla
                scaleY = 1.5f
            }
        }
       
        // Agregar la vista de la cámara al contenedor
        cameraContainer?.addView(mOpenCvCameraView)

        // Crear la vista del overlay
        overlayViewTop = View(activity).apply {
            layoutParams = FrameLayout.LayoutParams(
                width, 
                height / 8, 
            ).apply {
                gravity = Gravity.END or Gravity.TOP // Posición en la esquina superior derecha
            }
            setBackgroundColor(0x80000000.toInt()) // Convertir a Int para evitar el error
        }
        // Agregar el overlay al contenedor
        cameraContainer?.addView(overlayViewTop)
        // Crear la vista del overlay
        overlayViewBottom = View(activity).apply {
            layoutParams = FrameLayout.LayoutParams(
                width, 
                height / 8, 
            ).apply {
                gravity = Gravity.BOTTOM
            }
            setBackgroundColor(0x80000000.toInt()) // Convertir a Int para evitar el error
        }
        // Agregar el overlay al contenedor
        cameraContainer?.addView(overlayViewBottom)
        // Crear la vista del overlay
        overlayViewLeft = View(activity).apply {
            layoutParams = FrameLayout.LayoutParams(
                width / 4, 
                (height / 4) + 2, 
            ).apply {
                gravity = Gravity.START or Gravity.CENTER
            }
            setBackgroundColor(0x80000000.toInt()) // Convertir a Int para evitar el error
        }
        // Agregar el overlay al contenedor
        cameraContainer?.addView(overlayViewLeft)
        // Crear la vista del overlay
        overlayViewRight = View(activity).apply {
            layoutParams = FrameLayout.LayoutParams(
                width / 4, 
                (height / 4) + 2, 
            ).apply {
                gravity = Gravity.END or Gravity.CENTER
            }
            setBackgroundColor(0x80000000.toInt()) // Convertir a Int para evitar el error
        }
        // Agregar el overlay al contenedor
        cameraContainer?.addView(overlayViewRight)

        // Crear MarginLayoutParams y establecer márgenes
        val params = ViewGroup.MarginLayoutParams(
            width,
            height/2
        )
        //TODO:Agregar una función que recoja el tamaño de la barra de navegación de ser necesario
        params.setMargins(0, 150, 0, 0)

        // Agregar el contenedor a la actividad
        activity.addContentView(cameraContainer, params)

        // Habilitar la cámara
        mOpenCvCameraView?.setCameraPermissionGranted()
        mOpenCvCameraView?.enableView()
        Log.d("Cameragus", "Camera enabled: ${mOpenCvCameraView?.isEnabled}")
      }
      promise.resolve("Camera started successfully")
    } catch (e: Exception) {
      promise.reject("CameraError", e.message)
    }
  }
  @ReactMethod
    fun stopCamera(promise: Promise) {
        try {
            if (mOpenCvCameraView == null) {
                promise.reject("CameraError", "Camera is not initialized")
                return
            }

            currentActivity?.runOnUiThread {
                mOpenCvCameraView?.disableView() // Deshabilita la cámara
                cameraContainer?.removeView(mOpenCvCameraView) // Elimina la vista de la cámara del contenedor
                mOpenCvCameraView = null // Libera la referencia

                // Elimina el overlay si existe
                overlayViewTop?.let {
                    cameraContainer?.removeView(it)
                    overlayViewTop = null // Libera la referencia
                }
                overlayViewBottom?.let {
                    cameraContainer?.removeView(it)
                    overlayViewBottom = null // Libera la referencia
                }
                overlayViewLeft?.let {
                    cameraContainer?.removeView(it)
                    overlayViewLeft = null // Libera la referencia
                }
                overlayViewRight?.let {
                    cameraContainer?.removeView(it)
                    overlayViewRight = null // Libera la referencia
                }

                cameraContainer = null // Libera el contenedor
            }

            promise.resolve("Camera stopped successfully")
        } catch (e: Exception) {
            promise.reject("CameraError", e.message)
        }
    }
    // Métodos de la interfaz CvCameraViewListener2
    override fun onCameraViewStarted(width: Int, height: Int) {
        Log.d("Cameragus", "Camera view started")
        Log.d("Cameragus", "Camera view width:${width} height:${height}")
        frameCounter = 0
    }

    override fun onCameraViewStopped() {
        Log.d("Cameragus", "Camera view stopped")
        frameCounter = 0
    }

    override fun onCameraFrame(inputFrame: CameraBridgeViewBase.CvCameraViewFrame): Mat {
    val mRgba = inputFrame.rgba()

    // if (frameCounter == 20) {
    //     frameCounter = 0
    //     // Ejecutar detectCode() en un hilo separado
    //     CoroutineScope(Dispatchers.Default).launch {
    //         //detectCode(mRgba)
    //     }
    // }
    // frameCounter++
    // return mRgba

    return handleFrame(mRgba, tryDecode = true, multiDetect = false)
    }
    // Función que detecta y decodifica códigos QR en la imagen
    private fun handleFrame(inputFrame: Mat, tryDecode: Boolean, multiDetect: Boolean): Mat {
        val decodedInfo = mutableListOf<String>()
        val points = MatOfPoint()

        val result = findQRs(inputFrame, decodedInfo, points, tryDecode, multiDetect)
        if (result) {
            Log.e("CameragusQR", "Camera QR Result: ${decodedInfo}")
            renderQRs(inputFrame, decodedInfo, points)
            // Almacenar la última información del QR
            info = decodedInfo[0]
        }   
        points.release()
        return inputFrame
    }
    //Envia la información decodificada a React
    @ReactMethod
    private fun sendDecodedInfoToReact(promise: Promise) {
        if (info != null) {
        Log.e("CameragusQR", "sendDecodedInfoToReact: ${info}")
        promise.resolve(info)
        } else { //FIXME: Tal vez no haga falta mandar esto como error
            //promise.reject("NoQRCode", "No QR code detected")
        promise.resolve("")
        }
    }

    // Detecta los códigos QR y los decodifica si es necesario
    private fun findQRs(
        inputFrame: Mat, decodedInfo: MutableList<String>, points: MatOfPoint,
        tryDecode: Boolean, multiDetect: Boolean
    ): Boolean {
        return if (multiDetect) {
            if (tryDecode) {
                detector.detectAndDecodeMulti(inputFrame, decodedInfo, points)
            } else {
                detector.detectMulti(inputFrame, points)
            }
        } else {
            if (tryDecode) {
                val s = detector.detectAndDecode(inputFrame, points)
                val result = !points.empty()
                if (result) decodedInfo.add(s)
                result
            } else {
                detector.detect(inputFrame, points)
            }
        }
    }

    // Dibuja los contornos y textos de los códigos QR detectados
    private fun renderQRs(inputFrame: Mat, decodedInfo: List<String>, points: MatOfPoint) {
        for (i in 0 until points.rows()) {
            for (j in 0 until points.cols()) {
                val pt1 = Point(points[i, j])
                val pt2 = Point(points[i, (j + 1) % 4])
                Imgproc.line(inputFrame, pt1, pt2, lineColor, 3)
            }
            if (decodedInfo.isNotEmpty()) {
                var decode = decodedInfo[i]
                if (decode.length > 15) {
                    decode = decode.substring(0, 12) + "..."
                }
                val baseline = IntArray(1)
                val textSize = Imgproc.getTextSize(decode, Imgproc.FONT_HERSHEY_COMPLEX, .95, 3, baseline)
                val sum = Core.sumElems(points.row(i))
                val start = Point(
                    sum.`val`[0] / 4.0 - textSize.width / 2.0,
                    sum.`val`[1] / 4.0 - textSize.height / 2.0
                )
                Imgproc.putText(inputFrame, decode, start, Imgproc.FONT_HERSHEY_COMPLEX, .95, fontColor, 3)
            }
        }
    }

    //Función de emgu, del archivo detectcode.cs Se implementa en onCameraFrame pero esta comentado el codigo
    fun detectCode(activeArea: Mat) {
        val gray = Mat(activeArea.rows(), activeArea.cols(), CvType.CV_8UC1)
        Imgproc.cvtColor(activeArea, gray, Imgproc.COLOR_RGB2GRAY)

        // Aplicar filtros y umbrales
        Imgproc.GaussianBlur(gray, gray, Size(5.0, 5.0), 0.0) 
        Imgproc.adaptiveThreshold(gray, gray, 255.0, Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY_INV, 51, 14.0)

        // Encontrar contornos
        val contours = ArrayList<MatOfPoint>()
        val hierarchy = Mat()
        Imgproc.findContours(gray, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE)

        mark = 0
        val momentsList = mutableListOf<Moments>()
        val massCenters = mutableListOf<Point>()

        for (contour in contours) {
            val mu = Imgproc.moments(contour)
            momentsList.add(mu)
            if (mu.m00 != 0.0) {
                massCenters.add(Point(mu.m10 / mu.m00, mu.m01 / mu.m00))
            }
        }

        for (i in contours.indices) {
            val approx = MatOfPoint2f()
            val contour2f = MatOfPoint2f(*contours[i].toArray())
            Imgproc.approxPolyDP(contour2f, approx, Imgproc.arcLength(contour2f, true) * 0.02, true)

            if (approx.total() == 4L) {
                var k = i
                var c = 0
                val info = IntArray(4)

                while (info[2] != -1) {
                    // Aquí se debería implementar la función getHierarchy
                    k = info[2]
                    c++
                }

                if (c >= 3) {
                    if (mark == 0) border = i
                    else if (mark == 1) marker = i
                    mark++
                }
            }
        }

        Log.i("DetectCode", "mark = $mark")

        if (mark >= 2) {
            val widthA = getApproximatedWidth(contours, border)
            val widthB = getApproximatedWidth(contours, marker)

            if (widthA > widthB) {
                border = border
                marker = marker
            } else {
                border = marker
                marker = border
            }

            val slope = lineSlope(massCenters[marker], massCenters[border])

            orientation = when {
                slope > 0 && slope < 1.5708 -> HOLO_NORTH
                slope >= 1.5708 -> HOLO_EAST
                slope < 0 && slope > -1.5708 -> HOLO_WEST
                else -> HOLO_SOUTH
            }

            Imgproc.drawContours(activeArea, contours, marker, Scalar(0.0, 0.0, 255.0), 2)
            Imgproc.drawContours(activeArea, contours, border, Scalar(0.0, 255.0, 0.0), 2)
        }

        codeDetected = mark == 2 &&
                (border < contours.size && marker < contours.size &&
                        Imgproc.contourArea(contours[border]) > 10 &&
                        Imgproc.contourArea(contours[marker]) > 10)

        if (codeDetected) {
            val warpMatrix = Imgproc.getPerspectiveTransform(
                MatOfPoint2f(), MatOfPoint2f() // Reemplazar con los puntos correctos
            )
            val holoRaw = Mat()
            Imgproc.warpPerspective(activeArea, holoRaw, warpMatrix, Size(activeArea.cols().toDouble(), activeArea.rows().toDouble()))
            Imgproc.cvtColor(holoRaw, holoRaw, Imgproc.COLOR_RGB2GRAY)

            // Operaciones morfológicas
            val element = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(3.0, 3.0))
            Imgproc.dilate(holoRaw, holoRaw, element)
            Imgproc.erode(holoRaw, holoRaw, element)
            Imgproc.GaussianBlur(holoRaw, holoRaw, Size(5.0, 5.0), 0.0)
            Imgproc.adaptiveThreshold(holoRaw, holoRaw, 255.0, Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY, 51, 16.0)
        }
    }

    private fun getApproximatedWidth(contours: List<MatOfPoint>, index: Int): Int {
        return contours[index].toList().size // Implementar correctamente
    }

    private fun lineSlope(p1: Point, p2: Point): Double {
        return if (p2.x - p1.x != 0.0) (p2.y - p1.y) / (p2.x - p1.x) else Double.MAX_VALUE
    }
}