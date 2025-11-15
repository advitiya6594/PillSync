# AI Interaction Assistant UI - User Guide

## Overview

The **AI Interaction Assistant** is a comprehensive frontend component that provides users with:

1. **Drug Interaction Analysis** - Check medications for interactions with birth control
2. **Symptom Attribution** - Understand which medications might be causing symptoms
3. **AI-Generated Summaries** - Plain-English explanations of findings

## Location

Navigate to: **Medications** tab → Scroll down to **AI Interaction & Symptom Explainer**

## Features

### 1. Input Form

**Pill Type Selection**
- Combined (EE + progestin) - Standard combined oral contraceptives
- Progestin-only - Mini-pills without estrogen

**Medications Input**
- Enter comma-separated list of medications
- Example: `rifampin, topiramate, ibuprofen`
- Pre-filled with example: `rifampin, topiramate`

**Symptoms Description**
- Free-text area for symptom description
- Example: "headache and breast tenderness"
- Maximum 800 characters (enforced by backend)

### 2. Results Display

#### AI Summary (if OpenAI key is configured)
- Plain-English explanation of findings
- Highlights high-risk interactions
- Provides attribution for symptoms
- Includes medical disclaimer

Example:
```
"High-level interaction detected between rifampin and contraceptive components. 
Nausea and mood changes may be attributed to ethinyl estradiol. 
This is informational only—consult your healthcare provider."
```

#### Interaction Levels Table

Displays all drug-drug interactions found:

| Column | Description |
|--------|-------------|
| **Pair** | Drug A ↔ Drug B |
| **Level** | Risk level badge (high/medium/low) |
| **Source** | Data source (RxNav) |
| **Note** | Description of interaction |

**Risk Level Color Coding:**
- 🔴 **High** - Red badge (contraindicated, major risk)
- 🟡 **Medium** - Yellow badge (moderate risk, monitor)
- 🟢 **Low** - Green badge (minor risk, low concern)

#### Symptom Attribution

Shows which medications might be causing reported symptoms:

**For each drug:**
- Drug name header
- Up to 3 matching label snippets
- Each snippet shows:
  - Risk level badge
  - Label section (adverse_reactions, warnings, drug_interactions)
  - Similarity score (0-1)
  - Excerpt from drug label

Example:
```
rifampin
  🟡 medium  drug_interactions · score 0.823
  "Strong CYP3A4 inducer. Significantly reduces contraceptive effectiveness..."
  
  🟡 medium  adverse_reactions · score 0.712
  "May cause gastrointestinal upset, headache, dizziness, and fatigue."
```

## Usage Examples

### Example 1: Check New Medication

**Input:**
- Pill type: Combined
- Medications: `rifampin`
- Symptoms: (leave empty)

**Result:**
- Shows high-risk interaction between rifampin and contraceptive
- No symptom attribution (no symptoms entered)
- Summary explains reduced contraceptive effectiveness

### Example 2: Investigate Symptoms

**Input:**
- Pill type: Combined
- Medications: (leave empty)
- Symptoms: `nausea and mood swings`

**Result:**
- No drug interactions (only on birth control)
- Symptom attribution shows ethinyl estradiol as likely cause
- Summary explains these are common side effects

### Example 3: Comprehensive Check

**Input:**
- Pill type: Combined
- Medications: `rifampin, ibuprofen`
- Symptoms: `headache and breast tenderness`

**Result:**
- Interaction: rifampin ↔ ethinyl estradiol (high risk)
- Symptom attribution: headache → multiple sources, breast tenderness → ethinyl estradiol
- Summary synthesizes both findings

## API Integration

### Backend Endpoint
```
POST /api/ai/triage
```

### Request Format
```json
{
  "pillType": "combined",
  "meds": ["rifampin", "topiramate"],
  "symptoms": "headache and breast tenderness"
}
```

### Response Handling

**Success (200):**
```json
{
  "pillType": "combined",
  "meds": [...],
  "pillComponents": [...],
  "interactions": [...],
  "attribution": {...},
  "symptoms": "...",
  "summary": "..."
}
```

**Error:**
- HTTP error → Shows error message
- No interactions → Shows "No interactions returned by RxNav"
- No attribution → Shows "No strong label matches found"

## Technical Details

### Component Structure

```
AiInteractionAssistant.jsx
├── Badge component (risk level badges)
└── Main component
    ├── Input form
    │   ├── Pill type select
    │   ├── Medications input
    │   └── Symptoms textarea
    ├── Action button
    ├── Error display
    └── Results display
        ├── AI summary
        ├── Interactions table
        └── Attribution cards
```

### State Management

```javascript
const [pillType, setPillType] = useState("combined");
const [meds, setMeds] = useState("rifampin, topiramate");
const [symptoms, setSymptoms] = useState("headache and breast tenderness");
const [out, setOut] = useState(null);
const [loading, setLoading] = useState(false);
const [err, setErr] = useState("");
```

### Styling

- **Design System**: Tailwind CSS
- **Colors**: 
  - High risk: `bg-red-100 text-red-800 border-red-300`
  - Medium risk: `bg-yellow-100 text-yellow-800 border-yellow-300`
  - Low risk: `bg-green-100 text-green-800 border-green-300`
- **Layout**: Responsive grid, stacks on mobile
- **Theme**: White background with subtle border/shadow

## User Experience

### Loading States

While analyzing:
- Button text changes to "Analyzing…"
- Button is disabled
- Previous results are cleared

### Error States

If request fails:
- Red error message displays below button
- Previous results remain visible
- User can retry

### Empty States

- No interactions: "No interactions returned by RxNav."
- No attribution: "No strong label matches found."
- No summary: Summary section hidden

### Accessibility

- Semantic HTML (table, labels)
- Color + text for status (not color alone)
- Disabled state for button
- Clear error messages

## Testing

### Manual Test Cases

1. **Test with known interaction**
   - Medications: `rifampin`
   - Expected: High-risk interaction with pill

2. **Test with symptoms only**
   - Medications: (empty)
   - Symptoms: `nausea`
   - Expected: Attribution to pill components

3. **Test with no results**
   - Medications: `ibuprofen`
   - Symptoms: `headache`
   - Expected: Possibly low/medium risk, some attribution

4. **Test error handling**
   - Turn off backend
   - Expected: "Request failed" error

### Integration Test

```bash
# Start backend
cd server
npm run dev

# Start frontend (in project root)
npm run dev

# Navigate to http://localhost:5173
# Click "Medications" tab
# Scroll to AI Interaction & Symptom Explainer
# Enter test data and click "Analyze"
```

## Files

### New Files
- `frontend/src/components/AiInteractionAssistant.jsx` - Main component (150 lines)

### Modified Files
- `frontend/src/figma/FigmaLanding.jsx` - Mounted in Medications tab

## Requirements

- Backend running on port 5050
- OpenAI API key configured (for AI summaries)
- Vite proxy configured for `/api` requests

## Limitations

1. **Label Database**: Limited to ~15 drugs in demo version
2. **RxNav Coverage**: Not all medications have interaction data
3. **Embedding Accuracy**: Symptom matching is semantic, not clinical
4. **AI Summaries**: Requires OpenAI API key (optional feature)
5. **Not Diagnostic**: Tool is informational only

## Future Enhancements

1. **Auto-save**: Save user's medication list
2. **History**: Track symptom patterns over time
3. **Export**: Download results as PDF
4. **Severity Filter**: Filter interactions by risk level
5. **Drug Autocomplete**: Suggest medication names as user types
6. **Mobile Optimization**: Improve table display on small screens
7. **Voice Input**: Allow voice recording for symptoms

## Support

For issues or questions:
- Check backend logs: `cd server && npm run dev`
- Verify API endpoint: `http://localhost:5050/api/health`
- Test backend directly: Use `server/tests.http`

## Cost

Per analysis:
- Embeddings: ~$0.000015
- AI Summary: ~$0.00003
- **Total**: ~$0.000045

At 100 analyses/day: **$0.14/month**

