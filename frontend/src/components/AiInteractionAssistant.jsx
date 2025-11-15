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
      const r = await fetch(`${API}/api/ai/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setOut(await r.json());
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
          {out?.interactions && out.interactions.length > 0 && (
            <div className="p-3 rounded-xl bg-gray-50 border">
              <div className="text-sm font-medium">Overall interaction level</div>
              <div className="mt-1">
                <Badge level={overallLevel(out.interactions)} />
              </div>
            </div>
          )}

          {out.summary && (
            <div className="p-3 rounded-xl bg-gray-50 border">
              <div className="text-sm font-medium mb-1">Summary</div>
              <div className="text-sm text-gray-800">{out.summary}</div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium mb-2">Interaction levels</div>
            {!out.interactions?.length ? (
              <div className="text-sm text-gray-600">No interactions returned by RxNav.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-1 pr-3">Pair</th>
                      <th className="py-1 pr-3">Level</th>
                      <th className="py-1 pr-3">Source</th>
                      <th className="py-1">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {out.interactions.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-1 pr-3">{p.a} ↔ {p.b}</td>
                        <td className="py-1 pr-3"><Badge level={p.level} /></td>
                        <td className="py-1 pr-3">{p.source || "-"}</td>
                        <td className="py-1">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Which medicine might explain these symptoms?</div>
            {!out.attribution || !Object.keys(out.attribution).length ? (
              <div className="text-sm text-gray-600">No strong label matches found.</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(out.attribution).map(([drug, items]) => (
                  <div key={drug} className="p-3 border rounded-xl bg-gray-50">
                    <div className="text-sm font-semibold mb-1">{drug}</div>
                    <ul className="space-y-1">
                      {items.map((it, idx) => (
                        <li key={idx} className="text-xs text-gray-800">
                          <Badge level={it.level} /> <b>{it.section}</b> · score {it.score} — "{it.text}…"
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500">Informational only — not medical advice.</div>
        </div>
      )}
    </div>
  );
}

