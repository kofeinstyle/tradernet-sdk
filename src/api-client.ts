import { logger } from './helper'
import { HttpClient } from './http'
import { normalizeCorporateActionsItem } from './mappers'
import type {
  BrokerReportResponse,
  CashFlowResponse,
  ReportQueryFilter,
  ReportQueryParams,
  ReportQueryResult,
  ReportQueryType,
  TradernetConfig,
  UserCashFlowResponse,
  UserCashFlowsParams,
} from './types/api'

export class TradernetApiClient {
  private httpClient: HttpClient

  constructor(config: TradernetConfig) {
    this.httpClient = new HttpClient(config)
  }

  async getBrokerReport<T extends ReportQueryType>(filter: ReportQueryFilter, type: T): Promise<BrokerReportResponse<T>>

  async getBrokerReport<T extends ReportQueryType>(
    filter: ReportQueryFilter,
    type: T
  ): Promise<BrokerReportResponse<T>> {
    const payload: ReportQueryParams = {
      date_start: filter.dateFrom,
      date_end: filter.dateTo,
      time_period: 'timePeriod' in filter && filter.timePeriod ? filter.timePeriod : '08:40:00',
      type: type,
    }
    if (this.httpClient.verbose) {
      logger('getBrokerReport', payload)
    }
    const result = await this.httpClient.makeRequest<ReportQueryResult<T>>('getBrokerReport', payload, 1)

    if (
      result.success &&
      type === 'corporate_actions' &&
      result.data &&
      'report' in result.data &&
      'detailed' in result.data.report
    ) {
      result.data.report.detailed = result.data.report.detailed.map((item: object) =>
        normalizeCorporateActionsItem(item)
      )
    }

    return {
      success: result.success,
      error: result.error,
      message: result.message,
      data: result.data,
    }
  }

  async getUserCashFlows(params?: UserCashFlowsParams): Promise<UserCashFlowResponse> {
    const payload: UserCashFlowsParams = params ? { ...params } : { take: null }
    const result = await this.httpClient.makeRequest<CashFlowResponse>('getUserCashFlows', payload, 1)

    return {
      success: result.success,
      error: result.error,
      message: result.message,
      data: {
        limits: result.data?.limits,
        cash_totals: result.data?.cash_totals,
        total: Number(result.data?.total || 0),
        cashflow: result.data?.cashflow.map(item => {
          item.sumRaw = Number(item.sumRaw)
          item.sum = Number(item.sum)
          return item
        })!,
      },
    }
  }

  // Market data methods
  // async getTicker(symbol: string): Promise<ApiResponse<Ticker>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get<Ticker>(`/market/ticker/${symbol}`)
  // }
  //
  // async getTickers(symbols?: string[]): Promise<ApiResponse<Ticker[]>> {
  //   this.ensureAuthenticated()
  //   const endpoint = symbols ? `/market/tickers?symbols=${symbols.join(',')}` : '/market/tickers'
  //   return this.httpClient.get<Ticker[]>(endpoint)
  // }
  //
  // async getQuote(symbol: string): Promise<ApiResponse<Quote>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get<Quote>(`/market/quote/${symbol}`)
  // }
  //
  // async getCandles(symbol: string, interval: string = '1m', limit: number = 100): Promise<ApiResponse<Candle[]>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get<Candle[]>(`/market/candles/${symbol}?interval=${interval}&limit=${limit}`)
  // }
  //
  // // Order management methods
  // async createOrder(orderRequest: CreateOrderRequest): Promise<ApiResponse<Order>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.post<Order>('/orders', orderRequest)
  // }
  //
  // async getOrder(orderId: string): Promise<ApiResponse<Order>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get<Order>(`/orders/${orderId}`)
  // }
  //
  // async getOrders(symbol?: string, status?: string): Promise<ApiResponse<Order[]>> {
  //   this.ensureAuthenticated()
  //   let endpoint = '/orders'
  //   const params = []
  //
  //   if (symbol) params.push(`symbol=${symbol}`)
  //   if (status) params.push(`status=${status}`)
  //
  //   if (params.length > 0) {
  //     endpoint += `?${params.join('&')}`
  //   }
  //
  //   return this.httpClient.get<Order[]>(endpoint)
  // }
  //
  // async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.delete<Order>(`/orders/${orderId}`)
  // }
  //
  // async cancelAllOrders(symbol?: string): Promise<ApiResponse<Order[]>> {
  //   this.ensureAuthenticated()
  //   const endpoint = symbol ? `/orders/cancel-all?symbol=${symbol}` : '/orders/cancel-all'
  //   return this.httpClient.post<Order[]>(endpoint)
  // }
  //
  // // Portfolio methods
  // async getPortfolio(): Promise<ApiResponse<Portfolio>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get<Portfolio>('/portfolio')
  // }
  //
  // async getPositions(): Promise<ApiResponse<Position[]>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get<Position[]>('/portfolio/positions')
  // }
  //
  // async getPosition(symbol: string): Promise<ApiResponse<Position>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get<Position>(`/portfolio/positions/${symbol}`)
  // }
  //
  // // Account methods
  // async getAccountInfo(): Promise<ApiResponse<any>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get('/account')
  // }
  //
  // async getBalance(): Promise<ApiResponse<any>> {
  //   this.ensureAuthenticated()
  //   return this.httpClient.get('/account/balance')
  // }
}
