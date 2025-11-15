// server/ai/summary.js
import { maxLevel } from "./rules.js";

export function buildDeterministicSummary({ pillType, pillComponents, meds, interactions, attribution, symptoms }) {
  const lines = [];

  const level = maxLevel(interactions.map(x => x.level));
  const combos = interactions
    .filter(x => x.level === level)
    .slice(0, 3)
    .map(x => `${x.a} ↔ ${x.b}`);

  lines.push(`Overall interaction level: ${level.toUpperCase()}.`);
  if (combos.length) lines.push(`Key pairs: ${combos.join(", ")}.`);

  if (pillComponents?.length) {
    lines.push(`Pill type: ${pillType} (${pillComponents.join(" + ")}).`);
  }
  if (meds?.length) {
    lines.push(`Other medicines: ${meds.join(", ")}.`);
  }
  if (symptoms) {
    lines.push(`Reported symptoms: ${symptoms}.`);
  }

  // Short attribution sentence
  const topAttribution = Object.entries(attribution || {})
    .map(([drug, items]) => ({ drug, item: items[0] }))
    .filter(x => x.item)
    .sort((a, b) => b.item.score - a.item.score)
    .slice(0, 3)
    .map(x => `${x.drug} (${x.item.section}, score ${x.item.score})`);
  if (topAttribution.length) {
    lines.push(`Likely symptom links: ${topAttribution.join("; ")}.`);
  }

  lines.push("This information is informational only and not medical advice.");
  return lines.join(" ");
}

