const rawUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Strip trailing slash
export const API_URL = rawUrl.replace(/\/$/, "");

// Derive WebSocket URL: https → wss, http → ws
export const WS_URL = API_URL.replace(/^https/, "wss").replace(/^http/, "ws") + "/ws";
