# AI Setup Instructions

## Overview

PillSync now includes AI-powered side effect classification using OpenAI embeddings for semantic similarity matching.

## Quick Setup

1. **Get an OpenAI API Key**
   - Sign up at https://platform.openai.com/
   - Generate an API key from the API keys section

2. **Update your `.env` file**
   
   Add these lines to your `server/.env`:
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   AI_MODEL_EMB=text-embedding-3-small
   ```

3. **Restart the server**
   ```bash
   cd server
   npm run dev
   ```

## Testing

Use the REST Client (`tests.http`) or curl:

```bash
curl -X POST http://localhost:5050/api/ai/classify-effects \
  -H "Content-Type: application/json" \
  -d '{"text":"I felt nauseous today and had a mild headache"}'
```

## Files Added

- `server/utils/similarity.js` - Cosine similarity calculation
- `server/services/embeddings.js` - OpenAI embeddings API wrapper
- `server/ai/effectClassifier.js` - Main classification logic
- `server/index.js` - Added `/api/ai/classify-effects` route

## How It Works

1. Takes user diary text (e.g., "feeling tired and bloated")
2. Generates embeddings for the text and 13 side effect labels
3. Computes cosine similarity between text and each label
4. Returns top matching labels above threshold with confidence scores

## Side Effect Labels

The classifier recognizes these 13 common side effects:
- nausea
- headache
- breast tenderness
- mood changes
- spotting
- cramps
- fatigue
- acne
- libido changes
- bloating
- dizziness
- anxiety
- depression

## API Parameters

- `text` (required) - The diary entry or symptom description
- `topK` (optional, default: 4) - Maximum number of labels to return
- `minSim` (optional, default: 0.65) - Minimum similarity threshold (0-1)

## Example Response

```json
{
  "tags": [
    { "label": "nausea", "score": 0.823 },
    { "label": "headache", "score": 0.791 },
    { "label": "bloating", "score": 0.745 }
  ],
  "labelSpace": ["nausea", "headache", "breast tenderness", ...]
}
```

## Cost Considerations

- Uses `text-embedding-3-small` model by default (very low cost)
- Each request embeds ~14 strings (user text + 13 labels)
- Approximate cost: $0.00002 per request (~50,000 requests per dollar)

## Without OpenAI Key

If `OPENAI_API_KEY` is not set, the endpoint returns:
```json
{
  "error": "AI not configured"
}
```

The rest of the API continues to work normally.

