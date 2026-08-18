import type {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  BrokerReportResponse,
  CashFlowItem,
  CorporateActionTypesValue,
  FiatCurrency,
  KnownCorporateActionType,
  KnownFiatCurrency,
  KnownTransactionTypeCode,
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

  it('exports user profile types', () => {
    const profile: UserProfile = { homeCurrency: 'USD', main_curr: 'USD' }
    const response: UserProfileResponse = { success: true, data: profile }

    expect(response.data?.homeCurrency).toBe('USD')
    expect(response.data?.main_curr).toBe('USD')
  })
})
