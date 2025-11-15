import { embedMany } from "../services/embeddings.js";
import { cosineSim } from "../utils/similarity.js";

export const LABELS = [
  "nausea", "headache", "breast tenderness", "mood changes", "spotting", "cramps",
  "fatigue", "acne", "libido changes", "bloating", "dizziness", "anxiety", "depression"
];

export async function classifyDiary(text, topK = 4, minSim = 0.65) {
  const t = String(text || "").toLowerCase().slice(0, 800);
  const inputs = [t, ...LABELS];
  const embs = await embedMany(inputs);
  const q = embs[0], labels = embs.slice(1);
  const scored = LABELS
    .map((lab, i) => ({ label: lab, score: cosineSim(q, labels[i]) }))
    .sort((a, b) => b.score - a.score)
    .filter(x => x.score >= minSim)
    .slice(0, topK)
    .map(x => ({ label: x.label, score: +x.score.toFixed(3) }));
  return { tags: scored };
}

