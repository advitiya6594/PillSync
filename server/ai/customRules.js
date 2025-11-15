// server/ai/customRules.js
// Deterministic rulebook for demo. Highest priority.

// --- Aliases (misspellings/brands) ---
const ALIAS = {
  advil: "ibuprofen",
  motrin: "ibuprofen",
  ibuprofine: "ibuprofen",
  rifampicin: "rifampin",
  "ferrous sulphate": "ferrous sulfate",
};

export function normalizeDrugName(name = "") {
  const s = String(name).trim().toLowerCase();
  return ALIAS[s] || s;
}

// --- Your rulebook levels (highest priority) ---
export const FORCE_LEVEL = {
  rifampin: "high",
  topiramate: "moderate",
  ibuprofen: "low",
  "ferrous sulfate": "moderate",
  "ferrous gluconate": "moderate",
  "ferrous fumarate": "moderate",
  iron: "moderate",
}

export function applyCustomRulebook({ pillComponents = [], meds = [] }) {
  const forced = new Map();
  const pairs = [];
  const cap = s => String(s).split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  
  for (const raw of meds) {
    const norm = normalizeDrugName(raw);
    const level = FORCE_LEVEL[norm];
    if (!level) continue;
    forced.set(norm, level);
    for (const pc of pillComponents) {
      pairs.push({
        a: cap(raw), b: cap(pc), level, source: "CustomRule",
        desc: `Set by rulebook for demo: ${cap(raw)} vs ${cap(pc)} → ${level.toUpperCase()}.`
      });
    }
  }
  return { forcedPairs: pairs, forcedLevels: forced };
}

// --- Deterministic advice text (no LLM) ---
const ADVICE = {
  rifampin: {
    reason: "Rifampin induces liver enzymes and can lower contraceptive hormone levels.",
    keywords: ["spotting", "breakthrough", "bleeding", "breast", "tenderness", "nausea", "headache"],
    tips: [
      "Use a backup method (e.g., condoms) while on rifampin; confirm timing with your clinician.",
      "Track unexpected bleeding or cycle changes.",
      "If you miss pills or have GI illness, follow your pill's missed-dose instructions."
    ]
  },
  topiramate: {
    reason: "Topiramate can reduce hormone exposure at higher doses and can cause headache or dizziness.",
    keywords: ["headache", "dizzy", "dizziness", "fatigue", "nausea", "mood"],
    tips: [
      "Hydrate regularly and avoid alcohol when symptomatic.",
      "Taking in the evening may help; confirm dose/timing with your prescriber.",
      "If symptoms persist or dose ≥100 mg/day, consider backup contraception and consult your clinician."
    ]
  },
  "ferrous sulfate": baseIron(),
  "ferrous gluconate": baseIron(),
  "ferrous fumarate": baseIron(),
  iron: baseIron(),
};

function baseIron() {
  return {
    reason: "Iron salts often cause GI upset and can affect absorption of other medicines.",
    keywords: ["nausea", "constipation", "stomach", "cramp", "abdominal", "pain"],
    tips: [
      "Take with food if your stomach is upset (unless told otherwise).",
      "Separate iron from other medicines by ~2 hours to reduce absorption issues.",
      "Increase fluids and fiber if constipated."
    ]
  };
}

// Build the advice list. We include advice when:
//  - drug is in rulebook AND level is not 'low'
//  - symptoms match any keyword OR symptoms are empty (generic guidance still shown)
export function buildSymptomAdvice({ symptomsText = "", meds = [], forcedLevels = new Map(), pillComponents = [] }) {
  const text = (symptomsText || "").toLowerCase();
  const cap = s => String(s).split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const out = [];

  for (const raw of meds) {
    const norm = normalizeDrugName(raw);
    const lvl = (forcedLevels.get(norm) || "").toLowerCase();
    if (!lvl || lvl === "low") continue; // your rule: don't attribute for LOW (e.g., ibuprofen)
    const book = ADVICE[norm];
    if (!book) continue;
    const matched = (book.keywords || []).filter(k => text.includes(k));
    // relaxed: if user gave symptoms and none matched, we still show generic advice for high/moderate
    const show = text.length === 0 || matched.length > 0 || lvl !== "low";
    if (!show) continue;

    out.push({
      drug: cap(raw),
      level: lvl,
      reason: book.reason,
      matches: matched,
      tips: book.tips,
      pill: pillComponents.map(cap).join(" + ")
    });
  }
  return out;
}

