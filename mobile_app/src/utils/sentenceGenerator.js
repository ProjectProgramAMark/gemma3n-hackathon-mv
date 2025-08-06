import { NativeModules, Platform } from "react-native";
const { LlmInferenceModule } = NativeModules;

const strip = (s) => s?.replace(/^"+|"+$/g, "").trim();

/**
 * prompt that turns the tapped card titles into a natural sentence.
 */
function buildInitialPrompt(titles) {
  const list = titles.join(", ");
  return `
You are an AAC assistant. The user selected the following cards:

${list}

Compose ONE clear, grammatical sentence that the user might be trying to say with these words.
Do not add extra commentary or quotation marks.
  `.trim();
}

function buildRegenerationPrompt(titles, previous) {
  return `
The user disliked the previous sentence and wants a new one.

Previous: "${previous}"

Selected cards: ${titles.join(", ")}

Return ONE **different** sentence that still matches the cards.
`.trim();
}

/* ---------- public API ---------- */
export async function generateSentenceLocal(titles) {
  if (!LlmInferenceModule || Platform.OS !== "ios") return null;

  try {
    const raw = await LlmInferenceModule.generateResponse(
      buildInitialPrompt(titles)
    );
    return strip(raw);
  } catch (e) {
    console.warn("[LLM] local generation failed:", e);
    return null;
  }
}

export async function regenerateSentenceLocal(titles, previous) {
  if (!LlmInferenceModule || Platform.OS !== "ios") return null;

  try {
    const raw = await LlmInferenceModule.generateResponse(
      buildRegenerationPrompt(titles, previous)
    );
    return strip(raw);
  } catch (e) {
    console.warn("[LLM] local regeneration failed:", e);
    return null;
  }
}
