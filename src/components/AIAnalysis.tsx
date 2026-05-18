"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";

interface AIAnalysisProps {
  symbol: string;
  isRunning: boolean;
  onStartBot: () => void;
}

interface AnalysisData {
  analysis: string;
  recommendation: "favorable" | "not_favorable";
  reasoning: string;
  timestamp: Date;
}

export default function AIAnalysis({ symbol, isRunning, onStartBot }: AIAnalysisProps) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/api/ai-analysis?symbol=${symbol}`);
      const json = await r.json();
      if (!r.ok) {
        setError(json.error ?? "Analysis failed");
      } else {
        setData({
          analysis: json.analysis,
          recommendation: json.recommendation,
          reasoning: json.reasoning,
          timestamp: new Date(json.timestamp),
        });
      }
    } catch {
      setError("Could not reach backend");
    }
    setLoading(false);
  }, [symbol]);

  // Auto-refresh every 45 seconds while bot is running
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(fetchAnalysis, 45000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, fetchAnalysis]);

  const favorable = data?.recommendation === "favorable";

  // Empty state
  if (!loading && !data && !error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.6rem",
        padding: "1.25rem 1.5rem",
        textAlign: "center",
      }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>
          Start with AI Analysis
        </div>
        <div style={{ color: "#8a9ba8", fontSize: "0.72rem", lineHeight: 1.5, maxWidth: 280 }}>
          Let AI assess market conditions before activating the bot.
        </div>

        {/* Step flow */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.65rem", color: "#8a9ba8" }}>
          <span style={{ background: "#00d4aa", color: "#0a0a0a", borderRadius: 4, padding: "0.1rem 0.4rem", fontWeight: 700 }}>1</span>
          <span>Analyse</span>
          <span style={{ color: "#2a3f3c" }}>──</span>
          <span style={{ background: "#1e3330", borderRadius: 4, padding: "0.1rem 0.4rem", fontWeight: 700 }}>2</span>
          <span>Review signal</span>
          <span style={{ color: "#2a3f3c" }}>──</span>
          <span style={{ background: "#1e3330", borderRadius: 4, padding: "0.1rem 0.4rem", fontWeight: 700 }}>3</span>
          <span>Activate bot</span>
        </div>

        <button
          onClick={fetchAnalysis}
          style={{
            background: "#00d4aa",
            border: "none",
            borderRadius: 8,
            color: "#0a0a0a",
            cursor: "pointer",
            fontSize: "0.82rem",
            fontWeight: 700,
            padding: "0.55rem 1.5rem",
            fontFamily: "inherit",
            letterSpacing: "0.02em",
            marginTop: "0.25rem",
          }}
        >
          Analyse Market →
        </button>
      </div>
    );
  }

  // Loading state (initial)
  if (loading && !data) {
    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffc857", boxShadow: "0 0 6px #ffc857", flexShrink: 0 }} />
          <span className="label">Analysing Market Conditions…</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[95, 80, 70, 85, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 12, width: `${w}%`, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ color: "#ff4d6d", fontSize: "0.78rem", marginBottom: "0.75rem", lineHeight: 1.5 }}>
          {error.includes("OPENAI_API_KEY") ? "Add OPENAI_API_KEY to your environment variables." : error}
        </div>
        <button
          onClick={fetchAnalysis}
          style={{ background: "none", border: "1px solid #1e3330", borderRadius: 6, color: "#00d4aa", cursor: "pointer", fontSize: "0.7rem", padding: "0.3rem 0.75rem", fontFamily: "inherit", fontWeight: 600 }}
        >
          ↻ Retry
        </button>
      </div>
    );
  }

  // Result state
  return (
    <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4aa", boxShadow: "0 0 6px #00d4aa", flexShrink: 0 }} />
          <span className="label">AI Market Analysis</span>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          style={{ background: "none", border: "1px solid #1e3330", borderRadius: 6, color: loading ? "#8a9ba8" : "#00d4aa", cursor: loading ? "default" : "pointer", fontSize: "0.65rem", padding: "0.2rem 0.5rem", fontWeight: 600, fontFamily: "inherit" }}
        >
          {loading ? "Analysing…" : "↻ Re-analyse"}
        </button>
      </div>

      {/* Analysis text */}
      <div style={{ fontSize: "0.77rem", lineHeight: 1.6, color: "#d4e8e4" }}>
        {data!.analysis}
      </div>

      {/* Recommendation card — activate button lives inside so it's always visible together */}
      <div style={{
        borderRadius: 8,
        border: `1px solid ${favorable ? "rgba(0,212,170,0.4)" : "rgba(255,200,87,0.4)"}`,
        background: favorable ? "rgba(0,212,170,0.07)" : "rgba(255,200,87,0.07)",
        padding: "0.8rem 0.9rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <span style={{ fontSize: "0.9rem" }}>{favorable ? "✓" : "⚠"}</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: favorable ? "#00d4aa" : "#ffc857", letterSpacing: "0.05em" }}>
            {favorable ? "CONDITIONS FAVOURABLE" : "CONDITIONS UNFAVOURABLE"}
          </span>
        </div>
        <div style={{ fontSize: "0.78rem", color: "#d4e8e4", lineHeight: 1.6 }}>
          {data!.reasoning}
        </div>

        {favorable && !isRunning && (
          <button
            onClick={onStartBot}
            style={{
              width: "100%",
              background: "#00d4aa",
              border: "none",
              borderRadius: 8,
              color: "#0a0a0a",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 700,
              padding: "0.6rem",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              marginTop: "0.2rem",
            }}
          >
            Activate the Bot →
          </button>
        )}

        {isRunning && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", boxShadow: "0 0 4px #00d4aa", flexShrink: 0 }} />
            <span style={{ fontSize: "0.7rem", color: "#8a9ba8" }}>Bot is active — analysis refreshes every 45 seconds</span>
          </div>
        )}
      </div>

      {/* Timestamp */}
      {data?.timestamp && (
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.62rem", color: "#8a9ba8" }}>
            Updated {data.timestamp.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
