//  OpenCVWrapper.m
//  testDoc
//
//  Created by DDT on 28/02/25.
//

#import <Foundation/Foundation.h>
#import "OpenCVWrapper.h"
#import <React/RCTBridgeModule.h>

#import <AVFoundation/AVFoundation.h>
#import <React/RCTViewManager.h>
#import <opencv2/opencv.hpp>
#import <opencv2/highgui/highgui_c.h>
#import <opencv2/imgproc/imgproc_c.h>
#import <opencv2/core/core_c.h>
#import <opencv2/objdetect.hpp>
#import <opencv2/videoio.hpp>

@interface CameraViewController : UIViewController <AVCaptureVideoDataOutputSampleBufferDelegate>

@property (nonatomic, strong) AVCaptureSession *session;
@property (nonatomic, strong) AVCaptureDevice *device;
@property (nonatomic, strong) AVCaptureDeviceInput *input;
@property (nonatomic, strong) AVCaptureVideoDataOutput *output;
@property (nonatomic, strong) AVCaptureVideoPreviewLayer *previewLayer;

@end

@implementation CameraViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  // Setup de la cámara
  self.session = [[AVCaptureSession alloc] init];
  self.session.sessionPreset = AVCaptureSessionPreset640x480; 
  
  self.device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
  self.input = [AVCaptureDeviceInput deviceInputWithDevice:self.device error:nil];
  self.output = [[AVCaptureVideoDataOutput alloc] init];
  
  [self.session addInput:self.input];
  [self.session addOutput:self.output];

  // Crear una vista contenedora para la cámara
  CGRect cameraFrame = CGRectMake(0, 50, self.view.bounds.size.width, self.view.bounds.size.height / 2); // Mitad de la pantalla
  UIView *cameraContainerView = [[UIView alloc] initWithFrame:cameraFrame];
  cameraContainerView.clipsToBounds = YES;
  [self.view addSubview:cameraContainerView];

  // Configura el preview de la cámara
  self.previewLayer = [[AVCaptureVideoPreviewLayer alloc] initWithSession:self.session];
  self.previewLayer.frame = cameraContainerView.bounds; // Usar el bounds de la vista contenedora
  self.previewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill;

  // Aplicar zoom (escalado)
  CGFloat zoomScale = 1.5f; // Ajusta este valor para el nivel de zoom deseado
  self.previewLayer.transform = CATransform3DMakeScale(zoomScale, zoomScale, 1.0);

  [cameraContainerView.layer addSublayer:self.previewLayer];

  // Crear el overlay superior
  UIView *overlayViewTop = [[UIView alloc] init];
  overlayViewTop.backgroundColor = [UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.5]; // Color negro semitransparente
  overlayViewTop.frame = CGRectMake(0, 0, cameraContainerView.bounds.size.width, cameraContainerView.bounds.size.height / 4); // Parte superior

  // Crear el overlay inferior
  UIView *overlayViewBottom = [[UIView alloc] init];
  overlayViewBottom.backgroundColor = [UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.5]; // Color negro semitransparente
  overlayViewBottom.frame = CGRectMake(0, cameraContainerView.bounds.size.height - (cameraContainerView.bounds.size.height / 4), cameraContainerView.bounds.size.width, cameraContainerView.bounds.size.height / 4); // Parte inferior

  // Crear el overlay izquierdo
  UIView *overlayViewLeft = [[UIView alloc] init];
  overlayViewLeft.backgroundColor = [UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.5]; // Color negro semitransparente
  CGFloat overlayHeightLeft = cameraContainerView.bounds.size.height / 2; // Mitad de la altura
  overlayViewLeft.frame = CGRectMake(0, (cameraContainerView.bounds.size.height - overlayHeightLeft) / 2, cameraContainerView.bounds.size.width / 4, overlayHeightLeft); // Costado izquierdo

  // Crear el overlay derecho
  UIView *overlayViewRight = [[UIView alloc] init];
  overlayViewRight.backgroundColor = [UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.5]; // Color negro semitransparente
  CGFloat overlayHeightRight = cameraContainerView.bounds.size.height / 2; // Mitad de la altura
  overlayViewRight.frame = CGRectMake(cameraContainerView.bounds.size.width - (cameraContainerView.bounds.size.width / 4), (cameraContainerView.bounds.size.height - overlayHeightRight) / 2, cameraContainerView.bounds.size.width / 4, overlayHeightRight); // Costado derecho

  // Agregar los overlays a la vista contenedora de la cámara
  [cameraContainerView addSubview:overlayViewTop];
  [cameraContainerView addSubview:overlayViewBottom];
  [cameraContainerView addSubview:overlayViewLeft];
  [cameraContainerView addSubview:overlayViewRight];

  NSLog(@"Safe area insets: %@", NSStringFromUIEdgeInsets(self.view.safeAreaInsets));

  // Iniciar la sesión de la cámara
  [self.session startRunning];
  
  // Procesar cada frame de la cámara
  [self.output setSampleBufferDelegate:self queue:dispatch_get_main_queue()];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.session startRunning]; // Iniciar la sesión de la cámara
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    [self.session stopRunning]; // Detener la sesión de la cámara
}

// Método que procesa el frame de la cámara
- (void)captureOutput:(AVCaptureOutput *)output
 didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
      fromConnection:(AVCaptureConnection *)connection {

      static int frameCounter = 0;
      frameCounter++;
      if (frameCounter % 5 != 0) { // Procesar solo 1 de cada 5 frames
          return;
      }

    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    if (!imageBuffer) return;

    CVPixelBufferLockBaseAddress(imageBuffer, 0);

    // Obtener las dimensiones del frame
    size_t width = CVPixelBufferGetWidth(imageBuffer);
    size_t height = CVPixelBufferGetHeight(imageBuffer);

    // Obtener las dimensiones de la vista previa
    CGRect previewBounds = self.previewLayer.bounds;
    CGFloat previewWidth = previewBounds.size.width;
    CGFloat previewHeight = previewBounds.size.height;

    // Verificar el formato del pixel buffer
    OSType pixelFormat = CVPixelBufferGetPixelFormatType(imageBuffer);
    if (pixelFormat != kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange) {
        NSLog(@"Error: Unsupported pixel format (expected kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange, got %u)", (unsigned int)pixelFormat);
        CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
        return;
    }

    // Obtener los planos Y y UV
    uint8_t *yPlane = (uint8_t *)CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 0); // Plano Y
    uint8_t *uvPlane = (uint8_t *)CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 1); // Plano UV

    // Crear matrices OpenCV para los planos Y y UV
    size_t yWidth = CVPixelBufferGetWidthOfPlane(imageBuffer, 0);
    size_t yHeight = CVPixelBufferGetHeightOfPlane(imageBuffer, 0);
    cv::Mat yMat(yHeight, yWidth, CV_8UC1, yPlane); // Plano Y (1 canal)

    size_t uvWidth = CVPixelBufferGetWidthOfPlane(imageBuffer, 1);
    size_t uvHeight = CVPixelBufferGetHeightOfPlane(imageBuffer, 1);
    cv::Mat uvMat(uvHeight, uvWidth, CV_8UC2, uvPlane); // Plano UV (2 canales)

    // Convertir YUV a RGBA
    cv::Mat rgbaMat;
    cv::cvtColor(yMat, rgbaMat, cv::COLOR_YUV2RGBA_NV12); // NV12 es el formato YUV utilizado por iOS

    // Verificar si la matriz es válida
    if (rgbaMat.empty()) {
        NSLog(@"Error: rgbaMat is empty");
        CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
        return;
    }

    // Detectar y decodificar el código QR
    cv::QRCodeDetector qrDetector;
    std::vector<cv::Point> points;
    std::string qrCode = qrDetector.detectAndDecode(rgbaMat, points);

    // Manejar el resultado
    if (!qrCode.empty()) {
        NSLog(@"QR Code detected: %@", [NSString stringWithUTF8String:qrCode.c_str()]);

        // Convertir a NSString
        NSString *decodedString = [NSString stringWithUTF8String:qrCode.c_str()];

        // Obtener la instancia de OpenCVWrapper y actualizar la info
        [[OpenCVWrapper sharedInstance] updateDecodedInfo:decodedString];
    }

    CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
}

@end

@interface OpenCVWrapper ()
@property (nonatomic, strong) CameraViewController *cameraViewController;
@end

@implementation OpenCVWrapper {
    NSString *info; // Variable para almacenar el QR detectado
}

RCT_EXPORT_MODULE(); // Asegura que el módulo esté disponible en JavaScript

+ (instancetype)sharedInstance {
    static OpenCVWrapper *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[OpenCVWrapper alloc] init];
    });
    return sharedInstance;

}

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

RCT_EXPORT_METHOD(startCamera) {
    dispatch_async(dispatch_get_main_queue(), ^{
        // Obtener la ventana principal y su rootViewController
        UIWindow *window = [UIApplication sharedApplication].keyWindow;
        UIViewController *rootViewController = window.rootViewController;

        // Crear la vista de la cámara
        self.cameraViewController = [[CameraViewController alloc] init];
        self.cameraViewController.view.frame = CGRectMake(0, 50, rootViewController.view.bounds.size.width, rootViewController.view.bounds.size.height / 2); // Ajustar el frame de la cámara

        // Agregar la vista de la cámara a la jerarquía de vistas
        [rootViewController.view addSubview:self.cameraViewController.view];
        [rootViewController addChildViewController:self.cameraViewController]; // Agregar el controlador como hijo
        [self.cameraViewController didMoveToParentViewController:rootViewController]; // Notificar al controlador hijo
    });
}

RCT_EXPORT_METHOD(stopCamera) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.cameraViewController) {
            // Eliminar la vista de la cámara
            [self.cameraViewController.view removeFromSuperview];
            [self.cameraViewController removeFromParentViewController];
            self.cameraViewController = nil;
        }
    });
}

// Método actualizado para recibir info desde CameraViewController
- (void)updateDecodedInfo:(NSString *)decodedString {
    self.info = decodedString;
}

RCT_EXPORT_METHOD(sendDecodedInfoToReact:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (self.info != nil && [self.info length] > 0) {
        NSLog(@"CameragusQR - sendDecodedInfoToReact: %@", self.info);
        resolve(self.info); // Asegúrate de que esto se esté ejecutando
    } else {
        resolve(@""); // Devuelve una cadena vacía si no hay información
    }
}


+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
