import type {
  CashFlowItem,
  CorporateActionsItem,
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
  verbose?: boolean
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T | null
  error?: string
  errorObject?: Error | null
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
  time_period: string | null
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

export type ReportQueryFilter = {
  dateFrom: string
  dateTo: string
  timePeriod?: '23:59:59' | '08:40:00' | null
}

export type UnknownRecord = Record<string, unknown>
export type CashTotal = UnknownRecord
export type ReportProjectedTotal = UnknownRecord
export type ReportTotal = Record<string, number>
export type UntypedReportItem = UnknownRecord
export type AccountAtEndItem = UntypedReportItem
export type CommissionItem = UntypedReportItem
export type CashFlowReportItem = UntypedReportItem
export type SecuritiesFlowItem = UntypedReportItem

export type CashFlowResponse = {
  total: number
  cashflow: CashFlowItem[]
  cash_totals?: CashTotal[]
  limits?: Record<string, { minimum: number; maximum: number; multiplicity: number; blockchain?: number }>
}

export type ReportResponse<T> = {
  report: {
    detailed: T[]
    total: ReportTotal
    securities?: Record<string, number>
    prtotal?: ReportProjectedTotal[]
  }
}

export type ReportResponseShort<T> = {
  report: {
    detailed: T[]
    total: ReportTotal
  }
}

type ReportQueryResultMap = {
  trades: ReportResponse<TradeItem>
  corporate_actions: ReportResponseShort<CorporateActionsItem>
  account_at_end: ReportResponse<AccountAtEndItem>
  commissions: ReportResponse<CommissionItem>
  cash_flows: ReportResponse<CashFlowReportItem>
  securities_flows: ReportResponse<SecuritiesFlowItem>
}

export type ReportQueryResult<T extends ReportQueryType> = ReportQueryResultMap[T]

export type BrokerReportResponse<T extends ReportQueryType> = ApiResponse<ReportQueryResult<T>>
export type UserCashFlowResponse = ApiResponse<CashFlowResponse>
