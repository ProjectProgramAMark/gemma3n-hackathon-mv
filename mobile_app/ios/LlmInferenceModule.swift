//
//  LlmInferenceModule.swift
//  MosaicVoiceDev
//
//  Created by Mark Moussa on 7/12/25.
//
import Foundation
import MediaPipeTasksGenAI

@objc(LlmInferenceModule)
class LlmInferenceModule: NSObject {
    private var llmInference: LlmInference?

    override init() {
        super.init()
        // Update the model name and type if needed
        if let modelPath = Bundle.main.path(forResource: "gemma3-1b-it-int4", ofType: "task") {
        // if let modelPath = Bundle.main.path(forResource: "gemma-3n-E2B-it-int4", ofType: "task") {
            let options = LlmInference.Options(modelPath: modelPath)
            options.maxTokens = 1000
            options.maxTopk = 40
            // set other options as needed, e.g. options.waitForWeightUploads = true
            do {
                llmInference = try LlmInference(options: options)

            } catch {
                print("Failed to initialize LlmInference: \(error)")
            }
        } else {
            print("Model file not found!")
        }
    }

    @objc(generateResponse:resolver:rejecter:)
    func generateResponse(
        prompt: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let llmInference = llmInference else {
            rejecter("init_error", "LlmInference not initialized", nil as NSError?)
            return
        }
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let result = try llmInference.generateResponse(inputText: prompt)
                resolver(result)
            } catch {
                rejecter("inference_error", "Failed to generate response: \(error)", error as NSError)
            }
        }
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    // just a smoke test -- will remove after confirmed module is working
    @objc
    func runSmokeTest() {
        // print("--- Running LLM Smoke Test ---")
        // guard let llmInference = self.llmInference else {
        //     print("[SMOKE TEST] FAILED: LlmInference engine not initialized.")
        //     return
        // }

        // // Use a background thread to not block initialization
        // DispatchQueue.global(qos: .background).async {
        //     do {
        //         let prompt = "Write a short, 3-line poem about code."
        //         print("[SMOKE TEST] Prompt: \(prompt)")
        //         let result = try llmInference.generateResponse(inputText: prompt)
        //         print("\n[SMOKE TEST] SUCCESS: \(result)\n")
        //     } catch {
        //         print("\n[SMOKE TEST] FAILED with error: \(error)\n")
        //     }
        //     print("--- Smoke Test Finished ---")
        // }
    }
}
