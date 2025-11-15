# AI Diary Tagger - Quick Guide

## What It Does

The DiaryTagger component allows users to:
- Enter free-form diary text about symptoms/feelings
- Use AI (OpenAI embeddings) to automatically tag side effects
- Tune similarity threshold (`minSim`) and number of results (`topK`) in real-time

## Setup & Testing

### 1. Backend Setup

Make sure your OpenAI API key is configured:

```bash
# In server/.env
OPENAI_API_KEY=sk-your-key-here
```

Start the backend:

```bash
cd server
npm run dev
```

### 2. Frontend Setup

The proxy is already configured in `vite.config.js` to forward `/api` to `http://localhost:5050`.

Start the frontend from project root:

```bash
npm run dev
```

### 3. Test the Feature

1. Open http://localhost:5173
2. Go to the **Overview** tab
3. Scroll down to see the **AI — Side-effect tagger** card
4. Enter sample text like:
   - "felt moody, light spotting, slight headache"
   - "Feeling really tired and bloated today"
   - "Had some anxiety and mood swings"
5. Adjust parameters:
   - **Min similarity**: 0.60 (lower = more lenient matching)
   - **Top K**: 4 (number of tags to show)
6. Click **"AI tag side effects"**
7. See tagged effects appear as chips with confidence scores

## Example Results

**Input:** "I felt nauseous today and had a mild headache. Also feeling really bloated."

**Output:**
- nausea · 0.823
- headache · 0.791
- bloating · 0.745

## Files Added/Modified

### New Files:
- `frontend/src/components/DiaryTagger.jsx` - Main UI component
- `server/utils/similarity.js` - Cosine similarity calculation
- `server/services/embeddings.js` - OpenAI embeddings wrapper
- `server/ai/effectClassifier.js` - Classification logic

### Modified Files:
- `frontend/src/figma/FigmaLanding.jsx` - Mounted DiaryTagger in Overview tab
- `server/index.js` - Added `/api/ai/classify-effects` endpoint

## Architecture

```
User enters text in DiaryTagger
    ↓
POST /api/ai/classify-effects { text, minSim, topK }
    ↓
Backend: effectClassifier.classifyDiary()
    ↓
OpenAI API: Generate embeddings
    ↓
Compute cosine similarity with 13 labels
    ↓
Return top matches above threshold
    ↓
DiaryTagger displays tagged effects
```

## Troubleshooting

**Error: "AI not configured"**
- Add `OPENAI_API_KEY` to `server/.env`
- Restart the backend server

**Error: "HTTP 502"**
- Make sure backend is running on port 5050
- Check that Vite proxy is configured correctly

**No tags appearing**
- Lower the `minSim` threshold (try 0.50)
- Increase `topK` to see more results
- Make sure text is descriptive (not just one word)

## Supported Side Effect Labels

1. nausea
2. headache
3. breast tenderness
4. mood changes
5. spotting
6. cramps
7. fatigue
8. acne
9. libido changes
10. bloating
11. dizziness
12. anxiety
13. depression

## Cost

- Model: `text-embedding-3-small`
- ~$0.00002 per request
- ~50,000 requests per dollar

