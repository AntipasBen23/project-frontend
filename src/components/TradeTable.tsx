"use client";

import { useEffect, useRef } from "react";
import type { Trade } from "@/types";

interface TradeTableProps {
  trades: Trade[];
}

const exitReasonLabel: Record<string, { label: string; color: string }> = {
  SIGNAL: { label: "Signal", color: "#8a9ba8" },
  STOP_LOSS: { label: "Stop Loss", color: "#ff4d6d" },
  TAKE_PROFIT: { label: "Take Profit", color: "#00d4aa" },
};

export default function TradeTable({ trades }: TradeTableProps) {
  const prevLen = useRef(0);

  useEffect(() => {
    prevLen.current = trades.length;
  }, [trades]);

  if (trades.length === 0) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#8a9ba8",
        fontSize: "0.8rem",
        border: "1px dashed #1e3330",
        borderRadius: 12,
      }}>
        No trades yet — start the bot to begin trading
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.775rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #1e3330" }}>
            {["#", "Pair", "Side", "Entry", "Exit", "Qty", "P&L", "Reason", "Time"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: h === "#" || h === "P&L" ? "right" : "left",
                  padding: "0.5rem 0.625rem",
                  color: "#8a9ba8",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  fontSize: "0.6875rem",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  position: "sticky",
                  top: 0,
                  background: "#0a0a0a",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.slice(0, 50).map((trade, i) => {
            const isNew = i === 0 && trades.length > prevLen.current;
            const pnlColor = trade.pnl >= 0 ? "#00d4aa" : "#ff4d6d";
            const reason = exitReasonLabel[trade.exitReason] ?? { label: trade.exitReason, color: "#8a9ba8" };

            return (
              <tr
                key={trade.id}
                className={isNew ? "fade-in" : ""}
                style={{
                  borderBottom: "1px solid #1e333080",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1f1c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.5rem 0.625rem", color: "#8a9ba8", textAlign: "right" }}>
                  {trades.length - i}
                </td>
                <td style={{ padding: "0.5rem 0.625rem", color: "#fff", fontWeight: 500 }}>
                  {trade.pair.replace("USDT", "/USDT")}
                </td>
                <td style={{ padding: "0.5rem 0.625rem" }}>
                  <span style={{
                    color: trade.side === "BUY" ? "#00d4aa" : "#ff4d6d",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}>
                    {trade.side}
                  </span>
                </td>
                <td style={{ padding: "0.5rem 0.625rem", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                  ${trade.entryPrice.toFixed(2)}
                </td>
                <td style={{ padding: "0.5rem 0.625rem", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                  ${trade.exitPrice.toFixed(2)}
                </td>
                <td style={{ padding: "0.5rem 0.625rem", color: "#8a9ba8" }}>
                  {trade.quantity.toFixed(4)}
                </td>
                <td style={{ padding: "0.5rem 0.625rem", color: pnlColor, fontWeight: 700, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                </td>
                <td style={{ padding: "0.5rem 0.625rem" }}>
                  <span style={{
                    color: reason.color,
                    background: `${reason.color}15`,
                    border: `1px solid ${reason.color}30`,
                    borderRadius: 4,
                    padding: "0.1rem 0.4rem",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {reason.label}
                  </span>
                </td>
                <td style={{ padding: "0.5rem 0.625rem", color: "#8a9ba8", whiteSpace: "nowrap" }}>
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
