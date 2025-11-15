import { useState } from "react";
const API = import.meta.env.VITE_API_URL || "";

function Badge({ level }) {
  const map = {
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-green-100 text-green-800 border-green-300"
  };
  return <span className={`text-xs px-2 py-1 rounded-full border ${map[level] || "bg-gray-100 text-gray-700 border-gray-300"}`}>{level || "low"}</span>;
}

// Helper to compute overall level from interactions
const rank = { high: 3, medium: 2, low: 1 };
const overallLevel = (arr = []) => {
  let best = "low"; for (const x of arr) { if ((rank[x.level] || 0) > (rank[best] || 0)) best = x.level; }
  return best;
};

export default function AiInteractionAssistant() {
  const [pillType, setPillType] = useState("combined");
  const [meds, setMeds] = useState("rifampin, topiramate");
  const [symptoms, setSymptoms] = useState("headache and breast tenderness");
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true); setErr(""); setOut(null);
    try {
      const body = {
        pillType,
        meds: meds.split(",").map(s => s.trim()).filter(Boolean),
        symptoms
      };
      const r = await fetch(`${API}/api/ai/explain-interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setOut(j); // { pillType, meds, pillComponents, interactions, explanation: { overall_level }, advice }
    } catch (e) { setErr(e.message || "Request failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="mt-6 rounded-2xl p-5 bg-white/80 border shadow-sm space-y-4">
      <div className="text-lg font-semibold">AI Interaction & Symptom Explainer</div>
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs block mb-1">Pill type</label>
          <select value={pillType} onChange={e => setPillType(e.target.value)}
            className="w-full border rounded-lg p-2">
            <option value="combined">Combined (EE + progestin)</option>
            <option value="progestin_only">Progestin-only</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs block mb-1">Other medicines (comma separated)</label>
          <input value={meds} onChange={e => setMeds(e.target.value)}
            placeholder="e.g., rifampin, topiramate"
            className="w-full border rounded-lg p-2" />
        </div>
      </div>
      <div>
        <label className="text-xs block mb-1">Current symptoms</label>
        <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
          className="w-full border rounded-lg p-3 min-h-20"
          placeholder="e.g., headache, breast tenderness, dizziness" />
      </div>
      <button onClick={run} disabled={loading}
        className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-40">
        {loading ? "Analyzing…" : "Analyze interactions & causes"}
      </button>
      {err && <div className="text-sm text-red-600">{err}</div>}

      {!out ? null : (
        <div className="space-y-5">
          {out?.explanation?.overall_level && (
            <div className="p-3 rounded-xl bg-gray-50 border">
              <div className="text-sm font-medium">Overall interaction level</div>
              <div className="mt-1">
                <Badge level={out.explanation.overall_level} />
              </div>
            </div>
          )}

          {/* Symptom Summary & Tips (deterministic) */}
          {out?.advice && out.advice.length > 0 ? (
            <div className="mt-4 rounded-xl border bg-gray-50 p-4">
              <div className="text-sm font-semibold mb-2">Symptom summary & tips</div>
              <ul className="space-y-3">
                {out.advice.map((a, i) => (
                  <li key={i} className="rounded-lg border bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{a.drug}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-amber-50 text-amber-900 border-amber-300 capitalize">
                        {a.level}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 mt-1">{a.reason}</div>
                    {a.matches?.length ? (
                      <div className="text-xs text-gray-700 mt-1">Matched symptoms: {a.matches.join(", ")}</div>
                    ) : null}
                    <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                      {a.tips.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-gray-500 mt-2">
                Informational only — not medical advice. Please consult your clinician if symptoms persist or worsen.
              </div>
            </div>
          ) : null}

          <div className="text-[11px] text-gray-500">Informational only — not medical advice.</div>
        </div>
      )}
    </div>
  );
}

