// server/routes/chatRxNav.js
import { Router } from "express";

const router = Router();

router.post("/interaction-assistant", async (req, res) => {
  try {
    const { pillType = "combined", meds = [], symptoms = "" } = req.body || {};
    const r = await fetch(`http://localhost:${process.env.PORT || 5050}/api/interactions/check`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pillType, meds })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    // Build deterministic answer text
    const lvl = (data.overall || "low").toUpperCase();
    const pairs = data.interactions;
    const pill = data.pillComponents.join(" + ");
    const medsStr = (data.meds || []).join(", ") || "—";

    let lines = [];
    lines.push(`Overall interaction level: ${lvl}.`);
    lines.push(`Pill: ${pill}. Other medicines: ${medsStr}.`);
    if (pairs.length) {
      const list = pairs.map(p => `${p.a} ↔ ${p.b} (${p.level})`).join("; ");
      lines.push(`Pairs: ${list}.`);
    } else {
      lines.push(`RxNav returned no interactions for the drugs checked.`);
    }
    if (symptoms) {
      lines.push(`Note: symptom analysis is not altering the level; it's informational only.`);
    }
    lines.push(`Sources: ${(data.sources || []).join(", ") || "RxNav"}. Informational only — not medical advice.`);

    res.json({ message: lines.join(" "), data });
  } catch (e) {
    res.status(500).json({ error: e.message || "chat failed" });
  }
});

export default router;

