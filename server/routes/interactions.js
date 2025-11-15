// server/routes/interactions.js
import { Router } from "express";
import { namesToRxcuis, getInteractionsForRxcuiList } from "../services/rxnav.js";
import { severityToLevel } from "../ai/risk.js";
import { pillRiskOverrides, maxLevel } from "../ai/rules.js";

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
    const final = dedupePreferHigher([...rxnavPairs, ...overrides]);
    const overall = maxLevel(final.map(x => x.level));

    const sources = [...new Set(final.map(p => p.source))];

    res.json({ pillType, pillComponents: bc, meds, interactions: final, overall, sources });
  } catch (e) { res.status(500).json({ error: e.message || "interaction check failed" }); }
});

function dedupePreferHigher(arr) {
  const rank = { low: 1, medium: 2, high: 3 }, map = new Map();
  const key = p => `${p.a.toLowerCase()}|${p.b.toLowerCase()}`;
  for (const p of arr) {
    const k = key(p);
    if (!map.has(k) || (rank[p.level] || 0) > (rank[map.get(k).level] || 0)) map.set(k, p);
  }
  return [...map.values()];
}

export default router;

