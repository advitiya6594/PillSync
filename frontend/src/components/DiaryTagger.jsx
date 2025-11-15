import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

export default function DiaryTagger() {
  const [txt, setTxt] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minSim, setMinSim] = useState(0.60);   // demo-friendly defaults
  const [topK, setTopK] = useState(4);
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/api/ai/classify-effects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: txt, minSim, topK })
      });
      if (!r.ok) { throw new Error(`HTTP ${r.status}`); }
      const j = await r.json();
      setTags(j.tags || []);
    } catch (e) { setErr(e.message || "Request failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="border rounded-2xl p-4 bg-white/80 backdrop-blur-sm space-y-3 shadow-sm">
      <div className="text-sm font-medium">AI — Side-effect tagger</div>
      <textarea
        className="border rounded-lg p-3 w-full min-h-24 outline-none focus:ring-2"
        value={txt}
        onChange={e => setTxt(e.target.value)}
        placeholder="How did you feel today? e.g., felt moody, light spotting, slight headache"
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          Min similarity
          <input type="number" step="0.01" min="0" max="1"
            value={minSim}
            onChange={e => setMinSim(parseFloat(e.target.value) || 0.60)}
            className="border rounded px-2 py-1 w-24" />
        </label>
        <label className="flex items-center gap-2">
          Top K
          <input type="number" min="1" max="8"
            value={topK}
            onChange={e => setTopK(parseInt(e.target.value) || 4)}
            className="border rounded px-2 py-1 w-20" />
        </label>
        <button onClick={run} disabled={loading || !txt.trim()}
          className="px-3 py-2 rounded-lg bg-black text-white disabled:opacity-40">
          {loading ? "Tagging…" : "AI tag side effects"}
        </button>
        {err && <span className="text-red-600 text-xs">{err}</span>}
      </div>
      <div className="flex gap-2 flex-wrap">
        {tags.map(t => (
          <span key={t.label}
            className="text-xs px-2 py-1 rounded-full border bg-gray-50">
            {t.label} · {t.score}
          </span>
        ))}
        {!tags.length && <span className="text-xs text-gray-500">No tags yet.</span>}
      </div>
      <div className="text-[11px] text-gray-500">Informational only — not medical advice.</div>
    </div>
  );
}

