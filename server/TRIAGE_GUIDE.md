# AI Triage System - Complete Guide

## Overview

The AI Triage endpoint (`/api/ai/triage`) provides comprehensive health assessment by combining:

1. **Drug Interaction Analysis** - Real-time RxNav API queries
2. **Symptom Attribution** - Semantic matching with drug label database
3. **AI Summarization** - Plain-English summary via GPT-4o-mini

## Quick Start

### 1. Setup Environment

Add to `server/.env`:

```bash
PORT=5050
USE_DEMO_DATA=false
OPENAI_API_KEY=sk-your-key-here
AI_MODEL_EMB=text-embedding-3-small
AI_MODEL_CHAT=gpt-4o-mini
```

### 2. Start Server

```bash
cd server
npm run dev
```

### 3. Test the Endpoint

```bash
curl -X POST http://localhost:5050/api/ai/triage \
  -H "Content-Type: application/json" \
  -d '{
    "pillType": "combined",
    "symptoms": "Feeling nauseous and have mood swings",
    "meds": ["rifampin"]
  }'
```

## How It Works

### Architecture

```
User Input (symptoms + medications)
    ↓
1. DRUG RESOLUTION
   ├─ Combine user meds + pill components
   ├─ RxNav: name → RxCUI for each drug
   └─ Result: List of RxCUIs
    ↓
2. INTERACTION ANALYSIS
   ├─ RxNav: Query interactions for all RxCUIs
   ├─ Map severity → risk level (high/medium/low)
   └─ Result: Interaction pairs with risk levels
    ↓
3. SYMPTOM ATTRIBUTION
   ├─ OpenAI: Embed symptom text
   ├─ Search label database for semantic matches
   ├─ Score similarity → risk level
   └─ Result: Top 3 matches per drug
    ↓
4. AI SUMMARY (optional)
   ├─ GPT-4o-mini: Synthesize all data
   ├─ Generate 3-5 sentence summary
   └─ Result: Plain English explanation
    ↓
JSON Response
```

### Components

#### 1. Risk Level Mapping (`server/ai/risk.js`)

Maps API severities to standardized risk levels:

- **High**: Contraindicated, major interactions, high similarity (≥0.75)
- **Medium**: Moderate interactions, monitor closely, medium similarity (0.60-0.75)
- **Low**: Minor interactions, low risk, lower similarity (<0.60)

#### 2. Label Database (`server/ai/labelsIndexer.js`)

In-memory database of drug label snippets:
- Common contraceptive ingredients (ethinyl estradiol, levonorgestrel, norethindrone)
- Known interacting drugs (rifampin, topiramate, St. John's wort)
- Common OTC medications (ibuprofen, acetaminophen)

Each snippet includes:
- Drug name
- Section (adverse_reactions, warnings, drug_interactions)
- Text content
- Pre-computed embedding vector

#### 3. Chat Summarization (`server/services/chat.js`)

Uses GPT-4o-mini to create summaries:
- Temperature: 0.2 (consistent, factual)
- Max tokens: 220 (~50 words)
- System prompt: "Non-diagnostic, cautious assistant"
- Includes medical disclaimer

## API Request

### Endpoint

```
POST /api/ai/triage
```

### Request Body

```json
{
  "pillType": "combined",          // or "progestin_only"
  "symptoms": "text description",  // max 800 chars
  "meds": ["drug1", "drug2"]       // max 16 drugs
}
```

**Fields:**
- `pillType` (optional, default: "combined") - Type of contraceptive
  - `"combined"` - Estrogen + progestin (uses ethinyl estradiol, levonorgestrel)
  - `"progestin_only"` - POP (uses norethindrone)
- `symptoms` (required) - Free-text description of symptoms
- `meds` (optional, default: []) - Array of medication names

## API Response

### Structure

```json
{
  "pillType": "combined",
  "meds": ["rifampin"],
  "pillComponents": ["ethinyl estradiol", "levonorgestrel"],
  "interactions": [...],
  "attribution": {...},
  "symptoms": "Feeling nauseous and have mood swings",
  "summary": "AI-generated summary..."
}
```

### Interactions Array

Each interaction object:

```json
{
  "a": "ethinyl estradiol",
  "b": "rifampin",
  "severity": "high",
  "level": "high",
  "source": "RxNav",
  "desc": "Rifampin may decrease contraceptive effectiveness by inducing hepatic enzymes..."
}
```

### Attribution Object

Grouped by drug name, top 3 matches per drug:

```json
{
  "rifampin": [
    {
      "section": "drug_interactions",
      "score": 0.823,
      "level": "high",
      "text": "Strong CYP3A4 inducer. Significantly reduces contraceptive effectiveness..."
    }
  ],
  "ethinyl estradiol": [
    {
      "section": "adverse_reactions",
      "score": 0.791,
      "level": "high",
      "text": "Common adverse reactions include nausea, breast tenderness, mood changes..."
    }
  ]
}
```

### Summary Field

Plain-English AI-generated summary (requires OpenAI API key):

```
"High-level interaction detected between rifampin and contraceptive components. 
Nausea and mood changes may be attributed to ethinyl estradiol. 
This is informational only—consult your healthcare provider."
```

## Use Cases

### 1. New Medication Check

**Scenario:** User starts new prescription, wants to check interactions

```json
{
  "pillType": "combined",
  "symptoms": "",
  "meds": ["fluconazole"]
}
```

**Result:** Identifies CYP3A4 interactions with contraceptive

### 2. Symptom Investigation

**Scenario:** User experiencing side effects, wants to know the cause

```json
{
  "pillType": "combined",
  "symptoms": "Nausea and breast tenderness for the past week",
  "meds": []
}
```

**Result:** Attributes symptoms to ethinyl estradiol (common side effect)

### 3. Comprehensive Assessment

**Scenario:** User on multiple medications with new symptoms

```json
{
  "pillType": "combined",
  "symptoms": "Irregular bleeding and mood changes",
  "meds": ["topiramate", "ibuprofen"]
}
```

**Result:** 
- Interaction: topiramate reduces contraceptive efficacy
- Attribution: bleeding → topiramate interaction, mood changes → ethinyl estradiol
- Summary: Plain English explanation with action items

## Cost Estimates

Per request:
- **Embeddings**: ~$0.000015 (embedding symptom text + searching labels)
- **Chat Summary**: ~$0.00003 (GPT-4o-mini, 220 tokens)
- **Total**: ~$0.000045 per request (~22,000 requests per dollar)

Monthly at 1000 requests/day:
- 30,000 requests × $0.000045 = **$1.35/month**

## Error Handling

### No OpenAI Key

```json
{
  "interactions": [...],
  "attribution": {},
  "summary": ""
}
```

Attribution will be empty, summary will be empty string. Interactions still work via RxNav.

### RxNav API Failure

```json
{
  "interactions": [],
  "attribution": {...},
  "summary": "..."
}
```

Interactions array will be empty. Attribution and summary still work.

### Invalid Drug Names

System gracefully handles unknown drugs:
- RxNav returns null → drug skipped
- No error thrown
- Other valid drugs still processed

## Files

### New Files
- `server/ai/risk.js` - Severity/score mapping functions
- `server/ai/labelsIndexer.js` - Label database with embeddings
- `server/services/chat.js` - GPT summarization wrapper

### Modified Files
- `server/index.js` - Added `/api/ai/triage` endpoint
- `server/services/rxnav.js` - Added `namesToRxcuis` helper
- `server/README.md` - Documentation
- `server/tests.http` - Test cases

## Development

### Adding New Drugs to Label Database

Edit `server/ai/labelsIndexer.js`:

```javascript
const LABEL_SNIPPETS = [
  // ... existing entries ...
  {
    drug: "new_drug_name",
    section: "adverse_reactions",
    text: "Side effect description from FDA label..."
  }
];
```

Restart server to rebuild embeddings.

### Tuning Risk Thresholds

Edit `server/ai/risk.js`:

```javascript
export function scoreToLevel(score = 0) {
  if (score >= 0.80) return "high";  // Increase threshold
  if (score >= 0.65) return "medium";
  return "low";
}
```

### Customizing AI Summary

Edit `server/services/chat.js`:

```javascript
const sys = "Your custom system prompt...";
// Adjust temperature, max_tokens, etc.
```

## Testing

Use the provided test cases in `server/tests.http`:

1. **High-risk interaction**: rifampin + combined pill
2. **Symptom-only query**: No meds, just side effects
3. **Progestin-only pill**: Different ingredient set

## Security & Privacy

- **No data storage**: All processing is stateless
- **Truncated inputs**: Symptoms limited to 800 chars, meds to 16
- **Rate limiting**: Consider adding in production
- **HTTPS**: Always use HTTPS in production
- **Disclaimers**: All responses include "not medical advice" warnings

## Limitations

1. **Label Database**: Limited to ~15 drugs in demo. Production needs comprehensive database.
2. **RxNav Coverage**: Not all drugs have interaction data
3. **Embedding Quality**: Semantic search may miss exact clinical terms
4. **AI Hallucination**: Summary may include speculative statements—always include disclaimer
5. **Not Diagnostic**: Tool is informational only, not a substitute for medical advice

## Next Steps

To production-ize:

1. **Expand Label Database**
   - Integrate with OpenFDA for real-time label retrieval
   - Cache embeddings in Redis/database
   - Cover top 500 medications

2. **Add User Context**
   - Age, weight, medical history
   - Current cycle day
   - Historical symptom tracking

3. **Implement Rate Limiting**
   - Per-user API limits
   - OpenAI request throttling

4. **Enhanced Summarization**
   - Multi-turn conversations
   - Follow-up questions
   - Action item generation

5. **Analytics**
   - Track common interactions
   - Monitor API costs
   - A/B test summary styles

