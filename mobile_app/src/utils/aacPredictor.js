import { NativeModules } from "react-native";
const { LlmInferenceModule } = NativeModules;

const MAX_ALLOWED = 100; // keep prompt small
const MAX_HISTORY = 3; // last 3 taps only

/* ------------------------------------------------------------------ */
/*  helper: grab N random elements (Fisher‑Yates) I dont think this helps tho, model seems very deterministic */
function shuffledSample(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/* ------------------------------------------------------------------ */
/*  Build the actual prompt                                           */
function buildPrompt(historyIds, allowedObjs, id2title) {
  /* the last N human–readable taps, newest → oldest   */
  const history =
    historyIds
      .slice(-MAX_HISTORY)
      .reverse()
      .map((cid, i) => `(${i + 1}) ${id2title[cid] ?? cid}`)
      .join(" → ") || "(no taps yet)";

  const allowed = shuffledSample(allowedObjs, MAX_ALLOWED)
    .map((o) => `${o.id}:${o.title}`) // id:title
    .join("\n");

  console.log("Prompt:", {
    history,
    allowed,
  });

  return `
You are an AAC “next card” assistant.

### What the user has tapped so far (newest first)
${history}

### Cards you may choose from. (List of id:title pairs): 
${allowed}

### Rules
1. Suggest **exactly five distinct card *IDs***, best first.
2. Every suggestion *must* share at least **one topic** with the *most‑recent*
   tap above.  (Topics are implicit in the titles.)
3. Output format (one line):
<BEGIN>id1,id2,id3,id4,id5<END>
`.trim();
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
export async function getNextCards(historyIds, allowedObjs) {
  // 1.  build a tiny id → title map once to show readable history
  const id2title = Object.fromEntries(allowedObjs.map((o) => [o.id, o.title]));

  const prompt = buildPrompt(historyIds, allowedObjs, id2title);

  let raw = "";
  try {
    raw = await LlmInferenceModule.generateResponse(prompt);
  } catch (e) {
    console.warn("[LLM] crashed – fallback", e);
  }

  /* ---------- extract between tags ---------- */
  const inside = raw.match(/<BEGIN>([^<]+)<END>/)?.[1] ?? "";
  let ids = inside.split(/[\s,]+/).filter(Boolean);

  /* ---------- sanity‑check ---------- */
  const allowedSet = new Set(allowedObjs.map((o) => o.id));
  ids = ids.filter((id, i) => allowedSet.has(id) && ids.indexOf(id) === i);

  /* ---------- pad (deterministic) ---------- */
  for (const { id } of allowedObjs) {
    if (ids.length === 5) break;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, 5); // always 5
}
