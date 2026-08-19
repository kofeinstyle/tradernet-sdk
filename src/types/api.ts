import type { CorporateActionsItem, TradeItem } from './broker-reports'
import type { CashFlowItem } from './cash-flows'
import type { FilterOperator } from './common'
import type { OrdersSnapshot } from './orders'
import type { PortfolioSnapshot } from './portfolio'
import type { UserProfile } from './user-profile'

export type ApiCommand =
  | 'getBrokerReport'
  | 'getUserCashFlows'
  | 'getPositionJson'
  | 'getNotifyOrderJson'
  | 'getOrdersHistory'
  | 'getOPQ'

export interface TradernetConfig {
  apiKey: string
  apiSecret: string
  baseUrl?: string
  timeout?: number
  retries?: number
  verbose?: boolean
}

export type ApiSuccessResponse<T> = {
  success: true
  data: T
  error?: never
  errorObject?: never
  message?: never
}

export type ApiErrorResponse = {
  success: false
  data?: never
  error: string
  errorObject?: Error | null
  message?: string
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export type ReportQueryType =
  | 'corporate_actions'
  | 'account_at_end'
  | 'commissions'
  | 'trades'
  | 'cash_flows'
  | 'securities_flows'

export type ReportTimePeriod = '23:59:59' | '08:40:00'

export type ReportQueryParams = {
  date_end: string
  date_start: string
  time_period: ReportTimePeriod
  type: ReportQueryType
}

export type UserCashFlowsField = 'date' | 'sum' | 'currency' | 'comment' | 'type_code'

export type SortDirection = 'ASC' | 'DESC'

export type SortDescriptor<TField extends string = string> = {
  field: TField
  dir: SortDirection
}

export type UserCashFlowsParamsFilter = {
  field: UserCashFlowsField
  operator: FilterOperator
  value: string
}

export type UserCashFlowsParamsSort = SortDescriptor<UserCashFlowsField>

export type UserCashFlowsParams = {
  user_id?: number | null
  without_refund?: number | null
  hide_limits?: number | null
  cash_totals?: number | null
  take?: number | null
  groupByType?: number | null
  skip?: number | null
  filters?: UserCashFlowsParamsFilter[] | null
  sort?: UserCashFlowsParamsSort[] | null
}

export type OrdersFilter = {
  activeOnly?: boolean
}

export type OrdersParams = {
  active_only: 0 | 1
}

export type OrdersHistoryFilter = {
  dateFrom: string
  dateTo: string
}

export type OrdersHistoryParams = {
  from: string
  till: string
}

export type ReportQueryFilter = {
  dateFrom: string
  dateTo: string
  timePeriod?: ReportTimePeriod
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
    total?: ReportTotal
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
export type PortfolioResponse = ApiResponse<PortfolioSnapshot>
export type OrdersResponse = ApiResponse<OrdersSnapshot>
export type OrdersHistoryResponse = ApiResponse<OrdersSnapshot>
export type UserProfileResponse = ApiResponse<UserProfile>
