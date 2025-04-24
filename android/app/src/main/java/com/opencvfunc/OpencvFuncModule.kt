package com.opencvfunc

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

import android.content.res.Resources
import android.graphics.PointF
import kotlinx.coroutines.*

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
import org.opencv.core.Rect
import org.opencv.imgproc.Imgproc
import org.opencv.imgproc.Moments

import org.opencv.objdetect.GraphicalCodeDetector
import org.opencv.objdetect.QRCodeDetector

import android.view.View
import android.widget.FrameLayout
import android.view.ViewGroup
import android.view.ViewTreeObserver
import android.view.Gravity

import android.util.Log

import com.holodecoder.HoloDecoder

class OpencvFuncModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), CameraBridgeViewBase.CvCameraViewListener2 {

    // Variables de la cámara
	private var mOpenCvCameraView: JavaCameraView? = null
    private var cameraContainer: FrameLayout? = null
    private var overlayViewTop: View? = null
    private var overlayViewBottom: View? = null
    private var overlayViewLeft: View? = null
    private var overlayViewRight: View? = null

    // Variables globales
    private var frameCounter = 0
    private var mark = 0
    private var border = -1
    private var marker = -1
    private var orientation = 0
    private var codeDetected = false
    private var slope: Double = 0.0
    private var text: String? = null
    private val lineColor = Scalar(255.0, 0.0, 0.0) // Rojo
    private val fontColor = Scalar(0.0, 0.0, 255.0) // Azul
    private var impSize = 256 // Tamaño de la imagen procesada

    // Variables para el dibujo persistente
    private val drawingLock = Any()
    @Volatile private var lastValidBorder = -1
    @Volatile private var lastValidMarker = -1
    private val persistentOverlay = Mat()
    private var overlayInitialized = false

    // Matrices y contenedores
    private lateinit var holo_raw: Mat // Matriz para la imagen transformada
    private lateinit var holo_gray: Mat // Matriz para la imagen en escala de grises
    private lateinit var holoCode: Mat // Matriz para el código detectado
    private lateinit var hierarchy: Mat // Jerarquía de contornos
    private var contours: MutableList<MatOfPoint> = ArrayList() // Contornos detectados
    private lateinit var holo: Mat // Matriz para el holograma
    private lateinit var holo_thres: Mat // Matriz para el umbral
    private lateinit var holoMatrix: Mat // Matriz 28x28 para el resultado final
    private var info: String? = null

    // Variables adicionales del C# que podrías necesitar
    // private var documentsReaded = 0
    // private var _data: ByteArray? = null
    // private lateinit var _bgrMat: Mat
    // private lateinit var _rotatedMat: Mat
    // private lateinit var zoomMat: Mat
    // private var scan = true

    private lateinit var detector: GraphicalCodeDetector // Usa QRCodeDetectorAruco() si necesitas Aruco

    init {
        if (!OpenCVLoader.initLocal()) { // Inicializar OpenCV
            Log.e("pastel", "Unable to load OpenCV!")

        } else {
            Log.d("pastel", "OpenCV loaded Successfully!")
            holoCode = Mat()
            hierarchy = Mat()
            holo = Mat.zeros(impSize, impSize, CvType.CV_8UC3)
            holo_raw = Mat.zeros(impSize, impSize, CvType.CV_8UC3)
            holo_gray = Mat.zeros(impSize, impSize, CvType.CV_8UC1)
            holo_thres = Mat.zeros(impSize, impSize, CvType.CV_8UC1)
            holoMatrix = Mat.zeros(28, 28, CvType.CV_8UC1)
            detector = QRCodeDetector() // Inicializar el detector de códigos QR
        }
    }

    override fun getName(): String {
        return NAME
    }
    companion object {
        const val NAME = "OpencvFunc"
        const val HOLO_NORTH = 0
        const val HOLO_EAST = 1
        const val HOLO_WEST = 2
        const val HOLO_SOUTH = 3
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
			Log.d("pastel", "Initializing camera view...")
			// Crear un FrameLayout como contenedor para la cámara
			cameraContainer = FrameLayout(activity).apply {
				layoutParams = ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.MATCH_PARENT,
				ViewGroup.LayoutParams.MATCH_PARENT
				)
			}

			// Inicializar la vista de la cámara
			// -1 camara trasera, 0 para la camara por default y 1 para la cámara frontal
			// Se usa el tamaño del dispositivo para la vista de la cámara
			mOpenCvCameraView = JavaCameraView(activity, CameraBridgeViewBase.CAMERA_ID_BACK).apply {
                visibility = CameraBridgeViewBase.VISIBLE
                setCvCameraViewListener(this@OpencvFuncModule)
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
			}

			// Aplicar transformación de escala y rotación
			mOpenCvCameraView?.viewTreeObserver?.addOnGlobalLayoutListener {
				mOpenCvCameraView?.apply {
					// scaleX = 1.5f    // Ajusta el escalado para llenar la pantalla
					// scaleY = 1.5f
                    scaleX = 3f    // Ajusta el escalado para llenar la pantalla
					scaleY = 3f
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
			params.setMargins(0, 168, 0, 0)

			// Agregar el contenedor a la actividad
			activity.addContentView(cameraContainer, params)

			// Habilitar la cámara
			mOpenCvCameraView?.setCameraPermissionGranted()
			mOpenCvCameraView?.enableView()
			Log.d("pastel", "Camera enabled: ${mOpenCvCameraView?.isEnabled}")
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
            synchronized(drawingLock) {
                // Limpiar el overlay persistente
                if (overlayInitialized) {
                    persistentOverlay.setTo(Scalar(0.0, 0.0, 0.0, 0.0))
                }
                lastValidBorder = -1
                lastValidMarker = -1
                overlayInitialized = false
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
            info = null // Reinicia la información

            promise.resolve("Camera stopped successfully")
        } catch (e: Exception) {
            promise.reject("CameraError", e.message)
        }
    }

	override fun onCameraFrame(inputFrame: CameraBridgeViewBase.CvCameraViewFrame): Mat {
        val activeArea = inputFrame.rgba()

        // Procesamiento de detección (tu lógica existente)
        frameCounter++
        if (frameCounter >= 5) {  // Procesar cada 5 frames
            frameCounter = 0
            val detected = detectCode(activeArea)
            if (detected) {
                val message = extractBits()
                info = message?.joinToString(separator = "_")
            }
        }

        // Crear o actualizar la capa persistente
        synchronized(drawingLock) {
            // Inicializar la capa persistente si es necesario
            if (!overlayInitialized || persistentOverlay.width() != activeArea.width() || persistentOverlay.height() != activeArea.height()) {
                persistentOverlay.create(activeArea.size(), activeArea.type())
                persistentOverlay.setTo(Scalar(0.0, 0.0, 0.0, 0.0))  // Transparente
                overlayInitialized = true
            }

            // Dibujar en la capa persistente
            drawPersistentMarkers(activeArea)

            // Combinar con el frame actual
            val outputFrame = activeArea.clone()
            Core.add(outputFrame, persistentOverlay, outputFrame)
            return outputFrame
        }
    }

    // private fun handleFrame(inputFrame: Mat): Mat {
    //     val decodedInfo = mutableListOf<String>()
    //     val points = MatOfPoint()
    //     val tryDecode = true
    //     val result = findQRs(inputFrame, decodedInfo, points, tryDecode)
    //     if (result) {
    //         Log.e("pastel", "Camera QR Result: ${decodedInfo}")
    //         renderQRs(inputFrame, decodedInfo, points)
    //         // Almacenar la última información del QR
    //         text = decodedInfo[0]
    //     }
    //     points.release()
    //     return inputFrame
    // }
    // private fun findQRs(inputFrame: Mat, decodedInfo: MutableList<String>, points: MatOfPoint, tryDecode: Boolean): Boolean {
    //     return if (tryDecode) {
    //         val s = detector.detectAndDecode(inputFrame, points)
    //         val result = !points.empty()
    //         if (result) decodedInfo.add(s)
    //         result
    //     } else {
    //         detector.detect(inputFrame, points)
    //     }
    // }
    // private fun renderQRs(inputFrame: Mat, decodedInfo: List<String>, points: MatOfPoint) {
    //     for (i in 0 until points.rows()) {
    //         for (j in 0 until points.cols()) {
    //             val pt1 = Point(points[i, j])
    //             val pt2 = Point(points[i, (j + 1) % 4])
    //             Imgproc.line(inputFrame, pt1, pt2, lineColor, 3)
    //         }
    //         if (decodedInfo.isNotEmpty()) {
    //             var decode = decodedInfo[i]
    //             if (decode.length > 15) {
    //                 decode = decode.substring(0, 12) + "..."
    //             }
    //             val baseline = IntArray(1)
    //             val textSize = Imgproc.getTextSize(decode, Imgproc.FONT_HERSHEY_COMPLEX, .95, 3, baseline)
    //             val sum = Core.sumElems(points.row(i))
    //             val start = Point(
    //                 sum.`val`[0] / 4.0 - textSize.width / 2.0,
    //                 sum.`val`[1] / 4.0 - textSize.height / 2.0
    //             )
    //             Imgproc.putText(inputFrame, decode, start, Imgproc.FONT_HERSHEY_COMPLEX, .95, fontColor, 3)
    //         }
    //     }
    // }

    private fun drawPersistentMarkers(baseFrame: Mat) {
        // Limpiar la capa anterior
        persistentOverlay.setTo(Scalar(0.0, 0.0, 0.0, 0.0))

        // Solo dibujar si tenemos detecciones válidas
        if (lastValidBorder != -1 && lastValidMarker != -1 && contours.isNotEmpty()) {
            try {
                // Dibujar borde exterior (verde)
                if (lastValidBorder in contours.indices && !contours[lastValidBorder].empty()) {
                    val borderPoints = MatOfPoint2f(*contours[lastValidBorder].toArray())
                    val approxBorder = MatOfPoint2f()
                    Imgproc.approxPolyDP(borderPoints, approxBorder, 10.0, true)

                    if (approxBorder.toArray().size == 4) {
                        val points = approxBorder.toArray()
                        for (i in 0 until 4) {
                            Imgproc.line(persistentOverlay, points[i], points[(i + 1) % 4],
                                        Scalar(0.0, 255.0, 0.0, 255.0), 3)
                        }
                    }
                    borderPoints.release()
                    approxBorder.release()
                }

                // Dibujar marcador interior (rojo)
                if (lastValidMarker in contours.indices && !contours[lastValidMarker].empty()) {
                    val markerPoints = MatOfPoint2f(*contours[lastValidMarker].toArray())
                    val approxMarker = MatOfPoint2f()
                    Imgproc.approxPolyDP(markerPoints, approxMarker, 10.0, true)

                    if (approxMarker.toArray().size == 4) {
                        val points = approxMarker.toArray()
                        for (i in 0 until 4) {
                            Imgproc.line(persistentOverlay, points[i], points[(i + 1) % 4],
                                        Scalar(255.0, 0.0, 0.0, 255.0), 2)
                        }
                    }
                    markerPoints.release()
                    approxMarker.release()
                }

                // Dibujar línea de orientación (blanca)
                //FIXME: Pinta una linea de color blanca del centro del qr hacía el centro de la marca
                // val muBorder = Imgproc.moments(contours[lastValidBorder])
                // val muMarker = Imgproc.moments(contours[lastValidMarker])

                // if (muBorder.m00 > 0 && muMarker.m00 > 0) {
                //     val centerBorder = Point(muBorder.m10/muBorder.m00, muBorder.m01/muBorder.m00)
                //     val centerMarker = Point(muMarker.m10/muMarker.m00, muMarker.m01/muMarker.m00)
                //     Imgproc.line(persistentOverlay, centerBorder, centerMarker,
                //                 Scalar(255.0, 255.0, 255.0, 255.0), 2)
                // }
            } catch (e: Exception) {
                Log.e("drawMarkers", "Error al dibujar marcadores: ${e.message}")
            }
        }
    }

	//Función de emgu, del archivo detectcode.cs
    fun detectCode(activeArea: Mat): Boolean {
        val gray = Mat(activeArea.rows(), activeArea.cols(), CvType.CV_8UC1)
        Imgproc.cvtColor(activeArea, gray, Imgproc.COLOR_RGB2GRAY)

        // Aplicar filtros y umbrales
        Imgproc.GaussianBlur(gray, gray, Size(5.0, 5.0), 0.0, 0.0)
        Imgproc.adaptiveThreshold(gray, gray, 255.0, Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY_INV, 51, 14.0)


        contours.clear() // Reiniciar la lista de contornos
        var hierarchy = Mat() // Reiniciar la jerarquía

        // Encontrar contornos
        Imgproc.findContours(gray, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE)

        mark = 0
        //val momentsList = mutableListOf<Moments>()
        val massCenters = mutableListOf<Point>()
        for (contour in contours) {
            // Calcular los momentos del contorno
            val mu = Imgproc.moments(contour)

            // Almacenar los momentos en una lista (opcional, para uso posterior) TODO:
            //momentsList.add(mu)

            // Verificar que el área del contorno no sea cero
            if (mu.m00 != 0.0) {
                // Calcular el centro de masa (X, Y)
                val centerX = mu.m10 / mu.m00
                val centerY = mu.m01 / mu.m00

                // Almacenar el centro de masa en una lista
                massCenters.add(Point(centerX, centerY))
            }
        }

        for (i in contours.indices) {
            val approx = MatOfPoint2f()
            val contour2f = MatOfPoint2f(*contours[i].toArray())
            Imgproc.approxPolyDP(contour2f, approx, Imgproc.arcLength(contour2f, true) * 0.02, true)

            if (approx.total() == 4L) {
                var k = i
                var c = 0
                var info = getHierarchy(hierarchy, k)

                while (info[2] != -1) {
                    info = getHierarchy(hierarchy, k)
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

        Log.d("pastel", "mark = ${mark}")

        if (mark >= 2) {
            val widthA = getApproximatedWidth(contours, border)
            val widthB = getApproximatedWidth(contours, marker)

            if (widthB > widthA) {
                val temp = border
                border = marker
                marker = temp
            }

            if (marker < massCenters.size && border < massCenters.size) {
                slope = lineSlope(massCenters[marker], massCenters[border])

                orientation = when {
                    slope > 0 && slope < 1.5708 ->  HOLO_NORTH
                    slope >= 1.5708 -> HOLO_EAST
                    slope < 0 && slope > -1.5708 -> HOLO_WEST
                    else -> HOLO_SOUTH
                }

                // Imgproc.drawContours(activeArea, contours, marker, Scalar(255.0, 0.0, 0.0), 3)
                // Imgproc.drawContours(activeArea, contours, border, Scalar(0.0, 255.0, 0.0), 3)
            } else {
                Log.w("pastel", "Índices fuera de rango: marker = $marker, border = $border")
            }
        }
        val minArea = (impSize * 0.005).coerceAtLeast(5.0)
        codeDetected = mark == 2 &&
                (border < contours.size && marker < contours.size &&
                        Imgproc.contourArea(contours[border]) > minArea &&
                        Imgproc.contourArea(contours[marker]) > minArea) //antes mina area era 10
        Log.d("pastel", "CODEDETECTED: ${codeDetected}")

        if (codeDetected) {
            synchronized(drawingLock) {
                lastValidBorder = border
                lastValidMarker = marker
            }

            val L = mutableListOf<Point>()
            val M = mutableListOf<Point>()
            val tempL = mutableListOf<Point>()
            val tempM = mutableListOf<Point>()

            val srcArray = arrayOfNulls<Point>(4)
            val dstArray = arrayOfNulls<Point>(4)

            // Obtener vértices de los contornos
            getVertices(contours, border, slope, tempL)
            getVertices(contours, marker, slope, tempM)

            // Reordenar según orientación
            updateCornerOrientation(orientation, tempL, L)
            updateCornerOrientation(orientation, tempM, M)

            // Convertir a Point para la transformación de perspectiva
            srcArray[0] = L[0]
            srcArray[1] = L[1]
            srcArray[2] = L[2]
            srcArray[3] = L[3]

            dstArray[0] = Point(0.0, 0.0)
            dstArray[1] = Point(holo_raw.cols().toDouble(), 0.0)
            dstArray[2] = Point(holo_raw.cols().toDouble(), holo_raw.rows().toDouble())
            dstArray[3] = Point(0.0, holo_raw.rows().toDouble())

            val src = MatOfPoint2f(*srcArray.filterNotNull().toTypedArray())
            val dst = MatOfPoint2f(*dstArray.filterNotNull().toTypedArray())

            if (srcArray.size == 4 && dstArray.size == 4) {
                val warpMatrix = Imgproc.getPerspectiveTransform(src, dst)
                Imgproc.warpPerspective(
                    activeArea,
                    holo_raw,
                    warpMatrix,
                    Size(holo_raw.cols().toDouble(), holo_raw.rows().toDouble())
                )

                when (orientation) {
                    HOLO_NORTH -> Core.rotate(holo_raw, holo_raw, Core.ROTATE_180)
                    HOLO_EAST -> Core.rotate(holo_raw, holo_raw, Core.ROTATE_90_CLOCKWISE)
                    HOLO_WEST -> Core.rotate(holo_raw, holo_raw, Core.ROTATE_90_COUNTERCLOCKWISE)
                    HOLO_SOUTH -> {} // No rotation needed
                }

                // Convertir a escala de grises
                Imgproc.cvtColor(holo_raw, holo_gray, Imgproc.COLOR_RGB2GRAY)

                // Operaciones de mejora de imagen
                val element = Imgproc.getStructuringElement(
                    Imgproc.MORPH_RECT,
                    Size(3.0, 3.0),
                    Point(1.0, 1.0)
                )

                // Aplicar CLAHE (Contrast Limited Adaptive Histogram Equalization)
                val clahe = Imgproc.createCLAHE(5.0, Size(30.0, 30.0))
                clahe.apply(holo_gray, holo_gray)

                // Operaciones morfológicas
                Imgproc.dilate(holo_gray, holo_gray, element, Point(-1.0, -1.0), 1)
                Imgproc.erode(holo_gray, holo_gray, element, Point(-1.0, -1.0), 1)
                Imgproc.GaussianBlur(holo_gray, holo_gray, Size(5.0, 5.0), 0.0)
                Imgproc.adaptiveThreshold(
                    holo_gray,
                    holo_gray,
                    255.0,
                    Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
                    Imgproc.THRESH_BINARY,
                    51,
                    16.0
                )

                // Recortar el borde
                val targetSize = 224
                val borderSize = 16  // Píxeles a conservar en bordes
                val centerRect = Rect(
                    borderSize,
                    borderSize,
                    holo_gray.cols() - 2*borderSize,
                    holo_gray.rows() - 2*borderSize
                )

                holoCode = Mat(holo_gray, centerRect)
            }
            src.release()
            dst.release()
        }
        gray.release()
        hierarchy.release()
        return codeDetected
    }

    fun extractBits(): Array<String>? {
        val holoCodeInt = Array(28) { IntArray(28) }
        val holoCodeArray = Array(28) { Array(28) { ByteArray(1) } }
        val imagen = Mat(28, 28, CvType.CV_8UC1)
        val holoImage = imagen // En Kotlin no necesitamos la conversión ToImage como en EmguCV

        val moduleValues = mutableListOf<Int>()
        val sizeW = impSize / 32  // Tamaño de la ventana de barrido
        var average: Int
        val oneVal: Byte = 255.toByte()
        val zeroVal: Byte = 0.toByte()

        // Procesar cada módulo (ventana de barrido)
        for (r in 0 until holoCode.rows() step sizeW) {
            for (c in 0 until holoCode.cols() step sizeW) {
                val tempRec = Rect(c, r, sizeW, sizeW)
                val module = Mat(holoCode, tempRec)

                // Convertir los valores del módulo a una lista
                for (i in 0 until sizeW) {
                    for (j in 0 until sizeW) {
                        val value = ByteArray(1)
                        module.get(i, j, value)
                        moduleValues.add(value[0].toInt() and 0xFF)
                    }
                }

                // Calcular promedio y determinar bit
                average = moduleValues.sum() / moduleValues.size
                if (average > 128) {
                    holoCodeArray[r / sizeW][c / sizeW][0] = oneVal
                    holoCodeInt[r / sizeW][c / sizeW] = 0
                } else {
                    holoCodeArray[r / sizeW][c / sizeW][0] = zeroVal
                    holoCodeInt[r / sizeW][c / sizeW] = 1
                }
                moduleValues.clear()
            }
        }

        // Convertir el array a Mat (forma simplificada)
        for (i in 0 until 28) {
            for (j in 0 until 28) {
                imagen.put(i, j, byteArrayOf(holoCodeArray[i][j][0]))
            }
        }

        holoMatrix = imagen.clone()

        val holoDecoder = HoloDecoder()
        val message2 = holoDecoder.decodeMessage(holoCodeInt)

        return if (message2 != "El mensaje está corrompido") {
            Log.d("pastel", "DECODER message ${message2}")
            val m = message2.split("_").toTypedArray()

            if (m.size < 5) {
                m
            } else {
                val vehicleType = HoloDecoder.whichVehicleNew(m[5].toInt())
                if (vehicleType != "Servicio no reconocido") {
                    m[5] += "_$vehicleType"
                } else {
                    m[5] += "_F"
                }
                m
            }
        } else {
            null
        }
    }

    private fun getApproximatedWidth(contours: List<MatOfPoint>, cId: Int): Int { //FIXME:
        val box: Rect = Imgproc.boundingRect(contours[cId])
        return box.width
    }

    private fun lineSlope(L: Point, M: Point): Double { //FIXME:
        val dx = (M.x - L.x).toDouble()
        val dy = (M.y - L.y).toDouble()

        // Manejar casos especiales
        return if (dx == 0.0 && dy == 0.0) {
            0.0 // Si los puntos son iguales, la pendiente es 0
        } else {
            Math.atan2(dy, dx)
        }
    }

    private fun getHierarchy(hierarchy: Mat, contourIdx: Int): IntArray { //FIXME:
        // Verificar que la jerarquía tenga las dimensiones correctas
        if (hierarchy.rows() != 1) {
            Log.d("pastel", "La jerarquía debe tener una sola fila.")
            return intArrayOf(-1, -1, -1, -1)
            // throw IllegalArgumentException("La jerarquía debe tener una sola fila.")
        }
        if (hierarchy.channels() != 4) {
            Log.d("pastel", "La jerarquía debe tener 4 canales.")
            return intArrayOf(-1, -1, -1, -1)
            // throw IllegalArgumentException("La jerarquía debe tener 4 canales.")
        }
        if (hierarchy.dims() != 2) {
            Log.d("pastel", "La jerarquía debe ser bidimensional")
            // throw IllegalArgumentException("La jerarquía debe ser bidimensional.")
            return intArrayOf(-1, -1, -1, -1)
        }

        // Verificar que el índice esté dentro del rango válido
        if (contourIdx < 0 || contourIdx >= hierarchy.cols()) {
            Log.d("pastel", "Índice de contorno fuera de rango.")
            // throw IllegalArgumentException("Índice de contorno fuera de rango.")
            return intArrayOf(-1, -1, -1, -1)
        }

        // Obtener los valores de la jerarquía para el contorno especificado
        val row = hierarchy.get(0, contourIdx)

        // Verificar que la fila no sea nula
        if (row == null) {
            Log.d("pastel", "Fila nula en la jerarquía para el índice: $contourIdx")
            // throw IllegalArgumentException("Fila nula en la jerarquía para el índice: $contourIdx")
            return intArrayOf(-1, -1, -1, -1)
        }

        // Devolver los 4 valores de la jerarquía
        return intArrayOf(
            row[0].toInt(), // Siguiente contorno
            row[1].toInt(), // Contorno anterior
            row[2].toInt(), // Primer contorno hijo
            row[3].toInt()  // Contorno padre
        )
    }

    private fun getVertices(contours: List<MatOfPoint>, cId: Int, slope: Double, quad: MutableList<Point>) { //FIXME:
        val box: Rect = Imgproc.boundingRect(contours[cId])

        val M0 = Point()
        val M1 = Point()
        val M2 = Point()
        val M3 = Point()
        val A = Point()
        val B = Point()
        val C = Point()
        val D = Point()
        val W = Point()
        val X = Point()
        val Y = Point()
        val Z = Point()

        A.x = box.x.toDouble()
        A.y = box.y.toDouble()
        B.x = (box.x + box.width).toDouble()
        B.y = box.y.toDouble()
        C.x = (box.x + box.width).toDouble()
        C.y = (box.y + box.height).toDouble()
        D.x = box.x.toDouble()
        D.y = (box.y + box.height).toDouble()

        W.x = (A.x + B.x) / 2
        W.y = A.y

        X.x = B.x
        X.y = (B.y + C.y) / 2

        Y.x = (C.x + D.x) / 2
        Y.y = C.y

        Z.x = D.x
        Z.y = (D.y + A.y) / 2

        val dmax = DoubleArray(4)
        dmax[0] = 0.0
        dmax[1] = 0.0
        dmax[2] = 0.0
        dmax[3] = 0.0

        var pd1 = 0.0
        var pd2 = 0.0

        // Convertir MatOfPoint a una lista de Point
        val contourPoints = contours[cId].toList()

        if (slope > 5 || slope < -5) {
            for (point in contourPoints) {
                pd1 = lineEquation(C, A, point)
                pd2 = lineEquation(B, D, point)

                if (pd1 >= 0.0 && pd2 > 0.0) {
                    updateCorner(point, W, dmax, 1, M1)
                } else if (pd1 > 0.0 && pd2 <= 0.0) {
                    updateCorner(point, X, dmax, 2, M2)
                } else if (pd1 <= 0.0 && pd2 < 0.0) {
                    updateCorner(point, Y, dmax, 3, M3)
                } else if (pd1 < 0.0 && pd2 >= 0.0) {
                    updateCorner(point, Z, dmax, 0, M0)
                }
            }
        } else {
            val halfx = ((A.x + B.x) / 2).toInt()
            val halfy = ((A.y + D.y) / 2).toInt()

            for (point in contourPoints) {
                if (point.x < halfx && point.y <= halfy) {
                    updateCorner(point, C, dmax, 2, M0)
                } else if (point.x >= halfx && point.y < halfy) {
                    updateCorner(point, D, dmax, 3, M1)
                } else if (point.x > halfx && point.y >= halfy) {
                    updateCorner(point, A, dmax, 0, M2)
                } else if (point.x <= halfx && point.y > halfy) {
                    updateCorner(point, B, dmax, 1, M3)
                }
            }
        }

        quad.add(M0)
        quad.add(M1)
        quad.add(M2)
        quad.add(M3)
    }

    private fun updateCornerOrientation(orientation: Int, IN: MutableList<Point>, OUT: MutableList<Point>) { //FIXME:
        // Limpiar la lista de salida
        OUT.clear()

        // Reordenar los puntos según la orientación
        when (orientation) {
            HOLO_NORTH -> {
                OUT.add(IN[0]) // Punto 0
                OUT.add(IN[1]) // Punto 1
                OUT.add(IN[2]) // Punto 2
                OUT.add(IN[3]) // Punto 3
            }
            HOLO_EAST -> {
                OUT.add(IN[1]) // Punto 1
                OUT.add(IN[2]) // Punto 2
                OUT.add(IN[3]) // Punto 3
                OUT.add(IN[0]) // Punto 0
            }
            HOLO_WEST -> {
                OUT.add(IN[3]) // Punto 3
                OUT.add(IN[0]) // Punto 0
                OUT.add(IN[1]) // Punto 1
                OUT.add(IN[2]) // Punto 2
            }
            HOLO_SOUTH -> {
                OUT.add(IN[2]) // Punto 2
                OUT.add(IN[3]) // Punto 3
                OUT.add(IN[0]) // Punto 0
                OUT.add(IN[1]) // Punto 1
            }
        }
    }

    private fun convertToPoint(pCv: Point): PointF { //FIXME:
        return PointF(pCv.x.toFloat(), pCv.y.toFloat())
    }

    private fun lineEquation(L: Point, M: Point, J: Point): Double { //FIXME:
        val a = -((M.y - L.y) / (M.x - L.x))
        val b = 1.0
        val c = (((M.y - L.y) / (M.x - L.x)) * L.x) - L.y

        return (a * J.x + (b * J.y) + c) / Math.sqrt((a * a) + (b * b))
    }

    private fun updateCorner(p: Point, reference: Point, baseline: DoubleArray, index: Int, corner: Point) { //FIXME:
        val tempDist = distance(p, reference)

        if (tempDist > baseline[index]) {
            baseline[index] = tempDist
            corner.x = p.x
            corner.y = p.y
        }
    }

    private fun distance(p: Point, q: Point): Double {//FIXME:
        return Math.sqrt(Math.pow(p.x - q.x, 2.0) + Math.pow(p.y - q.y, 2.0))
    }

    // Métodos de la interfaz CvCameraViewListener2 obligatorios por la misma clase CvCameraViewListener2, junto con onCameraFrame que esta mas arriba
    override fun onCameraViewStarted(width: Int, height: Int) {
        Log.d("pastel", "Camera view started")
        Log.d("pastel", "Camera view width:${width} height:${height}")
        frameCounter = 0
    }
    override fun onCameraViewStopped() {
        Log.d("pastel", "Camera view stopped")
        frameCounter = 0
        info = null
        synchronized(drawingLock) {
            // 1. Resetear variables de estado
            lastValidBorder = -1
            lastValidMarker = -1
            frameCounter = 0
            info = null
            
            // 2. Limpiar el overlay persistente
            if (overlayInitialized) {
                persistentOverlay.setTo(Scalar(0.0, 0.0, 0.0, 0.0)) // Limpiar contenido
                persistentOverlay.release() // Liberar memoria
                overlayInitialized = false
            }
            
            // 3. Liberar contornos
            contours.forEach { it.release() }
            contours.clear()
        }
    }
    @ReactMethod
    private fun sendDecodedInfoToReact(promise: Promise) {
        if (info != null && info != "El mensaje está corrompido") {
        Log.e("CameragusQR", "sendDecodedInfoToReact: ${info}")
        promise.resolve(info)
        } else { //FIXME: Tal vez no haga falta mandar esto como error
            //promise.reject("NoQRCode", "No QR code detected")
        promise.resolve("")
        }
    }
}

