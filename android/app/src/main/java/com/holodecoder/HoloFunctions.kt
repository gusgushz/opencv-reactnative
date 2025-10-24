package com.holodecoder

import android.content.res.Resources
import android.graphics.PointF
import kotlinx.coroutines.*

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

import android.util.Log

import com.holodecoder.HoloDecoder

class HoloFunctions {

  // Variables globales
    private var frameCounter = 0
    private var mark = 0
    private var border = -1
    private var marker = -1
    private var orientation = 0
    private var codeDetected = false
    private var slope: Double = 0.0
    private var impSize = 256 // Tamaño de la imagen procesada

    // Matrices y contenedores
    private lateinit var holo_raw: Mat // Matriz para la imagen transformada
    private lateinit var holo_gray: Mat // Matriz para la imagen en escala de grises
    private lateinit var holoCode: Mat // Matriz para el código detectado
    private lateinit var hierarchy: Mat // Jerarquía de contornos
    private var contours: MutableList<MatOfPoint> = ArrayList() // Contornos detectados
    private lateinit var holoMatrix: Mat // Matriz 28x28 para el resultado final
    private var info: String? = null

    companion object {
        const val HOLO_NORTH = 0
        const val HOLO_EAST = 1
        const val HOLO_WEST = 2
        const val HOLO_SOUTH = 3
    }

    init {
        holoCode = Mat()
        hierarchy = Mat()
        holo_raw = Mat.zeros(impSize, impSize, CvType.CV_8UC3)
        holo_gray = Mat.zeros(impSize, impSize, CvType.CV_8UC1)
        holoMatrix = Mat.zeros(28, 28, CvType.CV_8UC1)
    }

    //Función de emgu, del archivo detectcode.cs
    fun detectCode(activeArea: Mat): Boolean {
        val gray = Mat()
        val hierarchy = Mat()
        val approx = MatOfPoint2f()
        val contour2f = MatOfPoint2f()
        try {

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
            for (contour in contours.toList()) {
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
            if (contours.isEmpty()) return false
            val contourCount = contours.size // Captura el tamaño actual al inicio para evitar cambios por otro hilo
            for (i in 0 until contourCount) {

                // Validar que el índice sigue siendo válido
                if (i >= contours.size) break

                val contour = contours[i]
                val points = contour.toArray()

                if (points.isEmpty()) continue // evita crash si el contorno está vacío

                val contour2f = MatOfPoint2f(*points)

                if (contour2f.total().toInt() < 3) {
                    contour2f.release()
                    continue
                }

                val approx = MatOfPoint2f()
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
                approx.release()
                contour2f.release()
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
                    //Imgproc.resize(holoCode, holoCode, Size(28.0, 28.0)) //FIXME:
                }
                src.release()
                dst.release()
            }
            gray.release()
            hierarchy.release()
            return codeDetected
        } finally {
            gray.release()
            hierarchy.release()
            approx.release()
            contour2f.release()
        }
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
        try {
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
        } catch (e: Exception) {
            Log.e("pastel", "Error al extraer bits: ${e.message}")
            return null
        } finally {
            holoCode.release()
            imagen.release()
        }
    }

    private fun getApproximatedWidth(contours: List<MatOfPoint>, cId: Int): Int {//FIXME:
        if (contours.isEmpty() || cId < 0 || cId >= contours.size) {
            return 0 // O devuelve -1, lanza excepción controlada, loguea, etc.
        }

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
}