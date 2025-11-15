# Final Testing Guide - PillSync Complete System

## 🎉 What's Been Implemented

### ✅ Backend (Node.js + Express)
1. **Single Source of Truth for Interactions** (`/api/interactions/check`)
   - RxNav API integration for real drug-drug interactions
   - Rule-based overrides for enzyme inducers (rifampin, St. John's Wort, etc.)
   - Deduplication with severity preference
   - LOW synthesis for non-interacting medications

2. **Deterministic Chat Endpoint** (`/api/chat/interaction-assistant`)
   - Template-based responses (no AI hallucinations)
   - Calls `/api/interactions/check` internally
   - Returns plain-English message + structured data

3. **AI Features** (optional, requires OpenAI API key)
   - `/api/ai/classify-effects` — Diary entry tagging with embeddings
   - `/api/ai/triage` — Comprehensive symptom analysis
   - `/api/ai/explain-interactions` — Evidence-locked explanations

4. **Other Endpoints**
   - `/api/cycle` — Cycle tracking (pack day, phase, suppression status)
   - `/api/side-effects` — Common and placebo-week side effects
   - `/api/health` — Server health check

### ✅ Frontend (Vite + React + Tailwind)
1. **Figma Design Integration**
   - Complete UI from Figma export
   - Tabs: Overview, Medications, Calendar, Reminders
   - Responsive, modern design with animations

2. **Live Data Bridges**
   - `CycleBridge` — Real-time cycle tracking
   - `EffectsBridge` — Side effect display
   - `InteractionsBridge` — Medication checker
   - `AiInteractionAssistant` — Smart interaction analysis

3. **Feature Flags**
   - `SHOW_SIDE_EFFECT_TAGGER=false` (hidden by default)
   - Controlled via `frontend/.env`

4. **High-Contrast UI**
   - All badges use light backgrounds + dark text
   - Readable on all screens

## 🚀 How to Run

### Start Both Servers
```bash
# Terminal 1 — Backend (from project root)
cd server
npm run dev
# ✅ Should see: "PillSync API running at http://localhost:5050"

# Terminal 2 — Frontend (from project root)
cd frontend
npm run dev
# ✅ Should see: "Local: http://localhost:5173"
```

**Or use the combined command:**
```bash
# From project root
npm run dev
# ✅ Starts both backend and frontend in parallel
```

## 🧪 Test Cases

### 1. Test Backend Health
**URL:** http://localhost:5050/api/health

**Expected Response:**
```json
{
  "ok": true,
  "name": "PillSync API",
  "version": "0.1",
  "mode": "real",
  "strict": true,
  "time": "2025-11-15T..."
}
```

### 2. Test HIGH-Risk Interaction (Rifampin)
**PowerShell:**
```powershell
$body = @{
  pillType = "combined"
  meds = @("rifampin")
  symptoms = "headache"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5050/api/chat/interaction-assistant `
  -Method POST -ContentType "application/json" -Body $body
```

**Expected:**
- `data.overall` = `"high"`
- `message` contains "Overall interaction level: HIGH"
- `data.interactions` includes Rifampin ↔ Ethinyl Estradiol (high)

### 3. Test LOW-Risk (Non-Interacting) Medication
**PowerShell:**
```powershell
$body = @{
  pillType = "combined"
  meds = @("ibuprofen")
  symptoms = ""
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5050/api/chat/interaction-assistant `
  -Method POST -ContentType "application/json" -Body $body
```

**Expected:**
- `data.overall` = `"low"`
- `message` contains "Overall interaction level: LOW"
- `data.interactions` shows "Ibuprofen ↔ Combined pill (low)" with "RxNav (no pairs)" source

### 4. Test Cycle Tracking
**URL:** http://localhost:5050/api/cycle?packType=combined_24_4&startDate=2025-11-01

**Expected Response:**
```json
{
  "packType": "combined_24_4",
  "packDay": 15,
  "phaseLabel": "Active pills",
  "suppression": "90-95%",
  "isActivePill": true,
  "message": "You're on day 15 of your pack..."
}
```

### 5. Test Side Effects
**URL:** http://localhost:5050/api/side-effects?kind=combined

**Expected Response:**
```json
{
  "kind": "combined",
  "common": [
    { "name": "Nausea", "likelihood": "10-20%", "note": "..." },
    ...
  ],
  "placebo_week": [...]
}
```

## 🌐 Frontend Testing (Browser)

### Open the App
**URL:** http://localhost:5173

### Test Flow:

#### A. Overview Tab
1. **Verify Cycle Tracker displays:**
   - Current pack day
   - Phase (Active/Placebo)
   - Suppression percentage
   - Dynamic phase indicator

2. **Verify Current Effects shows:**
   - List of common side effects
   - Likelihood percentages
   - On placebo days: withdrawal symptoms

3. **Verify Side Effect Tagger is HIDDEN** (default)
   - Should NOT appear under Current Effects
   - To enable: Set `VITE_SHOW_SIDE_EFFECT_TAGGER=true` in `frontend/.env` and restart

#### B. Medications Tab

##### Medication Interaction Checker
1. Enter medications: `rifampin, topiramate`
2. Click "Check Interactions"
3. **Expected:**
   - Overall level badge: **HIGH** (red, readable)
   - Table shows pairs with levels and descriptions
   - Sources listed (RxNav, Rule, etc.)

##### AI Interaction & Symptom Explainer
1. **Pill type:** Combined
2. **Other medicines:** `rifampin`
3. **Symptoms:** `headache and breast tenderness`
4. Click "Analyze interactions & causes"
5. **Expected:**
   - **Overall interaction level:** HIGH badge (red background, dark red text)
   - **AI Explanation:** "Overall interaction level: HIGH. Pill: ethinyl estradiol + levonorgestrel. Other medicines: rifampin. Pairs: Rifampin ↔ Ethinyl Estradiol (high); Rifampin ↔ Levonorgestrel (high). Sources: Rule. Informational only — not medical advice."
   - **Interaction details table:** Shows all pairs with badges

6. **Test LOW case:** Change meds to `ibuprofen`
7. Click "Analyze interactions & causes"
8. **Expected:**
   - Overall level: **LOW** (green)
   - Message mentions "RxNav returned no interacting pairs"
   - Table shows "Ibuprofen ↔ Combined pill (low)"

#### C. Calendar Tab
1. Verify fertility calendar renders
2. Check cycle day highlighting
3. Test date navigation

#### D. Reminders Tab
1. Verify pill reminder card displays
2. Check time selection works

## 🎨 Visual Verification

### High-Contrast Badges
All level badges should use:
- **HIGH:** Light red background (#FEE2E2), dark red text (#991B1B), red border
- **MEDIUM:** Light amber background (#FEF3C7), dark amber text (#92400E), amber border
- **LOW:** Light green background (#D1FAE5), dark green text (#065F46), green border

**No more pale/unreadable white text on translucent backgrounds!**

### Responsive Design
Test on:
- Desktop (1920x1080)
- Tablet (768px width)
- Mobile (375px width)

All cards should stack nicely on mobile.

## 🔧 Troubleshooting

### Backend won't start
```bash
cd server
npm install
npm run dev
```
Check `server/.env` exists with:
```
PORT=5050
USE_DEMO_DATA=false
OPENAI_API_KEY=your_key_here  # optional, for AI features
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```
Check `frontend/.env` exists with:
```
VITE_API_URL=http://localhost:5050
VITE_SHOW_SIDE_EFFECT_TAGGER=false
```

### API calls fail (CORS errors)
- Backend must be running on port 5050
- Frontend proxy is configured in `frontend/vite.config.js`
- Check browser console for exact error

### Interactions show as blank/no data
- Check backend logs for RxNav API errors
- RxNav API may be rate-limited or down
- Rule-based interactions (rifampin) should always work

### Badge colors look wrong
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check `frontend/src/components/AiInteractionAssistant.jsx` has updated Badge styles

## 📊 Success Criteria

### ✅ All tests pass if:
1. Backend health check returns `ok: true`
2. Rifampin shows **HIGH** in both checker and AI box
3. Ibuprofen shows **LOW** with "no pairs" note
4. Badges are readable (dark text, light background)
5. Side Effect Tagger is hidden on Overview tab
6. No console errors in browser
7. No 404s in network tab
8. Cycle tracker updates when date changes
9. Side effects list appears and changes based on pack day

## 🚨 Known Limitations

1. **RxNav API Rate Limits**
   - Free tier: ~1000 requests/day
   - Fallback: Rule-based interactions still work

2. **OpenFDA API**
   - Label data may be incomplete for generic drugs
   - Used for bonus context, not critical path

3. **AI Features Require OpenAI API Key**
   - `/api/ai/*` endpoints return 400 if `OPENAI_API_KEY` not set
   - Costs ~$0.01 per 100 analyses
   - Not required for core functionality

4. **Demo Data Mode**
   - Set `USE_DEMO_DATA=true` in `server/.env` to bypass APIs
   - Useful for offline development
   - Returns static demo interactions

## 📚 Documentation Files

- ✅ `server/README.md` — Backend setup and API docs
- ✅ `server/tests.http` — HTTP test cases for all endpoints
- ✅ `UNIFIED_INTERACTION_LOGIC_GUIDE.md` — Architecture of single source of truth
- ✅ `FEATURE_FLAGS_GUIDE.md` — How to control feature visibility
- ✅ `DETERMINISTIC_SUMMARY_GUIDE.md` — How AI explanations work
- ✅ `EVIDENCE_LOCKED_AI_GUIDE.md` — How AI is constrained to facts
- ✅ `FINAL_TESTING_GUIDE.md` (this file)

## 🎯 Next Steps After Testing

1. **Deploy to Production**
   - Push to GitHub: `git push origin main`
   - Deploy backend to Railway/Render/Heroku
   - Deploy frontend to Vercel/Netlify
   - Set environment variables in hosting platforms

2. **Add More Medications**
   - Extend `server/services/contraceptives.js` with more pill types
   - Add more enzyme inducers to `server/ai/rules.js`

3. **Improve AI Features**
   - Index more FDA label data (`server/ai/labelsIndexer.js`)
   - Add more symptom embeddings
   - Tune similarity thresholds

4. **User Authentication**
   - Add login/signup
   - Store user cycle data in database
   - Persist medication lists and diary entries

5. **Mobile App**
   - Wrap in Capacitor/React Native
   - Add push notifications for pill reminders

---

**Last Updated:** November 15, 2025  
**Status:** ✅ Ready for Testing  
**Maintainer:** PillSync Development Team

**Happy Testing! 🚀💊**


