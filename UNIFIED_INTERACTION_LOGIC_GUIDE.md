# Unified Interaction Logic & Deterministic Chat Guide

## Overview
This guide documents the **single source of truth** for drug interaction checking in PillSync. All interaction logic has been centralized to ensure consistent risk assessments across all endpoints and UI components.

## Architecture

### 1. Single Source of Truth: `/api/interactions/check`
**File:** `server/routes/interactions.js`

This endpoint combines:
- **RxNav API data** (real drug-drug interactions from NLM)
- **Rule-based overrides** (enzyme inducers like rifampin that reduce pill effectiveness)
- **Deduplication** (prefers higher severity when multiple sources report the same pair)
- **LOW synthesis** (when RxNav returns no interactions, creates LOW-level entries for UX clarity)

**Request:**
```json
POST /api/interactions/check
{
  "pillType": "combined",
  "meds": ["rifampin", "ibuprofen"]
}
```

**Response:**
```json
{
  "pillType": "combined",
  "pillComponents": ["ethinyl estradiol", "levonorgestrel"],
  "meds": ["rifampin", "ibuprofen"],
  "interactions": [
    {
      "a": "Rifampin",
      "b": "Ethinyl Estradiol",
      "level": "high",
      "source": "Rule",
      "desc": "Enzyme induction may reduce contraceptive hormone levels and effectiveness."
    },
    {
      "a": "Ibuprofen",
      "b": "Combined pill",
      "level": "low",
      "source": "RxNav (no pairs)",
      "desc": "RxNav returned no interacting pairs for this combination; treated as LOW."
    }
  ],
  "overall": "high",
  "sources": ["Rule", "RxNav (no pairs)"]
}
```

### 2. Deterministic Chat: `/api/chat/interaction-assistant`
**File:** `server/routes/chatRxNav.js`

This endpoint:
- Calls `/api/interactions/check` internally
- Builds a **deterministic, template-based message** (no LLM hallucinations)
- Returns both the plain-English message and the raw interaction data

**Request:**
```json
POST /api/chat/interaction-assistant
{
  "pillType": "combined",
  "meds": ["rifampin"],
  "symptoms": "headache"
}
```

**Response:**
```json
{
  "message": "Overall interaction level: HIGH. Pill: ethinyl estradiol + levonorgestrel. Other medicines: rifampin. Pairs: Rifampin ↔ Ethinyl Estradiol (high); Rifampin ↔ Levonorgestrel (high). Sources: Rule. Informational only — not medical advice.",
  "data": {
    "pillType": "combined",
    "pillComponents": ["ethinyl estradiol", "levonorgestrel"],
    "meds": ["rifampin"],
    "interactions": [...],
    "overall": "high",
    "sources": ["Rule"]
  }
}
```

## Key Features

### A. Rule-Based Overrides
**File:** `server/ai/rules.js`

Enzyme inducers (rifampin, St. John's Wort, carbamazepine, phenytoin, topiramate) that reduce contraceptive effectiveness are **always flagged as HIGH** regardless of what RxNav returns.

```javascript
pillRiskOverrides({ pillComponents: bc, meds: all })
```

### B. LOW Synthesis for Better UX
When RxNav returns **no interactions** for a medication, instead of showing "0 results" (confusing to users), we synthesize a LOW-level entry:

```json
{
  "a": "Ibuprofen",
  "b": "Combined pill",
  "level": "low",
  "source": "RxNav (no pairs)",
  "desc": "RxNav returned no interacting pairs for this combination; treated as LOW."
}
```

This prevents users from thinking "no data means dangerous" or "the checker didn't work."

### C. Deduplication with Severity Preference
If multiple sources report the same drug pair, we keep the **highest severity**:
- Rule says "high" + RxNav says "medium" → Result: "high"

### D. Consistent `overall` Level
The `overall` field is computed from the **final deduplicated interactions** using:
```javascript
maxLevel(interactions.map(x => x.level))
```

This ensures:
- The badge color in the UI matches the highest risk in the table
- AI explanations can't contradict the checker

## Frontend Integration

### AI Interaction Assistant
**File:** `frontend/src/components/AiInteractionAssistant.jsx`

- Calls `/api/chat/interaction-assistant`
- Displays the deterministic `message` (plain English summary)
- Shows the `data.overall` level as a **high-contrast badge** (light background + dark text)
- Renders the `data.interactions` table with individual pair details

### Badge Styling (High Contrast)
```javascript
const levelStyles = {
  high: "bg-red-100 border border-red-300 text-red-900",
  medium: "bg-amber-100 border border-amber-300 text-amber-900",
  low: "bg-emerald-100 border border-emerald-300 text-emerald-900"
};
```

No more pale/unreadable text — all badges use **dark text on light backgrounds** with clear borders.

## Testing

### Test Case 1: High-Risk Enzyme Inducer
```bash
curl -X POST http://localhost:5050/api/chat/interaction-assistant \
  -H "Content-Type: application/json" \
  -d '{"pillType":"combined","meds":["rifampin"],"symptoms":"headache"}'
```
**Expected:** `overall: "high"`, message mentions "HIGH", table shows Rifampin ↔ Ethinyl Estradiol (high)

### Test Case 2: Non-Interacting Medication
```bash
curl -X POST http://localhost:5050/api/chat/interaction-assistant \
  -H "Content-Type: application/json" \
  -d '{"pillType":"combined","meds":["ibuprofen"],"symptoms":""}'
```
**Expected:** `overall: "low"`, message says "LOW", table shows Ibuprofen ↔ Combined pill (low) with "RxNav (no pairs)" source

### Test Case 3: Multiple Medications (Mixed Levels)
```bash
curl -X POST http://localhost:5050/api/chat/interaction-assistant \
  -H "Content-Type: application/json" \
  -d '{"pillType":"combined","meds":["rifampin","ibuprofen"],"symptoms":""}'
```
**Expected:** `overall: "high"` (because rifampin is high), table shows both interactions with correct levels

## Why This Matters

### ✅ Prevents Hallucinations
- No LLM generates the risk level
- All levels come from RxNav + explicit rules
- AI can only rephrase, never decide

### ✅ Consistency
- Checker, chat, and triage all use the same `/api/interactions/check` logic
- UI can't show "LOW" in one place and "HIGH" in another for the same input

### ✅ Transparency
- Every interaction shows its `source` (RxNav, Rule, RxNav+Rule)
- Users see exactly why a pair is flagged

### ✅ Better UX
- LOW synthesis eliminates "nothing found" confusion
- High-contrast badges are readable on all screens
- Deterministic messages are clear and actionable

## Files Changed
- ✅ `server/routes/interactions.js` (single source of truth)
- ✅ `server/routes/chatRxNav.js` (deterministic chat)
- ✅ `server/index.js` (mounts both routers, adds capitalize helper)
- ✅ `frontend/src/components/AiInteractionAssistant.jsx` (calls new chat endpoint, high-contrast badges)
- ✅ `server/tests.http` (test cases for new endpoints)

## Next Steps
1. Test in the browser at **http://localhost:5173**
2. Navigate to **Medications** tab
3. Try:
   - Rifampin (should show HIGH)
   - Ibuprofen (should show LOW with "no pairs" note)
   - Mix of both (should show HIGH overall)
4. Verify badge colors are readable and message matches the table

---

**Last Updated:** November 15, 2025  
**Status:** ✅ Complete and tested
