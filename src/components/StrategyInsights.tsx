"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

interface InsightsData {
  insights: string;
  tradeCount: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface Props {
  tradeCount: number;
}

export default function StrategyInsights({ tradeCount }: Props) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  async function analyse() {
    setLoading(true);
    setError(null);
    setDismissed(false);
    try {
      const r = await fetch(`${API_URL}/api/ai-strategy-insights`);
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? "Analysis failed");
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    }
    setLoading(false);
  }

  const canAnalyse = tradeCount >= 2;

  return (
    <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #1e3330", flexShrink: 0 }}>
      {!data || dismissed ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={analyse}
            disabled={loading || !canAnalyse}
            style={{
              background: canAnalyse ? "rgba(0,212,170,0.1)" : "transparent",
              border: `1px solid ${canAnalyse ? "#00d4aa40" : "#1e3330"}`,
              borderRadius: 6,
              color: canAnalyse ? "#00d4aa" : "#4a5568",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.3rem 0.75rem",
              cursor: canAnalyse ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                Analysing…
              </>
            ) : (
              <>🧠 Analyse My Trades</>
            )}
          </button>
          {!canAnalyse && (
            <span style={{ fontSize: "0.65rem", color: "#4a5568" }}>
              Need 2+ closed trades
            </span>
          )}
          {error && (
            <span style={{ fontSize: "0.65rem", color: "#ff4d6d" }}>{error}</span>
          )}
        </div>
      ) : (
        <div style={{
          background: "rgba(0,212,170,0.06)",
          border: "1px solid #00d4aa30",
          borderRadius: 8,
          padding: "0.6rem 0.75rem",
          position: "relative",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.4rem",
          }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#00d4aa" }}>
              🧠 Strategy Insights
            </span>
            <span style={{
              fontSize: "0.62rem",
              color: "#8a9ba8",
              background: "#1e3330",
              borderRadius: 4,
              padding: "0.1rem 0.35rem",
            }}>
              {data.tradeCount} trades · {data.winRate.toFixed(0)}% win rate
            </span>
            <button
              onClick={() => setDismissed(true)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#8a9ba8",
                cursor: "pointer",
                fontSize: "0.7rem",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          <p style={{
            fontSize: "0.72rem",
            color: "#d4e8e4",
            lineHeight: 1.6,
            margin: 0,
          }}>
            {data.insights}
          </p>
          <button
            onClick={analyse}
            style={{
              marginTop: "0.5rem",
              background: "none",
              border: "none",
              color: "#8a9ba8",
              fontSize: "0.65rem",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
