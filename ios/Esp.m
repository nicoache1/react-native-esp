#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Esp, NSObject)

RCT_EXTERN_METHOD(scanBleDevices:(NSString *)prefix
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectToDevice:(NSString *)deviceAddress
                 deviceProofOfPossession:(NSString *)deviceProofOfPossession
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(scanWifiList:
  (RCTPromiseResolveBlock)resolve
  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(provision:(NSString *)ssid
                passPhrase:(NSString *)passPhrase
                withResolver:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL) requiresMainQueueSetup {
  return YES;
}

@end
