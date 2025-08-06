import { NativeModules, Platform } from "react-native";
const { LlmInferenceModule } = NativeModules;

const strip = (s) => s?.replace(/^"+|"+$/g, "").trim();

/**
 * prompt that turns the tapped card titles into a natural sentence.
 */
function buildInitialPrompt(titles) {
  const list = titles.join(", ");
  return `
  
Assistant, the following images were selected by an individual with non-verbal Autism to communicate a thought or need. \
    They interact with an app that has flashcards of basic things, in order to communicate their wants or needs. \
    Your task is to infer and articulate the underlying message by interpreting these visuals from a first-person \
    perspective to express the individual's message in a simple and direct manner:

${list}

Compose ONE clear, grammatical sentence that the user might be trying to say with these words.
Do not add extra commentary or quotation marks.

Keep in mind the following:
- Reflect on past useful feedback (Good Feedback): {good_feedback}
- Avoid mistakes identified in past feedback (Bad Feedback): {bad_feedback}

Your response should:
- Be rooted in empathy, aiming to capture the essence of the user's intended communication.
- Use simple, direct language, but also be open to interpreting the message creatively and not just literally.
- Maintain a practical and straightforward tone.
- Be precise and clear in communicating the intended message.
- Examine the human input for potential thematic connections or deeper meanings beyond the obvious.
- Only speak in first person. Pretend you are the user speaking.
- Be concise. There should be absolutely nothing else in your response except for the user's message.

Here is an example of how it should respond:

human_input: ['Thirsty', 'Water']
your_response: "I" am thirsty. I would like some water."

Remember, the goal is to give a voice to the user's thoughts or needs in a manner that is both accurate and respectful of their unique way of communicating.
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
