"use client";

import { useState } from "react";
import type { BacktestConfig } from "@/types";

import { API_URL } from "@/lib/api";
const API = API_URL;

interface BacktestFormProps {
  onStart: () => void;
  progress: { percent: number; message: string } | null;
}

export default function BacktestForm({ onStart, progress }: BacktestFormProps) {
  const [config, setConfig] = useState<BacktestConfig>({
    symbol: "BTCUSDT",
    interval: "1h",
    strategy: "RSI_MA",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    initialCapital: 1000,
    tradeSize: 0.001,
    stopLoss: 2,
    takeProfit: 3,
    useRisk: true,
  });
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    onStart();
    try {
      await fetch(`${API}/api/backtest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
    } catch {
      // error handled via WebSocket
    }
    setLoading(false);
  }

  function update<K extends keyof BacktestConfig>(key: K, value: BacktestConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="card" style={{ maxWidth: 400 }}>
      <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem", color: "#fff" }}>
        Backtest Configuration
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        <Field label="Trading Pair">
          <select className="input" value={config.symbol} onChange={(e) => update("symbol", e.target.value)}>
            <option value="BTCUSDT">BTC / USDT</option>
            <option value="ETHUSDT">ETH / USDT</option>
          </select>
        </Field>

        <Field label="Strategy">
          <select className="input" value={config.strategy} onChange={(e) => update("strategy", e.target.value)}>
            <option value="RSI_MA">RSI + MA Crossover</option>
            <option value="BOLLINGER">Bollinger Bands</option>
            <option value="EMA">EMA Scalper</option>
          </select>
        </Field>

        <Field label="Interval">
          <select className="input" value={config.interval} onChange={(e) => update("interval", e.target.value)}>
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
          <Field label="Start Date">
            <input
              type="date"
              className="input"
              value={config.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </Field>
          <Field label="End Date">
            <input
              type="date"
              className="input"
              value={config.endDate}
              onChange={(e) => update("endDate", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Starting Capital (USDT)">
          <input
            type="number"
            className="input"
            value={config.initialCapital}
            step={100}
            min={100}
            onChange={(e) => update("initialCapital", Number(e.target.value))}
          />
        </Field>

        <Field label="Trade Size">
          <input
            type="number"
            className="input"
            value={config.tradeSize}
            step={0.001}
            min={0.001}
            onChange={(e) => update("tradeSize", Number(e.target.value))}
          />
        </Field>

        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", flex: 1 }}>
            <input
              type="checkbox"
              checked={config.useRisk}
              onChange={(e) => update("useRisk", e.target.checked)}
              style={{ accentColor: "#00d4aa", width: 14, height: 14 }}
            />
            <span style={{ fontSize: "0.8rem", color: "#8a9ba8" }}>Enable stop loss / take profit</span>
          </label>
        </div>

        {config.useRisk && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
            <Field label="Stop Loss %">
              <input type="number" className="input" value={config.stopLoss} step={0.5}
                onChange={(e) => update("stopLoss", Number(e.target.value))} />
            </Field>
            <Field label="Take Profit %">
              <input type="number" className="input" value={config.takeProfit} step={0.5}
                onChange={(e) => update("takeProfit", Number(e.target.value))} />
            </Field>
          </div>
        )}

        {progress && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#8a9ba8" }}>{progress.message}</span>
              <span style={{ fontSize: "0.75rem", color: "#00d4aa" }}>{progress.percent}%</span>
            </div>
            <div style={{ height: 4, background: "#1e3330", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress.percent}%`,
                  background: "linear-gradient(90deg, #00d4aa, #00a882)",
                  borderRadius: 2,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "0.625rem" }}
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{
                width: 12, height: 12,
                border: "2px solid rgba(0,0,0,0.3)",
                borderTopColor: "#0a0a0a",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                display: "inline-block",
              }} />
              Running Backtest…
            </span>
          ) : "▶ Run Backtest"}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: "0.3rem" }}>{label}</div>
      {children}
    </div>
  );
}
