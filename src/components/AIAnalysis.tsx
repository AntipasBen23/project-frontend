"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";

interface AIAnalysisProps {
  symbol: string;
  isRunning: boolean;
}

export default function AIAnalysis({ symbol, isRunning }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/api/ai-analysis?symbol=${symbol}`);
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Analysis failed");
      } else {
        setAnalysis(data.analysis);
        setTimestamp(new Date(data.timestamp));
      }
    } catch {
      setError("Could not reach backend");
    }
    setLoading(false);
  }, [symbol]);

  // Auto-refresh every 45 seconds when bot is running
  useEffect(() => {
    if (isRunning) {
      fetchAnalysis();
      intervalRef.current = setInterval(fetchAnalysis, 45000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, fetchAnalysis]);

  const dots = loading ? "..." : "";

  return (
    <div className="card" style={{ flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: loading ? "#ffc857" : "#00d4aa",
            boxShadow: `0 0 6px ${loading ? "#ffc857" : "#00d4aa"}`,
            flexShrink: 0,
          }} />
          <span className="label">AI Analysis</span>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          style={{
            background: "none",
            border: "1px solid #1e3330",
            borderRadius: 6,
            color: loading ? "#8a9ba8" : "#00d4aa",
            cursor: loading ? "default" : "pointer",
            fontSize: "0.65rem",
            padding: "0.2rem 0.5rem",
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        >
          {loading ? "Analyzing…" : "↻ Refresh"}
        </button>
      </div>

      {/* Content */}
      {error ? (
        <div style={{ color: "#ff4d6d", fontSize: "0.78rem", lineHeight: 1.5 }}>
          {error.includes("OPENAI_API_KEY") ? "Add OPENAI_API_KEY to Railway environment variables." : error}
        </div>
      ) : loading && !analysis ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[90, 75, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 12, width: `${w}%`, borderRadius: 4 }} />
          ))}
        </div>
      ) : analysis ? (
        <div style={{
          fontSize: "0.8rem",
          lineHeight: 1.65,
          color: "#d4e8e4",
          position: "relative",
        }}>
          {analysis}{dots}
        </div>
      ) : (
        <div style={{ color: "#8a9ba8", fontSize: "0.78rem" }}>
          Start the bot to generate an AI market analysis.
        </div>
      )}

      {/* Footer */}
      {timestamp && (analysis || loading) && (
        <div style={{
          marginTop: "0.75rem",
          paddingTop: "0.6rem",
          borderTop: "1px solid #1e3330",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <span style={{ fontSize: "0.65rem", color: "#8a9ba8" }}>
            Updated {timestamp.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
