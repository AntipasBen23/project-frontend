"use client";

import { useEffect, useState } from "react";

interface ConnectionBannerProps {
  connected: boolean;
}

export default function ConnectionBanner({ connected }: ConnectionBannerProps) {
  const [show, setShow] = useState(false);
  const [isReconnect, setIsReconnect] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (!connected) {
      // Only show the banner after 2s of not being connected — avoids flash on initial load
      timer = setTimeout(() => setShow(true), 2000);
    } else {
      if (show) {
        // Was showing the "connecting" banner → briefly flash "connected"
        setIsReconnect(true);
        setShow(true);
        timer = setTimeout(() => {
          setShow(false);
          setIsReconnect(false);
        }, 2500);
      }
    }

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  if (!show) return null;

  const isConnected = connected && isReconnect;

  return (
    <div
      style={{
        position: "fixed",
        top: 68,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        padding: "0.45rem 1rem",
        borderRadius: 8,
        fontSize: "0.775rem",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        animation: "fadeInSlide 0.3s ease-out",
        ...(isConnected
          ? {
              background: "rgba(0,212,170,0.1)",
              border: "1px solid rgba(0,212,170,0.25)",
              color: "#00d4aa",
            }
          : {
              background: "rgba(255,200,87,0.08)",
              border: "1px solid rgba(255,200,87,0.2)",
              color: "#ffc857",
            }),
      }}
    >
      <span style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: isConnected ? "#00d4aa" : "#ffc857",
        display: "inline-block",
        flexShrink: 0,
      }} />
      {isConnected ? "Connected to trading server" : "Connecting to trading server…"}
    </div>
  );
}
