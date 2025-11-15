import { useState } from "react";
import clsx from "clsx";

const API = import.meta.env.VITE_API_URL || "";

export default function InteractionsBridge({ className = "" }) {
  const [pillType, setPillType] = useState("combined");
  const [medText, setMedText] = useState(localStorage.getItem("pillsync:meds") || "");
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runCheck() {
    setLoading(true);
    setError("");
    try {
      const meds = medText.split(",").map(s => s.trim()).filter(Boolean);
      localStorage.setItem("pillsync:meds", medText);
      const r = await fetch(`${API}/api/check-interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meds, pillType })
      });
      const j = await r.json();
      setFlags(j.flags || []);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          value={pillType}
          onChange={e => setPillType(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="combined">Combined</option>
          <option value="progestin_only">Progestin-only</option>
        </select>
        <input
          value={medText}
          onChange={e => setMedText(e.target.value)}
          placeholder="rifampin, St. John's Wort, topiramate"
          className="border rounded-lg p-2 sm:col-span-2"
        />
      </div>
      <button
        onClick={runCheck}
        disabled={loading}
        className="px-3 py-2 rounded-lg bg-black text-white mt-2 disabled:opacity-50"
      >
        {loading ? "Checking…" : "Check interactions"}
      </button>
      {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
      <div className="space-y-2 mt-3">
        {flags.map(f => (
          <div
            key={f.name}
            className={clsx(
              "border rounded-lg p-3",
              f.level === "high" && "border-red-500/60 bg-red-50",
              f.level === "moderate" && "border-amber-500/60 bg-amber-50",
              (f.level === "low" || f.level === "context") && "border-gray-300 bg-white"
            )}
          >
            <div className="text-sm font-medium">
              {f.name} <span className="ml-2 text-xs uppercase">{f.level}</span>
            </div>
            <div className="text-xs text-gray-700">{f.note}</div>
            {f.labelNotes && <div className="text-xs text-gray-600 mt-1 italic">{f.labelNotes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

