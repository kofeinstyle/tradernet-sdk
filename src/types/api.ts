import type {
  CashFlowItem,
  CorporateActionsItem,
  FiatCurrency,
  FilterOperator,
  TradeItem,
  TransactionTypeCode,
} from './common'

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

export type ReportQueryType =
  | 'corporate_actions'
  | 'account_at_end'
  | 'commissions'
  | 'trades'
  | 'cash_flows'
  | 'securities_flows'

export type ReportQueryParams = {
  date_end: string
  date_start: string
  time_period: string
  type: ReportQueryType
}

export type UserCashFlowsParamsFilter = {
  field: 'type_code' | 'date' | 'currency'
  operator: FilterOperator
  value: TransactionTypeCode | string
}

export type UserCashFlowsParams = {
  user_id?: number | null
  without_refund?: number | null
  hide_limits?: number | null
  cash_totals?: number | null
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

export type CashFlowResponse = {
  total: number
  cashflow: CashFlowItem[]
  cash_totals?: any[]
  limits?: Record<string, { minimum: number; maximum: number; multiplicity: number; blockchain?: number }>
}

export type ReportResponse<T> = {
  report: {
    detailed: T[]
    total: Record<FiatCurrency, number>
    securities?: Record<string, number>
    prtotal?: any[]
  }
}

export type ReportResponseShort<T> = {
  report: {
    detailed: T[]
    total: Record<FiatCurrency, number>
  }
}

type ReportQueryResultMap = {
  trades: ReportResponse<TradeItem>
  corporate_actions: ReportResponseShort<CorporateActionsItem>
  account_at_end: any
  commissions: any
  cash_flows: any
  securities_flows: any
}

export type ReportQueryResult<T extends ReportQueryType> = ReportQueryResultMap[T]

export type BrokerReportResponse<T extends ReportQueryType> = ApiResponse<ReportQueryResult<T>>
export type UserCashFlowResponse = ApiResponse<CashFlowResponse>
