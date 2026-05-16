"use client";

import { useState, useEffect } from "react";
import type { BotStatus, TabId } from "@/types";

import { API_URL } from "@/lib/api";
const API = API_URL;

interface NavbarProps {
  status: BotStatus | null;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onStatusChange: (s: BotStatus) => void;
  onPairChange?: (pair: string) => void;
  livePrice?: number | null;
  pair?: string;
}

export default function Navbar({ status, activeTab, onTabChange, onStatusChange, onPairChange, livePrice, pair: pairProp }: NavbarProps) {
  const [time, setTime] = useState("");
  const [pair, setPair] = useState("BTCUSDT");
  const [strategy, setStrategy] = useState("RSI_MA");
  const [loading, setLoading] = useState<string | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [priceDir, setPriceDir] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().slice(17, 25) + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (status) {
      setPair(status.activePair);
      setStrategy(status.activeStrategy);
    }
  }, [status]);

  // Track price direction for colour flash
  useEffect(() => {
    if (livePrice == null) return;
    if (prevPrice != null) {
      setPriceDir(livePrice > prevPrice ? "up" : livePrice < prevPrice ? "down" : null);
      const t = setTimeout(() => setPriceDir(null), 600);
      return () => clearTimeout(t);
    }
    setPrevPrice(livePrice);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrice]);

  async function post(endpoint: string, body?: object) {
    const r = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return r.json();
  }

  async function handleStart() {
    setLoading("start");
    await post("/api/bot/start");
    const s = await fetch(`${API}/api/status`).then((r) => r.json());
    onStatusChange(s);
    setLoading(null);
  }

  async function handleStop() {
    setLoading("stop");
    await post("/api/bot/stop");
    const s = await fetch(`${API}/api/status`).then((r) => r.json());
    onStatusChange(s);
    setLoading(null);
  }

  async function handlePause() {
    setLoading("pause");
    await post("/api/bot/pause");
    const s = await fetch(`${API}/api/status`).then((r) => r.json());
    onStatusChange(s);
    setLoading(null);
  }

  async function handleStrategy(val: string) {
    setStrategy(val);
    await post("/api/bot/strategy", { strategy: val });
  }

  const state = status?.state ?? "STOPPED";
  const stateColor =
    state === "RUNNING" ? "#00d4aa" : state === "PAUSED" ? "#ffc857" : "#8a9ba8";
  const stateBg =
    state === "RUNNING"
      ? "rgba(0,212,170,0.1)"
      : state === "PAUSED"
      ? "rgba(255,200,87,0.1)"
      : "rgba(138,155,168,0.1)";

  return (
    <header
      style={{
        background: "#0a0a0a",
        borderBottom: "1px solid #1e3330",
        padding: "0 1.5rem",
        height: "60px",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginRight: "0.5rem" }}>
        <div
          style={{
            width: 28,
            height: 28,
            background: "linear-gradient(135deg, #00d4aa, #00a882)",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: "#0a0a0a",
          }}
        >
          T
        </div>
        <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em" }}>
          AIEdge<span style={{ color: "#00d4aa" }}> Swing</span>
        </span>
      </div>

      {/* Live price ticker */}
      {livePrice != null && (
        <div style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.375rem",
          background: "#0f1f1c",
          border: "1px solid #1e3330",
          borderRadius: 8,
          padding: "0.3rem 0.75rem",
        }}>
          <span style={{ fontSize: "0.65rem", color: "#8a9ba8", fontWeight: 600 }}>
            {(pairProp ?? pair).replace("USDT", "/USDT")}
          </span>
          <span style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: priceDir === "up" ? "#00d4aa" : priceDir === "down" ? "#ff4d6d" : "#fff",
            transition: "color 0.3s",
          }}>
            ${livePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {priceDir && (
            <span style={{ fontSize: "0.65rem", color: priceDir === "up" ? "#00d4aa" : "#ff4d6d" }}>
              {priceDir === "up" ? "▲" : "▼"}
            </span>
          )}
        </div>
      )}

      {/* Status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: stateBg,
          border: `1px solid ${stateColor}30`,
          borderRadius: 8,
          padding: "0.3rem 0.75rem",
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        <span
          className="pulse-dot"
          style={{ background: stateColor, width: 7, height: 7 }}
        />
        <span style={{ color: stateColor }}>{state}</span>
        {status?.uptime && state === "RUNNING" && (
          <span style={{ color: "#8a9ba8", fontSize: "0.7rem" }}>{status.uptime}</span>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "0.375rem" }}>
        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={state === "RUNNING" || !!loading}
          style={{ opacity: state === "RUNNING" ? 0.4 : 1, fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
        >
          {loading === "start" ? "..." : "▶ Start"}
        </button>
        <button
          className="btn btn-warn"
          onClick={handlePause}
          disabled={state !== "RUNNING" || !!loading}
          style={{ opacity: state !== "RUNNING" ? 0.4 : 1, fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
        >
          {loading === "pause" ? "..." : "⏸ Pause"}
        </button>
        <button
          className="btn btn-danger"
          onClick={handleStop}
          disabled={state === "STOPPED" || !!loading}
          style={{ opacity: state === "STOPPED" ? 0.4 : 1, fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
        >
          {loading === "stop" ? "..." : "■ Stop"}
        </button>
      </div>

      {/* Pair selector */}
      <select
        className="input"
        value={pair}
        onChange={(e) => {
          setPair(e.target.value);
          onPairChange?.(e.target.value);
        }}
        style={{ width: 130, fontSize: "0.8rem" }}
      >
        <option value="BTCUSDT">BTC / USDT</option>
        <option value="ETHUSDT">ETH / USDT</option>
        <option value="BNBUSDT">BNB / USDT</option>
      </select>

      {/* Strategy selector */}
      <select
        className="input"
        value={strategy}
        onChange={(e) => handleStrategy(e.target.value)}
        style={{ width: 170, fontSize: "0.8rem" }}
      >
        <option value="RSI_MA">RSI + MA Crossover</option>
        <option value="BOLLINGER">Bollinger Bands</option>
        <option value="EMA">EMA Scalper</option>
      </select>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Tab navigation */}
      <nav style={{ display: "flex", gap: "0.25rem" }}>
        {(["live", "backtest", "settings"] as TabId[]).map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => onTabChange(tab)}
          >
            {tab === "live" ? "Live Trading" : tab === "backtest" ? "Backtest" : "Settings"}
          </button>
        ))}
      </nav>

      {/* Clock */}
      <div style={{ color: "#8a9ba8", fontSize: "0.75rem", fontVariantNumeric: "tabular-nums", minWidth: 90, textAlign: "right" }}>
        {time}
      </div>
    </header>
  );
}
