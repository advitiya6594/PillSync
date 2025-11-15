import "dotenv/config";
import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import morgan from "morgan";
import { z } from "zod";
import data from "./miniData.js";
import { getRxcuiByName, getInteractionsForRxcuiList } from "./services/rxnav.js";
import { getTargetIngredients } from "./services/contraceptives.js";
import { getLabelSnippets } from "./services/openfda.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5050;
const USE_DEMO_DATA = process.env.USE_DEMO_DATA === "true";

// ----- middleware -----
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// ----- boot logs -----
console.log("[PillSync] Mode:", process.env.USE_DEMO_DATA === "true" ? "DEMO" : "REAL");
console.log("[PillSync] Strict real mode:", process.env.STRICT_REAL_MODE === "true" ? "ON" : "OFF");

// ----- helpers (demo heuristics) -----
const rangeFor = (type) => {
  switch (type) {
    case "combined_21_7": return { active: 21, inactive: 7, length: 28 };
    case "combined_24_4": return { active: 24, inactive: 4, length: 28 };
    case "continuous_28": return { active: 28, inactive: 0, length: 28 };
    case "progestin_only": return { active: 28, inactive: 0, length: 28 };
    default: return { active: 24, inactive: 4, length: 28 };
  }
};

const packDayFrom = (startISO, now = dayjs()) => {
  const start = dayjs(startISO).startOf("day");
  const diff = now.startOf("day").diff(start, "day");
  const mod = ((diff % 28) + 28) % 28; // safe modulo for negatives
  return mod + 1; // 1..28
};

const cycleInfo = (packType, startISO, now = dayjs()) => {
  const cfg = rangeFor(packType);
  const packDay = packDayFrom(startISO, now);
  const isActivePill = packDay <= cfg.active;
  let suppression = "strong";
  if (!isActivePill && cfg.inactive > 0) suppression = "lower";
  else if (packType === "progestin_only") suppression = "moderate";
  const phaseLabel = isActivePill ? "Active hormones" : (cfg.inactive > 0 ? "Placebo/Break" : "Continuous active");
  return { packDay, isActivePill, suppression, phaseLabel, activeDays: cfg.active };
};

const norm = (s) => s.trim().toLowerCase();
const order = { high: 3, moderate: 2, low: 1, context: 0 };

const checkInteractions = (userMeds = []) => {
  const meds = userMeds.map(norm).filter(Boolean);
  const flags = [];
  const push = (name, level, source, note) => flags.push({ name, level, source, note });

  for (const item of data.cyp3a4_inducers) {
    if (meds.includes(norm(item.name))) push(item.name, item.level, "CYP3A4 inducer list", item.note);
  }
  for (const abx of data.antibiotics) {
    if (meds.includes(norm(abx.name))) push(abx.name, abx.level, "Antibiotics list", abx.note);
  }
  for (const m of data.misc) {
    if (meds.includes(norm(m.name))) push(m.name, m.level || "context", "Misc list", m.note);
  }

  // dedupe by highest risk
  const byName = new Map();
  for (const f of flags) {
    const ex = byName.get(f.name);
    if (!ex || order[f.level] > order[ex.level]) byName.set(f.name, f);
  }
  return [...byName.values()];
};

// ----- routes -----
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    name: "PillSync API",
    version: "0.1",
    mode: process.env.USE_DEMO_DATA === "true" ? "demo" : "real",
    strict: process.env.STRICT_REAL_MODE === "true",
    time: new Date().toISOString()
  });
});

const cycleQuery = z.object({
  packType: z.enum(["combined_21_7","combined_24_4","continuous_28","progestin_only"]).default("combined_24_4"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
app.get("/api/cycle", (req, res) => {
  const parse = cycleQuery.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: "Invalid query", details: parse.error.flatten() });
  const { packType, startDate } = parse.data;
  
  if (USE_DEMO_DATA) {
    const info = cycleInfo(packType, startDate);
    res.json({ packType, startDate, ...info, mode: "demo" });
  } else {
    // TODO: Call real API for cycle tracking
    res.status(501).json({ error: "Real API not implemented yet" });
  }
});

const checkBody = z.object({
  meds: z.array(z.string()).default([]),
  pillType: z.enum(["combined","progestin_only"]).default("combined")
});
app.post("/api/check-interactions", async (req, res) => {
  const parse = checkBody.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: "Invalid body", details: parse.error.flatten() });
  const { meds, pillType } = parse.data;
  
  if (USE_DEMO_DATA) {
    const flags = checkInteractions(meds);
    res.json({ pillType, flags, count: flags.length, datasetVersion: data.metadata.version, mode: "demo" });
  } else {
    // Real API mode - use RxNav
    try {
      const flags = [];
      
      // 1. Get RxCUIs for user medications
      const medRxcuis = [];
      const medNameMap = new Map(); // rxcui -> med name
      
      for (const med of meds) {
        const rxcui = await getRxcuiByName(med);
        if (rxcui) {
          medRxcuis.push(rxcui);
          medNameMap.set(rxcui, med);
        }
      }
      
      // 2. Get RxCUIs for pill ingredients
      const pillIngredients = getTargetIngredients(pillType);
      const pillRxcuis = [];
      const pillNameMap = new Map(); // rxcui -> ingredient name
      
      for (const ingredient of pillIngredients) {
        const rxcui = await getRxcuiByName(ingredient);
        if (rxcui) {
          pillRxcuis.push(rxcui);
          pillNameMap.set(rxcui, ingredient);
        }
      }
      
      // 3. Get interactions for combined list
      const allRxcuis = [...medRxcuis, ...pillRxcuis];
      if (allRxcuis.length === 0) {
        return res.json({ pillType, flags: [], count: 0, datasetVersion: "rxnav", mode: "real" });
      }
      
      const interactions = await getInteractionsForRxcuiList(allRxcuis);
      
      // 4. Filter to only interactions involving pill ingredients
      if (interactions && interactions.length > 0) {
        const pillRxcuiSet = new Set(pillRxcuis);
        const processedPairs = new Set(); // Track unique med pairs to avoid duplicates
        
        for (const interaction of interactions) {
          // Check if one side is a pill ingredient
          const drugAIsPill = pillIngredients.some(ing => 
            interaction.drugA.toLowerCase().includes(ing.toLowerCase())
          );
          const drugBIsPill = pillIngredients.some(ing => 
            interaction.drugB.toLowerCase().includes(ing.toLowerCase())
          );
          
          // Only include if one side is pill and the other is a user med
          if ((drugAIsPill && !drugBIsPill) || (!drugAIsPill && drugBIsPill)) {
            const medName = drugAIsPill ? interaction.drugB : interaction.drugA;
            const pairKey = `${medName}-${interaction.severity}`;
            
            // Avoid duplicate entries
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              // Map RxNav severity to our levels
              let level = "context";
              const sev = interaction.severity.toLowerCase();
              if (sev === "high" || sev === "n/a") level = "high";
              else if (sev === "moderate") level = "moderate";
              else level = "low";
              
              const flag = {
                name: medName,
                level,
                note: interaction.description,
                source: "RxNav API"
              };
              
              // 5. Optional: Enrich with OpenFDA label data
              try {
                const labelData = await getLabelSnippets(medName);
                if (labelData?.interactions) {
                  flag.labelNotes = labelData.interactions;
                }
              } catch (err) {
                // Silently fail on OpenFDA errors
                console.warn(`[OpenFDA] Failed to get label for ${medName}`);
              }
              
              flags.push(flag);
            }
          }
        }
      }
      
      // 6. Fallback to demo if API returns nothing
      if (flags.length === 0 && meds.length > 0) {
        console.warn("[API] No interactions found via RxNav, falling back to demo data");
        const demoFlags = checkInteractions(meds);
        return res.json({ 
          pillType, 
          flags: demoFlags, 
          count: demoFlags.length, 
          datasetVersion: data.metadata.version, 
          mode: "demo-fallback" 
        });
      }
      
      res.json({ pillType, flags, count: flags.length, datasetVersion: "rxnav", mode: "real" });
      
    } catch (error) {
      console.error("[API] check-interactions error:", error);
      // Fallback to demo on error
      const demoFlags = checkInteractions(meds);
      res.json({ 
        pillType, 
        flags: demoFlags, 
        count: demoFlags.length, 
        datasetVersion: data.metadata.version, 
        mode: "demo-fallback",
        error: "API error, using demo data" 
      });
    }
  }
});

app.get("/api/side-effects", (req, res) => {
  const kind = req.query.kind === "progestin_only" ? "progestin_only" : "combined";
  
  if (USE_DEMO_DATA) {
    res.json({ kind, effects: data.sideEffects[kind] || {}, mode: "demo" });
  } else {
    // TODO: Call real medical information API
    res.status(501).json({ error: "Real API not implemented yet" });
  }
});

// 404 + error handler
app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));

// ----- start -----
app.listen(PORT, () => console.log(`PillSync API running at http://localhost:${PORT}`));

