//
//  OpenCVWrapper.m
//  testDoc
//
//  Created by DDT on 28/02/25.
//

#import <Foundation/Foundation.h>
#import "OpenCVWrapper.h"
#import <React/RCTBridgeModule.h>

@implementation OpenCVWrapper

RCT_EXPORT_MODULE(); // Asegura que el módulo esté disponible en JavaScript

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_METHOD(getOpenCVVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([NSString stringWithFormat:@"OpenCV Version %s", CV_VERSION]);
}


@end
