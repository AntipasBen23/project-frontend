"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Is now a good time to trade?",
  "What are the key levels to watch?",
  "Explain the current RSI reading.",
  "Should I tighten my stop loss?",
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello. I have live access to current market data, open positions, and technical indicators. Ask me anything about market conditions, strategy, or risk.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMessage: Message = { role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Send last 6 messages as history for context
    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));

    try {
      const r = await fetch(`${API_URL}/api/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.error ?? "Something went wrong. Please try again.",
          timestamp: new Date(),
        }]);
      } else {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.reply,
          timestamp: new Date(data.timestamp),
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Unable to reach the backend. Please check your connection.",
        timestamp: new Date(),
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Header */}
      <div style={{
        padding: "0.5rem 0.75rem",
        borderBottom: "1px solid #1e3330",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: "0.9rem" }}>🤖</span>
        <span className="label">AI Trading Assistant</span>
        <span style={{ fontSize: "0.62rem", color: "#8a9ba8", marginLeft: "auto" }}>Live market data</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%",
              padding: "0.55rem 0.8rem",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
              background: m.role === "user" ? "#00d4aa" : "#0f1f1c",
              border: m.role === "user" ? "none" : "1px solid #1e3330",
              color: m.role === "user" ? "#0a0a0a" : "#d4e8e4",
              fontSize: "0.8rem",
              lineHeight: 1.65,
              fontWeight: m.role === "user" ? 600 : 400,
            }}>
              {m.content}
            </div>
            <span style={{ fontSize: "0.6rem", color: "#8a9ba8", marginTop: "0.2rem", paddingLeft: 4, paddingRight: 4 }}>
              {m.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{
              padding: "0.55rem 0.9rem",
              borderRadius: "2px 12px 12px 12px",
              background: "#0f1f1c",
              border: "1px solid #1e3330",
              color: "#00d4aa",
              fontSize: "1rem",
              letterSpacing: "0.15em",
            }}>
              •••
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only show when no conversation yet) */}
      {messages.length === 1 && !loading && (
        <div style={{ padding: "0 0.75rem 0.5rem", display: "flex", gap: "0.4rem", flexWrap: "wrap", flexShrink: 0 }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                background: "transparent",
                border: "1px solid #1e3330",
                borderRadius: 20,
                color: "#8a9ba8",
                cursor: "pointer",
                fontSize: "0.68rem",
                padding: "0.25rem 0.65rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = "#00d4aa"; (e.target as HTMLButtonElement).style.borderColor = "#00d4aa"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = "#8a9ba8"; (e.target as HTMLButtonElement).style.borderColor = "#1e3330"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "0.6rem 0.75rem",
        borderTop: "1px solid #1e3330",
        display: "flex",
        gap: "0.5rem",
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Ask anything about the market…"
          disabled={loading}
          style={{
            flex: 1,
            background: "#0f1f1c",
            border: "1px solid #1e3330",
            borderRadius: 8,
            color: "#d4e8e4",
            fontSize: "0.8rem",
            padding: "0.5rem 0.75rem",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? "#1e3330" : "#00d4aa",
            border: "none",
            borderRadius: 8,
            color: loading || !input.trim() ? "#8a9ba8" : "#0a0a0a",
            cursor: loading || !input.trim() ? "default" : "pointer",
            fontSize: "0.8rem",
            fontWeight: 700,
            padding: "0.5rem 0.9rem",
            fontFamily: "inherit",
            transition: "background 0.2s",
          }}
        >
          Send →
        </button>
      </div>
    </div>
  );
}
