# TradeBot — Next.js Dashboard

Professional real-time crypto trading dashboard connected to the Go backend.

## Stack
- Next.js 16 (App Router, React 19, Turbopack)
- TypeScript 5
- Tailwind CSS v4
- TradingView Lightweight Charts v5
- WebSocket (auto-reconnect)

## Setup

```bash
npm install
npm run dev
# Dashboard at http://localhost:3000
# Requires Go backend running on http://localhost:8080
```

## Features

### Live Trading Tab
- **Candlestick chart** — real-time candle updates, strategy overlays (MA, EMA, Bollinger Bands), SL/TP price lines
- **Live price ticker** — in navbar, colour-flashes on price movement
- **Stats panel** — animated balance, P&L, open position with unrealised P&L
- **Risk controls** — stop loss %, take profit %, max daily loss % — apply without restart
- **Trade history table** — colour-coded P&L, exit reason badges (Signal / Stop Loss / Take Profit)
- **Bot Brain log** — plain-English explanations of every bot decision, emoji-annotated, auto-scroll

### Backtest Tab
- Configure pair, strategy, date range, capital, trade size, risk params
- Live progress bar streamed from backend
- Results: Total Return, Win Rate, Total Trades, Max Drawdown, Sharpe Ratio
- Equity curve chart (TradingView)
- Full trade breakdown table

### Settings Tab
- Binance Testnet API key + secret
- Test connection button
- Default pair, strategy, trade size

## Design System

| Token | Value |
|-------|-------|
| Background | `#0A0A0A` |
| Surface | `#0F1F1C` |
| Accent | `#00D4AA` |
| Danger | `#FF4D6D` |
| Text | `#FFFFFF` / `#8A9BA8` |

Font: Inter · Radius: 12px cards, 8px inputs · Animations throughout
