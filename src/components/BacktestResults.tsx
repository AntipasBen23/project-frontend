"use client";

import { useEffect, useRef } from "react";
import type { BacktestResult, Trade } from "@/types";

interface BacktestResultsProps {
  result: BacktestResult | null;
}

export default function BacktestResults({ result }: BacktestResultsProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!result || !chartRef.current) return;

    const init = async () => {
      const lc = await import("lightweight-charts") as any;
      const { createChart, LineStyle, LineSeries } = lc;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }

      const chart = createChart(chartRef.current!, {
        layout: {
          background: { color: "#0a0a0a" },
          textColor: "#8a9ba8",
          fontSize: 11,
          fontFamily: "Inter, system-ui, sans-serif",
        },
        grid: {
          vertLines: { color: "#1e3330", style: LineStyle.Dotted },
          horzLines: { color: "#1e3330", style: LineStyle.Dotted },
        },
        rightPriceScale: { borderColor: "#1e3330" },
        timeScale: { borderColor: "#1e3330", timeVisible: true },
        width: chartRef.current!.clientWidth,
        height: 220,
      });
      chartInstanceRef.current = chart;

      const series = chart.addSeries(LineSeries, {
        color: "#00d4aa",
        lineWidth: 2,
        title: "Portfolio Value",
      });

      const data = result.equityCurve.map((p) => ({
        time: Math.floor(new Date(p.time).getTime() / 1000) as any,
        value: p.value,
      })).sort((a, b) => a.time - b.time);

      series.setData(data);
      chart.timeScale().fitContent();

      const ro = new ResizeObserver(() => {
        if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
      });
      ro.observe(chartRef.current!);

      return () => { ro.disconnect(); chart.remove(); };
    };

    const cleanup = init();
    return () => { cleanup.then((fn) => fn?.()); };
  }, [result]);

  if (!result) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#8a9ba8",
        fontSize: "0.875rem",
        flexDirection: "column",
        gap: "0.75rem",
      }}>
        <span style={{ fontSize: "2rem" }}>📈</span>
        <span>Configure and run a backtest to see results</span>
      </div>
    );
  }

  const returnColor = result.totalReturn >= 0 ? "#00d4aa" : "#ff4d6d";
  const ddColor = "#ff4d6d";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "100%", overflow: "auto" }}>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.625rem" }}>
        <SummaryCard
          label="Total Return"
          value={`${result.totalReturn >= 0 ? "+" : ""}${result.totalReturn.toFixed(2)}%`}
          color={returnColor}
        />
        <SummaryCard label="Win Rate" value={`${result.winRate.toFixed(1)}%`} color="#00d4aa" />
        <SummaryCard label="Total Trades" value={result.totalTrades.toString()} color="#fff" />
        <SummaryCard
          label="Max Drawdown"
          value={`-${result.maxDrawdown.toFixed(2)}%`}
          color={ddColor}
        />
        <SummaryCard
          label="Sharpe Ratio"
          value={result.sharpeRatio.toFixed(2)}
          color={result.sharpeRatio >= 1 ? "#00d4aa" : "#ffc857"}
        />
      </div>

      {/* Equity Curve */}
      <div className="card" style={{ flexShrink: 0 }}>
        <div className="label" style={{ marginBottom: "0.75rem" }}>Equity Curve</div>
        <div ref={chartRef} style={{ width: "100%", height: 220 }} />
      </div>

      {/* Trade Breakdown */}
      <div className="card" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div className="label" style={{ marginBottom: "0.75rem" }}>
          Trade Breakdown ({result.trades.length} trades)
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.775rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3330" }}>
                {["#", "Side", "Entry", "Exit", "Qty", "P&L", "Reason", "Date"].map((h) => (
                  <th key={h} style={{
                    padding: "0.4rem 0.5rem",
                    textAlign: "left",
                    color: "#8a9ba8",
                    fontWeight: 600,
                    fontSize: "0.6875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    position: "sticky",
                    top: 0,
                    background: "#0f1f1c",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.trades.map((t, i) => (
                <BacktestTradeRow key={t.id || i} trade={t} index={i + 1} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div className="label" style={{ marginBottom: "0.375rem" }}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function BacktestTradeRow({ trade, index }: { trade: Trade; index: number }) {
  const pnlColor = trade.pnl >= 0 ? "#00d4aa" : "#ff4d6d";

  return (
    <tr
      style={{ borderBottom: "1px solid #1e333060" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1f1c")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "0.4rem 0.5rem", color: "#8a9ba8" }}>{index}</td>
      <td style={{ padding: "0.4rem 0.5rem", color: trade.side === "BUY" ? "#00d4aa" : "#ff4d6d", fontWeight: 700 }}>
        {trade.side}
      </td>
      <td style={{ padding: "0.4rem 0.5rem", color: "#fff" }}>${trade.entryPrice.toFixed(2)}</td>
      <td style={{ padding: "0.4rem 0.5rem", color: "#fff" }}>${trade.exitPrice.toFixed(2)}</td>
      <td style={{ padding: "0.4rem 0.5rem", color: "#8a9ba8" }}>{trade.quantity.toFixed(4)}</td>
      <td style={{ padding: "0.4rem 0.5rem", color: pnlColor, fontWeight: 700 }}>
        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
      </td>
      <td style={{ padding: "0.4rem 0.5rem", color: "#8a9ba8" }}>{trade.exitReason}</td>
      <td style={{ padding: "0.4rem 0.5rem", color: "#8a9ba8" }}>
        {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString() : "—"}
      </td>
    </tr>
  );
}
