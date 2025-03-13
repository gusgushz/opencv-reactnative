//
//  OpenCVWrapper.h
//  testDoc
//
//  Created by DDT on 28/02/25.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

#ifndef OpenCVWrapper_h
#define OpenCVWrapper_h

NS_ASSUME_NONNULL_BEGIN

@interface OpenCVWrapper : NSObject <RCTBridgeModule>

@property (nonatomic, strong) NSString *info;

+ (instancetype)sharedInstance;
- (void)updateDecodedInfo:(NSString *)decodedString;

@end

NS_ASSUME_NONNULL_END

#endif /* OpenCVWrapper_h */
