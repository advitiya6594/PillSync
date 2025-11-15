import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = process.env.AI_MODEL_EMB || "text-embedding-3-small";

export async function embedMany(texts) {
  if (!texts?.length) return [];

  const res = await client.embeddings.create({ model: MODEL, input: texts });

  return res.data.map(d => d.embedding);
}

