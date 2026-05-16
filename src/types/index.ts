export interface Trade {
  id: string;
  pair: string;
  side: "BUY" | "SELL";
  strategy: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  exitReason: "SIGNAL" | "STOP_LOSS" | "TAKE_PROFIT";
  status: "OPEN" | "CLOSED";
  timestamp: string;
}

export interface BotStatus {
  state: "RUNNING" | "STOPPED" | "PAUSED";
  activePair: string;
  activeStrategy: string;
  uptime: string;
  totalTrades: number;
  totalPnl: number;
  winRate: number;
}

export interface BrainLog {
  time: string;
  message: string;
  type: "buy" | "sell" | "info" | "warn";
}

export interface Balance {
  asset: string;
  free: number;
  locked: number;
}

export interface Position {
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  unrealisedPnL: number;
  stopLoss: number;
  takeProfit: number;
}

export interface PnL {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
}

export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface Indicators {
  rsi?: number;
  shortMA?: number;
  longMA?: number;
  upperBand?: number;
  midBand?: number;
  lowerBand?: number;
  fastEMA?: number;
  slowEMA?: number;
}

export interface EquityPoint {
  time: string;
  value: number;
}

export interface BacktestResult {
  totalReturn: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: EquityPoint[];
  trades: Trade[];
}

export interface BacktestConfig {
  symbol: string;
  interval: string;
  strategy: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  tradeSize: number;
  stopLoss: number;
  takeProfit: number;
  useRisk: boolean;
}

export type TabId = "live" | "backtest" | "settings";

export interface BinanceOrder {
  symbol: string;
  orderId: number;
  side: "BUY" | "SELL";
  type: string;
  status: string;
  price: number;
  origQty: number;
  executedQty: number;
  quoteQty: number;
  time: number;
}
