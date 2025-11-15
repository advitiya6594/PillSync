# PillSync API (Demo)

Informational demo API for birth control pill cycle info and simple interaction flags.  
**Not medical advice. Dataset is illustrative and incomplete.**

## Configuration

Create a `.env` file based on `.env.example`:

```bash
PORT=5050
USE_DEMO_DATA=true
```

**Environment Variables:**
- `PORT` - Server port (default: 5050)
- `USE_DEMO_DATA` - Set to `true` for demo/mock data, `false` to call real APIs
- `OPENAI_API_KEY` - OpenAI API key for AI-powered side effect classification (optional)
- `AI_MODEL_EMB` - Embedding model to use (default: `text-embedding-3-small`)

## Run

```bash
npm i
npm run dev
```

Server at http://localhost:5050

## Endpoints

**GET /api/health** → liveness info

**GET /api/cycle?packType=combined_24_4&startDate=YYYY-MM-DD** → phase, pack day, suppression

**POST /api/check-interactions** body `{ meds: string[], pillType: "combined" | "progestin_only" }` → risk flags

**GET /api/side-effects?kind=combined|progestin_only** → common effects (demo)

**POST /api/ai/classify-effects** body `{ text: string, topK?: number, minSim?: number }` → AI-powered side effect classification from diary text

## Sample cURL

```bash
curl http://localhost:5050/api/health

curl "http://localhost:5050/api/cycle?packType=combined_24_4&startDate=2025-11-01"

curl -X POST http://localhost:5050/api/check-interactions \
  -H "Content-Type: application/json" \
  -d '{"meds":["rifampin","St. John'\''s Wort","topiramate"],"pillType":"combined"}'

curl "http://localhost:5050/api/side-effects?kind=combined"

curl -X POST http://localhost:5050/api/ai/classify-effects \
  -H "Content-Type: application/json" \
  -d '{"text":"I felt nauseous today and had a mild headache"}'
```

## Real API Mode

To use real drug interaction APIs instead of demo data:

```bash
cp .env.example .env
echo "USE_DEMO_DATA=false" >> .env
npm run dev
```

### APIs Used

**RxNav/RxNorm (NLM)**
- Medication name resolution via RxCUI
- Drug-drug interaction detection
- We restrict results to interaction pairs that involve pill ingredients (estrogen, progestin)

**OpenFDA (Optional Enhancement)**
- Drug label snippets for warnings and interactions
- Best-effort enrichment (fails silently on rate limits)

### Example with Real API

```bash
# Check interactions for rifampin and topiramate against combined pill
curl -X POST http://localhost:5050/api/check-interactions \
  -H "Content-Type: application/json" \
  -d '{"meds":["rifampin","topiramate"],"pillType":"combined"}'

# Response includes:
# - Real interaction data from RxNav
# - Optional label notes from OpenFDA
# - Falls back to demo data if APIs fail or return no results
```

**Note:** OpenFDA enrichment is best-effort and may be rate-limited. The API will work without it.

## AI-Powered Side Effect Classification

The API includes an AI-powered endpoint that can classify diary text into specific side effect categories using semantic similarity via OpenAI embeddings.

### Setup

Add your OpenAI API key to `.env`:

```bash
OPENAI_API_KEY=sk-your-key-here
AI_MODEL_EMB=text-embedding-3-small
```

### How It Works

1. Takes free-form diary text about symptoms/feelings
2. Uses OpenAI embeddings to compute semantic similarity with 13 common side effect labels
3. Returns the top matching labels with confidence scores

**Supported Labels:**
- nausea, headache, breast tenderness, mood changes, spotting, cramps
- fatigue, acne, libido changes, bloating, dizziness, anxiety, depression

### Example

```bash
curl -X POST http://localhost:5050/api/ai/classify-effects \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Feeling really tired and bloated today, also had some mild cramping",
    "topK": 4,
    "minSim": 0.65
  }'
```

**Response:**

```json
{
  "tags": [
    { "label": "fatigue", "score": 0.823 },
    { "label": "bloating", "score": 0.791 },
    { "label": "cramps", "score": 0.745 }
  ],
  "labelSpace": ["nausea", "headache", "breast tenderness", ...]
}
```

**Parameters:**
- `text` (required) - Diary entry or symptom description
- `topK` (optional, default: 4) - Maximum number of labels to return
- `minSim` (optional, default: 0.65) - Minimum similarity threshold (0-1)

