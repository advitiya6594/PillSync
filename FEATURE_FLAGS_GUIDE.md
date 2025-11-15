# Feature Flags Guide

## Overview
PillSync uses environment-based feature flags to control which experimental or work-in-progress features are visible to users.

## Configuration

### Frontend Environment File
**File:** `frontend/.env`

```env
# API connection
VITE_API_URL=http://localhost:5050

# Feature flags
VITE_SHOW_SIDE_EFFECT_TAGGER=false
```

### Flag Definitions
**File:** `frontend/src/lib/flags.js`

```javascript
export const SHOW_SIDE_EFFECT_TAGGER =
  (import.meta.env.VITE_SHOW_SIDE_EFFECT_TAGGER ?? "false").toString().toLowerCase() === "true";
```

## Current Flags

### `VITE_SHOW_SIDE_EFFECT_TAGGER`
**Default:** `false` (hidden)  
**Purpose:** Controls visibility of the AI Diary Tagger component on the Overview tab

**Component:** `frontend/src/components/DiaryTagger.jsx`  
**Used In:** `frontend/src/figma/FigmaLanding.jsx` (Overview tab)

**What it does:**
- Analyzes free-text diary entries using OpenAI embeddings
- Tags entries with likely side effect labels (nausea, headache, mood changes, etc.)
- Shows confidence scores for each tag

**Why it's hidden by default:**
- Requires OpenAI API key (`OPENAI_API_KEY` in `server/.env`)
- Backend AI features (embeddings) must be configured
- Still in testing phase

**To enable:**
1. Set `VITE_SHOW_SIDE_EFFECT_TAGGER=true` in `frontend/.env`
2. Ensure `OPENAI_API_KEY` is set in `server/.env`
3. Restart frontend: `npm --prefix frontend run dev`
4. The AI Diary Tagger will appear under the "Current Effects" card on the Overview tab

## How to Add New Flags

### 1. Add to `.env` (or `.env.example`)
```env
VITE_MY_NEW_FEATURE=false
```

### 2. Export in `flags.js`
```javascript
export const MY_NEW_FEATURE =
  (import.meta.env.VITE_MY_NEW_FEATURE ?? "false").toString().toLowerCase() === "true";
```

### 3. Use in Components
```jsx
import { MY_NEW_FEATURE } from "../lib/flags.js";

export default function MyPage() {
  return (
    <div>
      {MY_NEW_FEATURE && (
        <ExperimentalComponent />
      )}
    </div>
  );
}
```

## Best Practices

### ✅ DO
- Set sensible defaults (usually `false` for experimental features)
- Document what the flag controls in this guide
- Hide features that require external APIs or paid services
- Use flags for work-in-progress features that aren't ready for general use

### ❌ DON'T
- Use flags for core functionality (cycle tracking, pill reminders)
- Leave flags enabled in production for incomplete features
- Forget to document new flags
- Mix feature flags with configuration values (API URLs, port numbers, etc.)

## Environment Files

### Development
- `frontend/.env` — Local development settings (gitignored)
- `frontend/.env.example` — Template for new developers

### Production
- Set environment variables in your hosting platform (Vercel, Netlify, etc.)
- Prefix with `VITE_` for client-side access
- Never commit `.env` files to version control

## Current Feature Status

| Flag | Default | Status | Dependencies |
|------|---------|--------|--------------|
| `SHOW_SIDE_EFFECT_TAGGER` | `false` | 🟡 Testing | OpenAI API key |

**Legend:**
- ✅ Production-ready
- 🟡 Testing/Beta
- 🔴 Experimental/Unstable

## Testing Flags Locally

### Enable a flag:
```bash
# Windows PowerShell
Set-Content frontend\.env "VITE_API_URL=http://localhost:5050`nVITE_SHOW_SIDE_EFFECT_TAGGER=true"

# macOS/Linux
echo "VITE_API_URL=http://localhost:5050" > frontend/.env
echo "VITE_SHOW_SIDE_EFFECT_TAGGER=true" >> frontend/.env
```

### Restart frontend:
```bash
npm --prefix frontend run dev
```

### Verify in browser console:
```javascript
console.log(import.meta.env.VITE_SHOW_SIDE_EFFECT_TAGGER); // should print "true"
```

---

**Last Updated:** November 15, 2025  
**Maintainer:** PillSync Development Team


