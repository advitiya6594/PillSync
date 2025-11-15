# Custom Rulebook Guide - Demo Priority System

## Overview
The Custom Rulebook is the **highest priority** interaction source in PillSync. It overrides both RxNav API results and the enzyme inducer rules, making it perfect for demos, testing, and client-specific requirements.

## Architecture Priority

```
┌─────────────────────────────────────┐
│   1. CUSTOM RULEBOOK (Highest)     │ ← server/ai/customRules.js
├─────────────────────────────────────┤
│   2. Enzyme Inducer Rules           │ ← server/ai/rules.js
├─────────────────────────────────────┤
│   3. RxNav API Data                 │ ← server/services/rxnav.js
├─────────────────────────────────────┤
│   4. LOW Synthesis (if empty)       │ ← server/routes/interactions.js
└─────────────────────────────────────┘
```

**Key Principle:** Custom rulebook wins all conflicts, then higher severity wins.

## File Structure

### `server/ai/customRules.js`

```javascript
// Aliases for common misspellings and brand names
const ALIAS = {
  advil: "ibuprofen",
  motrin: "ibuprofen",
  ibuprofine: "ibuprofen",  // misspelling
  rifampicin: "rifampin",
  "ferrous sulphate": "ferrous sulfate",
};

// Forced severity levels (override everything)
const FORCE_LEVEL = {
  rifampin: "high",
  topiramate: "moderate",
  ibuprofen: "low",
  "ferrous sulfate": "moderate",
  "ferrous gluconate": "moderate",
  "ferrous fumarate": "moderate",
  iron: "moderate",
};
```

### Exported Functions

#### 1. `normalizeDrugName(name)`
Converts drug names to their canonical form using the ALIAS map.

**Examples:**
```javascript
normalizeDrugName("Advil")          → "ibuprofen"
normalizeDrugName("ibuprofine")     → "ibuprofen"
normalizeDrugName("rifampicin")     → "rifampin"
normalizeDrugName("unknown drug")   → "unknown drug" (unchanged)
```

#### 2. `applyCustomRulebook({ pillComponents, meds })`
Generates interaction pairs with forced severity levels.

**Returns:**
```javascript
{
  forcedPairs: [
    {
      a: "Iron",                    // User's input (capitalized)
      b: "Ethinyl Estradiol",       // Pill component
      level: "moderate",            // From FORCE_LEVEL
      source: "CustomRule",         // Identifies rulebook origin
      desc: "Set by rulebook for demo: Iron vs Ethinyl Estradiol → MODERATE."
    },
    // ... one pair per pill component
  ],
  forcedLevels: Map {
    "iron" → "moderate",
    // ... normalized name → level
  }
}
```

## Integration Points

### 1. `/api/interactions/check`
**File:** `server/routes/interactions.js`

```javascript
// After RxNav + enzyme rules
const { forcedPairs } = applyCustomRulebook({ pillComponents: bc, meds });
final = dedupePreferRulebook([...final, ...forcedPairs]);
```

**Deduplication Logic:**
```javascript
function dedupePreferRulebook(arr) {
  // 1. CustomRule source wins over any other source
  // 2. If both are CustomRule (or neither), higher level wins
  // 3. moderate/medium treated as equal (rank 2)
}
```

### 2. `/api/ai/explain-interactions`
**File:** `server/index.js`

```javascript
// After RxNav + enzyme rules
const { forcedPairs, forcedLevels } = applyCustomRulebook({ pillComponents: bc, meds });
finalInteractions = dedupePreferRulebook([...finalInteractions, ...forcedPairs]);

// Skip symptom analysis for forced LOW drugs (no need to analyze safe meds)
const lowForced = new Set([...forcedLevels.entries()]
  .filter(([, lvl]) => lvl === "low")
  .map(([drug]) => drug));
```

### 3. Frontend Badge Display
**File:** `frontend/src/components/AiInteractionAssistant.jsx`

```jsx
<td className="py-1 pr-3">
  {p.source || "-"}
  {p.source?.includes("CustomRule") && (
    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
      rule
    </span>
  )}
</td>
```

Purple "rule" badge appears next to CustomRule sources.

## Test Results

### ✅ Test 1: Rifampin (HIGH)
```bash
POST /api/interactions/check
{
  "pillType": "combined",
  "meds": ["rifampin"]
}
```

**Result:**
```json
{
  "overall": "high",
  "interactions": [
    {
      "a": "Rifampin",
      "b": "Ethinyl Estradiol",
      "level": "high",
      "source": "CustomRule"
    },
    {
      "a": "Rifampin",
      "b": "Levonorgestrel",
      "level": "high",
      "source": "CustomRule"
    }
  ]
}
```

### ✅ Test 2: Topiramate (MODERATE)
```bash
POST /api/interactions/check
{
  "pillType": "progestin_only",
  "meds": ["topiramate"]
}
```

**Result:**
```json
{
  "overall": "moderate",
  "interactions": [
    {
      "a": "Topiramate",
      "b": "Norethindrone",
      "level": "moderate",
      "source": "CustomRule"
    }
  ]
}
```

### ✅ Test 3: Misspelling - ibuprofine (LOW)
```bash
POST /api/interactions/check
{
  "pillType": "progestin_only",
  "meds": ["ibuprofine"]  // misspelling
}
```

**Result:**
```json
{
  "overall": "low",
  "interactions": [
    {
      "a": "Ibuprofine",              // User's spelling preserved in display
      "b": "Norethindrone",
      "level": "low",
      "source": "CustomRule",
      "desc": "Set by rulebook for demo: Ibuprofine vs Norethindrone → LOW."
    }
  ]
}
```

**Note:** `ibuprofine` → normalized to `ibuprofen` → matched to FORCE_LEVEL

### ✅ Test 4: Iron Supplement (MODERATE)
```bash
POST /api/interactions/check
{
  "pillType": "combined",
  "meds": ["iron"]
}
```

**Result:**
```json
{
  "overall": "moderate",
  "interactions": [
    {
      "a": "Iron",
      "b": "Ethinyl Estradiol",
      "level": "moderate",
      "source": "CustomRule"
    },
    {
      "a": "Iron",
      "b": "Levonorgestrel",
      "level": "moderate",
      "source": "CustomRule"
    }
  ]
}
```

## How to Add New Rules

### Step 1: Add Aliases (Optional)
If the drug has common misspellings or brand names:

```javascript
const ALIAS = {
  advil: "ibuprofen",
  motrin: "ibuprofen",
  tylenol: "acetaminophen",  // ← ADD HERE
  "st john's wort": "st. john's wort",
};
```

### Step 2: Set Forced Level (Required)
```javascript
const FORCE_LEVEL = {
  rifampin: "high",
  topiramate: "moderate",
  acetaminophen: "low",  // ← ADD HERE
};
```

### Step 3: Restart Backend
```bash
npm --prefix server run dev
```

### Step 4: Test
```bash
Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check `
  -Method POST -ContentType "application/json" `
  -Body '{"pillType":"combined","meds":["Tylenol"]}'
```

**Expected:** Overall level = `"low"`, source = `"CustomRule"`

## Use Cases

### 1. **Demo/Client Presentations**
Force specific results for client meetings:
```javascript
const FORCE_LEVEL = {
  "client_demo_drug_a": "high",
  "client_demo_drug_b": "moderate",
};
```

### 2. **Testing Edge Cases**
Test UI behavior with specific severities without waiting for RxNav:
```javascript
const FORCE_LEVEL = {
  "test_high": "high",
  "test_moderate": "moderate",
  "test_low": "low",
};
```

### 3. **Overriding Incorrect RxNav Data**
If RxNav returns wrong severity for a known interaction:
```javascript
const FORCE_LEVEL = {
  "specific_medication": "high",  // Force correct level
};
```

### 4. **Handling Misspellings**
Support common user input errors:
```javascript
const ALIAS = {
  "acetominophen": "acetaminophen",
  "ibuprofin": "ibuprofen",
  "aspirine": "aspirin",
};
```

## Configuration Priority Matrix

| Scenario | RxNav Says | Rules Say | CustomRule Says | **Final Result** | **Winning Source** |
|----------|------------|-----------|-----------------|------------------|--------------------|
| 1        | high       | -         | moderate        | **moderate**     | CustomRule         |
| 2        | low        | high      | moderate        | **moderate**     | CustomRule         |
| 3        | -          | high      | low             | **low**          | CustomRule         |
| 4        | moderate   | -         | -               | **moderate**     | RxNav              |
| 5        | low        | high      | -               | **high**         | Rule               |
| 6        | -          | -         | -               | **low** (synthetic) | RxNav (no pairs) |

**Legend:** `-` means no data from that source

## Debugging CustomRule Results

### Check if Rule Applied
Look for `"source": "CustomRule"` in the response:

```bash
$response | Select-Object -ExpandProperty interactions | Where-Object {$_.source -eq "CustomRule"}
```

### Verify Normalization
Test the alias resolution:

```javascript
// In Node.js console (server directory)
import { normalizeDrugName } from "./ai/customRules.js";
console.log(normalizeDrugName("Advil"));  // → "ibuprofen"
```

### Check Force Level
```javascript
// In server/ai/customRules.js, add temporary logging:
export function applyCustomRulebook({ pillComponents, meds }) {
  const normalized = meds.map(m => ({
    raw: m,
    norm: normalizeDrugName(m)
  }));
  console.log("[DEBUG] Normalized meds:", normalized);
  // ... rest of function
}
```

### Frontend: Look for Purple Badge
The UI shows a purple "rule" badge next to CustomRule entries:

```
Source Column: CustomRule [rule]
               ↑          ↑
               text       purple badge
```

## Benefits

### ✅ **Deterministic Demo Behavior**
- No dependency on external APIs
- Predictable results for presentations
- Can force any severity for any drug

### ✅ **Instant Overrides**
- No need to wait for RxNav API updates
- Can correct known data errors immediately
- Testing doesn't require API calls

### ✅ **User Experience**
- Handles misspellings gracefully
- Recognizes brand names automatically
- Clear "CustomRule" source for transparency

### ✅ **Separation of Concerns**
- Demo logic separate from clinical logic
- Easy to disable (just remove from FORCE_LEVEL)
- Version controlled alongside code

## Maintenance

### When to Update

1. **Before Client Demos**
   - Add client-specific medications
   - Force desired severity levels
   - Test thoroughly

2. **After RxNav Data Changes**
   - If RxNav fixes incorrect data, remove from FORCE_LEVEL
   - Keep only necessary overrides

3. **User Feedback on Misspellings**
   - Add common misspellings to ALIAS
   - Test with actual user input

### Best Practices

✅ **DO:**
- Document why each drug is in FORCE_LEVEL (comment)
- Use lowercase keys in FORCE_LEVEL
- Test aliases with actual user inputs
- Keep ALIAS for common variations only

❌ **DON'T:**
- Add every drug to FORCE_LEVEL (defeats purpose of RxNav)
- Use brand names as keys (use ALIAS instead)
- Forget to restart backend after changes
- Override without reason (note in comments)

## Example: Full Workflow

### Goal: Add "Tylenol" support with LOW severity

**Step 1: server/ai/customRules.js**
```javascript
const ALIAS = {
  // ... existing ...
  tylenol: "acetaminophen",  // brand name
};

const FORCE_LEVEL = {
  // ... existing ...
  acetaminophen: "low",  // Generally safe with contraceptives
};
```

**Step 2: Restart**
```bash
cd server && npm run dev
```

**Step 3: Test**
```powershell
$r = Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check `
  -Method POST -ContentType "application/json" `
  -Body '{"pillType":"combined","meds":["Tylenol"]}'

Write-Host "Overall:" $r.overall
$r.interactions | Format-Table a,b,level,source
```

**Step 4: Verify in UI**
1. Open http://localhost:5173
2. Go to Medications tab
3. Enter "Tylenol" in AI Assistant
4. See purple "rule" badge next to CustomRule source

---

**Last Updated:** November 15, 2025  
**Status:** ✅ Production Ready  
**Priority:** Highest (overrides all other sources)


