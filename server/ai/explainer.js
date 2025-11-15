import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CHAT_MODEL = process.env.AI_MODEL_CHAT || "gpt-4o-mini";

// Hard JSON schema so the model can't wander
const schema = {
  name: "InteractionExplanation",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      overall_level: { type: "string", enum: ["low", "medium", "high"] },
      pairs: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            a: { type: "string" },
            b: { type: "string" },
            level: { type: "string", enum: ["low", "medium", "high"] },
            rationale: { type: "string" }
          },
          required: ["a", "b", "level", "rationale"]
        }
      },
      symptom_links: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            symptom: { type: "string" },
            caused_by: { type: "string" },   // one of allowed drugs
            evidence_quote: { type: "string" }, // must be exact substring from provided snippets
          },
          required: ["symptom", "caused_by", "evidence_quote"]
        }
      }
    },
    required: ["overall_level", "pairs", "symptom_links"]
  }
};

export async function explainFromEvidence({ interactions, symptoms, evidenceByDrug, overallLevel, allowedDrugs }) {
  // Build a compact, explicit evidence bundle
  const payload = {
    overallLevel,
    interactions: interactions.map(p => ({ a: p.a, b: p.b, level: p.level, source: p.source })),
    symptoms,
    evidenceByDrug // { drug: [ {section, text} ] }  ONLY these texts may be quoted
  };

  const sys = [
    "You are an extractive explainer. Only use the provided evidence bundle.",
    "Rules:",
    "• Do NOT invent interactions, levels, drugs, or symptoms.",
    "• For symptom_links.evidence_quote you MUST copy an exact substring from evidenceByDrug for the chosen drug.",
    "• caused_by must be one of the allowed drugs.",
    "• If no evidence connects a symptom to a drug, omit that symptom.",
    "• Use short, clinical wording.",
  ].join(" ");

  const user = "Evidence bundle:\n" + JSON.stringify(payload).slice(0, 12000) +
    `\nAllowed drugs: ${allowedDrugs.join(", ")}\nOutput strictly in the JSON schema.`;

  const res = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    temperature: 0.0,
    response_format: { type: "json_schema", json_schema: schema }
  });

  const text = res.choices?.[0]?.message?.content || "{}";
  return JSON.parse(text);
}

