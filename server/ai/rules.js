// server/ai/rules.js
// Simple, transparent rule overlays that can override or add interaction signals.

export function pillRiskOverrides({ pillComponents = [], meds = [] }) {
  const lowers = toLowerSet(meds);
  const pill = toLowerSet(pillComponents);
  const overrides = [];

  // If any hormonal contraceptive component is present with strong enzyme inducers:
  const HORMONAL = intersect(pill, ["ethinyl estradiol", "levonorgestrel", "norethindrone", "drospirenone"]);
  const INDUCERS = intersect(lowers, ["rifampin", "rifampicin", "st. john's wort", "carbamazepine", "phenytoin", "topiramate"]);

  if (HORMONAL.size && INDUCERS.size) {
    for (const hc of HORMONAL) {
      for (const ind of INDUCERS) {
        overrides.push({
          a: readable(ind), b: readable(hc),
          level: "high",
          source: "Rule",
          desc: "Enzyme induction may reduce contraceptive hormone levels and effectiveness."
        });
      }
    }
  }

  return overrides;
}

function toLowerSet(arr) {
  return new Set((arr || []).map(s => String(s).toLowerCase().trim()).filter(Boolean));
}
function intersect(setLike, arr) {
  const out = new Set();
  for (const x of arr) if (setLike.has(x)) out.add(x);
  return out;
}
function readable(x) { return x.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" "); }

export function maxLevel(levels = []) {
  // order: high > medium > low
  const rank = { high: 3, medium: 2, low: 1 };
  let best = "low";
  for (const l of levels) if ((rank[l] || 0) > (rank[best] || 0)) best = l;
  return best;
}

