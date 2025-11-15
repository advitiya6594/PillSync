# Custom Rulebook - Quick Reference

## 🎯 What It Does
The Custom Rulebook **forces specific severity levels** for medications, overriding RxNav API and other rules. Perfect for demos, testing, and client-specific requirements.

## 📊 Current Rules (server/ai/customRules.js)

### Aliases (Misspellings & Brand Names)
| User Types | Normalized To |
|------------|---------------|
| `Advil`, `Motrin`, `ibuprofine` | `ibuprofen` |
| `rifampicin` | `rifampin` |
| `ferrous sulphate` | `ferrous sulfate` |

### Forced Severity Levels
| Medication | Level | Use Case |
|------------|-------|----------|
| `rifampin` | **HIGH** | Enzyme inducer (reduces pill effectiveness) |
| `topiramate` | **MODERATE** | Known interaction |
| `ibuprofen` | **LOW** | Generally safe pain reliever |
| `iron`, `ferrous sulfate/gluconate/fumarate` | **MODERATE** | Absorption interactions |

## ✅ Test Results Summary

| Test | Input | Expected | ✓ Status |
|------|-------|----------|----------|
| 1 | `rifampin` + combined pill | `overall: "high"`, source: CustomRule | ✅ PASS |
| 2 | `topiramate` + progestin pill | `overall: "moderate"`, source: CustomRule | ✅ PASS |
| 3 | `ibuprofine` (misspelling) | `overall: "low"`, source: CustomRule | ✅ PASS |
| 4 | `iron` + combined pill | `overall: "moderate"`, source: CustomRule | ✅ PASS |
| 5 | `Advil` (brand name) | `overall: "low"`, source: CustomRule | ✅ PASS |

## 🔧 Quick Test Commands (PowerShell)

```powershell
# Test Rifampin (HIGH)
Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check -Method POST -ContentType "application/json" -Body '{"pillType":"combined","meds":["rifampin"]}'

# Test Topiramate (MODERATE)
Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check -Method POST -ContentType "application/json" -Body '{"pillType":"progestin_only","meds":["topiramate"]}'

# Test Misspelling (LOW)
Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check -Method POST -ContentType "application/json" -Body '{"pillType":"combined","meds":["ibuprofine"]}'

# Test Iron (MODERATE)
Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check -Method POST -ContentType "application/json" -Body '{"pillType":"combined","meds":["iron"]}'
```

## 💡 How It Works

### Priority Order
```
1. Custom Rulebook (HIGHEST) ← Forces specific levels
2. Enzyme Inducer Rules       ← Rifampin, St. John's Wort, etc.
3. RxNav API Data              ← Real drug-drug interactions
4. LOW Synthesis               ← If no data found
```

### Deduplication Logic
When the same drug pair appears from multiple sources:
1. **CustomRule wins** (always takes precedence)
2. If no CustomRule, **higher severity wins**
3. `moderate` = `medium` (rank 2)

### Example: Rifampin Override
```javascript
// RxNav might say "moderate" or have no data
// CustomRule forces "high" for enzyme inducers

Result: {
  "a": "Rifampin",
  "b": "Ethinyl Estradiol",
  "level": "high",         ← From CustomRule
  "source": "CustomRule",  ← Clear indicator
  "desc": "Set by rulebook for demo..."
}
```

## 🎨 UI Display

### Purple "rule" Badge
Interactions from CustomRule show a purple badge:

```
Source Column:
┌──────────────────────┐
│ CustomRule [rule]    │  ← Purple badge
│            ↑         │
│            └─ Light purple bg + dark purple text
└──────────────────────┘
```

**CSS:**
```jsx
<span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
  rule
</span>
```

## 📝 How to Add New Rules

### Add a New Forced Level
**File:** `server/ai/customRules.js`

```javascript
const FORCE_LEVEL = {
  // ... existing ...
  "your_medication": "moderate",  // ← ADD HERE
};
```

### Add an Alias (Optional)
```javascript
const ALIAS = {
  // ... existing ...
  "brand_name": "generic_name",  // ← ADD HERE
};
```

### Restart Backend
```bash
npm --prefix server run dev
```

### Test
```powershell
Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check -Method POST -ContentType "application/json" -Body '{"pillType":"combined","meds":["your_medication"]}'
```

## 🔍 Debugging

### Check if CustomRule Applied
Look for `"source": "CustomRule"` in API response:

```powershell
$r = Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check -Method POST -ContentType "application/json" -Body '{"pillType":"combined","meds":["iron"]}'
$r.interactions | Where-Object {$_.source -eq "CustomRule"}
```

### Verify Alias Resolution
```javascript
// In server/ai/customRules.js, add console.log:
export function normalizeDrugName(name = "") {
  const s = String(name).trim().toLowerCase();
  const result = ALIAS[s] || s;
  console.log(`[CustomRule] ${name} → ${result}`);
  return result;
}
```

### Check Overall Level Calculation
```powershell
$r = Invoke-RestMethod -Uri http://localhost:5050/api/interactions/check -Method POST -ContentType "application/json" -Body '{"pillType":"combined","meds":["rifampin","ibuprofen"]}'
Write-Host "Overall:" $r.overall  # Should be "high" (rifampin wins)
$r.interactions | Format-Table a,b,level,source
```

## 📦 Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `server/ai/customRules.js` | ✨ NEW | Rulebook definitions |
| `server/routes/interactions.js` | 🔧 Updated | Apply custom rules, prefer in dedupe |
| `server/index.js` | 🔧 Updated | Apply custom rules in AI explainer |
| `server/ai/rules.js` | 🔧 Updated | Support `moderate` in maxLevel |
| `frontend/src/components/AiInteractionAssistant.jsx` | 🎨 Updated | Purple "rule" badge |
| `server/tests.http` | 📝 Updated | Added custom rule test cases |

## 🎯 Use Cases

### 1. Demo/Presentation
Force specific results for client meetings:
```javascript
const FORCE_LEVEL = {
  "demo_drug_a": "high",
  "demo_drug_b": "moderate",
  "demo_drug_c": "low",
};
```

### 2. Testing UI States
Test all severity badges without API dependency:
```javascript
const FORCE_LEVEL = {
  "test_high": "high",
  "test_moderate": "moderate",
  "test_low": "low",
};
```

### 3. Override Incorrect Data
If RxNav has wrong severity for a known interaction:
```javascript
const FORCE_LEVEL = {
  "specific_med": "high",  // Force correct level
};
```

### 4. Handle User Errors
Support common misspellings:
```javascript
const ALIAS = {
  "aspirine": "aspirin",
  "acetominophen": "acetaminophen",
};
```

## ⚠️ Important Notes

- **Highest Priority:** CustomRule overrides everything
- **Transparent:** Source clearly marked as "CustomRule"
- **Case Insensitive:** User can type "Advil", "advil", or "ADVIL"
- **Display Preserves Input:** Shows "Advil" in UI, but matches as "ibuprofen"
- **Restart Required:** Changes to customRules.js need backend restart

## ✅ Success Criteria

All tests passing:
- ✅ Rifampin returns HIGH
- ✅ Topiramate returns MODERATE
- ✅ Misspellings handled (ibuprofine → ibuprofen)
- ✅ Iron returns MODERATE
- ✅ Brand names work (Advil → ibuprofen)
- ✅ Purple "rule" badge appears in UI
- ✅ Chat endpoint uses custom rules
- ✅ Overall level correctly computed from mixed severities

---

**Status:** ✅ **PRODUCTION READY**  
**Priority:** **HIGHEST** (overrides all other sources)  
**Last Updated:** November 15, 2025

**For detailed documentation, see:** `CUSTOM_RULEBOOK_GUIDE.md`


