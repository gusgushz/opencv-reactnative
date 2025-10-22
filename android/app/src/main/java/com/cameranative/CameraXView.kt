package com.cameranative

import android.content.Context
import android.graphics.*
import android.hardware.camera2.*
import android.media.Image
import android.media.ImageReader
import android.util.AttributeSet
import android.util.Log
import android.util.Size
import android.view.Surface
import android.view.SurfaceHolder
import android.view.SurfaceView
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import org.opencv.core.*
import org.opencv.core.Point
import org.opencv.imgproc.Imgproc
import java.nio.ByteBuffer
import android.graphics.Rect
import kotlin.math.min


class CameraXView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : FrameLayout(context, attrs), SurfaceHolder.Callback {

    private val TAG = "CameraXView"
    private var cameraDevice: CameraDevice? = null
    private var cameraCaptureSession: CameraCaptureSession? = null
    private var cameraId: String = ""
    private var cameraManager: CameraManager =
        context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private var cameraCharacteristics: CameraCharacteristics? = null
    private var previewSize: Size? = null
    private var imageReader: ImageReader? = null
    private val cameraSurface = AutoFitSurfaceView(context)
    private val overlayView = OverlayView(context)

    init {
        cameraSurface.holder.addCallback(this)
         // Agregamos primero la cámara
        addView(cameraSurface, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        // Agregamos la overlay encima
        addView(overlayView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    }

    fun setAspectRatio(width: Int, height: Int) {
        cameraSurface.setAspectRatio(width, height)
        cameraSurface.holder.setFixedSize(width, height)
        requestLayout()
    }

    private fun openCamera() {
        try {
            cameraId = cameraManager.cameraIdList.first {
                val characteristics = cameraManager.getCameraCharacteristics(it)
                characteristics.get(CameraCharacteristics.LENS_FACING) ==
                        CameraCharacteristics.LENS_FACING_BACK
            }

            // Guardamos las characteristics para usarlas después
            cameraCharacteristics = cameraManager.getCameraCharacteristics(cameraId)

            val characteristics = cameraCharacteristics!!
            val capabilities = characteristics.get(CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES)
            Log.d(TAG, "Capacidades: ${capabilities?.joinToString()}")

            val focalLengths = characteristics.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)
            Log.d(TAG, "Distancia focal: ${focalLengths?.joinToString()}")

            val apertures = characteristics.get(CameraCharacteristics.LENS_INFO_AVAILABLE_APERTURES)
            Log.d(TAG, "Aperturas: ${apertures?.joinToString()}")

            val sensorSize = characteristics.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
            Log.d(TAG, "Tamaño del sensor: ${sensorSize?.width} x ${sensorSize?.height}")

            val map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
            val outputSizes = map?.getOutputSizes(SurfaceHolder::class.java)
            outputSizes?.forEach {
                Log.d(TAG, "Resolución soportada: ${it.width} x ${it.height}")
            }
            val orientation = characteristics.get(CameraCharacteristics.SENSOR_ORIENTATION)
            Log.d("CameraInfo", "Orientación del sensor: $orientation°")

            // Crear ImageReader en landscape 1920x1080 (ajusta si quieres portrait)
            imageReader = ImageReader.newInstance(1280, 720, ImageFormat.YUV_420_888, 2)
            imageReader?.setOnImageAvailableListener(onImageAvailableListener, null)

            cameraManager.openCamera(cameraId, stateCallback, null)
        } catch (e: CameraAccessException) {
            Log.e(TAG, "CameraAccessException abriendo cámara: ${e.message}", e)
        } catch (e: Exception) {
            Log.e(TAG, "Error abriendo cámara: ${e.message}", e)
        }
    }

    private val stateCallback = object : CameraDevice.StateCallback() {
        override fun onOpened(camera: CameraDevice) {
            cameraDevice = camera
            // Ajustamos la relación de aspecto del SurfaceView
            setAspectRatio(1280, 720)
            startPreview()
        }

        override fun onDisconnected(camera: CameraDevice) {
            camera.close()
            cameraDevice = null
        }

        override fun onError(camera: CameraDevice, error: Int) {
            camera.close()
            cameraDevice = null
        }
    }

    private fun startPreview() {
        try {
            val rotation = (context.getSystemService(Context.WINDOW_SERVICE) as WindowManager)
                .defaultDisplay.rotation

            val sensorOrientation = cameraCharacteristics?.get(CameraCharacteristics.SENSOR_ORIENTATION) ?: 90

            // CALCULAR rotación correcta para mostrar en portrait
            val totalRotation = when (rotation) {
                Surface.ROTATION_0 -> 90 // Portrait normal
                Surface.ROTATION_90 -> 0  // Landscape normal
                Surface.ROTATION_180 -> 270 // Portrait invertido  
                Surface.ROTATION_270 -> 180 // Landscape invertido
                else -> 90
            }

            Log.d(TAG, "Rotación - Pantalla: $rotation, Sensor: $sensorOrientation, Total: $totalRotation")

            val previewSurface = cameraSurface.holder.surface
            val readerSurface = imageReader!!.surface

            val captureRequestBuilder =
                cameraDevice!!.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW)
            captureRequestBuilder.addTarget(previewSurface)
            captureRequestBuilder.addTarget(readerSurface)

            // Aplicar rotación portrait
            captureRequestBuilder.set(CaptureRequest.JPEG_ORIENTATION, totalRotation)
            
            // Configurar para evitar distorsión
            captureRequestBuilder.set(CaptureRequest.SCALER_CROP_REGION, getMaxZoomRect())
            captureRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO)
            captureRequestBuilder.set(CaptureRequest.CONTROL_AF_MODE, CameraMetadata.CONTROL_AF_MODE_CONTINUOUS_PICTURE)

            cameraDevice!!.createCaptureSession(
                listOf(previewSurface, readerSurface),
                object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(session: CameraCaptureSession) {
                        cameraCaptureSession = session
                        session.setRepeatingRequest(captureRequestBuilder.build(), null, null)
                        Log.d(TAG, "Preview iniciado en portrait (estilo iOS)")
                    }
                    override fun onConfigureFailed(session: CameraCaptureSession) {
                        Log.e(TAG, "Falló la configuración de la cámara")
                    }
                },
                null
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error iniciando preview: ${e.message}", e)
        }
    }
    private fun getMaxZoomRect(): Rect? {
        return try {
            cameraCharacteristics?.get(CameraCharacteristics.SENSOR_INFO_ACTIVE_ARRAY_SIZE)
        } catch (e: Exception) {
            null
        }
    }

    private val onImageAvailableListener = ImageReader.OnImageAvailableListener { reader ->
        val image = reader.acquireLatestImage() ?: return@OnImageAvailableListener

        try {
            Log.d(TAG, "Image received: ${image.width}x${image.height}, format: ${image.format}")
            
            // CONVERSIÓN YUV_420_888 CORRECTA
            val rgbMat = convertYUV420ToRGB(image)
            
            if (rgbMat.empty()) {
                Log.e(TAG, "RGB Mat is empty after conversion")
                image.close()
                return@OnImageAvailableListener
            }
            
            Log.d(TAG, "RGB Mat created: ${rgbMat.cols()}x${rgbMat.rows()}, type: ${rgbMat.type()}")
            
            // Procesamiento normal
            val contours = processFrameWithOpenCV(rgbMat)
        
            // SI no hay contornos, crear unos de prueba
            val contoursToDraw = if (contours.isEmpty()) {
                Log.d(TAG, "No contours found, creating test contours")
                createTestContours(rgbMat.cols(), rgbMat.rows())
            } else {
                contours
            }
            
            Log.d(TAG, "Sending ${contoursToDraw.size} contours to overlay")
            
            // Actualizar overlay
            post {
                overlayView.setContours(contoursToDraw, rgbMat.cols(), rgbMat.rows())
            }

            rgbMat.release()
            
        } catch (e: Exception) {
            Log.e(TAG, "Error procesando frame: ${e.message}", e)
        } finally {
            image.close()
        }
    }

    private fun convertYUV420ToRGB(image: Image): Mat {
        try {
            val width = image.width
            val height = image.height
            val planes = image.planes
            
            Log.d(TAG, "YUV Conversion - Planes: ${planes.size}")
            
            // Obtener los buffers de cada plano
            val yBuffer = planes[0].buffer
            val uBuffer = planes[1].buffer
            val vBuffer = planes[2].buffer
            
            // Obtener información de los planos
            val yPixelStride = planes[0].pixelStride
            val uvPixelStride = planes[1].pixelStride
            val uvRowStride = planes[1].rowStride
            
            Log.d(TAG, "Y pixel stride: $yPixelStride, UV pixel stride: $uvPixelStride, UV row stride: $uvRowStride")
            
            // Crear array para datos YUV
            val ySize = yBuffer.remaining()
            val uSize = uBuffer.remaining()
            val vSize = vBuffer.remaining()
            
            val yuvData = ByteArray(ySize + uSize + vSize)
            
            // Copiar datos Y
            yBuffer.get(yuvData, 0, ySize)
            
            // Para YUV_420_888, necesitamos manejar el pixel stride
            if (uvPixelStride == 1) {
                // Caso simple: pixel stride 1
                uBuffer.get(yuvData, ySize, uSize)
                vBuffer.get(yuvData, ySize + uSize, vSize)
            } else {
                // Caso complejo: pixel stride > 1, necesitamos intercalar manualmente
                val uvBuffer = ByteArray(uvRowStride * height / 2)
                uBuffer.get(uvBuffer, 0, min(uBuffer.remaining(), uvBuffer.size))
                
                var uvIndex = 0
                var nv21Index = ySize
                while (uvIndex < uvBuffer.size && nv21Index < yuvData.size - 1) {
                    yuvData[nv21Index++] = uvBuffer[uvIndex] // U
                    if (uvIndex + 1 < uvBuffer.size) {
                        yuvData[nv21Index++] = uvBuffer[uvIndex + 1] // V
                    }
                    uvIndex += uvPixelStride
                }
            }
            
            // Crear Mat YUV y convertir a RGB
            val yuvMat = Mat(height + height / 2, width, CvType.CV_8UC1)
            yuvMat.put(0, 0, yuvData)
            
            val rgbMat = Mat()
            Imgproc.cvtColor(yuvMat, rgbMat, Imgproc.COLOR_YUV2RGB_NV21)
            
            yuvMat.release()
            
            Log.d(TAG, "YUV to RGB conversion successful")
            return rgbMat
            
        } catch (e: Exception) {
            Log.e(TAG, "Error in YUV conversion: ${e.message}", e)
            return Mat()
        }
    }

// si tienes reactApplicationContext y sendEvent; comentar si no existe
                    // val params = Arguments.createMap().apply {
                    //     putDouble("x", rect.x.toDouble())
                    //     putDouble("y", rect.y.toDouble())
                    //     putDouble("area", area)
                    // }
                    // sendEvent(reactApplicationContext, "onBumpDetected", params)
    private fun processFrameWithOpenCV(rgbMat: Mat): MutableList<MatOfPoint> { 
        // Cambiado para retornar contours
        Log.d(TAG, "Procesando frame: ${rgbMat.cols()} x ${rgbMat.rows()}")
        
        val gray = Mat()
        Imgproc.cvtColor(rgbMat, gray, Imgproc.COLOR_RGB2GRAY)
        Imgproc.GaussianBlur(gray, gray, Size(5.0, 5.0), 0.0)

        val edges = Mat()
        Imgproc.Canny(gray, edges, 50.0, 150.0)

        val contours: MutableList<MatOfPoint> = ArrayList()
        val hierarchy = Mat()
        Imgproc.findContours(edges, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE)

        Log.d(TAG, "Contornos detectados: ${contours.size}")
        
        // EJEMPLO: Filtrar contornos por área para tener menos ruido
        val filteredContours = contours.filter { contour ->
            val area = Imgproc.contourArea(contour)
            area > 100.0 // Filtrar contornos muy pequeños
        }.toMutableList()
        
        Log.d(TAG, "Contornos filtrados: ${filteredContours.size}")

        // ejemplo de filtrado y eventos
        for (contour in filteredContours) {
            val area = Imgproc.contourArea(contour)
            if (area in 800.0..8000.0) {
                val rect = Imgproc.boundingRect(contour)
                val roi = gray.submat(rect)
                val mean = Core.mean(roi)

                if (mean.`val`[0] < 90) {
                    Imgproc.rectangle(rgbMat, rect, Scalar(0.0, 0.0, 255.0, 255.0), 2)
                    Imgproc.putText(
                        rgbMat,
                        "Posible bache",
                        Point(rect.x.toDouble(), rect.y.toDouble() - 10),
                        Imgproc.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        Scalar(0.0, 0.0, 255.0, 255.0),
                        2
                    )
                }
                roi.release()
            }
        }
        
        edges.release()
        hierarchy.release()
        gray.release()
        
        return filteredContours // RETORNAR los contornos
    }
    // Añadir esta función si no existe
    private fun createTestContours(matWidth: Int, matHeight: Int): MutableList<MatOfPoint> {
        val testContours = mutableListOf<MatOfPoint>()
        
        Log.d(TAG, "Creating test contours for: $matWidth x $matHeight")
        
        // Crear un contorno cuadrado en el centro
        val centerX = matWidth / 2.0
        val centerY = matHeight / 2.0
        val size = min(matWidth, matHeight) / 4.0 // Tamaño relativo
        
        val points = arrayOf(
            Point(centerX - size, centerY - size),
            Point(centerX + size, centerY - size),
            Point(centerX + size, centerY + size),
            Point(centerX - size, centerY + size)
        )
        
        val contour = MatOfPoint(*points)
        testContours.add(contour)
        
        // Crear un triángulo de prueba también
        val trianglePoints = arrayOf(
            Point(centerX, centerY - size),
            Point(centerX + size, centerY + size),
            Point(centerX - size, centerY + size)
        )
        
        val triangleContour = MatOfPoint(*trianglePoints)
        testContours.add(triangleContour)
        
        Log.d(TAG, "Created ${testContours.size} test contours")
        return testContours
    }

    fun closeCamera() {
        cameraCaptureSession?.close()
        cameraDevice?.close()
        imageReader?.close()
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        openCamera()
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        closeCamera()
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {}
}

class OverlayView(context: Context) : View(context) {
    private val contours: MutableList<MatOfPoint> = mutableListOf()
    private val paint = Paint().apply {
        color = Color.RED
        style = Paint.Style.STROKE
        strokeWidth = 8f // Hacer más grueso para que sea visible
        isAntiAlias = true
    }
    private var matWidth = 0
    private var matHeight = 0

    fun setContours(contours: List<MatOfPoint>, matWidth: Int, matHeight: Int) {
        Log.d("Overlay", "setContours called: $matWidth x $matHeight, ${contours.size} contours")
        
        this.contours.clear()
        this.contours.addAll(contours)
        this.matWidth = matWidth
        this.matHeight = matHeight
        
        // Log detallado de los contornos
        contours.forEachIndexed { index, contour ->
            val points = contour.toArray()
            Log.d("Overlay", "Contour $index: ${points.size} points")
            if (points.isNotEmpty()) {
                Log.d("Overlay", "First point: (${points[0].x}, ${points[0].y})")
                Log.d("Overlay", "Last point: (${points.last().x}, ${points.last().y})")
            }
        }
        
        postInvalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        Log.d("Overlay", "onDraw - View: ${width}x${height}, Mat: ${matWidth}x${matHeight}")
        
        if (matWidth == 0 || matHeight == 0) {
            Log.d("Overlay", "Mat dimensions not set")
            drawDebugInfo(canvas, "No mat dimensions")
            return
        }

        if (contours.isEmpty()) {
            Log.d("Overlay", "No contours to draw")
            drawDebugInfo(canvas, "No contours")
            return
        }

        // Calcular escala - ROTAR las coordenadas porque el sensor está a 90°
        val scaleX = width.toFloat() / matHeight.toFloat()  // Invertir: width/matHeight
        val scaleY = height.toFloat() / matWidth.toFloat()  // Invertir: height/matWidth
        
        Log.d("Overlay", "Scale factors: $scaleX x $scaleY")

        for ((index, contour) in contours.withIndex()) {
            val path = Path()
            val points = contour.toArray()
            
            Log.d("Overlay", "Drawing contour $index with ${points.size} points")
            
            if (points.isNotEmpty()) {
                // ROTAR COORDENADAS: (x, y) -> (y, matWidth - x)
                val firstPoint = points[0]
                val x = (firstPoint.y * scaleX) // y original se convierte en x
                val y = ((matWidth - firstPoint.x) * scaleY) // x invertido se convierte en y
                path.moveTo(x.toFloat(), y.toFloat())
                
                Log.d("Overlay", "First point rotated: (${firstPoint.x}, ${firstPoint.y}) -> ($x, $y)")
                
                // Resto de puntos rotados
                for (i in 1 until points.size) {
                    val point = points[i]
                    val x2 = (point.y * scaleX)
                    val y2 = ((matWidth - point.x) * scaleY)
                    path.lineTo(x2.toFloat(), y2.toFloat())
                }
                
                // Cerrar el path
                path.close()
                
                canvas.drawPath(path, paint)
                Log.d("Overlay", "Contour $index drawn")
            }
        }
        
        // Dibujar un punto de referencia en cada esquina
        drawReferencePoints(canvas)
        drawDebugInfo(canvas, "Contours: ${contours.size}")
    }
    
    private fun drawReferencePoints(canvas: Canvas) {
        val pointPaint = Paint().apply {
            color = Color.GREEN
            style = Paint.Style.FILL
            strokeWidth = 15f
        }
        
        // Esquinas
        canvas.drawCircle(50f, 50f, 10f, pointPaint) // Esquina superior izquierda
        canvas.drawCircle(width - 50f, 50f, 10f, pointPaint) // Esquina superior derecha
        canvas.drawCircle(50f, height - 50f, 10f, pointPaint) // Esquina inferior izquierda
        canvas.drawCircle(width - 50f, height - 50f, 10f, pointPaint) // Esquina inferior derecha
        
        // Centro
        val centerPaint = Paint().apply {
            color = Color.BLUE
            style = Paint.Style.FILL
            strokeWidth = 20f
        }
        canvas.drawCircle(width / 2f, height / 2f, 15f, centerPaint)
    }
    
    private fun drawDebugInfo(canvas: Canvas, message: String) {
        val textPaint = Paint().apply {
            color = Color.WHITE
            textSize = 40f
            isAntiAlias = true
        }
        
        // Fondo semitransparente para el texto
        val backgroundPaint = Paint().apply {
            color = Color.argb(180, 0, 0, 0)
        }
        
        canvas.drawRect(0f, 0f, width.toFloat(), 250f, backgroundPaint)
        canvas.drawText("View: ${width}x${height}", 20f, 50f, textPaint)
        canvas.drawText("Mat: ${matWidth}x${matHeight}", 20f, 100f, textPaint)
        canvas.drawText(message, 20f, 150f, textPaint)
        canvas.drawText("Scale: ${width.toFloat() / matHeight.toFloat()} x ${height.toFloat() / matWidth.toFloat()}", 20f, 200f, textPaint)
    }
}

class AutoFitSurfaceView(context: Context, attrs: AttributeSet? = null) : SurfaceView(context, attrs) {
    private var ratioWidth = 0
    private var ratioHeight = 0

    fun setAspectRatio(width: Int, height: Int) {
        ratioWidth = width
        ratioHeight = height
        Log.d("SurfaceView", "Aspect ratio configurado: $width:$height")
        requestLayout()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)

        if (ratioWidth == 0 || ratioHeight == 0) {
            setMeasuredDimension(width, height)
            return
        }

        // Calcular para portrait (9:16)
        val expectedRatio = ratioHeight.toFloat() / ratioWidth.toFloat() // 16/9 = 1.777
        val actualViewRatio = height.toFloat() / width.toFloat()

        Log.d("SurfaceView", "Expected: $expectedRatio, Actual: $actualViewRatio")

        val newWidth: Int
        val newHeight: Int

        if (actualViewRatio > expectedRatio) {
            // Demasiado alto - ajustar height
            newWidth = width
            newHeight = (width * expectedRatio).toInt()
        } else {
            // Demasiado ancho - ajustar width  
            newHeight = height
            newWidth = (height / expectedRatio).toInt()
        }

        Log.d("SurfaceView", "Medidas finales: $newWidth x $newHeight")
        setMeasuredDimension(newWidth, newHeight)
    }
}
