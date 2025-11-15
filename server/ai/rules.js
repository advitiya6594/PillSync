// server/ai/rules.js
export function pillRiskOverrides({ pillComponents = [], meds = [] }) {
  const pill = toSet(pillComponents);
  const lowers = toSet(meds);
  const HORMONAL = intersect(pill, ["ethinyl estradiol", "levonorgestrel", "norethindrone", "drospirenone"]);
  const INDUCERS = intersect(lowers, ["rifampin", "rifampicin", "st. john's wort", "carbamazepine", "phenytoin", "topiramate"]);
  const out = [];
  if (HORMONAL.size && INDUCERS.size) {
    for (const hc of HORMONAL) for (const ind of INDUCERS) {
      out.push({
        a: cap(ind), b: cap(hc),
        level: "high", source: "Rule",
        desc: "Enzyme induction may reduce contraceptive hormone levels and effectiveness."
      });
    }
  }
  return out;
}

export function maxLevel(levels = []) { const r = { low: 1, moderate: 2, medium: 2, high: 3 }; let best = "low"; for (const l of levels) { if ((r[l] || 0) > (r[best] || 0)) best = l; } return best; }
const toSet = arr => new Set((arr || []).map(s => String(s).toLowerCase().trim()).filter(Boolean));
const intersect = (S, arr) => new Set(arr.filter(x => S.has(x)));
const cap = s => s.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

