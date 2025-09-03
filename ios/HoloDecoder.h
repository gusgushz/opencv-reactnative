// HoloDecoder.h
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface HoloDecoder : NSObject

+ (NSString *)whichState:(NSInteger)stateId;
+ (NSString *)whichVehicleNew:(NSInteger)vehicleId;
- (NSString *)decodeMessage:(int * _Nonnull * _Nonnull)binaryData rows:(int)rows cols:(int)cols;
- (void)printMatrixWithoutBorders:(int **)matrix rows:(int)rows cols:(int)cols;
- (void)rotateMatrix180:(int **)matrix rows:(int)rows cols:(int)cols;
- (void)rotateMatrix90:(int **)matrix rows:(int)rows cols:(int)cols;
- (void)rotateMatrix270:(int **)matrix rows:(int)rows cols:(int)cols;

@end

NS_ASSUME_NONNULL_END
