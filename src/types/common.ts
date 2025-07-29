import { Instruments, Operations } from '../enums'

export type TradeOperation = (typeof Operations)[keyof typeof Operations]
export type Instrument = (typeof Instruments)[keyof typeof Instruments]
export type FiatCurrency = 'USD' | 'EUR'

// Market data types
export interface Ticker {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  close: number
  timestamp: number
}

export interface Quote {
  symbol: string
  bid: number
  ask: number
  bidSize: number
  askSize: number
  timestamp: number
}

export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Order types
export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  PARTIALLY_FILLED = 'partially_filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export interface Order {
  id: string
  symbol: string
  type: OrderType
  side: OrderSide
  quantity: number
  price?: number
  stopPrice?: number
  status: OrderStatus
  filledQuantity: number
  remainingQuantity: number
  createdAt: number
  updatedAt: number
}

export interface CreateOrderRequest {
  symbol: string
  type: OrderType
  side: OrderSide
  quantity: number
  price?: number
  stopPrice?: number
}

// Portfolio types
export interface Position {
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  unrealizedPnL: number
  realizedPnL: number
  side: 'long' | 'short'
}

export interface Portfolio {
  totalValue: number
  availableCash: number
  usedMargin: number
  freeMargin: number
  positions: Position[]
  totalPnL: number
  dayPnL: number
}

// WebSocket types
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export interface SubscriptionRequest {
  type: 'subscribe' | 'unsubscribe'
  channels: string[]
  symbols?: string[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Event types
export interface MarketDataEvent {
  type: 'ticker' | 'quote' | 'trade'
  symbol: string
  data: Ticker | Quote | any
}

export interface OrderEvent {
  type: 'order_update'
  order: Order
}

export interface PortfolioEvent {
  type: 'portfolio_update'
  portfolio: Portfolio
}

export type TradernetEvent = MarketDataEvent | OrderEvent | PortfolioEvent
