"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  BotStatus,
  BrainLog,
  Candle,
  Position,
  PnL,
  Trade,
  BacktestResult,
  TabId,
} from "@/types";
import { useWebSocket } from "@/hooks/useWebSocket";
import Navbar from "@/components/Navbar";
import Chart from "@/components/Chart";
import StatsPanel from "@/components/StatsPanel";
import StrategyConfig from "@/components/StrategyConfig";
import TradeTable from "@/components/TradeTable";
import BotBrainLog from "@/components/BotBrainLog";
import BacktestForm from "@/components/BacktestForm";
import BacktestResults from "@/components/BacktestResults";
import SettingsTab from "@/components/SettingsTab";
import ConnectionBanner from "@/components/ConnectionBanner";
import OrderHistory from "@/components/OrderHistory";
import { API_URL, WS_URL } from "@/lib/api";

const API = API_URL;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("live");
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [brainLogs, setBrainLogs] = useState<BrainLog[]>([]);
  const [pnl, setPnl] = useState<PnL | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [bottomTab, setBottomTab] = useState<"trades" | "orders">("trades");
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [backtestProgress, setBacktestProgress] = useState<{ percent: number; message: string } | null>(null);
  const [stopLoss, setStopLoss] = useState(2.0);
  const [takeProfit, setTakeProfit] = useState(3.0);
  const [maxDailyLoss, setMaxDailyLoss] = useState(5.0);

  useEffect(() => {
    fetch(`${API}/api/candles?symbol=BTCUSDT&interval=1m&limit=100`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setCandles(data); })
      .catch(() => {});
  }, []);

  const handleMessage = useCallback((event: string, data: unknown) => {
    if (!connected) setConnected(true);

    switch (event) {
      case "status":
        setStatus(data as BotStatus);
        break;
      case "price": {
        const d = data as { candles?: Candle[]; price?: number };
        if (d.candles) setCandles(d.candles);
        if (d.price) setLivePrice(d.price);
        break;
      }
      case "trade":
      case "trade_closed": {
        const t = data as Trade;
        setTrades((prev) => {
          const existing = prev.findIndex((x) => x.id === t.id);
          if (existing >= 0) {
            const next = [...prev];
            next[existing] = t;
            return next;
          }
          return [t, ...prev].slice(0, 50);
        });
        break;
      }
      case "position":
        setPosition(data as Position);
        break;
      case "pnl":
        setPnl(data as PnL);
        break;
      case "brain_log":
        setBrainLogs((prev) => [...prev, data as BrainLog].slice(-200));
        break;
      case "backtest_progress":
        setBacktestProgress(data as { percent: number; message: string });
        break;
      case "backtest_result":
        setBacktestResult(data as BacktestResult);
        setBacktestProgress(null);
        break;
      case "backtest_error":
        setBacktestProgress(null);
        break;
    }
  }, [connected]);

  useWebSocket(WS_URL, handleMessage);

  async function handlePairChange(newPair: string) {
    await fetch(`${API}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tradingPair: newPair }),
    });
    setCandles([]);
    setLivePrice(null);
    fetch(`${API}/api/candles?symbol=${newPair}&interval=1m&limit=100`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setCandles(data); })
      .catch(() => {});
  }

  async function handleRiskUpdate(sl: number, tp: number, mdl: number) {
    setStopLoss(sl);
    setTakeProfit(tp);
    setMaxDailyLoss(mdl);
    await fetch(`${API}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stopLoss: sl, takeProfit: tp, maxDailyLoss: mdl }),
    });
  }

  const activeStrategy = status?.activeStrategy ?? "RSI_MA";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#0a0a0a" }}>
      <Navbar
        status={status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStatusChange={setStatus}
        onPairChange={handlePairChange}
        livePrice={livePrice}
        pair={status?.activePair ?? "BTCUSDT"}
      />

      <ConnectionBanner connected={connected} />

      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* LIVE TRADING TAB */}
        {activeTab === "live" && (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Top: Chart (65%) + Stats (35%) */}
            <div style={{
              flex: "1 1 auto",
              minHeight: 300,
              display: "flex",
            }}>
              <div style={{ flex: "0 0 65%", borderRight: "1px solid #1e3330", overflow: "hidden" }}>
                <Chart
                  candles={candles}
                  activeStrategy={activeStrategy}
                  stopLossLevel={position?.stopLoss}
                  takeProfitLevel={position?.takeProfit}
                />
              </div>
              <div style={{
                flex: "0 0 35%",
                overflow: "auto",
                padding: "0.75rem",
                paddingTop: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                boxSizing: "border-box",
              }}>
                <StatsPanel
                  pnl={pnl}
                  position={position}
                  stopLossPct={stopLoss}
                  takeProfitPct={takeProfit}
                  maxDailyLossPct={maxDailyLoss}
                  onRiskUpdate={handleRiskUpdate}
                />
                <StrategyConfig activeStrategy={activeStrategy} />
              </div>
            </div>

            {/* Bottom: Trade table (58%) + Bot Brain (42%) */}
            <div style={{
              flex: "0 0 260px",
              display: "flex",
              borderTop: "1px solid #1e3330",
            }}>
              <div style={{ flex: "0 0 58%", borderRight: "1px solid #1e3330", display: "flex", flexDirection: "column" }}>
                <div style={{
                  padding: "0 0.75rem",
                  borderBottom: "1px solid #1e3330",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  flexShrink: 0,
                  height: 36,
                }}>
                  {(["trades", "orders"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBottomTab(t)}
                      style={{
                        background: bottomTab === t ? "#1e3330" : "transparent",
                        color: bottomTab === t ? "#00d4aa" : "#8a9ba8",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.2rem 0.6rem",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t === "trades" ? `Bot Trades${trades.length > 0 ? ` (${trades.length})` : ""}` : "Exchange Orders"}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  {bottomTab === "trades" ? (
                    <TradeTable trades={trades} />
                  ) : (
                    <OrderHistory symbol={status?.activePair ?? "BTCUSDT"} />
                  )}
                </div>
              </div>
              <div style={{ flex: "0 0 42%", display: "flex", flexDirection: "column" }}>
                <SectionHeader label="🤖 Bot Brain" badge={brainLogs.length} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <BotBrainLog logs={brainLogs} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BACKTEST TAB */}
        {activeTab === "backtest" && (
          <div style={{
            flex: 1,
            overflow: "auto",
            padding: "1.25rem",
            display: "grid",
            gridTemplateColumns: "400px 1fr",
            gap: "1.25rem",
            alignItems: "start",
          }}>
            <BacktestForm
              onStart={() => {
                setBacktestResult(null);
                setBacktestProgress({ percent: 0, message: "Starting…" });
              }}
              progress={backtestProgress}
            />
            <BacktestResults result={backtestResult} />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{ flex: 1, overflow: "auto", padding: "1.25rem" }}>
            <SettingsTab />
          </div>
        )}
      </main>
    </div>
  );
}

function SectionHeader({ label, badge, badgeColor = "#8a9ba8" }: {
  label: string;
  badge?: number;
  badgeColor?: string;
}) {
  return (
    <div style={{
      padding: "0.5rem 0.75rem",
      borderBottom: "1px solid #1e3330",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      flexShrink: 0,
    }}>
      <span className="label">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span style={{
          background: "#1e3330",
          color: badgeColor,
          borderRadius: 4,
          padding: "0.1rem 0.4rem",
          fontSize: "0.65rem",
          fontWeight: 700,
        }}>{badge}</span>
      )}
    </div>
  );
}
