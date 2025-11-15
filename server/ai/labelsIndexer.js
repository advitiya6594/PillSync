import { embedMany } from "../services/embeddings.js";
import { cosineSim } from "../utils/similarity.js";

// In-memory label snippets database
// In production, this would come from OpenFDA labels or a proper database
const LABEL_SNIPPETS = [
  // Ethinyl Estradiol + Levonorgestrel (Combined Pills)
  { drug: "ethinyl estradiol", section: "adverse_reactions", text: "The most common adverse reactions reported by ≥5% of users include: nausea, breast tenderness, headache, and mood changes." },
  { drug: "ethinyl estradiol", section: "warnings", text: "May cause increased risk of blood clots, stroke, and heart attack, especially in smokers over 35." },
  { drug: "levonorgestrel", section: "adverse_reactions", text: "Common side effects include irregular bleeding or spotting, breast tenderness, abdominal pain, nausea, and headache." },
  { drug: "levonorgestrel", section: "warnings", text: "May cause mood changes, depression, or anxiety. Contact healthcare provider if symptoms worsen." },
  
  // Norethindrone (Progestin-Only)
  { drug: "norethindrone", section: "adverse_reactions", text: "Most frequently reported: irregular menstrual bleeding, spotting, amenorrhea, breast tenderness, acne, and mood changes." },
  { drug: "norethindrone", section: "warnings", text: "May cause changes in menstrual patterns. Breakthrough bleeding and spotting are common in the first months." },
  
  // Common medications that interact
  { drug: "rifampin", section: "drug_interactions", text: "Strong CYP3A4 inducer. Significantly reduces contraceptive effectiveness. Use backup contraception." },
  { drug: "rifampin", section: "adverse_reactions", text: "May cause gastrointestinal upset, headache, dizziness, and fatigue." },
  { drug: "topiramate", section: "drug_interactions", text: "May reduce contraceptive efficacy at doses ≥200mg/day. Consider alternative or additional contraception." },
  { drug: "topiramate", section: "adverse_reactions", text: "Common side effects include cognitive impairment, fatigue, dizziness, nausea, and mood changes." },
  { drug: "st. john's wort", section: "drug_interactions", text: "Herbal supplement that induces CYP3A4. Reduces oral contraceptive levels. Avoid concurrent use." },
  { drug: "st. john's wort", section: "adverse_reactions", text: "May cause photosensitivity, gastrointestinal symptoms, dizziness, confusion, and fatigue." },
  { drug: "ibuprofen", section: "adverse_reactions", text: "Common side effects include stomach upset, nausea, heartburn, dizziness, and headache." },
  { drug: "acetaminophen", section: "adverse_reactions", text: "Generally well tolerated. Rare side effects may include nausea, rash, and headache." },
];

// Cached embeddings
let indexCache = null;

export async function ensureIndex() {
  if (indexCache) return;
  
  console.log("[LabelsIndexer] Building embeddings index...");
  const texts = LABEL_SNIPPETS.map(s => s.text);
  const embeddings = await embedMany(texts);
  
  indexCache = LABEL_SNIPPETS.map((snippet, i) => ({
    ...snippet,
    embedding: embeddings[i]
  }));
  
  console.log(`[LabelsIndexer] Indexed ${indexCache.length} label snippets`);
}

export async function searchRelevant(queryText, topK = 10) {
  await ensureIndex();
  
  if (!queryText || !queryText.trim()) return [];
  
  // Embed the query
  const [queryEmb] = await embedMany([queryText]);
  
  // Compute similarities
  const scored = indexCache.map(item => ({
    drug: item.drug,
    section: item.section,
    text: item.text,
    score: cosineSim(queryEmb, item.embedding)
  }));
  
  // Sort by score and return top K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

