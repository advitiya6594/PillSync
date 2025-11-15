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

## Sample cURL

```bash
curl http://localhost:5050/api/health

curl "http://localhost:5050/api/cycle?packType=combined_24_4&startDate=2025-11-01"

curl -X POST http://localhost:5050/api/check-interactions \
  -H "Content-Type: application/json" \
  -d '{"meds":["rifampin","St. John'\''s Wort","topiramate"],"pillType":"combined"}'

curl "http://localhost:5050/api/side-effects?kind=combined"
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

