"use client";

import { useCallback, useState } from "react";
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

const API = "http://localhost:8080";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("live");
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [brainLogs, setBrainLogs] = useState<BrainLog[]>([]);
  const [pnl, setPnl] = useState<PnL | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [backtestProgress, setBacktestProgress] = useState<{ percent: number; message: string } | null>(null);
  const [stopLoss, setStopLoss] = useState(2.0);
  const [takeProfit, setTakeProfit] = useState(3.0);
  const [maxDailyLoss, setMaxDailyLoss] = useState(5.0);

  const handleMessage = useCallback((event: string, data: unknown) => {
    switch (event) {
      case "status":
        setStatus(data as BotStatus);
        break;
      case "price": {
        const d = data as { candles?: Candle[] };
        if (d.candles) setCandles(d.candles);
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
        if (t.status === "OPEN") {
          // new open trade — clear position tracking
        }
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
  }, []);

  useWebSocket("ws://localhost:8080/ws", handleMessage);

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
      />

      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* LIVE TRADING TAB */}
        {activeTab === "live" && (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Top section: Chart + Stats */}
            <div style={{
              flex: "0 0 auto",
              height: "calc(100vh - 60px - 260px)",
              minHeight: 320,
              display: "flex",
              gap: "0",
            }}>
              {/* Chart area (65%) */}
              <div style={{
                flex: "0 0 65%",
                borderRight: "1px solid #1e3330",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{
                  height: "100%",
                  overflow: "hidden",
                }}>
                  <Chart
                    candles={candles}
                    activeStrategy={activeStrategy}
                    stopLossLevel={position?.stopLoss}
                    takeProfitLevel={position?.takeProfit}
                  />
                </div>
              </div>

              {/* Stats panel (35%) */}
              <div style={{
                flex: "0 0 35%",
                overflow: "auto",
                padding: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
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

            {/* Bottom section: Trade table + Bot Brain */}
            <div style={{
              height: 260,
              display: "flex",
              borderTop: "1px solid #1e3330",
              flexShrink: 0,
            }}>
              {/* Trade table */}
              <div style={{
                flex: "0 0 58%",
                borderRight: "1px solid #1e3330",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{
                  padding: "0.5rem 0.75rem",
                  borderBottom: "1px solid #1e3330",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                  <span className="label">Trade History</span>
                  <span style={{
                    background: "#1e3330",
                    color: "#00d4aa",
                    borderRadius: 4,
                    padding: "0.1rem 0.4rem",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                  }}>{trades.length}</span>
                </div>
                <div style={{ flex: 1, overflow: "hidden", padding: "0 0.25rem" }}>
                  <TradeTable trades={trades} />
                </div>
              </div>

              {/* Bot Brain log */}
              <div style={{
                flex: "0 0 42%",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{
                  padding: "0.5rem 0.75rem",
                  borderBottom: "1px solid #1e3330",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                  <span className="label">🤖 Bot Brain</span>
                  {brainLogs.length > 0 && (
                    <span style={{
                      background: "#1e3330",
                      color: "#8a9ba8",
                      borderRadius: 4,
                      padding: "0.1rem 0.4rem",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}>{brainLogs.length}</span>
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden", padding: "0 0.25rem" }}>
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
