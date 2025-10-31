package com.cameranative

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import android.widget.FrameLayout
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import android.util.DisplayMetrics
import android.view.Gravity

import org.opencv.core.Mat
import org.opencv.core.Core
import org.opencv.core.CvType
import org.opencv.android.Utils
import java.util.concurrent.Executors

import com.holodecoder.HoloFunctions

@SuppressLint("UnsafeOptInUsageError")
class CameraXView(context: Context) : FrameLayout(context), LifecycleOwner {

    private val lifecycleRegistry = LifecycleRegistry(this)
    private val previewView: PreviewView = PreviewView(context)
    
    private var frameCounter = 0
    private val processEveryNFrames = 10
    private val opencvFunctions = HoloFunctions()
    private var info: String? = null

    private val analysisExecutor = Executors.newSingleThreadExecutor()

    override val lifecycle: Lifecycle
        get() = lifecycleRegistry

    init {
        val displayMetrics = context.resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels // ancho del dispositivo
        val previewParams = LayoutParams(screenWidth, screenWidth) // cuadrado
        previewParams.gravity = Gravity.TOP // centrar
        previewView.layoutParams = previewParams

        // Ajusta el scale type para centrar y recortar bordes
        previewView.scaleType = PreviewView.ScaleType.FILL_CENTER

        addView(previewView)

        lifecycleRegistry.currentState = Lifecycle.State.CREATED
        // logCameraInfo()
        startCamera()
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()

                val preview = Preview.Builder().build()
                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                preview.setSurfaceProvider(previewView.surfaceProvider)

                // ImageAnalysis para obtener frames y procesarlos con OpenCV en la funcion processImageProxy
                val imageAnalyzer = ImageAnalysis.Builder()
                    // .setTargetResolution(android.util.Size(1024, 768)) // resolución deseada
                    .setTargetResolution(android.util.Size(1600, 1200)) // resolución deseada
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()

                imageAnalyzer.setAnalyzer(analysisExecutor) { imageProxy ->
                    try {
                        frameCounter++
                        if (frameCounter % processEveryNFrames == 0) {
                            // Procesar este frame
                            processImageProxy(imageProxy)
                        } else {
                            // No procesar, solo liberar
                            imageProxy.close()
                        }
                    } catch (e: Exception) {
                        Log.e("CameraXView", "Error procesando frame: ${e.message}")
                    }
                }

                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this, // ✅ esta clase ahora implementa LifecycleOwner
                    cameraSelector,
                    preview,
                    imageAnalyzer
                )

                lifecycleRegistry.currentState = Lifecycle.State.RESUMED

                // 🔍 Log para ver que resolución es usada por CameraX
                // previewView.post {
                //     val viewWidth = previewView.width
                //     val viewHeight = previewView.height
                //     Log.i("CameraXView", "📏 Resolución del PreviewView: ${viewWidth}x${viewHeight}")
                //     //NOTE:Resolución del PreviewView: 1080x2232 ACTUALMENTE
                //     val surfaceResolution = preview.attachedSurfaceResolution
                //     Log.i("CameraXView", "🎯 Resolución exacta usada por CameraX: ${surfaceResolution?.width}x${surfaceResolution?.height}")
                //     //NOTE:Resolución exacta usada por CameraX: 1600x1200 ACTUALMENTE. Ratio 4/3
                // }
                Log.i("CameraXView", "✅ Cámara iniciada correctamente")
                // 🔍 Log de características de la cámara actual
                //logCurrentCameraCharacteristics(cameraSelector)

            } catch (e: Exception) {
                Log.e("CameraXView", "❌ Error iniciando cámara: ${e.message}")
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun processImageProxy(imageProxy: ImageProxy) {
        try {
            val yBuffer = imageProxy.planes[0].buffer
            val uBuffer = imageProxy.planes[1].buffer
            val vBuffer = imageProxy.planes[2].buffer

            val ySize = yBuffer.remaining()
            val uSize = uBuffer.remaining()
            val vSize = vBuffer.remaining()

            val nv21 = ByteArray(ySize + uSize + vSize)

            yBuffer.get(nv21, 0, ySize)
            vBuffer.get(nv21, ySize, vSize)
            uBuffer.get(nv21, ySize + vSize, uSize)

            // Convert NV21 a Bitmap
            val yuvImage = android.graphics.YuvImage(nv21, android.graphics.ImageFormat.NV21, imageProxy.width, imageProxy.height, null)
            val out = java.io.ByteArrayOutputStream()
            yuvImage.compressToJpeg(android.graphics.Rect(0, 0, imageProxy.width, imageProxy.height), 100, out)
            val yuvBytes = out.toByteArray()
            val bitmap = android.graphics.BitmapFactory.decodeByteArray(yuvBytes, 0, yuvBytes.size)

            // Convert Bitmap a Mat
            val mat = Mat(bitmap.height, bitmap.width, CvType.CV_8UC4)
            Utils.bitmapToMat(bitmap, mat)

            // Aquí ya puedes usar OpenCV
            // Ejemplo: detectar QR con detectores de OpenCV o Zxing
            val isDetected = opencvFunctions.detectCode(mat)
            // Log para ver cuando se detecta
            Log.i("CameraXView", "✅ Código detectado: $isDetected")
            if (isDetected) {
                val message = opencvFunctions.extractBits()
                info = message?.joinToString(separator = "_")
                // Log para ver cuando se detecta
                Log.i("CameraXView", "✅ INFORMACION: $info")
            }
        } catch (e: Exception) {
            Log.e("CameraXView", "Error en processImageProxy: ${e.message}")
        } finally {
            imageProxy.close() // 🔹 MUY IMPORTANTE
        }
    }

    private fun logCameraInfo() {
        try {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as android.hardware.camera2.CameraManager
            val cameraIds = cameraManager.cameraIdList

            Log.i("CameraXView", "=== Lista de cámaras disponibles ===")
            for (cameraId in cameraIds) {
                val characteristics = cameraManager.getCameraCharacteristics(cameraId)
                val lensFacing = characteristics.get(android.hardware.camera2.CameraCharacteristics.LENS_FACING)
                val facingStr = when (lensFacing) {
                    android.hardware.camera2.CameraCharacteristics.LENS_FACING_BACK -> "Trasera"
                    android.hardware.camera2.CameraCharacteristics.LENS_FACING_FRONT -> "Frontal"
                    android.hardware.camera2.CameraCharacteristics.LENS_FACING_EXTERNAL -> "Externa"
                    else -> "Desconocida"
                }

                Log.i("CameraXView", "Cámara ID: $cameraId ($facingStr)")

                val map = characteristics.get(android.hardware.camera2.CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
                val outputSizes = map?.getOutputSizes(android.view.SurfaceHolder::class.java)

                outputSizes?.forEach {
                    Log.i("CameraXView", "  Resolución soportada: ${it.width}x${it.height}")
                }
            }
            Log.i("CameraXView", "=== Fin de lista ===")

        } catch (e: Exception) {
            Log.e("CameraXView", "❌ Error obteniendo info cámara: ${e.message}")
        }
    }

    private fun logCurrentCameraCharacteristics(cameraSelector: CameraSelector) {
        try {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as android.hardware.camera2.CameraManager
            val cameraIds = cameraManager.cameraIdList

            for (cameraId in cameraIds) {
                val characteristics: android.hardware.camera2.CameraCharacteristics =
                    cameraManager.getCameraCharacteristics(cameraId)

                val facing: Int? = characteristics.get(android.hardware.camera2.CameraCharacteristics.LENS_FACING)

                val isSelected: Boolean =
                    (cameraSelector == CameraSelector.DEFAULT_BACK_CAMERA && facing == android.hardware.camera2.CameraCharacteristics.LENS_FACING_BACK) ||
                    (cameraSelector == CameraSelector.DEFAULT_FRONT_CAMERA && facing == android.hardware.camera2.CameraCharacteristics.LENS_FACING_FRONT)

                if (isSelected) {
                    val sensorOrientation: Int? =
                        characteristics.get(android.hardware.camera2.CameraCharacteristics.SENSOR_ORIENTATION)
                    val apertures: FloatArray? =
                        characteristics.get(android.hardware.camera2.CameraCharacteristics.LENS_INFO_AVAILABLE_APERTURES)
                    val focalLengths: FloatArray? =
                        characteristics.get(android.hardware.camera2.CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)
                    val sensorSize: android.util.SizeF? =
                        characteristics.get(android.hardware.camera2.CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
                    val isoRange: android.util.Range<Int>? =
                        characteristics.get(android.hardware.camera2.CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE)
                    val flashAvailable: Boolean? =
                        characteristics.get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE)
                    val afModes: IntArray? =
                        characteristics.get(android.hardware.camera2.CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES)
                    val oisModes: IntArray? =
                        characteristics.get(android.hardware.camera2.CameraCharacteristics.LENS_INFO_AVAILABLE_OPTICAL_STABILIZATION)

                    Log.i("CameraXView", "--- Características de la cámara actual ---")
                    Log.i("CameraXView", "ID: $cameraId")
                    Log.i("CameraXView", "Orientación del sensor: ${sensorOrientation}°")
                    Log.i("CameraXView", "Apertura (f-stop): ${apertures?.joinToString()}")
                    Log.i("CameraXView", "Distancia focal (mm): ${focalLengths?.joinToString()}")
                    Log.i("CameraXView", "Tamaño físico del sensor: ${sensorSize}")
                    Log.i("CameraXView", "ISO máximo: ${isoRange?.upper}")
                    Log.i("CameraXView", "Soporta flash: $flashAvailable")
                    Log.i("CameraXView", "Modos de enfoque disponibles: ${afModes?.joinToString()}")
                    Log.i("CameraXView", "Modos de estabilización óptica: ${oisModes?.joinToString()}")
                    Log.i("CameraXView", "--------------------------------------------")
                }
            }
        } catch (e: Exception) {
            Log.e("CameraXView", "❌ Error obteniendo características: ${e.message}")
        }
    }
}
