import type { FiatCurrency, Instrument, TradeOperation } from './common'

export interface TradernetConfig {
  apiKey: string
  apiSecret: string
  baseUrl?: string
  timeout?: number
  retries?: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T | null
  error?: string
  message?: string
}

export type ApiCommand = 'getBrokerReport'

export type RequestParams = ReportQueryParams

export type ReportQueryParams = {
  date_end: string
  date_start: string
  time_period: string
  type: 'corporate_actions' | 'account_at_end' | 'commissions' | 'trades'
}

export type QueryDateRange = {
  dateFrom: string
  dateTo: string
}

export type TradeItem = {
  id: string
  trade_id: number
  transaction_id: number
  date: string
  short_date: string // '2025-01-14',
  pay_d: string // '2025-01-15',
  order_id: string
  operation: TradeOperation
  commission: number
  commission_currency: FiatCurrency
  q: number // quantity
  p: number // price
  summ: number // sum
  instr_nm: string // 'AAPL.US',
  instr_type: Instrument
  instr_kind: string
  issue_nb: string
  curr_c: FiatCurrency
  comment?: string
  broker: string
  isin: string
  das_exe_id?: string
  mkt_id?: number
  mkt_name?: string
}

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

export type ReportResponse<T = TradeItem> = {
  report: {
    detailed: T[]
    securities: Record<string, number>
    prtotal: any[]
    total: Record<FiatCurrency, number>
  }
}

export type BrokerTradesResponse = ApiResponse<ReportResponse>
