"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

const CACHE_KEY = "aiedge_market_brief";

interface BriefData {
  brief: string;
  pair: string;
  timestamp: string;
}

export default function MarketBrief() {
  const [data, setData] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try { setData(JSON.parse(cached)); } catch { /* ignore */ }
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/ai-brief`)
      .then((r) => r.json())
      .then((d) => {
        if (d.brief) {
          setData(d);
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(d));
        }
      })
      .catch(() => { /* silent fail */ })
      .finally(() => setLoading(false));
  }, []);

  if (dismissed || (!loading && !data)) return null;

  return (
    <div style={{
      borderBottom: "1px solid #1e3330",
      background: "rgba(0,212,170,0.04)",
      padding: "0.55rem 1.25rem",
      display: "flex",
      alignItems: "flex-start",
      gap: "0.65rem",
      flexShrink: 0,
    }}>
      {loading ? (
        <div style={{ flex: 1, display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className="skeleton" style={{ height: 10, width: "60%", borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 10, width: "25%", borderRadius: 4 }} />
        </div>
      ) : (
        <span style={{ flex: 1, fontSize: "0.75rem", color: "#d4e8e4", lineHeight: 1.55 }}>
          <span style={{ color: "#00d4aa", fontWeight: 700, marginRight: "0.4rem" }}>Market Brief</span>
          {data!.brief}
        </span>
      )}

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none",
          border: "none",
          color: "#8a9ba8",
          cursor: "pointer",
          fontSize: "0.75rem",
          padding: "0 0.2rem",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
