import { HttpClient } from './http'
import type { BrokerTradesResponse, QueryDateRange, ReportResponse, RequestParams, TradernetConfig } from './types/api'

export class TradernetApiClient {
  private httpClient: HttpClient

  constructor(config: TradernetConfig) {
    this.httpClient = new HttpClient(config)
  }

  async getBrokerTrades(dateRange: QueryDateRange, attempt: number = 1): Promise<BrokerTradesResponse> {
    const payload: RequestParams = {
      date_start: dateRange.dateFrom,
      date_end: dateRange.dateTo,
      time_period: '23:59:59',
      type: 'trades',
    }

    const result = await this.httpClient.makeRequest<ReportResponse>('getBrokerReport', payload, attempt)

    return {
      success: result.success,
      error: result.error,
      message: result.message,
      data: result.data ?? null,
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
