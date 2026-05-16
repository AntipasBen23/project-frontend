"use client";

import { useState } from "react";

import { API_URL } from "@/lib/api";
const API = API_URL;

export default function SettingsTab() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [pair, setPair] = useState("BTCUSDT");
  const [strategy, setStrategy] = useState("RSI_MA");
  const [tradeSize, setTradeSize] = useState(0.0002);
  const [saved, setSaved] = useState(false);
  const [connectivity, setConnectivity] = useState<{ connected: boolean; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  async function handleSave() {
    await fetch(`${API}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, apiSecret, tradingPair: pair, strategy, tradeSize }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    setTesting(true);
    setConnectivity(null);
    try {
      const r = await fetch(`${API}/api/connectivity`).then((r) => r.json());
      setConnectivity(r);
    } catch {
      setConnectivity({ connected: false, error: "Could not reach backend" });
    }
    setTesting(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem", color: "#fff" }}>
          Binance Testnet API
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <div className="label" style={{ marginBottom: "0.3rem" }}>API Key</div>
            <input
              type="text"
              className="input"
              placeholder="Your Binance Testnet API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: "0.3rem" }}>API Secret</div>
            <input
              type="password"
              className="input"
              placeholder="Your Binance Testnet API Secret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button
              className="btn btn-ghost"
              onClick={handleTest}
              disabled={testing}
              style={{ flex: 1, justifyContent: "center" }}
            >
              {testing ? "Testing…" : "Test Connection"}
            </button>
          </div>

          {connectivity && (
            <div style={{
              padding: "0.75rem",
              borderRadius: 8,
              background: connectivity.connected ? "rgba(0,212,170,0.08)" : "rgba(255,77,109,0.08)",
              border: `1px solid ${connectivity.connected ? "#00d4aa40" : "#ff4d6d40"}`,
              color: connectivity.connected ? "#00d4aa" : "#ff4d6d",
              fontSize: "0.8rem",
            }}>
              {connectivity.connected
                ? "✓ Successfully connected to Binance Testnet"
                : `✗ Connection failed: ${connectivity.error}`}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem", color: "#fff" }}>
          Trading Defaults
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <div className="label" style={{ marginBottom: "0.3rem" }}>Default Pair</div>
            <select className="input" value={pair} onChange={(e) => setPair(e.target.value)}>
              <option value="BTCUSDT">BTC / USDT</option>
              <option value="ETHUSDT">ETH / USDT</option>
              <option value="BNBUSDT">BNB / USDT</option>
              <option value="SOLUSDT">SOL / USDT</option>
              <option value="XRPUSDT">XRP / USDT</option>
              <option value="ADAUSDT">ADA / USDT</option>
              <option value="DOGEUSDT">DOGE / USDT</option>
              <option value="LTCUSDT">LTC / USDT</option>
              <option value="DOTUSDT">DOT / USDT</option>
              <option value="AVAXUSDT">AVAX / USDT</option>
            </select>
          </div>
          <div>
            <div className="label" style={{ marginBottom: "0.3rem" }}>Default Strategy</div>
            <select className="input" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              <option value="RSI_MA">RSI + MA Crossover</option>
              <option value="BOLLINGER">Bollinger Bands</option>
              <option value="EMA">EMA Scalper</option>
            </select>
          </div>
          <div>
            <div className="label" style={{ marginBottom: "0.3rem" }}>Default Trade Size</div>
            <input
              type="number"
              className="input"
              value={tradeSize}
              step={0.00001}
              min={0.00013}
              onChange={(e) => setTradeSize(Number(e.target.value))}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
            onClick={handleSave}
          >
            {saved ? "✓ Saved" : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.75rem", color: "#fff" }}>
          About
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", color: "#8a9ba8" }}>
          <Row label="Version" value="2.0.0" />
          <Row label="Backend" value="Go 1.25 + Binance Testnet" />
          <Row label="Frontend" value="Next.js 16 + TradingView Charts" />
          <Row label="Mode" value="Testnet (No real funds)" />
          <Row label="WebSocket" value="ws://localhost:8080/ws" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{label}</span>
      <span style={{ color: "#fff", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
