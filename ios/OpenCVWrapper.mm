//  OpenCVWrapper.m
//  testDoc
//
//  Created by DDT on 28/02/25.
//

#import "OpenCVWrapper.h"
#import "HoloDecoder.h"
#import <React/RCTBridgeModule.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTViewManager.h>
#import <opencv2/opencv.hpp>
#import <opencv2/highgui/highgui_c.h>
#import <opencv2/imgproc/imgproc_c.h>
#import <opencv2/core/core_c.h>
#import <opencv2/objdetect.hpp>
#import <opencv2/videoio.hpp>
#import <opencv2/imgproc.hpp>
#import <opencv2/core.hpp>
#import <UIKit/UIKit.h>


@interface CameraTouchView : UIView
@property (nonatomic, weak) UIView *cameraContainerView;
@end

@implementation CameraTouchView

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    // Convertir el punto al sistema de coordenadas de cameraContainerView
    CGPoint convertedPoint = [self convertPoint:point toView:self.cameraContainerView];
    
    // Si el toque está dentro de la vista de la cámara, ignorarlo
    if (CGRectContainsPoint(self.cameraContainerView.bounds, convertedPoint)) {
        return nil;
    }
    
    return [super hitTest:point withEvent:event];
}

@end

@interface CameraViewController : UIViewController <AVCaptureVideoDataOutputSampleBufferDelegate> {
    UIView *_cameraViewContainer; // Declaración como variable de instancia
}

@property (nonatomic, strong) AVCaptureSession *session;
@property (nonatomic, strong) AVCaptureDevice *device;
@property (nonatomic, strong) AVCaptureDeviceInput *input;
@property (nonatomic, strong) AVCaptureVideoDataOutput *output;
@property (nonatomic, strong) AVCaptureVideoPreviewLayer *previewLayer;
@property (nonatomic, assign) CGFloat zoomScale;
@property (nonatomic, strong) UIView *cameraContainerView;
@property (nonatomic, strong) CameraTouchView *touchView;

@end

@implementation CameraViewController

- (instancetype)initWithZoomScale:(CGFloat)zoomScale {
    self = [super init];
    if (self) {
        _zoomScale = zoomScale;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Configurar la vista de toques primero
    self.touchView = [[CameraTouchView alloc] initWithFrame:self.view.bounds];
    self.touchView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.touchView.cameraContainerView = self.cameraContainerView;
    [self.view addSubview:self.touchView];
    
    // Luego configurar la cámara
    [self setupCamera];
}


- (void)setupCamera {
    self.session = [[AVCaptureSession alloc] init];
    // self.session.sessionPreset = AVCaptureSessionPreset1280x720;
    self.session.sessionPreset = AVCaptureSessionPreset640x480;
    // self.session.sessionPreset = AVCaptureSessionPresetMedium;
    
    self.device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
    self.input = [AVCaptureDeviceInput deviceInputWithDevice:self.device error:nil];
    self.output = [[AVCaptureVideoDataOutput alloc] init];
    
    [self.session addInput:self.input];
    [self.session addOutput:self.output];
    
    [self setupCameraContainer];
    [self setupOverlays];
    
    [self.session startRunning];
    [self.output setSampleBufferDelegate:self queue:dispatch_get_main_queue()];
}

- (void)setupCameraContainer {
    // Configurar vista de cámara al 50% superior
    CGFloat cameraHeight = self.view.bounds.size.height * 0.5;
    _cameraViewContainer = [[UIView alloc] initWithFrame:CGRectMake(0, 65, self.view.bounds.size.width, cameraHeight)];
    _cameraViewContainer.userInteractionEnabled = NO;
    _cameraViewContainer.backgroundColor = [UIColor clearColor];
    
    [self.view addSubview:_cameraViewContainer];
    
    // Configurar el preview layer
    self.previewLayer = [[AVCaptureVideoPreviewLayer alloc] initWithSession:self.session];
    self.previewLayer.frame = _cameraViewContainer.bounds;
    self.previewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill;
    
    [_cameraViewContainer.layer addSublayer:self.previewLayer];
}

- (void)setupOverlays {
    // Obtenemos la vista contenedora desde el previewLayer
    UIView *cameraContainerView = (UIView *)self.previewLayer.superlayer.delegate;
    
    if (![cameraContainerView isKindOfClass:[UIView class]]) {
        NSLog(@"Error: No se pudo obtener la vista contenedora");
        return;
    }
    
    // Configuración de overlays
    CGFloat overlayAlpha = 0.5;
    UIColor *overlayColor = [UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:overlayAlpha];
    
    // Overlay superior
    UIView *overlayViewTop = [[UIView alloc] init];
    overlayViewTop.backgroundColor = overlayColor;
    overlayViewTop.frame = CGRectMake(0, 0, 
                                    cameraContainerView.bounds.size.width, 
                                    cameraContainerView.bounds.size.height / 4);
    
    // Overlay inferior
    UIView *overlayViewBottom = [[UIView alloc] init];
    overlayViewBottom.backgroundColor = overlayColor;
    overlayViewBottom.frame = CGRectMake(0, 
                                       cameraContainerView.bounds.size.height - (cameraContainerView.bounds.size.height / 4), 
                                       cameraContainerView.bounds.size.width, 
                                       cameraContainerView.bounds.size.height / 4);
    
    // Overlay izquierdo
    CGFloat overlaySideHeight = cameraContainerView.bounds.size.height / 2;
    UIView *overlayViewLeft = [[UIView alloc] init];
    overlayViewLeft.backgroundColor = overlayColor;
    overlayViewLeft.frame = CGRectMake(0, 
                                      (cameraContainerView.bounds.size.height - overlaySideHeight) / 2, 
                                      cameraContainerView.bounds.size.width / 4, 
                                      overlaySideHeight);
    
    // Overlay derecho
    UIView *overlayViewRight = [[UIView alloc] init];
    overlayViewRight.backgroundColor = overlayColor;
    overlayViewRight.frame = CGRectMake(cameraContainerView.bounds.size.width - (cameraContainerView.bounds.size.width / 4), 
                                       (cameraContainerView.bounds.size.height - overlaySideHeight) / 2, 
                                       cameraContainerView.bounds.size.width / 4, 
                                       overlaySideHeight);
    
    // Agregar overlays
    [cameraContainerView addSubview:overlayViewTop];
    [cameraContainerView addSubview:overlayViewBottom];
    [cameraContainerView addSubview:overlayViewLeft];
    [cameraContainerView addSubview:overlayViewRight];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.session startRunning];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    [self.session stopRunning];
}

- (void)captureOutput:(AVCaptureOutput *)output didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer fromConnection:(AVCaptureConnection *)connection {
    static int frameCounter = 0;
    frameCounter++;
    if (frameCounter % 5 != 0) return;
    
    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    if (!imageBuffer) return;
    
    // Convertir buffer a imagen RGBA
    cv::Mat rgbaImage = [OpenCVWrapper convertYUVBufferToRGBA:imageBuffer];
    if (rgbaImage.empty()) return;
    
    // Detectar código
    BOOL detected = [[OpenCVWrapper sharedInstance] detectCode:rgbaImage];
    //NSLog(@"HOLO codigo detectado? %@", detected);
    
    // Si se detectó, extraer bits
    if (detected) {
        NSArray<NSString *> *message = [[OpenCVWrapper sharedInstance] extractBits];
        if (message.count > 0) {
            NSString *decodedString = [message componentsJoinedByString:@"_"];
            NSLog(@"✅ Holograma detectado: %@", decodedString);
            [OpenCVWrapper sharedInstance].lastDecodedQRCode = decodedString;
        }
    }
}

@end

@interface OpenCVWrapper ()
@property (nonatomic, strong) CameraViewController *cameraViewController;
@end

// Implementación de la clase
@implementation OpenCVWrapper {
    // Matrices OpenCV
    cv::Mat _holo_raw;
    cv::Mat _holo_gray;
    cv::Mat _holoCode;
    cv::Mat _hierarchy;
    std::vector<std::vector<cv::Point>> _contours;
    cv::Mat _holo;
    cv::Mat _holo_thres;
    cv::Mat _holoMatrix;
}

RCT_EXPORT_MODULE();

#pragma mark - Lifecycle

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

+ (instancetype)sharedInstance {
    static OpenCVWrapper *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[OpenCVWrapper alloc] init];
    });
    return sharedInstance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _impSize = 256;
        _holo_raw = cv::Mat::zeros(_impSize, _impSize, CV_8UC3);
        _holo_gray = cv::Mat::zeros(_impSize, _impSize, CV_8UC1);
        _holo_thres = cv::Mat::zeros(_impSize, _impSize, CV_8UC1);
        _holoMatrix = cv::Mat::zeros(28, 28, CV_8UC1);
    }
    return self;
}

#pragma mark - React Native Methods

RCT_EXPORT_METHOD(getOpenCVVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([NSString stringWithFormat:@"OpenCV Version %s", CV_VERSION]);
}

// Método para verificar el estado del permiso
RCT_EXPORT_METHOD(checkCameraPermission:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
  
  switch (status) {
    case AVAuthorizationStatusAuthorized:
      resolve(@"granted");
      break;
    case AVAuthorizationStatusDenied:
    case AVAuthorizationStatusRestricted:
      resolve(@"denied");
      break;
    case AVAuthorizationStatusNotDetermined:
      resolve(@"undetermined");
      break;
    default:
      resolve(@"unknown");
      break;
  }
}

// Método para solicitar el permiso de cámara
RCT_EXPORT_METHOD(requestCameraPermission:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
    if (granted) {
      resolve(@"granted");
    } else {
      resolve(@"denied");
    }
  }];
}

RCT_EXPORT_METHOD(startCamera:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
        
        if (!rootViewController) {
            reject(@"no_root", @"No root view controller found", nil);
            return;
        }
        
        // Crear vista contenedora especial
        UIView *cameraHostView = [[UIView alloc] initWithFrame:rootViewController.view.bounds];
        cameraHostView.userInteractionEnabled = NO; // ¡CRUCIAL!
        cameraHostView.backgroundColor = [UIColor clearColor];
        
        // Configurar el controlador de cámara
        self.cameraViewController = [[CameraViewController alloc] init];
        self.cameraViewController.view.frame = cameraHostView.bounds;
        
        // Añadir la vista de la cámara al host
        [cameraHostView addSubview:self.cameraViewController.view];
        
        // Insertar en una posición que no bloquee toques
        [rootViewController.view insertSubview:cameraHostView atIndex:1];
        
        resolve(@"Cámara iniciada correctamente");
    });
}

RCT_EXPORT_METHOD(stopCamera:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.cameraViewController) {
            [self.cameraViewController willMoveToParentViewController:nil];
            [self.cameraViewController.view removeFromSuperview];
            [self.cameraViewController removeFromParentViewController];
            self.cameraViewController = nil;
            
            NSLog(@"🛑 CameraViewController eliminado");
        }
        
        [OpenCVWrapper sharedInstance].lastDecodedQRCode = nil;
        resolve(@"Camera stopped successfully");
    });
}

RCT_EXPORT_METHOD(sendDecodedInfoToReact:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
    NSLog(@"Último código decodificado: %@", [OpenCVWrapper sharedInstance].lastDecodedQRCode);
        if ([OpenCVWrapper sharedInstance].lastDecodedQRCode &&
            ![[OpenCVWrapper sharedInstance].lastDecodedQRCode isEqualToString:@"El mensaje está corrompido"]) {
            NSString *response = [[OpenCVWrapper sharedInstance].lastDecodedQRCode copy];
            resolve(response);
        }
    });
}

#pragma mark - Image Processing

+ (cv::Mat)convertYUVBufferToRGBA:(CVImageBufferRef)imageBuffer {
    CVPixelBufferLockBaseAddress(imageBuffer, 0);
    
    // Verificar formato del buffer
    OSType pixelFormat = CVPixelBufferGetPixelFormatType(imageBuffer);
    if (pixelFormat != kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange) {
        NSLog(@"Error: Unsupported pixel format");
        CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
        return cv::Mat();
    }
    
    // Obtener planos Y y UV
    uint8_t *yPlane = (uint8_t *)CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 0);
    size_t yWidth = CVPixelBufferGetWidthOfPlane(imageBuffer, 0);
    size_t yHeight = CVPixelBufferGetHeightOfPlane(imageBuffer, 0);
    cv::Mat yMat((int)yHeight, (int)yWidth, CV_8UC1, yPlane);
    
    // Convertir YUV a RGBA
    cv::Mat rgbaMat;
    cv::cvtColor(yMat, rgbaMat, cv::COLOR_YUV2RGBA_NV12);
    
    CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
    
    return rgbaMat;
}

- (BOOL)detectCode:(cv::Mat &)activeArea {
    cv::Mat gray;
    cv::cvtColor(activeArea, gray, cv::COLOR_RGB2GRAY);
    
    // Aplicar filtros
    cv::GaussianBlur(gray, gray, cv::Size(5, 5), 0, 0);
    cv::adaptiveThreshold(gray, gray, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C, cv::THRESH_BINARY_INV, 51, 14.0);
    
    _contours.clear();
    _hierarchy = cv::Mat();
    
    // Encontrar contornos
    cv::findContours(gray, _contours, _hierarchy, cv::RETR_TREE, cv::CHAIN_APPROX_SIMPLE);
    
    self.mark = 0;
    std::vector<cv::Point> massCenters;
    
    // Calcular centros de masa
    for (const auto &contour : _contours) {
        cv::Moments mu = cv::moments(contour);
        if (mu.m00 != 0.0) {
            double centerX = mu.m10 / mu.m00;
            double centerY = mu.m01 / mu.m00;
            massCenters.push_back(cv::Point(centerX, centerY));
        }
    }
    
    // Procesar contornos
    for (size_t i = 0; i < _contours.size(); i++) {
        std::vector<cv::Point> approx;
        cv::approxPolyDP(_contours[i], approx, cv::arcLength(_contours[i], true) * 0.02, true);
        
        if (approx.size() == 4) {
            int k = (int)i;
            int c = 0;
            std::vector<int> info = [self getHierarchy:_hierarchy contourIdx:k];
            
            while (info[2] != -1) {
                info = [self getHierarchy:_hierarchy contourIdx:k];
                k = info[2];
                c++;
            }
            
            if (c >= 3) {
                if (self.mark == 0) self.border = (int)i;
                else if (self.mark == 1) self.marker = (int)i;
                self.mark++;
            }
        }
    }
    
    // Determinar orientación
    if (self.mark >= 2) {
        int widthA = [self getApproximatedWidth:_contours cId:self.border];
        int widthB = [self getApproximatedWidth:_contours cId:self.marker];
        
        if (widthA <= widthB) {
            int temp = self.border;
            self.border = self.marker;
            self.marker = temp;
        }
        
        if (self.marker < massCenters.size() && self.border < massCenters.size()) {
            self.slope = [self lineSlope:massCenters[self.marker] point2:massCenters[self.border]];
            
            if (self.slope > 0 && self.slope < 1.5708) {
                self.orientation = HOLO_NORTH;
            } else if (self.slope >= 1.5708) {
                self.orientation = HOLO_EAST;
            } else if (self.slope < 0 && self.slope > -1.5708) {
                self.orientation = HOLO_WEST;
            } else {
                self.orientation = HOLO_SOUTH;
            }
        }
    }
    
    // Verificar detección
    double minArea = MAX(self.impSize * 0.005, 5.0);
    self.codeDetected = self.mark == 2 &&
                       (self.border < _contours.size() && self.marker < _contours.size() &&
                        cv::contourArea(_contours[self.border]) > minArea &&
                        cv::contourArea(_contours[self.marker]) > minArea);
    
    if (self.codeDetected) {
        // Procesar código detectado
        [self processDetectedCode:activeArea];
    }
    
    return self.codeDetected;
}

- (void)processDetectedCode:(cv::Mat &)activeArea {
    std::vector<cv::Point> L, M, tempL, tempM;
    
    // Obtener vértices
    [self getVertices:_contours cId:self.border slope:self.slope quad:tempL];
    [self getVertices:_contours cId:self.marker slope:self.slope quad:tempM];
    
    // Reordenar según orientación
    [self updateCornerOrientation:self.orientation IN:tempL OUT:L];
    [self updateCornerOrientation:self.orientation IN:tempM OUT:M];
    
    // Transformación de perspectiva
    std::vector<cv::Point2f> srcPoints = {
        L[0], L[1], L[2], L[3]
    };
    
    std::vector<cv::Point2f> dstPoints = {
        cv::Point2f(0, 0),
        cv::Point2f(_holo_raw.cols, 0),
        cv::Point2f(_holo_raw.cols, _holo_raw.rows),
        cv::Point2f(0, _holo_raw.rows)
    };
    
    cv::Mat warpMatrix = cv::getPerspectiveTransform(srcPoints, dstPoints);
    cv::warpPerspective(activeArea, _holo_raw, warpMatrix, cv::Size(_holo_raw.cols, _holo_raw.rows));
    
    // Rotar según orientación
    switch (self.orientation) {
        case HOLO_NORTH:
            cv::rotate(_holo_raw, _holo_raw, cv::ROTATE_180);
            break;
        case HOLO_EAST:
            cv::rotate(_holo_raw, _holo_raw, cv::ROTATE_90_CLOCKWISE);
            break;
        case HOLO_WEST:
            cv::rotate(_holo_raw, _holo_raw, cv::ROTATE_90_COUNTERCLOCKWISE);
            break;
        case HOLO_SOUTH:
            // No rotation needed
            break;
    }
    
    // Procesamiento adicional de la imagen
    cv::cvtColor(_holo_raw, _holo_gray, cv::COLOR_RGB2GRAY);
    
    // Aplicar CLAHE
    cv::Ptr<cv::CLAHE> clahe = cv::createCLAHE(5.0, cv::Size(30, 30));
    clahe->apply(_holo_gray, _holo_gray);
    
    // Operaciones morfológicas
    cv::Mat element = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(3, 3));
    cv::dilate(_holo_gray, _holo_gray, element);
    cv::erode(_holo_gray, _holo_gray, element);
    cv::GaussianBlur(_holo_gray, _holo_gray, cv::Size(5, 5), 0);
    cv::adaptiveThreshold(_holo_gray, _holo_gray, 255, cv::ADAPTIVE_THRESH_GAUSSIAN_C, cv::THRESH_BINARY, 51, 16.0);
    
    // Recortar centro
    int borderSize = 16;
    cv::Rect centerRect(borderSize, borderSize, _holo_gray.cols - 2*borderSize, _holo_gray.rows - 2*borderSize);
    _holoCode = cv::Mat(_holo_gray, centerRect);
}

- (NSArray<NSString *> *)extractBits {
    int holoCodeInt[28][28];
    uint8_t holoCodeArray[28][28][1];
    cv::Mat imagen(28, 28, CV_8UC1);
    
    int sizeW = _impSize / 32;
    NSMutableArray<NSNumber *> *moduleValues = [NSMutableArray array];
    uint8_t oneVal = 255;
    uint8_t zeroVal = 0;
    
    // Procesar cada módulo
    for (int r = 0; r < _holoCode.rows; r += sizeW) {
        for (int c = 0; c < _holoCode.cols; c += sizeW) {
            cv::Rect tempRec(c, r, sizeW, sizeW);
            cv::Mat module(_holoCode, tempRec);
            
            [moduleValues removeAllObjects];
            for (int i = 0; i < sizeW; i++) {
                for (int j = 0; j < sizeW; j++) {
                    [moduleValues addObject:@(module.at<uint8_t>(i, j))];
                }
            }
            
            // Calcular promedio
            int sum = 0;
            for (NSNumber *num in moduleValues) {
                sum += num.intValue;
            }
            int average = sum / (int)moduleValues.count;
            
            if (average > 128) {
                holoCodeArray[r/sizeW][c/sizeW][0] = oneVal;
                holoCodeInt[r/sizeW][c/sizeW] = 0;
            } else {
                holoCodeArray[r/sizeW][c/sizeW][0] = zeroVal;
                holoCodeInt[r/sizeW][c/sizeW] = 1;
            }
        }
    }
    
    // Convertir a Mat
    for (int i = 0; i < 28; i++) {
        for (int j = 0; j < 28; j++) {
            imagen.at<uint8_t>(i, j) = holoCodeArray[i][j][0];
        }
    }
    
    _holoMatrix = imagen.clone();
    
    // Preparar datos para HoloDecoder
    int **binaryData = (int **)malloc(28 * sizeof(int *));
    for (int i = 0; i < 28; i++) {
        binaryData[i] = (int *)malloc(28 * sizeof(int));
        for (int j = 0; j < 28; j++) {
            binaryData[i][j] = holoCodeInt[i][j];
        }
    }
    
    NSLog(@"HOLO Antes de DECODER");
    HoloDecoder *holoDecoder = [[HoloDecoder alloc] init];
    NSString *message = [holoDecoder decodeMessage:binaryData rows:28 cols:28];

    // Liberar memoria
    for (int i = 0; i < 28; i++) {
        free(binaryData[i]);
    }
    free(binaryData);

    if (![message isEqualToString:@"El mensaje está corrompido"]) {
        NSLog(@"HOLO DECODER message %@", message);

        NSArray *components = [message componentsSeparatedByString:@"_"];
        NSMutableArray *mutableComponents = [components mutableCopy];

        if (mutableComponents.count < 5) {
            return mutableComponents;
        } else {
            NSString *vehicleIdStr = mutableComponents[5];
            NSArray<NSString *> *parts = [vehicleIdStr componentsSeparatedByString:@"_"];
            NSInteger vehicleId = [[parts firstObject] intValue];

            NSString *vehicleType = [HoloDecoder whichVehicleNew:vehicleId];
            NSLog(@"🧠 Vehículo ID: %ld, tipo detectado: %@", (long)vehicleId, vehicleType);

            if (![vehicleType isEqualToString:@"Servicio no reconocido"]) {
                mutableComponents[5] = [NSString stringWithFormat:@"%ld_%@", (long)vehicleId, vehicleType];
            } else {
                mutableComponents[5] = [NSString stringWithFormat:@"%ld_F", (long)vehicleId];
            }

            return mutableComponents;
        }
    }
    return @[];
}

#pragma mark - Helper Methods

- (int)getApproximatedWidth:(const std::vector<std::vector<cv::Point>> &)contours cId:(int)cId {
    cv::Rect box = cv::boundingRect(contours[cId]);
    return box.width;
}

- (double)lineSlope:(cv::Point)point1 point2:(cv::Point)point2 {
    double dx = point2.x - point1.x;
    double dy = point2.y - point1.y;
    
    if (dx == 0.0 && dy == 0.0) {
        return 0.0;
    }
    
    return atan2(dy, dx);
}

- (std::vector<int>)getHierarchy:(const cv::Mat &)hierarchy contourIdx:(int)contourIdx {
    if (hierarchy.rows != 1 || hierarchy.channels() != 4 || hierarchy.dims != 2) {
        return {-1, -1, -1, -1};
    }
    
    if (contourIdx < 0 || contourIdx >= hierarchy.cols) {
        return {-1, -1, -1, -1};
    }
    
    const cv::Vec4i &row = hierarchy.at<cv::Vec4i>(0, contourIdx);
    return {row[0], row[1], row[2], row[3]};
}

- (void)getVertices:(const std::vector<std::vector<cv::Point>> &)contours cId:(int)cId slope:(double)slope quad:(std::vector<cv::Point> &)quad {
    cv::Rect box = cv::boundingRect(contours[cId]);
    
    cv::Point A(box.x, box.y);
    cv::Point B(box.x + box.width, box.y);
    cv::Point C(box.x + box.width, box.y + box.height);
    cv::Point D(box.x, box.y + box.height);
    
    cv::Point W((A.x + B.x) / 2, A.y);
    cv::Point X(B.x, (B.y + C.y) / 2);
    cv::Point Y((C.x + D.x) / 2, C.y);
    cv::Point Z(D.x, (D.y + A.y) / 2);
    
    double dmax[4] = {0.0, 0.0, 0.0, 0.0};
    cv::Point M0, M1, M2, M3;
    
    if (slope > 5 || slope < -5) {
        for (const auto &point : contours[cId]) {
            double pd1 = [self lineEquation:C point2:A point3:point];
            double pd2 = [self lineEquation:B point2:D point3:point];
            
            if (pd1 >= 0.0 && pd2 > 0.0) {
                [self updateCorner:point reference:W baseline:dmax index:1 corner:M1];
            } else if (pd1 > 0.0 && pd2 <= 0.0) {
                [self updateCorner:point reference:X baseline:dmax index:2 corner:M2];
            } else if (pd1 <= 0.0 && pd2 < 0.0) {
                [self updateCorner:point reference:Y baseline:dmax index:3 corner:M3];
            } else if (pd1 < 0.0 && pd2 >= 0.0) {
                [self updateCorner:point reference:Z baseline:dmax index:0 corner:M0];
            }
        }
    } else {
        int halfx = (A.x + B.x) / 2;
        int halfy = (A.y + D.y) / 2;
        
        for (const auto &point : contours[cId]) {
            if (point.x < halfx && point.y <= halfy) {
                [self updateCorner:point reference:C baseline:dmax index:2 corner:M0];
            } else if (point.x >= halfx && point.y < halfy) {
                [self updateCorner:point reference:D baseline:dmax index:3 corner:M1];
            } else if (point.x > halfx && point.y >= halfy) {
                [self updateCorner:point reference:A baseline:dmax index:0 corner:M2];
            } else if (point.x <= halfx && point.y > halfy) {
                [self updateCorner:point reference:B baseline:dmax index:1 corner:M3];
            }
        }
    }
    
    quad.push_back(M0);
    quad.push_back(M1);
    quad.push_back(M2);
    quad.push_back(M3);
}

- (void)updateCornerOrientation:(HologramOrientation)orientation IN:(const std::vector<cv::Point> &)IN OUT:(std::vector<cv::Point> &)OUT {
    OUT.clear();
    
    switch (orientation) {
        case HOLO_NORTH:
            OUT.push_back(IN[0]);
            OUT.push_back(IN[1]);
            OUT.push_back(IN[2]);
            OUT.push_back(IN[3]);
            break;
        case HOLO_EAST:
            OUT.push_back(IN[1]);
            OUT.push_back(IN[2]);
            OUT.push_back(IN[3]);
            OUT.push_back(IN[0]);
            break;
        case HOLO_WEST:
            OUT.push_back(IN[3]);
            OUT.push_back(IN[0]);
            OUT.push_back(IN[1]);
            OUT.push_back(IN[2]);
            break;
        case HOLO_SOUTH:
            OUT.push_back(IN[2]);
            OUT.push_back(IN[3]);
            OUT.push_back(IN[0]);
            OUT.push_back(IN[1]);
            break;
    }
}

- (double)lineEquation:(cv::Point)L point2:(cv::Point)M point3:(cv::Point)J {
    double a = -((M.y - L.y) / (M.x - L.x));
    double b = 1.0;
    double c = (((M.y - L.y) / (M.x - L.x)) * L.x) - L.y;
    
    return (a * J.x + (b * J.y) + c) / sqrt((a * a) + (b * b));
}

- (void)updateCorner:(cv::Point)p reference:(cv::Point)reference baseline:(double *)baseline index:(int)index corner:(cv::Point &)corner {
    double tempDist = [self distance:p point2:reference];
    
    if (tempDist > baseline[index]) {
        baseline[index] = tempDist;
        corner.x = p.x;
        corner.y = p.y;
    }
}

- (double)distance:(cv::Point)p point2:(cv::Point)q {
    return sqrt(pow(p.x - q.x, 2.0) + pow(p.y - q.y, 2.0));
}

@end
