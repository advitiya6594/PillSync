import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5050";

export default function CycleBridge({ packType, startDate, className = "" }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!packType || !startDate) return;
    
    fetch(`${API}/api/cycle?packType=${encodeURIComponent(packType)}&startDate=${startDate}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setErr("Failed to load"));
  }, [packType, startDate]);

  if (err) return <div className={className}>Error: {err}</div>;
  if (!data) return <div className={className}>Loading…</div>;

  return (
    <div className={className}>
      <div className="text-sm"><b>Phase:</b> {data.phaseLabel}</div>
      <div className="text-sm"><b>Pack day:</b> {data.packDay}/28</div>
      <div className="text-sm"><b>Suppression:</b> {data.suppression}</div>
    </div>
  );
}

