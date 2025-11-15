import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5050";

export default function EffectsBridge({ packType, isActivePill = true, packDay = 1, className = "" }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const kind = packType === "progestin_only" ? "progestin_only" : "combined";
    fetch(`${API}/api/side-effects?kind=${kind}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [packType]);

  const list = useMemo(() => {
    if (!data?.effects) return [];
    const base = data.effects.common || [];
    const extra = (!isActivePill && data.kind === "combined") ? (data.effects.placebo_week || []) : [];
    return [...base, ...extra].slice(0, 5);
  }, [data, isActivePill]);

  if (!data) return <div className={className}>Loading…</div>;

  return (
    <div className={className}>
      <div className="text-sm mb-1"><b>Today's effects</b> — Day {packDay} of 28</div>
      <ul className="text-sm list-disc ml-4">
        {list.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}

