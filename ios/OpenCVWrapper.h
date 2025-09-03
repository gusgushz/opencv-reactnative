#import <Foundation/Foundation.h>
#import <CoreVideo/CoreVideo.h>
#import <React/RCTBridgeModule.h>

#ifdef __cplusplus
#import <opencv2/core.hpp>
#endif

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, HologramOrientation) {
    HOLO_NORTH = 0,
    HOLO_EAST = 1,
    HOLO_WEST = 2,
    HOLO_SOUTH = 3
};

@interface OpenCVWrapper : NSObject <RCTBridgeModule>

@property (nonatomic, strong, nullable) NSString *lastDecodedQRCode;
@property (nonatomic, assign) int frameCounter;
@property (nonatomic, assign) int mark;
@property (nonatomic, assign) int border;
@property (nonatomic, assign) int marker;
@property (nonatomic, assign) HologramOrientation orientation;
@property (nonatomic, assign) BOOL codeDetected;
@property (nonatomic, assign) double slope;
@property (nonatomic, assign) int impSize;

// Índices de contorno y marcador válidos
@property (nonatomic, assign) int lastValidBorder;
@property (nonatomic, assign) int lastValidMarker;

+ (instancetype)sharedInstance;

#ifdef __cplusplus
// Contornos detectados
@property (nonatomic, readonly) std::vector<std::vector<cv::Point>> *lastContours;
// Declaraciones de métodos que usan tipos C++
+ (cv::Mat)convertYUVBufferToRGBA:(CVImageBufferRef)imageBuffer;
- (BOOL)detectCode:(const cv::Mat &)image;
- (NSArray<NSString *> *)extractBits;
#endif

@end

NS_ASSUME_NONNULL_END
