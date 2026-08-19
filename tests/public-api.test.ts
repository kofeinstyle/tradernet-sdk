import { OrderExpirations, OrderOperations, OrderStatuses, OrderTypes } from '../src'
import type {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  BinaryFlag,
  BrokerReportResponse,
  CashFlowItem,
  CorporateActionTypesValue,
  FiatCurrency,
  KnownCorporateActionType,
  KnownFiatCurrency,
  KnownOrderExpiration,
  KnownOrderOperation,
  KnownOrderStatus,
  KnownOrderType,
  KnownTransactionTypeCode,
  Order,
  OrderExpiration,
  OrderOperation,
  OrderStatus,
  OrderTrade,
  OrderType,
  OrdersFilter,
  OrdersHistoryFilter,
  OrdersHistoryResponse,
  OrdersResponse,
  PortfolioAccount,
  PortfolioPosition,
  PortfolioResponse,
  ReportQueryType,
  SortDescriptor,
  SortDirection,
  TransactionTypeCode,
  UserCashFlowResponse,
  UserCashFlowsField,
  UserCashFlowsParams,
  UserCashFlowsParamsFilter,
  UserCashFlowsParamsSort,
  UserProfile,
  UserProfileResponse,
} from '../src'

const unwrapResponse = (response: ApiResponse<number>): number | string => {
  if (response.success) {
    return response.data
  }

  return response.error
}

const getDetailedReport = <T extends ReportQueryType>(response: BrokerReportResponse<T>) => {
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data.report.detailed
}

describe('Public API types', () => {
  it('exports cash flow request and response types', () => {
    const filter: UserCashFlowsParamsFilter = {
      field: 'type_code',
      operator: 'eq',
      value: 'dividend',
    }
    const sortField: UserCashFlowsField = 'date'
    const sort: UserCashFlowsParamsSort = { field: sortField, dir: 'DESC' }
    const params: UserCashFlowsParams = { take: 100, filters: [filter], sort: [sort] }
    const cashFlowItem = {} as CashFlowItem
    const response: UserCashFlowResponse = {
      success: true,
      data: { total: 1, cashflow: [cashFlowItem] },
    }

    expect(params.filters).toEqual([filter])
    expect(params.sort).toEqual([sort])
    expect(response.data?.cashflow).toEqual([cashFlowItem])
  })

  it('provides reusable sorting types', () => {
    type OrdersSortField = 'date' | 'status'

    const direction: SortDirection = 'ASC'
    const sort: SortDescriptor<OrdersSortField> = { field: 'status', dir: direction }

    expect(sort).toEqual({ field: 'status', dir: 'ASC' })
  })

  it('supports known and API-provided currency and transaction codes', () => {
    const knownCorporateAction: KnownCorporateActionType = 'dividend'
    const apiCorporateAction: CorporateActionTypesValue = 'merger'
    const knownCurrency: KnownFiatCurrency = 'UAH'
    const apiCurrency: FiatCurrency = 'GBP'
    const knownTypeCode: KnownTransactionTypeCode = 'dividend'
    const apiTypeCode: TransactionTypeCode = 'custom_type_code'
    const item = { type_code: apiTypeCode } satisfies Pick<CashFlowItem, 'type_code'>

    expect([knownCorporateAction, apiCorporateAction]).toEqual(['dividend', 'merger'])
    expect([knownCurrency, apiCurrency]).toEqual(['UAH', 'GBP'])
    expect([knownTypeCode, item.type_code]).toEqual(['dividend', 'custom_type_code'])
  })

  it('supports known and API-provided order statuses', () => {
    const knownStatus: KnownOrderStatus = OrderStatuses.EXECUTED
    const apiStatus: OrderStatus = 999

    expect(knownStatus).toBe(21)
    expect(apiStatus).toBe(999)
  })

  it('supports typed order operation, type, expiration, and binary flags', () => {
    const knownOperation: KnownOrderOperation = OrderOperations.BUY
    const apiOperation: OrderOperation = 999
    const knownType: KnownOrderType = OrderTypes.LIMIT
    const apiType: OrderType = 999
    const knownExpiration: KnownOrderExpiration = OrderExpirations.GOOD_TILL_CANCELED
    const apiExpiration: OrderExpiration = 999
    const allOrNone: BinaryFlag = 1

    expect([knownOperation, apiOperation]).toEqual([1, 999])
    expect([knownType, apiType]).toEqual([2, 999])
    expect([knownExpiration, apiExpiration]).toEqual([3, 999])
    expect(allOrNone).toBe(1)
  })

  it('narrows API responses by success', () => {
    const success: ApiSuccessResponse<number> = { success: true, data: 42 }
    const failure: ApiErrorResponse = { success: false, error: 'Request failed' }

    expect(unwrapResponse(success)).toBe(42)
    expect(unwrapResponse(failure)).toBe('Request failed')
  })

  it('provides report data after checking success', () => {
    const response: BrokerReportResponse<'trades'> = {
      success: true,
      data: { report: { detailed: [], total: {} } },
    }

    expect(getDetailedReport(response)).toEqual([])
  })

  it('allows corporate actions reports without totals', () => {
    const response: BrokerReportResponse<'corporate_actions'> = {
      success: true,
      data: { report: { detailed: [] } },
    }

    expect(getDetailedReport(response)).toEqual([])
  })

  it('exports portfolio snapshot types', () => {
    const account: PortfolioAccount = {
      curr: 'USD',
      currval: 1,
      forecast_in: 0,
      forecast_out: 0,
      s: 1000,
    }
    const position: PortfolioPosition = {
      acc_pos_id: 1,
      curr: 'USD',
      currval: 1,
      i: 'TEST.US',
      market_value: 1000,
      mkt_price: 100,
      q: 10,
    }
    const response: PortfolioResponse = {
      success: true,
      data: { loaded: true, accounts: [account], positions: [position] },
    }

    expect(response.data?.accounts).toEqual([account])
    expect(response.data?.positions).toEqual([position])
  })

  it('exports order types', () => {
    const filter: OrdersFilter = { activeOnly: true }
    const historyFilter: OrdersHistoryFilter = { dateFrom: '2026-01-01', dateTo: '2026-01-31' }
    const trade: OrderTrade = {
      id: 2,
      p: 190.4,
      q: 5,
      v: 952,
      date: '2026-01-15T14:30:00.250',
    }
    const order: Order = {
      id: 1,
      date: '2026-08-19T14:30:00.000',
      stat: OrderStatuses.CANCEL_PENDING,
      instr: 'AAPL.US',
      oper: OrderOperations.BUY,
      type: OrderTypes.LIMIT,
      cur: 'USD',
      p: 190.5,
      q: 5,
      leaves_qty: 3,
      aon: 0,
      exp: OrderExpirations.GOOD_TILL_CANCELED,
      trade: [trade],
    }
    const response: OrdersResponse = { success: true, data: { orders: [order] } }
    const historyResponse: OrdersHistoryResponse = response

    expect(filter.activeOnly).toBe(true)
    expect(historyFilter.dateFrom).toBe('2026-01-01')
    expect(response.data?.orders).toEqual([order])
    expect(historyResponse.data?.orders[0].trade).toEqual([trade])
  })

  it('exports user profile types', () => {
    const profile: UserProfile = { homeCurrency: 'USD', main_curr: 'USD' }
    const response: UserProfileResponse = { success: true, data: profile }

    expect(response.data?.homeCurrency).toBe('USD')
    expect(response.data?.main_curr).toBe('USD')
  })
})
