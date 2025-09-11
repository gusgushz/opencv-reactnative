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

@property (nonatomic, strong) UIView *drawingOverlayView;

@property (nonatomic, strong) AVCaptureSession *session;
@property (nonatomic, strong) AVCaptureDevice *device;
@property (nonatomic, strong) AVCaptureDeviceInput *input;
@property (nonatomic, strong) AVCaptureVideoDataOutput *output;
@property (nonatomic, strong) AVCaptureVideoPreviewLayer *previewLayer;
@property (nonatomic, assign) CGFloat zoomScale;
@property (nonatomic, strong) CameraTouchView *touchView;

//alto y ancho del Mat de la pantalla/frame
@property (nonatomic, assign) int frameWidth;
@property (nonatomic, assign) int frameHeight;

//Overlays
@property (nonatomic, strong) UIView *overlayViewTop;
@property (nonatomic, strong) UIView *overlayViewBottom;
@property (nonatomic, strong) UIView *overlayViewLeft;
@property (nonatomic, strong) UIView *overlayViewRight;

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

    // Configurar vista de toques
    self.touchView = [[CameraTouchView alloc] initWithFrame:self.view.bounds];
    self.touchView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self.view addSubview:self.touchView];

    // Configurar cámara
    [self setupCamera];
    self.touchView.cameraContainerView = _cameraViewContainer;

    // Overlay para dibujar los contornos
    self.drawingOverlayView = [[UIView alloc] initWithFrame:self.view.bounds];
    self.drawingOverlayView.backgroundColor = [UIColor clearColor];
    self.drawingOverlayView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self.view addSubview:self.drawingOverlayView];
    [self.view bringSubviewToFront:self.drawingOverlayView]; // asegurarse de que esté encima de la cámara

}
- (CGFloat)getTopInset {
    CGFloat topInset = 0;

    // Si hay navigation controller y está visible, pero no funciona
    if (self.navigationController && !self.navigationController.navigationBarHidden) {
        topInset += self.navigationController.navigationBar.frame.size.height;
    }

    // Fallback para status bar
    topInset += 44; // altura típica de status bar en iPhones

    return topInset;
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];

    CGFloat topInset = [self getTopInset];
    NSLog(@"topInset ************************%f", topInset);

    CGFloat width = self.view.bounds.size.width;
    _cameraViewContainer.frame = CGRectMake(0, topInset, width, width);
    self.previewLayer.frame = _cameraViewContainer.bounds;

    [self updateOverlaysFrames];
}

- (void)updateOverlaysFrames {
    CGFloat width = _cameraViewContainer.bounds.size.width;
    self.overlayViewTop.frame = CGRectMake(0, 0, width, width / 4);
    self.overlayViewBottom.frame = CGRectMake(0, width - width / 4, width, width / 4);
    self.overlayViewLeft.frame = CGRectMake(0, width / 4, width / 4, width / 2);
    self.overlayViewRight.frame = CGRectMake(width - width / 4, width / 4, width / 4, width / 2);
}
- (void)setupCamera {
    self.session = [[AVCaptureSession alloc] init];
    //NOTE: Diferentes presets para la calidad de la captura de la camara. Mientras màs alto, màs pesado y màs se llena la memoria.
    // self.session.sessionPreset = AVCaptureSessionPreset1280x720;+
    // self.session.sessionPreset = AVCaptureSessionPreset640x480;
    self.session.sessionPreset = AVCaptureSessionPresetMedium;
    // self.session.sessionPreset = AVCaptureSessionPresetHigh;
    
    self.device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
    [self configureDeviceForLowLight];
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
    _cameraViewContainer = [[UIView alloc] init];
    _cameraViewContainer.backgroundColor = [UIColor clearColor];
    _cameraViewContainer.userInteractionEnabled = NO;
    [self.view addSubview:_cameraViewContainer];

    self.previewLayer = [[AVCaptureVideoPreviewLayer alloc] initWithSession:self.session];
    self.previewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill;
    [_cameraViewContainer.layer addSublayer:self.previewLayer];
}

- (void)setupOverlays {
    UIColor *overlayColor = [[UIColor blackColor] colorWithAlphaComponent:0.5];

    self.overlayViewTop = [[UIView alloc] init];
    self.overlayViewTop.backgroundColor = overlayColor;
    [_cameraViewContainer addSubview:self.overlayViewTop];

    self.overlayViewBottom = [[UIView alloc] init];
    self.overlayViewBottom.backgroundColor = overlayColor;
    [_cameraViewContainer addSubview:self.overlayViewBottom];

    self.overlayViewLeft = [[UIView alloc] init];
    self.overlayViewLeft.backgroundColor = overlayColor;
    [_cameraViewContainer addSubview:self.overlayViewLeft];

    self.overlayViewRight = [[UIView alloc] init];
    self.overlayViewRight.backgroundColor = overlayColor;
    [_cameraViewContainer addSubview:self.overlayViewRight];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.session startRunning];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    [self.session stopRunning];
}

- (void)captureOutput:(AVCaptureOutput *)output 
    didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer 
    fromConnection:(AVCaptureConnection *)connection {
    
    // Verificar la orientación de la conexión de la cámara
    AVCaptureVideoOrientation orientation = connection.videoOrientation;
    connection.videoOrientation = AVCaptureVideoOrientationPortrait;
    // NSLog(@"🎥 Orientación de cámara:******** %ld", (long)orientation);

    static int frameCounter = 0;
    frameCounter++;
    if (frameCounter % 5 != 0) return;

    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    if (!imageBuffer) return;

    cv::Mat rgbaImage = [OpenCVWrapper convertYUVBufferToRGBA:imageBuffer];
    if (rgbaImage.empty()) return;

    //Guarda dimensiones reales del frame
    self.frameWidth = rgbaImage.cols;
    self.frameHeight = rgbaImage.rows;
    
    // Detecta si hay o no un còdigo
    BOOL detected = [[OpenCVWrapper sharedInstance] detectCode:rgbaImage];

    if (detected) {
        // Llamar al overlay usando los datos de detectCode
        std::vector<std::vector<cv::Point>> contours = *[OpenCVWrapper sharedInstance].lastContours;
        int lastValidBorder = [OpenCVWrapper sharedInstance].lastValidBorder;
        int lastValidMarker = [OpenCVWrapper sharedInstance].lastValidMarker;
        NSLog(@"********contours.size() = %zu", contours.size());
        NSLog(@"lastValidBorder = %zu", lastValidBorder);
        NSLog(@"lastValidBorder = %zu", lastValidMarker);

        dispatch_async(dispatch_get_main_queue(), ^{
            // [self drawPersistentMarkersOverlay:contours borderIndex:lastValidBorder markerIndex:lastValidMarker];
            [self drawPersistentMarkersOverlay:*[OpenCVWrapper sharedInstance].lastContours
                            borderIndex:lastValidBorder
                            markerIndex:lastValidMarker];

        });

        NSArray<NSString *> *message = [[OpenCVWrapper sharedInstance] extractBits];
        if (message.count > 0) {
            NSString *decodedString = [message componentsJoinedByString:@"_"];
            NSLog(@"✅ Holograma detectado: %@", decodedString);
            [OpenCVWrapper sharedInstance].lastDecodedQRCode = decodedString;
        }
    } else {
        [self.drawingOverlayView.layer.sublayers makeObjectsPerformSelector:@selector(removeFromSuperlayer)];
    }
}

- (void)drawPersistentMarkersOverlay:(std::vector<std::vector<cv::Point>>)contours
                         borderIndex:(int)borderIdx
                         markerIndex:(int)markerIdx {

    [self.drawingOverlayView.layer.sublayers makeObjectsPerformSelector:@selector(removeFromSuperlayer)];

    if (contours.empty() || borderIdx < 0 || markerIdx < 0 || self.frameWidth == 0 || self.frameHeight == 0) {
        return;
    }

    // ====== Calcular el rect del video dentro del previewLayer ======
    CGRect layerBounds = self.previewLayer.bounds;
    CGFloat videoAspect = (CGFloat)self.frameWidth / (CGFloat)self.frameHeight;
    CGFloat layerAspect = layerBounds.size.width / layerBounds.size.height;

    CGRect videoRect = CGRectZero;

    if (layerAspect > videoAspect) {
        // La layer es más ancha que el video → recorte horizontal
        CGFloat scale = layerBounds.size.height / (CGFloat)self.frameHeight;
        CGFloat width = self.frameWidth * scale;
        CGFloat x = (layerBounds.size.width - width) / 2.0;
        videoRect = CGRectMake(x, 0, width, layerBounds.size.height);
    } else {
        // La layer es más alta que el video → recorte vertical
        CGFloat scale = layerBounds.size.width / (CGFloat)self.frameWidth;
        CGFloat height = self.frameHeight * scale;
        CGFloat y = (layerBounds.size.height - height) / 2.0;
        videoRect = CGRectMake(0, y, layerBounds.size.width, height);
    }

    // ====== Borde verde ======
    std::vector<cv::Point> borderPoints = contours[borderIdx];
    if (!borderPoints.empty()) {
        UIBezierPath *borderPath = [UIBezierPath bezierPath];

        for (size_t i = 0; i < borderPoints.size(); i++) {
            CGFloat normX = (CGFloat)borderPoints[i].x / (CGFloat)self.frameWidth;
            CGFloat normY = (CGFloat)borderPoints[i].y / (CGFloat)self.frameHeight;
            CGFloat offsetY = -15;
            CGPoint point = CGPointMake(normX * layerBounds.size.width,
                                        (normY * layerBounds.size.width*1.333) + offsetY);


            if (i == 0) [borderPath moveToPoint:point];
            else [borderPath addLineToPoint:point];
        }

        [borderPath closePath];

        CAShapeLayer *borderLayer = [CAShapeLayer layer];
        borderLayer.path = borderPath.CGPath;
        borderLayer.strokeColor = [UIColor greenColor].CGColor;
        borderLayer.fillColor = [UIColor clearColor].CGColor;
        borderLayer.lineWidth = 3.0;
        [self.drawingOverlayView.layer addSublayer:borderLayer];
    }

    // ====== Marcador rojo ======
    std::vector<cv::Point> markerPoints = contours[markerIdx];
    if (!markerPoints.empty()) {
        UIBezierPath *markerPath = [UIBezierPath bezierPath];

        for (size_t i = 0; i < markerPoints.size(); i++) {
            CGFloat normX = (CGFloat)markerPoints[i].x / (CGFloat)self.frameWidth;
            CGFloat normY = (CGFloat)markerPoints[i].y / (CGFloat)self.frameHeight;
            CGFloat offsetY = -15;
            CGPoint point = CGPointMake(normX * layerBounds.size.width,
                                        (normY * layerBounds.size.width*1.333) + offsetY);

            if (i == 0) [markerPath moveToPoint:point];
            else [markerPath addLineToPoint:point];
        }

        [markerPath closePath];

        CAShapeLayer *markerLayer = [CAShapeLayer layer];
        markerLayer.path = markerPath.CGPath;
        markerLayer.strokeColor = [UIColor redColor].CGColor;
        markerLayer.fillColor = [UIColor clearColor].CGColor;
        markerLayer.lineWidth = 2.0;
        [self.drawingOverlayView.layer addSublayer:markerLayer];
    }
}

- (void)configureDeviceForLowLight {
    NSError *error = nil;
    if ([self.device lockForConfiguration:&error]) {

        // Autofocus continuo
        if ([self.device isFocusModeSupported:AVCaptureFocusModeContinuousAutoFocus]) {
            self.device.focusMode = AVCaptureFocusModeContinuousAutoFocus;
        }

        // Exposición automática
        if ([self.device isExposureModeSupported:AVCaptureExposureModeContinuousAutoExposure]) {
            self.device.exposureMode = AVCaptureExposureModeContinuousAutoExposure;
        }

        // Low-light boost (mejora en poca luz)
        if ([self.device isLowLightBoostSupported]) {
            self.device.automaticallyEnablesLowLightBoostWhenAvailable = YES;
        }

        [self.device unlockForConfiguration];
    } else {
        NSLog(@"Error configurando cámara: %@", error.localizedDescription);
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

    // Variables para dibujo persistente
    cv::Mat _persistentOverlay;
    BOOL _overlayInitialized;
    BOOL _shouldClearOverlay;
    int _lastValidBorder;
    int _lastValidMarker;
}

- (std::vector<std::vector<cv::Point>> *)lastContours {
    return &_contours;
}

- (int)lastValidBorder {
    return _lastValidBorder;
}

- (int)lastValidMarker {
    return _lastValidMarker;
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
        // Inicializar variables de dibujo persistente
        _overlayInitialized = NO;
        _shouldClearOverlay = NO;
        _lastValidBorder = -1;
        _lastValidMarker = -1;
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

        // NOTE Inicializar variables de dibujo
        _shouldClearOverlay = YES;
        _lastValidBorder = -1;
        _lastValidMarker = -1;
        
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
        
        // Resetear variables de estado
        _lastValidBorder = -1;
        _lastValidMarker = -1;
        _mark = 0;
        _border = -1;
        _marker = -1;
        self.lastDecodedQRCode = nil;
        
        // Liberar matrices
        if (_overlayInitialized && !_persistentOverlay.empty()) {
            _persistentOverlay.release();
        }
        
        _contours.clear();
        _overlayInitialized = NO;
        _shouldClearOverlay = YES;
        
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
        } else {
            resolve(nil);
        }
    });
}
RCT_EXPORT_METHOD(clearDecodedInfo) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [OpenCVWrapper sharedInstance].lastDecodedQRCode = nil;
    NSLog(@"Cameragus: info cleared");
  });
}

RCT_EXPORT_METHOD(getIosId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        @try {
            NSString *uuid = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
            if (uuid) {
            resolve(uuid);
            } else {
            reject(@"no_id", @"No se pudo obtener el ID del dispositivo", nil);
            }
        }
        @catch (NSException *exception) {
            reject(@"error", exception.reason, nil);
        }
    });
}
RCT_EXPORT_METHOD(exitAppWithMessage:(NSString *)message) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Cerrando la App"
                                                                       message:message
                                                                preferredStyle:UIAlertControllerStyleAlert];

        UIViewController *root = RCTPresentedViewController();
        [root presentViewController:alert animated:YES completion:^{
            // Espera 2 segundos y luego cierra la app
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)),
                           dispatch_get_main_queue(), ^{
                [alert dismissViewControllerAnimated:YES completion:^{
                    exit(50); // Termina la app
                }];
            });
        }];
    });
}


#pragma mark - Image Processing

+ (cv::Mat)convertYUVBufferToRGBA:(CVImageBufferRef)imageBuffer {
    CVPixelBufferLockBaseAddress(imageBuffer, 0);

    // Verificar formato del buffer
    OSType pixelFormat = CVPixelBufferGetPixelFormatType(imageBuffer);
    if (pixelFormat != kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange &&
        pixelFormat != kCVPixelFormatType_420YpCbCr8BiPlanarFullRange) {
        NSLog(@"❌ Error: Unsupported pixel format %u", pixelFormat);
        CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
        return cv::Mat();
    }

    int width  = (int)CVPixelBufferGetWidth(imageBuffer);
    int height = (int)CVPixelBufferGetHeight(imageBuffer);

    // Plano Y
    uint8_t *yPlane = (uint8_t *)CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 0);
    size_t yStride  = CVPixelBufferGetBytesPerRowOfPlane(imageBuffer, 0);
    cv::Mat yMat(height, width, CV_8UC1, yPlane, yStride);

    // Plano UV
    uint8_t *uvPlane = (uint8_t *)CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 1);
    size_t uvStride  = CVPixelBufferGetBytesPerRowOfPlane(imageBuffer, 1);
    cv::Mat uvMat(height / 2, width / 2, CV_8UC2, uvPlane, uvStride);

    // Convertir YUV → RGBA
    cv::Mat rgbaMat;
    cv::cvtColorTwoPlane(yMat, uvMat, rgbaMat, cv::COLOR_YUV2RGBA_NV12);

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
        self.lastValidBorder = self.border;
        self.lastValidMarker = self.marker;
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
    if (contours.empty() || cId < 0 || cId >= contours.size()) {
        return 0;
    }
    
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

+ (UIImage *)UIImageFromCVMat:(const cv::Mat&)cvMat {
    NSData *data = nil;
    CGColorSpaceRef colorSpace;

    if (cvMat.type() == CV_8UC1) {
        colorSpace = CGColorSpaceCreateDeviceGray();
        data = [NSData dataWithBytes:cvMat.data length:cvMat.elemSize() * cvMat.total()];
    } else if (cvMat.type() == CV_8UC3) {
        // OpenCV usa BGR, UIKit usa RGB
        cv::Mat rgbMat;
        cv::cvtColor(cvMat, rgbMat, cv::COLOR_BGR2RGB);
        colorSpace = CGColorSpaceCreateDeviceRGB();
        data = [NSData dataWithBytes:rgbMat.data length:rgbMat.elemSize() * rgbMat.total()];
    } else if (cvMat.type() == CV_8UC4) {
        colorSpace = CGColorSpaceCreateDeviceRGB();
        data = [NSData dataWithBytes:cvMat.data length:cvMat.elemSize() * cvMat.total()];
    } else {
        NSLog(@"UIImageFromCVMat: tipo de cv::Mat no soportado");
        return nil;
    }

    CGDataProviderRef provider = CGDataProviderCreateWithCFData((__bridge CFDataRef)data);
    CGImageRef imageRef = CGImageCreate(cvMat.cols,                                 // ancho
                                        cvMat.rows,                                 // alto
                                        8,                                          // bits por componente
                                        8 * cvMat.elemSize(),                        // bits por pixel
                                        cvMat.step[0],                               // bytes por fila
                                        colorSpace,                                  // espacio de color
                                        kCGImageAlphaNone | kCGBitmapByteOrderDefault, // info bitmap
                                        provider,
                                        NULL,
                                        false,
                                        kCGRenderingIntentDefault);

    UIImage *image = [UIImage imageWithCGImage:imageRef];

    CGImageRelease(imageRef);
    CGDataProviderRelease(provider);
    CGColorSpaceRelease(colorSpace);

    return image;
}


@end
