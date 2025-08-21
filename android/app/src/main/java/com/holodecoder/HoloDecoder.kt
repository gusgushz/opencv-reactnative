package com.holodecoder

import java.lang.Integer.parseInt
import java.util.HashSet
import kotlin.text.Regex
import android.util.Log

// import com.reedsolomon.Decoder
// import com.reedsolomon.GF257
// import com.reedsolomon.GF28
import com.google.zxing.common.reedsolomon.GenericGF
import com.google.zxing.common.reedsolomon.ReedSolomonDecoder
import com.google.zxing.common.reedsolomon.ReedSolomonException

class HoloDecoder {
    companion object {
        private fun whichState(id: Int): String {
            return when (id) {
                0 -> "AGUASCALIENTES"
                1 -> "BAJA CALIFORNIA"
                2 -> "BAJA CALIFORNIA SUR"
                3 -> "CAMPECHE"
                4 -> "CHIAPAS"
                5 -> "CHIHUAHUA"
                6 -> "CIUDAD DE MEXICO"
                7 -> "COAHUILA"
                8 -> "COLIMA"
                9 -> "DURANGO"
                10 -> "GUANAJUATO"
                11 -> "GUERRERO"
                12 -> "HIDALGO"
                13 -> "JALISCO"
                14 -> "MEXICO"
                15 -> "MICHOACAN"
                16 -> "MORELOS"
                17 -> "NAYARIT"
                18 -> "NUEVO LEON"
                19 -> "OAXACA"
                20 -> "PUEBLA"
                21 -> "QUERETARO"
                22 -> "QUINTANA ROO"
                23 -> "SAN LUIS POTOSI"
                24 -> "SINALOA"
                25 -> "SONORA"
                26 -> "TABASCO"
                27 -> "TAMAULIPAS"
                28 -> "TLAXCALA"
                29 -> "VERACRUZ"
                30 -> "YUCATAN"
                31 -> "ZACATECAS"
                32 -> "BELIZE"
                33 -> "CAYO"
                34 -> "COROZAL"
                35 -> "ORANGE WALK"
                36 -> "STANN CREEK"
                37 -> "TOLEDO"
                else -> "ESTADO"
            }
        }

        public fun whichVehicleNew(id: Int?): String {
            return when (id) {
                0 -> "Servicio no reconocido"
                1 -> "Autotransporte Federal Motrices"
                2 -> "Autotransporte Federal Remolques"
                3 -> "Autotransporte Federal Pasaje"
                4 -> "Autotransporte Federal Turismo"
                5 -> "Autotransporte con Inv. Ext. Motrices"
                6 -> "Autotransporte con Inv. Ext. Remolques"
                7 -> "Autotransporte con Inv. Ext. Pasaje"
                8 -> "Autotransporte con Inv. Ext. Turismo"
                9 -> "Autotransporte Arrendamiento Motrices"
                10 -> "Autotransporte Arrendamiento Remolque"
                11 -> "Autotransporte Arrendamiento Pasaje"
                12 -> "Autotransporte Arrendamiento Turismo"
                13 -> "Autotransporte Arrendamiento uso Particular"
                14 -> "Autotransporte Federal Paquetería y Mensajería"
                15 -> "Autotransporte Federal Capacidades Diferentes"
                16 -> "Autotransporte Federal Transfronterizo Motrices"
                17 -> "Autotransporte Federal Transfronterizo Remolques"
                18 -> "Autotransporte Federal Transfronterizo Pasaje"
                19 -> "Autotransporte Federal Inter. Motrices"
                20 -> "Autotransporte Federal Inter. Remolques"
                21 -> "Autotransporte Federal Inter. Pasaje"
                22 -> "Autotransporte Federal Gruas y Salvamiento"
                23 -> "Autotransporte Federal Traslado Nacional"
                24 -> "Autotransporte Federal Pasaje Económico"
                25 -> "Autotransporte Federal Inspección de Vias"
                26 -> "Autotransporte Federal Convertidor Dolly"
                27 -> "Autotransporte Federal Diagnóstico"
                28 -> "Autotransporte Federal Traslado Nacional Motos"
                29 -> "Privado Fronterizo Automóviles"
                30 -> "Privado Fronterizo Camiones"
                31 -> "Privado Fronterizo Autobuses"
                32 -> "Privado Fronterizo Remolques"
                33 -> "Público Local Fronterizo Automóviles"
                34 -> "Público Local Fronterizo Camiones"
                35 -> "Público Local Fronterizo Autobuses"
                36 -> "Público Local Fronterizo Remolques"
                37 -> "Policía Automóviles"
                38 -> "Policía Motocicletas"
                39 -> "Policía Federal"
                40 -> "Privado Demostración"
                41 -> "Privado Automóviles"
                42 -> "Privado Camiones"
                43 -> "Privado Autobuses"
                44 -> "Privado Remolques"
                45 -> "Privado Covnertidor Dolly"
                46 -> "Público Local sin Itinerario Libre"
                47 -> "Público Local sin Itinerario Sitio"
                48 -> "Público Local con Itinerario"
                49 -> "Público Local Camiones"
                50 -> "Público Local Autobuses"
                51 -> "Público Local Remolques"
                52 -> "Público Local Autómoviles"
                53 -> "Privado Antiguo"
                54 -> "Público Local Motocicletas"
                55 -> "Público Local Motocicletas"
                56 -> "Demostración Motocicletas"
                57 -> "Privado Motocicletas"
                58 -> "Privado Motocicletas"
                59 -> "Privado Motocicletas"
                60 -> "Privado Motocicletas"
                61 -> "Vehículo Ecológico"
                62 -> "Ambulancias"
                63 -> "Bomberos"
                64 -> "Protección Civil"
                65 -> "Escoltas Automóviles"
                66 -> "Escoltas Motocicletas"
                67 -> "Capacidades Diferentes"
                else -> "Servicio no reconocido"
            }
        }
    }

    fun decodeMessage(binaryData: Array<IntArray>): String {
        // Log.d("pastel", "inside DECODEMESSAGE********* ")
        // 1. Verificar orientación y rotar binaryData si es necesario
        when {
            binaryData[1][1] == 0 -> {
                Log.d("pastel", "Matriz sin rotar (basado en [1,1])")
            }
            binaryData[26][26] == 0 -> {
                rotateMatrix180(binaryData)
                Log.d("pastel", "Matriz rotada 180° (basado en [26,26])")
            }
            binaryData[1][26] == 0 -> {
                rotateMatrix270(binaryData)
                Log.d("pastel", "Matriz rotada 90° (basado en [1,26])")
            }
            binaryData[26][1] == 0 -> {
                rotateMatrix90(binaryData)
                Log.d("pastel", "Matriz rotada 270° (basado en [26,1])")
            }
            else -> {
                Log.w("pastel", "No se pudo determinar orientación, usando matriz original")
            }
        }

        // 2. Convertir binaryData (orientado correctamente) a byteData
        // Crear matriz de bytes y aplicar máscaras inversas
        val byteData = Array(28) { Array(28) { ByteArray(1) } }.apply {
            for (i in 0 until 28) {
                for (j in 0 until 28) {
                    this[i][j][0] = (if (binaryData[i][j] == 0) 255 else 0).toByte()
                }
            }
        }
        
        // Extraer bytes de máscara
        val mask0 = Integer.parseInt("00000${binaryData[6][0]}${binaryData[6][1]}${binaryData[6][2]}", 2)
        val mask1 = Integer.parseInt("00000${binaryData[6][3]}${binaryData[6][4]}${binaryData[6][5]}", 2)
        val mask2 = Integer.parseInt("00000${binaryData[7][0]}${binaryData[7][1]}${binaryData[7][2]}", 2)
        val mask3 = Integer.parseInt("00000${binaryData[7][3]}${binaryData[7][4]}${binaryData[7][5]}", 2)

        //TODO: todas las mascaras dan 1 
        // Log.d("pastel", "mask0: ${mask0}")
        // Log.d("pastel", "mask1: ${mask1}")
        // Log.d("pastel", "mask2: ${mask2}")
        // Log.d("pastel", "mask3: ${mask3}")

        printMatrixWithoutBorders(byteData)//FIXME:
        
        // Aplicar máscaras (implementar función mask similar a la de C#)
        mask(byteData, mask0, mask1, mask2, mask3)

        // Actualizar binaryData con los datos desenmascarados
        for (i in 0 until 28) {
            for (j in 0 until 28) {
                binaryData[i][j] = if (byteData[i][j][0] == 255.toByte()) 0 else 1
            }
        }

        // Extraer datos binarios
        val binStrings = Array(84) { "" }
        var counter = 0

        // Primer bloque (5 iteraciones)
        for (i in 0 until 5) {
            for (j in 0 until 4) {
                for (k in 0 until 2) {
                    binStrings[counter] += binaryData[k + 26][j + (i * 4) + 4].toString()
                }
            }
            counter++
        }

        // Segundo bloque (5 iteraciones)
        for (i in 0 until 5) {
            for (j in 0 until 4) {
                for (k in 0 until 2) {
                    binStrings[counter] += binaryData[k + 24][-j - (i * 4) + 23].toString()
                }
            }
            counter++
        }

        // Tercer bloque (8 iteraciones con sub-bloques)
        for (h in 0 until 8) {
            if (h % 2 == 0) {
                // Sub-bloque par
                for (i in 0 until 7) {
                    for (j in 0 until 4) {
                        for (k in 0 until 2) {
                            binStrings[counter] += binaryData[k + 22 - (h * 2)][j + (i * 4) + 0].toString()
                        }
                    }
                    counter++
                }
            } else {
                // Sub-bloque impar
                for (i in 0 until 7) {
                    for (j in 0 until 4) {
                        for (k in 0 until 2) {
                            binStrings[counter] += binaryData[k + 22 - (h * 2)][-j - (i * 4) + 27].toString()
                        }
                    }
                    counter++
                }
            }
        }

        // Cuarto bloque (5 iteraciones)
        for (i in 0 until 5) {
            for (j in 0 until 4) {
                for (k in 0 until 2) {
                    binStrings[counter] += binaryData[k + 6][j + (i * 4) + 8].toString()
                }
            }
            counter++
        }

        // Quinto bloque (5 iteraciones)
        for (i in 0 until 5) {
            for (j in 0 until 4) {
                for (k in 0 until 2) {
                    binStrings[counter] += binaryData[k + 4][-j - (i * 4) + 27].toString()
                }
            }
            counter++
        }

        // Sexto bloque (4 iteraciones)
        for (i in 0 until 4) {
            for (j in 0 until 4) {
                for (k in 0 until 2) {
                    binStrings[counter] += binaryData[k + 2][j + (i * 4) + 8].toString()
                }
            }
            counter++
        }

        // Séptimo bloque (4 iteraciones)
        for (i in 0 until 4) {
            for (j in 0 until 4) {
                for (k in 0 until 2) {
                    binStrings[counter] += binaryData[k][-j - (i * 4) + 23].toString()
                }
            }
            counter++
        }

        // Convertir a bytes
        val extractedData = ByteArray(84)
        for (i in 0 until 84) {
            extractedData[i] = binStrings[i].toInt(2).toByte()
            // Log.d("pastel", "EXTRACTEDDATA: ${extractedData[i]}")
        }

        // Corrección de errores (necesitarías implementar ReedSolomonDecoder)
        val finalMessage = IntArray(84) { extractedData[it].toInt() and 0xFF }

        // // Imprime los datos (hexadecimal)
        // Log.d("pastel", "Contenido de finalMessage (84 elementos):")
        // Log.d("pastel", finalMessage.joinToString(" ") { "%02X".format(it) })

        // 3. Decodificación
        try {
            // Aplicar Reed-Solomon antes del checksum
            val field = GenericGF(285, 256, 0)  // Polinomio x⁸ + x⁴ + x³ + x² + 1
            val rsd = ReedSolomonDecoder(field)
            // Log.d("pastel", "Datos antes de RS (hex): ${finalMessage.take(48).joinToString(" ") { "%02X".format(it) }}")
            // for (i in 0 until 84) {
            //     Log.d("original", "byte[$i] = %02X".format(finalMessage[i]))
            // }
            rsd.decode(finalMessage, 36)  // 36 bytes de redundancia
            // Log.d("pastel", "Datos después de RS (hex): ${finalMessage.take(48).joinToString(" ") { "%02X".format(it) }}")
        } catch (e: ReedSolomonException) {
            Log.e("pastel", "Error RS: ${e.message}")
            return "El mensaje está corrompido"
        }

        // 5. Verificar checksum (AHORA con datos corregidos)
        val checksumCalc = finalMessage.take(47).sum() % 256
        val originalChecksum = finalMessage[47]
        
        if (checksumCalc != originalChecksum) {
            Log.e("pastel", "Checksum inválido: Calculado=$checksumCalc, Esperado=$originalChecksum. Mensaje corrupto.")
            return "Mensaje corrupto (checksum)"
        }

        // Parsear mensaje
        val specs = arrayOfNulls<String>(13)
        specs[0] = finalMessage[0].toString()
        specs[2] = finalMessage[2].toString()

        if (specs[0] == "2") {
            val message = StringBuilder()
            for (i in 4 until specs[2]!!.toInt()) {
                message.append(finalMessage[i].toInt().toChar())
            }
            specs[1] = message.toString()
            return message.toString()
        }

        specs[1] = when (finalMessage[1].toInt()) {
            0 -> "Delantero"
            1 -> "Trasero"
            2 -> "Engomado"
            3 -> "Tarjeta"
            else -> return "El mensaje está corrompido"
        }

        specs[3] = finalMessage[3].toString()
        specs[4] = (4..10).map { finalMessage[it].toInt().toChar() }.joinToString("")
        specs[5] = finalMessage[12].toString()
        specs[6] = whichState(finalMessage[13] - 1)
        //specs[6] = finalMessage[13].toString()
        Log.d("pastel", "finalMessage[13].toString(): ${finalMessage[13].toString()}")
        specs[7] = (14..19).map { finalMessage[it].toInt().toChar() }.joinToString("")
        specs[8] = (20..26).map { finalMessage[it].toInt().toChar() }.joinToString("")
        specs[9] = finalMessage[27].toString()
        specs[10] = "20${finalMessage[28]}-20${finalMessage[29]}"
        specs[11] = "20${finalMessage[30]}"
        specs[12] = (31..46).map { finalMessage[it].toInt().toChar() }.joinToString("")

        // Validación con regex
        val plateNumber = specs[4]!!.trim()
        if (!Regex("^[A-Z0-9]+\$").matches(plateNumber)) {
            return "El mensaje está corrompido"
        }
        
        val result = specs.joinToString("_") { it?.trim() ?: "" }
        Log.d("pastel", "Mensaje specs: ${result}")
        return result
    }

    fun mask(matrix: Array<Array<ByteArray>>, mask0: Int, mask1: Int, mask2: Int, mask3: Int): Int {
        val AoM = 4 // Amount of Masks

        // Validar máscaras
        if (mask1 > AoM - 1 || mask2 > AoM - 1 || mask3 > AoM - 1 || mask0 > AoM - 1) {
            return 1
        }

        val centerColumn = matrix.size / 2
        val centerRow = matrix[0].size / 2

        // Definición de las máscaras
        val maskBytes = arrayOf(
            intArrayOf(255, 255, 255),
            intArrayOf(255, 255, 0),
            intArrayOf(255, 0, 255),
            intArrayOf(255, 0, 0)
        )
        
        val maskMatrix = Array(4) { Array(28) { IntArray(28) } }

        // Máscara 0 (vertical stripes)
        for (x in 0 until centerRow) {
            for (y in 0 until centerRow) {
                val bit = y % 2
                maskMatrix[0][x][y] = bit * 255
            }
        }

        // Máscara 1 (horizontal stripes)
        for (x in 0 until centerRow) {
            for (y in 0 until centerRow) {
                val bit = x % 2
                maskMatrix[1][x][y] = bit * 255
            }
        }

        // Máscara 2 (checkerboard pattern)
        for (x in 0 until centerRow) {
            for (y in 0 until centerRow) {
                val bit = (y + x) % 2
                maskMatrix[2][x][y] = bit * 255
            }
        }

        // Máscara 3 (inverse checkerboard)
        for (x in 0 until centerRow) {
            for (y in 0 until centerRow) {
                val bit = (y + x + 1) % 2
                maskMatrix[3][x][y] = bit * 255
            }
        }

        // Aplicar máscaras a cada cuadrante
        // Cuadrante 0 (superior izquierdo)
        for (i in 0 until centerRow) {
            for (j in 0 until centerRow) {
                if (maskMatrix[mask0][i][j] == 255) {
                    matrix[i][j][0] = if (matrix[i][j][0] == 255.toByte()) 0.toByte() else 255.toByte()
                }
            }
        }

        // Cuadrante 1 (superior derecho)
        for (i in 0 until centerRow) {
            for (j in 0 until centerRow) {
                if (maskMatrix[mask1][i][j] == 255) {
                    matrix[i][j + centerRow][0] = if (matrix[i][j + centerRow][0] == 255.toByte()) 0.toByte() else 255.toByte()
                }
            }
        }

        // Cuadrante 2 (inferior izquierdo)
        for (i in 0 until centerRow) {
            for (j in 0 until centerRow) {
                if (maskMatrix[mask2][i][j] == 255) {
                    matrix[i + centerRow][j][0] = if (matrix[i + centerRow][j][0] == 255.toByte()) 0.toByte() else 255.toByte()
                }
            }
        }

        // Cuadrante 3 (inferior derecho)
        for (i in 0 until centerRow) {
            for (j in 0 until centerRow) {
                if (maskMatrix[mask3][i][j] == 255) {
                    matrix[i + centerRow][j + centerRow][0] = if (matrix[i + centerRow][j + centerRow][0] == 255.toByte()) 0.toByte() else 255.toByte()
                }
            }
        }

        // Formatear el byte de matriz con información de máscaras
        for (x in 0 until 3) {
            matrix[6][3 + x][0] = maskBytes[mask1][x].toByte()
            matrix[6][0 + x][0] = maskBytes[mask0][x].toByte()
            matrix[7][0 + x][0] = maskBytes[mask2][x].toByte()
            matrix[7][3 + x][0] = maskBytes[mask3][x].toByte()

            matrix[0 + x][6][0] = maskBytes[mask0][x].toByte()
            matrix[3 + x][6][0] = maskBytes[mask1][x].toByte()
            matrix[0 + x][7][0] = maskBytes[mask2][x].toByte()
            matrix[3 + x][7][0] = maskBytes[mask3][x].toByte()
        }
        return 0
    }
    fun printMatrixWithoutBorders(matrix: Array<Array<ByteArray>>) {
        val sb = StringBuilder("\n   ")
        
        // Encabezado de columnas
        for (j in 0 until 28) sb.append("%02d ".format(j))
        sb.append("\n")
        
        for (i in 0 until 28) {
            sb.append("%02d ".format(i)) // Número de fila
            for (j in 0 until 28) {
                sb.append(if (matrix[i][j][0].toInt() == 0) "██ " else "   ")
            }
            sb.append("\n")
        }
        Log.d("pastel", "Matriz con coordenadas:$sb")
    }

    private fun rotateMatrix180(matrix: Array<IntArray>) {
        val n = matrix.size
        for (i in 0 until n / 2) {
            for (j in 0 until n) {
                // Intercambiar elementos opuestos
                val temp = matrix[i][j]
                matrix[i][j] = matrix[n - 1 - i][n - 1 - j]
                matrix[n - 1 - i][n - 1 - j] = temp
            }
        }
    }
    private fun rotateMatrix90(matrix: Array<IntArray>) {
        val n = matrix.size
        for (i in 0 until n / 2) {
            for (j in i until n - i - 1) {
                // Intercambiar elementos en sentido horario
                val temp = matrix[i][j]
                matrix[i][j] = matrix[n - j - 1][i]
                matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1]
                matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1]
                matrix[j][n - i - 1] = temp
            }
        }
    }
    private fun rotateMatrix270(matrix: Array<IntArray>) {
        val n = matrix.size
        for (i in 0 until n / 2) {
            for (j in i until n - i - 1) {
                // Intercambiar elementos en sentido antihorario
                val temp = matrix[i][j]
                matrix[i][j] = matrix[j][n - i - 1]
                matrix[j][n - i - 1] = matrix[n - i - 1][n - j - 1]
                matrix[n - i - 1][n - j - 1] = matrix[n - j - 1][i]
                matrix[n - j - 1][i] = temp
            }
        }
    }
}
