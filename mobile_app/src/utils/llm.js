import { NativeModules, Platform } from "react-native";

const { LlmInferenceModule } = NativeModules;

/**
 * Ask the on‑device LLM for a response.
 * Falls back to a rejected promise on platforms where the native module
 * does not exist (e.g. Expo Go, web).
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function askLLM(prompt) {
  if (!LlmInferenceModule || Platform.OS === "web") {
    return Promise.reject(
      new Error("LlmInference native module not available on this platform.")
    );
  }

  try {
    const reply = await LlmInferenceModule.generateResponse(prompt);
    return reply;
  } catch (err) {
    console.warn("LLM error:", err);
    throw err;
  }
}

/** One‑shot smoke test you can call from JS */
export function runSmokeTest() {
  if (LlmInferenceModule?.runSmokeTest) {
    LlmInferenceModule.runSmokeTest();
  } else {
    console.warn("runSmokeTest not available");
  }
}
