"use client";

import { useEffect, useRef, useState } from "react";
import type { Candle } from "@/types";

interface ChartProps {
  candles: Candle[];
  activeStrategy: string;
  stopLossLevel?: number;
  takeProfitLevel?: number;
}

export default function Chart({
  candles,
  activeStrategy,
  stopLossLevel,
  takeProfitLevel,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const lc = await import("lightweight-charts");
      const { createChart, CrosshairMode, LineStyle, candlestickSeries } = lc as any;

      if (!containerRef.current) return;

      const chart = createChart(containerRef.current, {
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
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: "#00d4aa50", labelBackgroundColor: "#0f1f1c" },
          horzLine: { color: "#00d4aa50", labelBackgroundColor: "#0f1f1c" },
        },
        rightPriceScale: { borderColor: "#1e3330" },
        timeScale: { borderColor: "#1e3330", timeVisible: true, secondsVisible: false },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });

      chartRef.current = chart;

      candleSeriesRef.current = chart.addSeries(candlestickSeries, {
        upColor: "#00d4aa",
        downColor: "#ff4d6d",
        borderUpColor: "#00d4aa",
        borderDownColor: "#ff4d6d",
        wickUpColor: "#00d4aa80",
        wickDownColor: "#ff4d6d80",
      });

      chartRef.current._slLine = null;
      chartRef.current._tpLine = null;

      const ro = new ResizeObserver(() => {
        if (containerRef.current && chart) {
          chart.applyOptions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        }
      });
      ro.observe(containerRef.current);

      // Signal React that the chart is ready — this triggers the candles/overlays effects
      setChartReady(true);

      cleanup = () => {
        ro.disconnect();
        chart.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
      };
    })();

    return () => cleanup?.();
  }, []);

  // Runs whenever candles change OR chart becomes ready — guaranteed to have series ref
  useEffect(() => {
    if (!chartReady || !candleSeriesRef.current || candles.length === 0) return;
    const data = candles
      .map((c) => ({
        time: Math.floor(c.openTime / 1000) as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
      .sort((a, b) => a.time - b.time);
    candleSeriesRef.current.setData(data);
  }, [candles, chartReady]);

  // SL / TP price lines
  useEffect(() => {
    if (!chartReady) return;
    const cs = candleSeriesRef.current;
    if (!cs) return;

    if (cs._slLine) { try { cs.removePriceLine(cs._slLine); } catch {} cs._slLine = null; }
    if (cs._tpLine) { try { cs.removePriceLine(cs._tpLine); } catch {} cs._tpLine = null; }

    if (stopLossLevel) {
      cs._slLine = cs.createPriceLine({ price: stopLossLevel, color: "#ff4d6d", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "SL" });
    }
    if (takeProfitLevel) {
      cs._tpLine = cs.createPriceLine({ price: takeProfitLevel, color: "#00d4aa", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "TP" });
    }
  }, [stopLossLevel, takeProfitLevel, chartReady]);

  // Overlay lines (MA / Bollinger / EMA)
  useEffect(() => {
    if (!chartReady || !chartRef.current || candles.length === 0) return;

    (async () => {
      const { lineSeries: ls } = (await import("lightweight-charts")) as any;

      for (const s of overlaysRef.current) {
        try { chartRef.current?.removeSeries(s); } catch {}
      }
      overlaysRef.current = [];

      if (!chartRef.current) return;

      const times = candles.map((c) => Math.floor(c.openTime / 1000) as any);
      const closes = candles.map((c) => c.close);

      const addLine = (data: { time: any; value: number }[], color: string, title: string) => {
        const s = chartRef.current.addSeries(ls, { color, lineWidth: 1, title });
        s.setData(data.filter((d) => d.value > 0));
        overlaysRef.current.push(s);
      };

      if (activeStrategy === "RSI_MA") {
        addLine(computeSMAArray(closes, 9).map((v, i) => ({ time: times[i], value: v })), "#00d4aa", "MA9");
        addLine(computeSMAArray(closes, 21).map((v, i) => ({ time: times[i], value: v })), "#ffc857", "MA21");
      } else if (activeStrategy === "BOLLINGER") {
        const { upper, mid, lower } = computeBollingerArray(closes, 20, 2);
        addLine(upper.map((v, i) => ({ time: times[i], value: v })), "#ff4d6d60", "Upper");
        addLine(mid.map((v, i) => ({ time: times[i], value: v })), "#8a9ba860", "Mid");
        addLine(lower.map((v, i) => ({ time: times[i], value: v })), "#00d4aa60", "Lower");
      } else if (activeStrategy === "EMA") {
        addLine(computeEMAArray(closes, 9).map((v, i) => ({ time: times[i], value: v })), "#00d4aa", "EMA9");
        addLine(computeEMAArray(closes, 21).map((v, i) => ({ time: times[i], value: v })), "#ffc857", "EMA21");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, activeStrategy, chartReady]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#0a0a0a" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {candles.length === 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          color: "#8a9ba8",
          pointerEvents: "none",
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: "2px solid #1e3330",
            borderTopColor: "#00d4aa",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ fontSize: "0.875rem", margin: 0 }}>Connecting to Binance Testnet…</p>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function computeSMAArray(closes: number[], period: number): number[] {
  return closes.map((_, i) => {
    if (i < period - 1) return 0;
    return closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
  });
}

function computeEMAArray(closes: number[], period: number): number[] {
  const result: number[] = new Array(closes.length).fill(0);
  if (closes.length < period) return result;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result[period - 1] = ema;
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    result[i] = ema;
  }
  return result;
}

function computeBollingerArray(closes: number[], period: number, mult: number) {
  const upper: number[] = new Array(closes.length).fill(0);
  const mid: number[] = new Array(closes.length).fill(0);
  const lower: number[] = new Array(closes.length).fill(0);
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
    upper[i] = mean + mult * std;
    mid[i] = mean;
    lower[i] = mean - mult * std;
  }
  return { upper, mid, lower };
}
