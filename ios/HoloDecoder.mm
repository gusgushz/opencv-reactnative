// HoloDecoder.mm
#import "HoloDecoder.h"
#import <ZXingObjC/ZXingObjC.h>
#import "ZXReedSolomonDecoder.h"

static ZXGenericGF *QRCodeField256() {
    static ZXGenericGF *field = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        field = [[ZXGenericGF alloc] initWithPrimitive:0x011D size:256 b:0];
    });
    return field;
}

@implementation HoloDecoder

+ (NSString *)whichState:(NSInteger)id {
    NSArray *states = @[
        @"AGUASCALIENTES", @"BAJA CALIFORNIA", @"BAJA CALIFORNIA SUR", @"CAMPECHE",
        @"CHIAPAS", @"CHIHUAHUA", @"CIUDAD DE MÉXICO", @"COAHUILA",
        @"COLIMA", @"DURANGO", @"GUANAJUATO", @"GUERRERO",
        @"HIDALGO", @"JALISCO", @"MÉXICO", @"MICHOACÁN",
        @"MORELOS", @"NAYARIT", @"NUEVO LEÓN", @"OAXACA",
        @"PUEBLA", @"QUERÉTARO", @"QUINTANA ROO", @"SAN LUIS POTOSÍ",
        @"SINALOA", @"SONORA", @"TABASCO", @"TAMAULIPAS",
        @"TLAXCALA", @"VERACRUZ", @"YUCATÁN", @"ZACATECAS",
        @"BELIZE", @"CAYO", @"COROZAL", @"ORANGE WALK",
        @"STANN CREEK", @"TOLEDO"
    ];
    
    return (id >= 0 && id < states.count) ? states[id] : @"ESTADO";
}

+ (NSString *)whichVehicleNew:(NSInteger)id {
    NSArray *vehicles = @[
        @"Servicio no reconocido",
        @"Autotransporte Federal Motrices",
        @"Autotransporte Federal Remolques",
        @"Autotransporte Federal Pasaje",
        @"Autotransporte Federal Turismo",
        @"Autotransporte con Inv. Ext. Motrices",
        @"Autotransporte con Inv. Ext. Remolques",
        @"Autotransporte con Inv. Ext. Pasaje",
        @"Autotransporte con Inv. Ext. Turismo",
        @"Autotransporte Arrendamiento Motrices",
        @"Autotransporte Arrendamiento Remolque",
        @"Autotransporte Arrendamiento Pasaje",
        @"Autotransporte Arrendamiento Turismo",
        @"Autotransporte Arrendamiento uso Particular",
        @"Autotransporte Federal Paquetería y Mensajería",
        @"Autotransporte Federal Capacidades Diferentes",
        @"Autotransporte Federal Transfronterizo Motrices",
        @"Autotransporte Federal Transfronterizo Remolques",
        @"Autotransporte Federal Transfronterizo Pasaje",
        @"Autotransporte Federal Inter. Motrices",
        @"Autotransporte Federal Inter. Remolques",
        @"Autotransporte Federal Inter. Pasaje",
        @"Autotransporte Federal Grúas y Salvamento",
        @"Autotransporte Federal Traslado Nacional",
        @"Autotransporte Federal Pasaje Económico",
        @"Autotransporte Federal Inspección de Vías",
        @"Autotransporte Federal Convertidor Dolly",
        @"Autotransporte Federal Diagnóstico",
        @"Autotransporte Federal Traslado Nacional Motos",
        @"Privado Fronterizo Automóviles",
        @"Privado Fronterizo Camiones",
        @"Privado Fronterizo Autobuses",
        @"Privado Fronterizo Remolques",
        @"Público Local Fronterizo Automóviles",
        @"Público Local Fronterizo Camiones",
        @"Público Local Fronterizo Autobuses",
        @"Público Local Fronterizo Remolques",
        @"Policía Automóviles",
        @"Policía Motocicletas",
        @"Policía Federal",
        @"Privado Demostración",
        @"Privado Automóviles",
        @"Privado Camiones",
        @"Privado Autobuses",
        @"Privado Remolques",
        @"Privado Convertidor Dolly",
        @"Público Local sin Itinerario Libre",
        @"Público Local sin Itinerario Sitio",
        @"Público Local con Itinerario",
        @"Público Local Camiones",
        @"Público Local Autobuses",
        @"Público Local Remolques",
        @"Público Local Automóviles",
        @"Privado Antiguo",
        @"Público Local Motocicletas",
        @"Público Local Motocicletas",
        @"Demostración Motocicletas",
        @"Privado Motocicletas",
        @"Privado Motocicletas",
        @"Privado Motocicletas",
        @"Privado Motocicletas",
        @"Vehículo Ecológico",
        @"Ambulancias",
        @"Bomberos",
        @"Protección Civil",
        @"Escoltas Automóviles",
        @"Escoltas Motocicletas",
        @"Capacidades Diferentes"
    ];
    
    return (id >= 0 && id < vehicles.count) ? vehicles[id] : @"Servicio no reconocido";
}

- (NSString *)decodeMessage:(int **)binaryData rows:(int)rows cols:(int)cols {
    [self flipMatrix90DegreesRight:binaryData rows:rows cols:cols];

    // 1. Verificar orientación y rotar si es necesario
    if (binaryData[1][1] == 1) {
        [self rotateMatrix180:binaryData rows:rows cols:cols];
        NSLog(@"Matriz rotada 180° (basado en [1,1])");
    }

    // 2. Convertir binaryData a byteData y aplicar máscaras
    uint8_t byteData[28][28];
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            byteData[i][j] = binaryData[i][j] == 0 ? 255 : 0;
        }
    }

    int mask0 = (binaryData[6][0] << 2) | (binaryData[6][1] << 1) | binaryData[6][2];
    int mask1 = (binaryData[6][3] << 2) | (binaryData[6][4] << 1) | binaryData[6][5];
    int mask2 = (binaryData[7][0] << 2) | (binaryData[7][1] << 1) | binaryData[7][2];
    int mask3 = (binaryData[7][3] << 2) | (binaryData[7][4] << 1) | binaryData[7][5];

    [self printMatrixWithoutBorders:binaryData rows:rows cols:cols];

    [self mask:byteData rows:28 cols:28 mask0:mask0 mask1:mask1 mask2:mask2 mask3:mask3];

    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            binaryData[i][j] = byteData[i][j] == 255 ? 0 : 1;
        }
    }

    // 3. Extraer datos binarios (MODIFICADO PARA COINCIDIR CON KOTLIN)
    NSMutableArray<NSString *> *binStrings = [NSMutableArray array];
    for (int i = 0; i < 84; i++) {
        [binStrings addObject:@""];
    }

    int counter = 0;

    // Primer bloque (5 iteraciones) - Coincide con Kotlin
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 4; j++) {
            for (int k = 0; k < 2; k++) {
                int row = k + 26;
                int col = j + (i * 4) + 4;
                if (row < rows && col < cols) {
                    binStrings[counter] = [binStrings[counter] stringByAppendingFormat:@"%d", binaryData[row][col]];
                }
            }
        }
        counter++;
    }

    // Segundo bloque (5 iteraciones) - Modificado para coincidir con Kotlin
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 4; j++) {
            for (int k = 0; k < 2; k++) {
                int row = k + 24;
                int col = 23 - j - (i * 4); // Cambiado para coincidir con Kotlin (-j - (i * 4) + 23)
                if (row < rows && col >= 0 && col < cols) {
                    binStrings[counter] = [binStrings[counter] stringByAppendingFormat:@"%d", binaryData[row][col]];
                }
            }
        }
        counter++;
    }

    // Tercer bloque (8 iteraciones con sub-bloques) - Modificado
    for (int h = 0; h < 8; h++) {
        if (h % 2 == 0) {
            // Sub-bloque par
            for (int i = 0; i < 7; i++) {
                for (int j = 0; j < 4; j++) {
                    for (int k = 0; k < 2; k++) {
                        int row = k + 22 - (h * 2);
                        int col = j + (i * 4) + 0;
                        if (row >= 0 && row < rows && col >= 0 && col < cols) {
                            binStrings[counter] = [binStrings[counter] stringByAppendingFormat:@"%d", binaryData[row][col]];
                        }
                    }
                }
                counter++;
            }
        } else {
            // Sub-bloque impar
            for (int i = 0; i < 7; i++) {
                for (int j = 0; j < 4; j++) {
                    for (int k = 0; k < 2; k++) {
                        int row = k + 22 - (h * 2);
                        int col = 27 - j - (i * 4); // Cambiado para coincidir con Kotlin (-j - (i * 4) + 27)
                        if (row >= 0 && row < rows && col >= 0 && col < cols) {
                            binStrings[counter] = [binStrings[counter] stringByAppendingFormat:@"%d", binaryData[row][col]];
                        }
                    }
                }
                counter++;
            }
        }
    }

    // Cuarto bloque (5 iteraciones) - Coincide con Kotlin
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 4; j++) {
            for (int k = 0; k < 2; k++) {
                int row = k + 6;
                int col = j + (i * 4) + 8;
                if (row < rows && col < cols) {
                    binStrings[counter] = [binStrings[counter] stringByAppendingFormat:@"%d", binaryData[row][col]];
                }
            }
        }
        counter++;
    }

    // Quinto bloque (5 iteraciones) - Modificado para coincidir con Kotlin
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 4; j++) {
            for (int k = 0; k < 2; k++) {
                int row = k + 4;
                int col = 27 - j - (i * 4); // Cambiado para coincidir con Kotlin (-j - (i * 4) + 27)
                if (row < rows && col >= 0 && col < cols) {
                    binStrings[counter] = [binStrings[counter] stringByAppendingFormat:@"%d", binaryData[row][col]];
                }
            }
        }
        counter++;
    }

    // Sexto bloque (4 iteraciones) - Coincide con Kotlin
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            for (int k = 0; k < 2; k++) {
                int row = k + 2;
                int col = j + (i * 4) + 8;
                if (row < rows && col < cols) {
                    binStrings[counter] = [binStrings[counter] stringByAppendingFormat:@"%d", binaryData[row][col]];
                }
            }
        }
        counter++;
    }

    // Séptimo bloque (4 iteraciones) - Modificado para coincidir con Kotlin
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            for (int k = 0; k < 2; k++) {
                int row = k;
                int col = 23 - j - (i * 4); // Cambiado para coincidir con Kotlin (-j - (i * 4) + 23)
                if (row < rows && col >= 0 && col < cols) {
                    binStrings[counter] = [binStrings[counter] stringByAppendingFormat:@"%d", binaryData[row][col]];
                }
            }
        }
        counter++;
    }

    for (int i = 0; i < 84; i++) {
        if (binStrings[i].length != 8) {
            NSLog(@"❌ binStrings[%d] no tiene 8 bits: %@", i, binStrings[i]);
        }
    }
    // for (int i = 0; i < 84; i++) {
    //     NSLog(@"binStrings[%d] = %@", i, binStrings[i]);
    // }

    // Convertir binarios a bytes
    uint8_t extractedData[84];
    for (int i = 0; i < 84; i++) {
        const char *cstr = [binStrings[i] UTF8String];
        extractedData[i] = (uint8_t)strtol(cstr, NULL, 2);
    }

    // NSLog(@"🧪 extractedData (hex):");
    // for (int i = 0; i < 84; i++) {
    //     NSLog(@"%02X", extractedData[i]);
    // }

    // 4. Corrección de errores Reed-Solomon
    @try {
        NSLog(@"HOLO Antes de ZXReedSolomonDecoder");
        ZXGenericGF *field = QRCodeField256();
        ZXReedSolomonDecoder *rsd = [[ZXReedSolomonDecoder alloc] initWithField:field];

        ZXIntArray *intArray = [[ZXIntArray alloc] initWithLength:84];
        for (int i = 0; i < 84; i++) {
            intArray.array[i] = extractedData[i] & 0xFF;
        }

        NSError *error = nil;
        // NSMutableString *logStr = [NSMutableString stringWithString:@"\n[ReedSolomon Input]:\n"];
        // for (int i = 0; i < 84; i++) {
        //     [logStr appendFormat:@"%02X ", intArray.array[i] & 0xFF];
        // }
        // NSLog(@"%@", logStr);

        // if (![rsd decode:intArray twoS:36 error:&error]) {
        //     NSLog(@"HOLO Error al decodificar con Reed-Solomon: %@", error.localizedDescription);
        //     return @"El mensaje está corrompido";
        // }
        BOOL result = [rsd decode:intArray twoS:36 error:&error];
        NSLog(@"¿decode fue llamado? %@", result ? @"✅ Sí, y funcionó" : @"❌ Sí, pero falló");
        if (!result) {
            NSLog(@"Error real: %@", error.localizedDescription);
            return @"El mensaje está corrompido";
        }

        // // Copiar datos corregidos de vuelta
        for (int i = 0; i < 84; i++) {
            extractedData[i] = (uint8_t)intArray.array[i];
        }

    } @catch (NSException *exception) {
        NSLog(@"Error RS: %@", exception.reason);
        return @"El mensaje está corrompido";
    }


    // 5. Verificar checksum
    int checksumCalc = 0;
    for (int i = 0; i < 47; i++) {
        checksumCalc += extractedData[i];
    }
    checksumCalc %= 256;

    if (checksumCalc != extractedData[47]) {
        NSLog(@"Checksum inválido: Calculado=%d, Esperado=%d. Mensaje corrupto.", checksumCalc, extractedData[47]);
        return @"Mensaje corrupto (checksum)";
    }

    // 6. Parsear mensaje
    NSMutableArray<NSString *> *specs = [NSMutableArray array];
    for (int i = 0; i < 13; i++) [specs addObject:@""];

    specs[0] = [NSString stringWithFormat:@"%d", extractedData[0]];
    specs[2] = [NSString stringWithFormat:@"%d", extractedData[2]];

    if ([specs[0] isEqualToString:@"2"]) {
        NSMutableString *message = [NSMutableString string];
        for (int i = 4; i < [specs[2] intValue]; i++) {
            [message appendFormat:@"%c", extractedData[i]];
        }
        return message;
    }

    switch (extractedData[1]) {
        case 0: specs[1] = @"Delantero"; break;
        case 1: specs[1] = @"Trasero"; break;
        case 2: specs[1] = @"Engomado"; break;
        case 3: specs[1] = @"Tarjeta"; break;
        default: return @"El mensaje está corrompido";
    }

    specs[3] = [NSString stringWithFormat:@"%d", extractedData[3]];

    // specs[4] (4..10)
    NSMutableString *spec4 = [NSMutableString string];
    for (int i = 4; i <= 10; i++) {
        [spec4 appendFormat:@"%c", extractedData[i]];
    }
    specs[4] = spec4;

    specs[5] = [NSString stringWithFormat:@"%d", extractedData[12]];
    specs[6] = [HoloDecoder whichState:extractedData[13] - 1];

    // specs[7] (14..19)
    NSMutableString *spec7 = [NSMutableString string];
    for (int i = 14; i <= 19; i++) {
        [spec7 appendFormat:@"%c", extractedData[i]];
    }
    specs[7] = spec7;

    // specs[8] (20..26)
    NSMutableString *spec8 = [NSMutableString string];
    for (int i = 20; i <= 26; i++) {
        [spec8 appendFormat:@"%c", extractedData[i]];
    }
    specs[8] = spec8;

    specs[9] = [NSString stringWithFormat:@"%d", extractedData[27]];
    specs[10] = [NSString stringWithFormat:@"20%d-20%d", extractedData[28], extractedData[29]];
    specs[11] = [NSString stringWithFormat:@"20%d", extractedData[30]];

    // specs[12] (31..46)
    NSMutableString *spec12 = [NSMutableString string];
    for (int i = 31; i <= 46; i++) {
        [spec12 appendFormat:@"%c", extractedData[i]];
    }
    specs[12] = spec12;

    // Validación con regex
    NSString *plateNumber = [specs[4] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"^[A-Z0-9]+$" options:0 error:nil];
    if ([regex numberOfMatchesInString:plateNumber options:0 range:NSMakeRange(0, plateNumber.length)] == 0) {
        return @"El mensaje está corrompido";
    }

    // Crear resultado final
    NSMutableArray *trimmedSpecs = [NSMutableArray array];
    for (NSString *spec in specs) {
        NSString *trimmed = [spec stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
        [trimmedSpecs addObject:trimmed ? trimmed : @""];
    }

    NSString *result = [trimmedSpecs componentsJoinedByString:@"_"];
    NSLog(@"Mensaje specs: %@", result);
    return result;
}


- (void)rotateMatrix180:(int **)matrix rows:(int)rows cols:(int)cols {
    for (int i = 0; i < rows / 2; i++) {
        for (int j = 0; j < cols; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[rows - 1 - i][cols - 1 - j];
            matrix[rows - 1 - i][cols - 1 - j] = temp;
        }
    }
}

- (void)flipMatrix90DegreesRight:(int **)matrix rows:(int)rows cols:(int)cols {
    // Paso 1: Transponer (intercambiar matrix[i][j] con matrix[j][i])
    for (int i = 0; i < rows; i++) {
        for (int j = i + 1; j < cols; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }

    // Paso 2: Flip horizontal
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols / 2; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[i][cols - 1 - j];
            matrix[i][cols - 1 - j] = temp;
        }
    }
}

- (int)mask:(uint8_t [28][28])matrix rows:(int)rows cols:(int)cols
       mask0:(int)mask0 mask1:(int)mask1 mask2:(int)mask2 mask3:(int)mask3 {

    const int AoM = 4;

    if (mask0 > AoM - 1 || mask1 > AoM - 1 || mask2 > AoM - 1 || mask3 > AoM - 1) {
        return 1;
    }

    int center = rows / 2;

    // Definir patrones
    int maskMatrix[4][14][14];
    for (int x = 0; x < 14; x++) {
        for (int y = 0; y < 14; y++) {
            maskMatrix[0][x][y] = (y % 2) * 255;                      // vertical stripes
            maskMatrix[1][x][y] = (x % 2) * 255;                      // horizontal stripes
            maskMatrix[2][x][y] = ((x + y) % 2) * 255;                // checkerboard
            maskMatrix[3][x][y] = ((x + y + 1) % 2) * 255;            // inverse checkerboard
        }
    }

    // Cuadrante 0 - superior izquierdo
    for (int i = 0; i < 14; i++) {
        for (int j = 0; j < 14; j++) {
            if (maskMatrix[mask0][i][j] == 255) {
                matrix[i][j] = matrix[i][j] == 255 ? 0 : 255;
            }
        }
    }

    // Cuadrante 1 - superior derecho
    for (int i = 0; i < 14; i++) {
        for (int j = 0; j < 14; j++) {
            if (maskMatrix[mask1][i][j] == 255) {
                matrix[i][j + center] = matrix[i][j + center] == 255 ? 0 : 255;
            }
        }
    }

    // Cuadrante 2 - inferior izquierdo
    for (int i = 0; i < 14; i++) {
        for (int j = 0; j < 14; j++) {
            if (maskMatrix[mask2][i][j] == 255) {
                matrix[i + center][j] = matrix[i + center][j] == 255 ? 0 : 255;
            }
        }
    }

    // Cuadrante 3 - inferior derecho
    for (int i = 0; i < 14; i++) {
        for (int j = 0; j < 14; j++) {
            if (maskMatrix[mask3][i][j] == 255) {
                matrix[i + center][j + center] = matrix[i + center][j + center] == 255 ? 0 : 255;
            }
        }
    }

    // Escribir los valores de las máscaras en la matriz (como en Kotlin)
    uint8_t maskBytes[4][3] = {
        {255, 255, 255},
        {255, 255, 0},
        {255, 0, 255},
        {255, 0, 0}
    };

    for (int x = 0; x < 3; x++) {
        matrix[6][3 + x] = maskBytes[mask1][x];
        matrix[6][0 + x] = maskBytes[mask0][x];
        matrix[7][0 + x] = maskBytes[mask2][x];
        matrix[7][3 + x] = maskBytes[mask3][x];

        matrix[0 + x][6] = maskBytes[mask0][x];
        matrix[3 + x][6] = maskBytes[mask1][x];
        matrix[0 + x][7] = maskBytes[mask2][x];
        matrix[3 + x][7] = maskBytes[mask3][x];
    }

    return 0;
}

- (void)printMatrixWithoutBorders:(int **)matrix rows:(int)rows cols:(int)cols {
    // 1. Crear ruta de archivo temporal
    NSString *tempPath = [NSTemporaryDirectory() stringByAppendingPathComponent:@"holo_matrix.log"];
    
    // 2. Eliminar archivo previo si existe
    [[NSFileManager defaultManager] removeItemAtPath:tempPath error:nil];
    
    // 3. Crear contenido de la matriz
    NSMutableString *matrixContent = [NSMutableString stringWithString:@"\n🟦🟦HOLO MATRIZ COMPLETA 🟦🟦\n"];
    
    // Encabezado de columnas
    [matrixContent appendString:@"    "];
    for (int j = 0; j < cols; j++) {
        [matrixContent appendFormat:@"%02d ", j % 100]; // Mostrar sólo 2 dígitos para columnas
    }
    [matrixContent appendString:@"\n"];
    
    // Filas de la matriz
    for (int i = 0; i < rows; i++) {
        [matrixContent appendFormat:@"%02d  ", i % 100]; // Mostrar sólo 2 dígitos para filas
        for (int j = 0; j < cols; j++) {
            [matrixContent appendString:matrix[i][j] == 1 ? @"⬛️ " : @"⬜️ "];
        }
        [matrixContent appendString:@"\n"];
    }
    
    // 4. Escribir en archivo temporal
    [matrixContent writeToFile:tempPath atomically:YES encoding:NSUTF8StringEncoding error:nil];
    
    // 5. Leer y mostrar en logs
    NSError *error = nil;
    NSString *fileContent = [NSString stringWithContentsOfFile:tempPath encoding:NSUTF8StringEncoding error:&error];
    
    if (!error) {
        // Dividir en líneas para evitar truncamiento
        NSArray *lines = [fileContent componentsSeparatedByString:@"\n"];
        for (NSString *line in lines) {
            NSLog(@"%@", line);
            [NSThread sleepForTimeInterval:0.02]; // Pequeña pausa
        }
        
        // Mostrar ubicación del archivo completo
        NSLog(@"\n📁 Matriz completa guardada en: %@", tempPath);
    } else {
        NSLog(@"❌ Error al leer archivo temporal: %@", error);
    }
}

@end
