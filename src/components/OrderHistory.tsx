"use client";

import { useEffect, useState, useCallback } from "react";
import type { BinanceOrder } from "@/types";
import { API_URL } from "@/lib/api";

interface Props {
  symbol: string;
}

export default function OrderHistory({ symbol }: Props) {
  const [orders, setOrders] = useState<BinanceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/api/orders?symbol=${symbol}`);
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: "Unknown error" }));
        setError(body.error ?? "Failed to load orders");
        setLoading(false);
        return;
      }
      const data: BinanceOrder[] = await r.json();
      setOrders(data);
      setError(null);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }, [symbol]);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 15000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const sideColor = (side: string) => side === "BUY" ? "#00d4aa" : "#ff4d6d";
  const statusColor = (status: string) => {
    if (status === "FILLED") return "#00d4aa";
    if (status === "CANCELED") return "#8a9ba8";
    if (status === "NEW") return "#ffc857";
    return "#8a9ba8";
  };

  if (loading) {
    return (
      <div style={{ padding: "1rem", color: "#8a9ba8", fontSize: "0.75rem", textAlign: "center" }}>
        Loading Binance orders…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1rem", color: "#ff4d6d", fontSize: "0.75rem" }}>
        {error.includes("no API key") ? "No API key — configure in Settings tab." : error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: "1rem", color: "#8a9ba8", fontSize: "0.75rem", textAlign: "center" }}>
        No orders found on Binance Testnet for {symbol}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #1e3330" }}>
            {["Order ID", "Side", "Type", "Status", "Qty", "Quote", "Time"].map((h) => (
              <th key={h} style={{ padding: "0.35rem 0.6rem", color: "#8a9ba8", fontWeight: 600, textAlign: "left", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId} style={{ borderBottom: "1px solid #111" }}>
              <td style={{ padding: "0.3rem 0.6rem", color: "#8a9ba8", fontVariantNumeric: "tabular-nums" }}>
                #{o.orderId}
              </td>
              <td style={{ padding: "0.3rem 0.6rem", color: sideColor(o.side), fontWeight: 700 }}>
                {o.side}
              </td>
              <td style={{ padding: "0.3rem 0.6rem", color: "#ccc" }}>{o.type}</td>
              <td style={{ padding: "0.3rem 0.6rem" }}>
                <span style={{
                  background: `${statusColor(o.status)}18`,
                  color: statusColor(o.status),
                  borderRadius: 4,
                  padding: "0.1rem 0.4rem",
                  fontWeight: 600,
                }}>
                  {o.status}
                </span>
              </td>
              <td style={{ padding: "0.3rem 0.6rem", color: "#ccc", fontVariantNumeric: "tabular-nums" }}>
                {o.executedQty.toFixed(5)}
              </td>
              <td style={{ padding: "0.3rem 0.6rem", color: "#ccc", fontVariantNumeric: "tabular-nums" }}>
                ${o.quoteQty.toFixed(2)}
              </td>
              <td style={{ padding: "0.3rem 0.6rem", color: "#8a9ba8", whiteSpace: "nowrap" }}>
                {new Date(o.time).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
