"use client";

import { useEffect, useRef } from "react";
import type { BrainLog } from "@/types";

interface BotBrainLogProps {
  logs: BrainLog[];
}

const typeStyle: Record<string, { color: string; icon: string }> = {
  buy:  { color: "#00d4aa", icon: "🟢" },
  sell: { color: "#ff4d6d", icon: "🔴" },
  info: { color: "#8a9ba8", icon: "📊" },
  warn: { color: "#ffc857", icon: "⚠️" },
};

export default function BotBrainLog({ logs }: BotBrainLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(0);

  useEffect(() => {
    if (logs.length > prevLen.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLen.current = logs.length;
  }, [logs]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.125rem",
        padding: "0.25rem 0",
      }}
    >
      {logs.length === 0 ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#8a9ba8",
          fontSize: "0.8rem",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          <span style={{ fontSize: "1.5rem" }}>🤖</span>
          <span>Bot Brain log will appear here when the bot runs</span>
        </div>
      ) : (
        logs.map((log, i) => {
          const style = typeStyle[log.type] ?? typeStyle.info;
          const isNew = i === logs.length - 1;

          return (
            <div
              key={i}
              className={isNew ? "fade-in" : ""}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.3rem 0.5rem",
                borderRadius: 6,
                background: isNew ? `${style.color}08` : "transparent",
                transition: "background 0.5s",
              }}
            >
              <span style={{ flexShrink: 0, fontSize: "0.75rem" }}>{style.icon}</span>
              <span
                style={{
                  color: "#8a9ba8",
                  fontSize: "0.7rem",
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                  marginTop: "0.05rem",
                }}
              >
                [{new Date(log.time).toLocaleTimeString()}]
              </span>
              <span style={{ color: style.color, fontSize: "0.775rem", lineHeight: 1.5 }}>
                {log.message}
              </span>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}
