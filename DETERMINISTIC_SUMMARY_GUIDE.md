# Deterministic Summary System - Technical Guide

## Overview

The AI triage system has been updated to use **rule-based interactions** and **deterministic summaries** instead of AI-generated text. This eliminates hallucinations and ensures consistent, predictable results.

## What Changed

### Before (AI-Generated)
- ❌ GPT-4o-mini generated summaries
- ❌ Potential hallucinations
- ❌ Inconsistent risk levels
- ❌ Cost: ~$0.00003 per request
- ❌ Required OpenAI API key

### After (Rule-Based + Deterministic)
- ✅ Explicit rules for known interactions
- ✅ Deterministic text generation
- ✅ Consistent risk assessment
- ✅ Cost: ~$0.000015 per request (embeddings only)
- ✅ Works without OpenAI API key (embeddings still need it for symptom attribution)

## Architecture

```
Input (medications + symptoms)
    ↓
1. RxNav API Interactions
   ├─ Query drug-drug interactions
   └─ Map severity → risk level
    ↓
2. Rule-Based Overrides
   ├─ Check known high-risk combinations
   ├─ Merge with RxNav results
   └─ Prefer higher risk levels
    ↓
3. Symptom Attribution (embeddings)
   ├─ Semantic search on labels
   └─ Score → risk level
    ↓
4. Deterministic Summary
   ├─ Template-based text generation
   ├─ No AI model involved
   └─ Fact-based statements only
    ↓
Response
```

## Components

### 1. Rule Engine (`server/ai/rules.js`)

**Purpose:** Catch known dangerous interactions that might be missed by RxNav

**Supported Rules:**
- **Enzyme Inducers** × **Hormonal Contraceptives** → HIGH risk
  - Rifampin, Rifampicin
  - St. John's Wort
  - Carbamazepine
  - Phenytoin
  - Topiramate (at high doses)

**How It Works:**

```javascript
// Detects if any contraceptive hormone + any inducer
if (has_hormonal_component && has_enzyme_inducer) {
  return {
    level: "high",
    source: "Rule",
    desc: "Enzyme induction may reduce contraceptive hormone levels and effectiveness."
  };
}
```

**Override Logic:**
1. Get interactions from RxNav
2. Apply rule-based overrides
3. Merge by deduplication:
   - Same drug pair → prefer higher risk level
   - Different pairs → add both
   - Sources are combined (e.g., "RxNav+Rule")

### 2. Deterministic Summary (`server/ai/summary.js`)

**Purpose:** Generate human-readable summaries without AI models

**Template Structure:**

```
[1] Overall interaction level: {HIGH|MEDIUM|LOW}.
[2] Key pairs: {drug A ↔ drug B, ...}.
[3] Pill type: {type} ({components}).
[4] Other medicines: {med1, med2, ...}.
[5] Reported symptoms: {symptoms}.
[6] Likely symptom links: {drug (section, score); ...}.
[7] This information is informational only and not medical advice.
```

**Example Output:**

```
Overall interaction level: HIGH. 
Key pairs: Rifampin ↔ Ethinyl Estradiol. 
Pill type: combined (ethinyl estradiol + levonorgestrel). 
Other medicines: rifampin. 
Reported symptoms: headache and breast tenderness. 
Likely symptom links: ethinyl estradiol (adverse_reactions, score 0.803); rifampin (adverse_reactions, score 0.712). 
This information is informational only and not medical advice.
```

### 3. Level Ranking (`server/ai/rules.js`)

**Purpose:** Consistent risk level comparison

```javascript
const rank = { high: 3, medium: 2, low: 1 };

export function maxLevel(levels = []) {
  let best = "low";
  for (const l of levels) {
    if (rank[l] > rank[best]) best = l;
  }
  return best;
}
```

## API Changes

### Endpoint: `POST /api/ai/triage`

**Request:** (unchanged)
```json
{
  "pillType": "combined",
  "meds": ["rifampin"],
  "symptoms": "nausea and mood swings"
}
```

**Response Changes:**

**Before:**
```json
{
  "interactions": [...],
  "summary": "AI-generated text that might hallucinate..."
}
```

**After:**
```json
{
  "interactions": [
    {
      "a": "Rifampin",
      "b": "Ethinyl Estradiol",
      "level": "high",
      "source": "Rule",  // ← Can be "RxNav", "Rule", or "RxNav+Rule"
      "desc": "Enzyme induction may reduce contraceptive hormone levels and effectiveness."
    }
  ],
  "summary": "Overall interaction level: HIGH. Key pairs: Rifampin ↔ Ethinyl Estradiol. ..."
}
```

## UI Changes

### New: Overall Interaction Level Badge

**Location:** Top of results, above summary

**Display:**
```
┌─────────────────────────────────────┐
│ Overall interaction level           │
│ [HIGH] 🔴                           │
└─────────────────────────────────────┘
```

**Color Coding:**
- 🔴 **HIGH** - Red background
- 🟡 **MEDIUM** - Yellow background
- 🟢 **LOW** - Green background

**Calculation:**
```javascript
// Frontend calculates max level from all interactions
const overallLevel = (interactions) => {
  return interactions.reduce((max, curr) => 
    rank[curr.level] > rank[max] ? curr.level : max, 
    "low"
  );
};
```

## Testing

### Test Case 1: Known High-Risk Interaction

**Input:**
```json
{
  "pillType": "combined",
  "meds": ["rifampin"],
  "symptoms": ""
}
```

**Expected:**
- Interaction: Rifampin ↔ Ethinyl Estradiol
- Level: HIGH
- Source: "Rule" (or "RxNav+Rule" if RxNav also detects it)
- Overall badge: RED/HIGH

### Test Case 2: Multiple Medications

**Input:**
```json
{
  "pillType": "combined",
  "meds": ["rifampin", "ibuprofen", "st. john's wort"],
  "symptoms": "headache"
}
```

**Expected:**
- Interactions:
  - Rifampin ↔ Ethinyl Estradiol (HIGH)
  - St. John's Wort ↔ Ethinyl Estradiol (HIGH)
  - Rifampin ↔ Levonorgestrel (HIGH)
  - St. John's Wort ↔ Levonorgestrel (HIGH)
- Overall: HIGH
- Summary mentions all key pairs

### Test Case 3: Symptom-Only Query

**Input:**
```json
{
  "pillType": "combined",
  "meds": [],
  "symptoms": "nausea and breast tenderness"
}
```

**Expected:**
- No interactions (only on pill)
- Attribution to ethinyl estradiol
- Summary mentions symptom links

## Benefits

### 1. No Hallucinations
- Every statement is fact-based
- Risk levels come from rules or RxNav
- No speculative AI-generated content

### 2. Consistent Results
- Same input → same output (every time)
- Predictable risk levels
- Reproducible for testing

### 3. Transparent Logic
- Rules are explicit in code
- Easy to audit and verify
- Medical professionals can review logic

### 4. Cost Reduction
- Embeddings only: ~$0.000015/request
- No chat completions needed
- 50% cost savings

### 5. No API Key Required (for summaries)
- Works with just RxNav (free)
- Embeddings optional (for symptom attribution)
- More accessible for development

## Limitations

### Current Rule Coverage
Currently only covers:
- 6 enzyme inducers (rifampin, rifampicin, St. John's wort, carbamazepine, phenytoin, topiramate)
- 4 contraceptive hormones (ethinyl estradiol, levonorgestrel, norethindrone, drospirenone)

**Missing:**
- Antibiotics (ampicillin, tetracycline)
- Antifungals (griseofulvin)
- HIV medications (many interactions)
- Anticonvulsants (beyond phenytoin, carbamazepine)

### Summary Style
- Factual but less polished than AI-generated text
- More technical/clinical tone
- Less conversational

### RxNav Dependency
- Still requires RxNav API for most interactions
- Rules only supplement, not replace

## Future Enhancements

### 1. Expand Rule Coverage
```javascript
// Add more interaction classes
ANTIBIOTIC_INTERACTIONS
ANTIFUNGAL_INTERACTIONS
HIV_MEDICATION_INTERACTIONS
ANTICONVULSANT_INTERACTIONS
```

### 2. Severity Grading
```javascript
// More granular risk levels
levels: ["critical", "high", "medium", "low", "minimal"]
```

### 3. Action Items
```javascript
// Add specific recommendations
{
  level: "high",
  action: "Use backup contraception for 7 days",
  reference: "WHO Guidelines 2023"
}
```

### 4. Optional AI Polish
```javascript
// Use GPT to rephrase (but not decide) deterministic summary
const polished = await polishSummary(deterministicSummary);
// Only rewording, never changing facts or levels
```

## Migration Guide

### For Backend Developers

**Remove old chat service:**
```diff
- import { summarizeTriage } from "./services/chat.js";
+ import { buildDeterministicSummary } from "./ai/summary.js";
```

**Use rule-based overrides:**
```javascript
const overrides = pillRiskOverrides({ pillComponents, meds });
const merged = mergeInteractions(rxnavResults, overrides);
```

**Generate deterministic summary:**
```javascript
const summary = buildDeterministicSummary({
  pillType, pillComponents, meds, interactions, attribution, symptoms
});
```

### For Frontend Developers

**Add overall level display:**
```jsx
{out?.interactions && out.interactions.length > 0 && (
  <div className="p-3 rounded-xl bg-gray-50 border">
    <div className="text-sm font-medium">Overall interaction level</div>
    <div className="mt-1">
      <Badge level={overallLevel(out.interactions)} />
    </div>
  </div>
)}
```

## Files Modified

### Backend
- `server/ai/rules.js` ✨ NEW - Rule-based interaction detection
- `server/ai/summary.js` ✨ NEW - Deterministic summary generation
- `server/index.js` 📝 UPDATED - Integrated rules + summary
- `server/tests.http` 📝 UPDATED - Removed "requires OpenAI key" note

### Frontend
- `frontend/src/components/AiInteractionAssistant.jsx` 📝 UPDATED - Added overall level badge

### Documentation
- `DETERMINISTIC_SUMMARY_GUIDE.md` ✨ NEW - This file

## Cost Comparison

### Old System
- Embeddings: $0.000015
- GPT-4o-mini summary: $0.00003
- **Total: $0.000045/request**

### New System
- Embeddings: $0.000015
- Deterministic summary: $0 (no API call)
- **Total: $0.000015/request**

**Savings: 67% cost reduction**

At 1000 requests/day:
- Old: $1.35/month
- New: **$0.45/month**
- **Savings: $0.90/month**

## Conclusion

The deterministic summary system provides:
- ✅ More reliable results
- ✅ No AI hallucinations
- ✅ Lower costs
- ✅ Transparent logic
- ✅ Easier to maintain

While sacrificing some polish in the text, the system gains reliability, consistency, and trustworthiness—critical for healthcare applications.

