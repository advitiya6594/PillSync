// server/routes/interactions.js
import { Router } from "express";
import { namesToRxcuis, getInteractionsForRxcuiList } from "../services/rxnav.js";
import { severityToLevel } from "../ai/risk.js";
import { pillRiskOverrides, maxLevel } from "../ai/rules.js";
import { applyCustomRulebook, normalizeDrugName } from "../ai/customRules.js";

const BC = {
  combined: ["ethinyl estradiol", "levonorgestrel"],
  progestin_only: ["norethindrone"]
};

const router = Router();

router.post("/check", async (req, res) => {
  try {
    const pillType = (req.body?.pillType || "combined").toLowerCase();
    const bc = BC[pillType] || BC.combined;
    const meds = Array.isArray(req.body?.meds) ? req.body.meds.slice(0, 16) : [];
    const all = Array.from(new Set([...bc, ...meds]));

    const rxcuis = await namesToRxcuis(all);
    const rawInteractions = await getInteractionsForRxcuiList(rxcuis);

    const rxnavPairs = rawInteractions.map(p => ({
      a: p.drugA, b: p.drugB,
      level: severityToLevel(p.severity || ""),
      source: p.source || "RxNav",
      desc: (p.description || "").slice(0, 240)
    }));

    // rule overlays keep demo-clinical sanity (e.g., rifampin)
    const overrides = pillRiskOverrides({ pillComponents: bc, meds: all });
    let final = dedupePreferHigher([...rxnavPairs, ...overrides]);

    // >>> NEW: apply custom rulebook (takes precedence over everything)
    const { forcedPairs } = applyCustomRulebook({ pillComponents: bc, meds });
    final = dedupePreferRulebook([...final, ...forcedPairs]);

    // >>> NEW: if nothing came back, synthesize a LOW record per med vs pill for UX
    if (final.length === 0 && meds.length) {
      const pillName = pillType === "progestin_only" ? "Progestin-only pill" : "Combined pill";
      final = meds.map(m => ({
        a: capitalize(m), b: pillName,
        level: "low",
        source: "RxNav (no pairs)",
        desc: "RxNav returned no interacting pairs for this combination; treated as LOW."
      }));
    }

    const overall = maxLevel(final.map(x => x.level));
    const sources = [...new Set(final.map(p => p.source))];

    res.json({ pillType, pillComponents: bc, meds, interactions: final, overall, sources });
  } catch (e) { res.status(500).json({ error: e.message || "interaction check failed" }); }
});

function capitalize(s) { return String(s || "").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "); }

function dedupePreferHigher(arr) {
  const rank = { low: 1, medium: 2, high: 3 }, map = new Map();
  const key = p => `${p.a.toLowerCase()}|${p.b.toLowerCase()}`;
  for (const p of arr) {
    const k = key(p);
    if (!map.has(k) || (rank[p.level] || 0) > (rank[map.get(k).level] || 0)) map.set(k, p);
  }
  return [...map.values()];
}

function dedupePreferRulebook(arr) {
  // rulebook wins, then higher level wins
  const rank = { low: 1, moderate: 2, medium: 2, high: 3 };
  const isRule = (p) => (p.source || "").toLowerCase().includes("customrule");
  const key = (p) => `${p.a.toLowerCase()}|${p.b.toLowerCase()}`;
  const map = new Map();
  for (const p of arr) {
    const k = key(p);
    if (!map.has(k)) { map.set(k, p); continue; }
    const cur = map.get(k);
    if (isRule(p) && !isRule(cur)) { map.set(k, p); continue; }
    if ((rank[(p.level || "").toLowerCase()] || 0) > (rank[(cur.level || "").toLowerCase()] || 0)) map.set(k, p);
  }
  return Array.from(map.values());
}

export default router;

