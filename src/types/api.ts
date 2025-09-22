import { CashFlowItem, FiatCurrency, FilterOperator, TradeItem, TransactionTypeCode } from './common'

export type { TradeItem } from './common'

export type ApiCommand = 'getBrokerReport' | 'getUserCashFlows'

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

export type ReportQueryParams = {
  date_end: string
  date_start: string
  time_period: string
  type: 'corporate_actions' | 'account_at_end' | 'commissions' | 'trades'
}

export type UserCashFlowsParamsFilter = {
  field: string
  operator: FilterOperator
  value: TransactionTypeCode | string
}
export type UserCashFlowsParams = {
  without_refund?: number | null
  take?: number | null
  groupByType?: number | null
  skip?: number | null
  filters?: UserCashFlowsParamsFilter[] | null
  sort?: [] | null
}

export type QueryDateRange = {
  dateFrom: string
  dateTo: string
}

export type ReportResponse<T = TradeItem> = {
  report: {
    detailed: T[]
    securities: Record<string, number>
    prtotal: any[]
    total: Record<FiatCurrency, number>
  }
}

export type CashFlowResponse = {
  total: number
  cashflow: CashFlowItem[]
  cash_totals?: any[]
  limits?: Record<string, { minimum: number; maximum: number; multiplicity: number; blockchain?: number }>
}

export type BrokerTradesResponse = ApiResponse<ReportResponse>
export type UserCashFlowResponse = ApiResponse<CashFlowResponse>
