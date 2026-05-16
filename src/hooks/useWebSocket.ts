"use client";

import { useEffect, useRef, useCallback } from "react";

type MessageHandler = (event: string, data: unknown) => void;

export function useWebSocket(url: string, onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!isMounted.current) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data);
        onMessageRef.current(event, data);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (!isMounted.current) return;
      reconnectRef.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [url]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
