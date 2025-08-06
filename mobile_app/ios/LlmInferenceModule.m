#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LlmInferenceModule, NSObject)

// uncomment to execute smoke test of LLM inference
// RCT_EXTERN_METHOD(runSmokeTest)

RCT_EXTERN_METHOD(generateResponse:(NSString *)prompt
                 resolver:(RCTPromiseResolveBlock)resolver
                 rejecter:(RCTPromiseRejectBlock)rejecter)

@end
