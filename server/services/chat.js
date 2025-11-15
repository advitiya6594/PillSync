import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CHAT_MODEL = process.env.AI_MODEL_CHAT || "gpt-4o-mini";

export async function summarizeTriage(payload) {
  // Keep prompts small and safe
  const sys = "You are a cautious, non-diagnostic assistant. Summarize interaction level (high/medium/low) and likely symptom attributions per medication. Add a one-line caution: informational only, not medical advice.";
  const usr = `Data:\n${JSON.stringify(payload).slice(0, 6000)}\nTask: Produce a 3-5 sentence plain-English summary.`;
  const res = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "system", content: sys }, { role: "user", content: usr }],
    temperature: 0.2,
    max_tokens: 220
  });
  return res.choices?.[0]?.message?.content?.trim() || "";
}

