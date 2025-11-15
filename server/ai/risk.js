// Map RxNav severity → triage level
export function severityToLevel(sev = "") {
  const s = (sev || "").toLowerCase();
  if (s.includes("high") || s.includes("contraindicated") || s.includes("major")) return "high";
  if (s.includes("moderate") || s.includes("monitor")) return "medium";
  if (s.includes("minor") || s.includes("low")) return "low";
  return "low";
}

// Map embedding similarity → triage level (tunable)
export function scoreToLevel(score = 0) {
  if (score >= 0.75) return "high";
  if (score >= 0.60) return "medium";
  return "low";
}

