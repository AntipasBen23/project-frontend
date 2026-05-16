"use client";

import { useEffect, useState } from "react";
import type { Balance, PnL, Position } from "@/types";

const API = "http://localhost:8080";

interface StatsPanelProps {
  pnl: PnL | null;
  position: Position | null;
  stopLossPct: number;
  takeProfitPct: number;
  maxDailyLossPct: number;
  onRiskUpdate: (sl: number, tp: number, mdl: number) => void;
}

function AnimatedNumber({ value, prefix = "", decimals = 2, className = "" }: {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setDisplay(value);
    setKey((k) => k + 1);
  }, [value]);

  return (
    <span key={key} className={`animate-count ${className}`}>
      {prefix}{display.toFixed(decimals)}
    </span>
  );
}

export default function StatsPanel({
  pnl,
  position,
  stopLossPct,
  takeProfitPct,
  maxDailyLossPct,
  onRiskUpdate,
}: StatsPanelProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [sl, setSl] = useState(stopLossPct);
  const [tp, setTp] = useState(takeProfitPct);
  const [mdl, setMdl] = useState(maxDailyLossPct);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setSl(stopLossPct); }, [stopLossPct]);
  useEffect(() => { setTp(takeProfitPct); }, [takeProfitPct]);
  useEffect(() => { setMdl(maxDailyLossPct); }, [maxDailyLossPct]);

  async function fetchBalance() {
    setRefreshing(true);
    try {
      const data = await fetch(`${API}/api/balance`).then((r) => r.json());
      setBalances(data.balances ?? []);
    } catch {
      // ignore
    }
    setRefreshing(false);
  }

  useEffect(() => {
    fetchBalance();
    const id = setInterval(fetchBalance, 15000);
    return () => clearInterval(id);
  }, []);

  const pnlColor = (pnl?.totalPnl ?? 0) >= 0 ? "#00d4aa" : "#ff4d6d";

  const usdt = balances.find((b) => b.asset === "USDT");
  const btc = balances.find((b) => b.asset === "BTC");
  const eth = balances.find((b) => b.asset === "ETH");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%", overflow: "auto" }}>
      {/* Balance Card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span className="label">Account Balance</span>
          <button
            onClick={fetchBalance}
            style={{
              background: "none",
              border: "none",
              color: "#8a9ba8",
              cursor: "pointer",
              fontSize: "0.75rem",
              padding: "0.25rem",
              transition: "color 0.15s",
            }}
            title="Refresh balance"
          >
            {refreshing ? "↻" : "⟳"}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {usdt && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>USDT</span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>
                ${usdt.free.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {btc && btc.free > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>BTC</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>
                {btc.free.toFixed(6)}
              </span>
            </div>
          )}
          {eth && eth.free > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>ETH</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>
                {eth.free.toFixed(6)}
              </span>
            </div>
          )}
          {balances.length === 0 && (
            <div style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>Loading…</div>
          )}
        </div>
      </div>

      {/* P&L Card */}
      <div className="card">
        <div className="label" style={{ marginBottom: "0.75rem" }}>Performance</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>Total P&L</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: pnlColor }}>
              <AnimatedNumber
                value={pnl?.totalPnl ?? 0}
                prefix={pnl?.totalPnl ?? 0 >= 0 ? "+$" : "-$"}
                decimals={2}
              />
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>Win Rate</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#00d4aa" }}>
              {(pnl?.winRate ?? 0).toFixed(1)}%
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>Total Trades</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>
              {pnl?.totalTrades ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Current Position */}
      <div className="card">
        <div className="label" style={{ marginBottom: "0.75rem" }}>Current Position</div>
        {position ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Row label="Entry" value={`$${position.entryPrice.toFixed(2)}`} />
            <Row label="Current" value={`$${position.currentPrice.toFixed(2)}`} />
            <Row label="Qty" value={position.quantity.toFixed(6)} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>Unrealised P&L</span>
              <span style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: position.unrealisedPnL >= 0 ? "#00d4aa" : "#ff4d6d",
              }}>
                {position.unrealisedPnL >= 0 ? "+" : ""}${position.unrealisedPnL.toFixed(2)}
              </span>
            </div>
            <div style={{ borderTop: "1px solid #1e3330", paddingTop: "0.5rem", marginTop: "0.125rem" }}>
              <Row label="Stop Loss" value={`$${position.stopLoss.toFixed(2)}`} valueColor="#ff4d6d" />
              <Row label="Take Profit" value={`$${position.takeProfit.toFixed(2)}`} valueColor="#00d4aa" />
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 64,
            color: "#8a9ba8",
            fontSize: "0.8rem",
            border: "1px dashed #1e3330",
            borderRadius: 8,
          }}>
            No open position
          </div>
        )}
      </div>

      {/* Risk Controls */}
      <div className="card">
        <div className="label" style={{ marginBottom: "0.75rem" }}>Risk Controls</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <RiskInput label="Stop Loss %" value={sl} onChange={setSl} />
          <RiskInput label="Take Profit %" value={tp} onChange={setTp} />
          <RiskInput label="Max Daily Loss %" value={mdl} onChange={setMdl} />
          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.25rem", justifyContent: "center" }}
            onClick={() => onRiskUpdate(sl, tp, mdl)}
          >
            Apply Risk Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueColor = "#fff" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#8a9ba8", fontSize: "0.8rem" }}>{label}</span>
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: valueColor }}>{value}</span>
    </div>
  );
}

function RiskInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: "0.25rem" }}>{label}</div>
      <input
        type="number"
        className="input"
        value={value}
        step={0.5}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ fontSize: "0.85rem" }}
      />
    </div>
  );
}
