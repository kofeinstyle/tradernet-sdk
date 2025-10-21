import type { CorporateActionTypesValue, InstrumentValue, TradeOperationValue } from '../enums'

export { CorporateActionTypesValue, InstrumentValue, TradeOperationValue }

export type FiatCurrency = 'USD' | 'EUR'

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'more'
  | 'eqormore'
  | 'eqorless'
  | 'contains'
  | 'doesnotcontain'
  | 'startswith'
  | 'endswith'
  | 'in'

export type TransactionTypeCode = 'tax' | 'dividend' | 'commission_for_trades' | 'refund' | 'card'

export type TradeItem = {
  id: string
  trade_id: number
  transaction_id: number
  date: string
  short_date: string // '2025-01-14',
  pay_d: string // '2025-01-15',
  order_id: string
  operation: TradeOperationValue
  commission: number
  commission_currency: FiatCurrency
  q: number // quantity
  p: number // price
  summ: number // sum
  instr_nm: string // 'AAPL.US',
  instr_type: InstrumentValue
  instr_kind: string
  issue_nb: string
  curr_c: FiatCurrency
  comment?: string
  broker: string
  isin: string
  das_exe_id?: string
  mkt_id?: number
  mkt_name?: string
  //   turnover: '0.00000000',
  //   profit: 0,
  //   fifo_profit: '0.00000000',
  //   repo_operation: null,
  //   office: 35,
  //   yield: null,
  //   offbalance: 0,
  //   otc: 0,
  //   is_dvp: 0,
  //   stamp_tax: null,
  //   smat: 0,
  //   forts_exchange_fee: null,
  //   trade_nb: 'das_20250114_-T13424',
  //   market: 'N',
  //   itc_trd_match_id: null,
}

export type CorporateActionsItem = {
  ticker: string
  isin: string
  corporate_action_id: string
  type_id: CorporateActionTypesValue
  date: string
  ex_date: string
  amount: number
  amount_per_one: number
  currency: FiatCurrency
  external_tax: number
  external_tax_currency: FiatCurrency
  tax_amount: number
  tax_currency: FiatCurrency
  q_on_ex_date: string
  comment: string
}

export type CashFlowItem = {
  id: number
  type_code: TransactionTypeCode | string
  date: string
  datetime: string
  currency: FiatCurrency
  comment: string
  account: string
  sum: number
  min_step: string
  icon: string
  type_code_name: string
  sumRaw: number
}

// Market data types
// export interface Ticker {
//   symbol: string
//   name: string
//   price: number
//   change: number
//   changePercent: number
//   volume: number
//   high: number
//   low: number
//   open: number
//   close: number
//   timestamp: number
// }

// export interface Quote {
//   symbol: string
//   bid: number
//   ask: number
//   bidSize: number
//   askSize: number
//   timestamp: number
// }
//
// export interface Candle {
//   timestamp: number
//   open: number
//   high: number
//   low: number
//   close: number
//   volume: number
// }

// Order types
// export enum OrderType {
//   MARKET = 'market',
//   LIMIT = 'limit',
//   STOP = 'stop',
//   STOP_LIMIT = 'stop_limit',
// }

// export enum OrderSide {
//   BUY = 'buy',
//   SELL = 'sell',
// }
//
// export enum OrderStatus {
//   PENDING = 'pending',
//   FILLED = 'filled',
//   PARTIALLY_FILLED = 'partially_filled',
//   CANCELLED = 'cancelled',
//   REJECTED = 'rejected',
// }

// export interface Order {
//   id: string
//   symbol: string
//   type: OrderType
//   side: OrderSide
//   quantity: number
//   price?: number
//   stopPrice?: number
//   status: OrderStatus
//   filledQuantity: number
//   remainingQuantity: number
//   createdAt: number
//   updatedAt: number
// }

// export interface CreateOrderRequest {
//   symbol: string
//   type: OrderType
//   side: OrderSide
//   quantity: number
//   price?: number
//   stopPrice?: number
// }

// Portfolio types
// export interface Position {
//   symbol: string
//   quantity: number
//   averagePrice: number
//   currentPrice: number
//   unrealizedPnL: number
//   realizedPnL: number
//   side: 'long' | 'short'
// }

// export interface Portfolio {
//   totalValue: number
//   availableCash: number
//   usedMargin: number
//   freeMargin: number
//   positions: Position[]
//   totalPnL: number
//   dayPnL: number
// }

// WebSocket types
// export interface WebSocketMessage {
//   type: string
//   data: any
//   timestamp: number
// }

// export interface SubscriptionRequest {
//   type: 'subscribe' | 'unsubscribe'
//   channels: string[]
//   symbols?: string[]
// }

// Event types
// export interface MarketDataEvent {
//   type: 'ticker' | 'quote' | 'trade'
//   symbol: string
//   data: Ticker | Quote | any
// }

// export interface OrderEvent {
//   type: 'order_update'
//   order: Order
// }

// export interface PortfolioEvent {
//   type: 'portfolio_update'
//   portfolio: Portfolio
// }

// export type TradernetEvent = MarketDataEvent | OrderEvent | PortfolioEvent
