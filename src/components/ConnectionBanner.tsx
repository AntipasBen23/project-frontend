"use client";

import { useEffect, useState } from "react";

interface ConnectionBannerProps {
  connected: boolean;
}

export default function ConnectionBanner({ connected }: ConnectionBannerProps) {
  const [visible, setVisible] = useState(false);
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (!connected) {
      setVisible(true);
    } else {
      if (wasConnected === false && connected) {
        // just reconnected
        setVisible(true);
        const t = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(t);
      }
      setVisible(false);
    }
    setWasConnected(connected);
  }, [connected, wasConnected]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 68,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        padding: "0.5rem 1.25rem",
        borderRadius: 8,
        fontSize: "0.8rem",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        animation: "fadeInSlide 0.3s ease-out",
        ...(connected
          ? {
              background: "rgba(0,212,170,0.12)",
              border: "1px solid rgba(0,212,170,0.3)",
              color: "#00d4aa",
            }
          : {
              background: "rgba(255,77,109,0.12)",
              border: "1px solid rgba(255,77,109,0.3)",
              color: "#ff4d6d",
            }),
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: connected ? "#00d4aa" : "#ff4d6d",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {connected ? "Backend connected" : "Connecting to backend… (start go run main.go)"}
    </div>
  );
}
