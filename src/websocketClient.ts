// // Main Tradernet SDK Client
// // import { EventEmitter } from 'events'
// import { HttpClient } from './http-client'
// import {
//   ApiResponse,
//   AuthCredentials,
//   AuthResponse,
//   Candle,
//   CreateOrderRequest,
//   Order,
//   Portfolio,
//   Position,
//   Quote,
//   Ticker,
//   // TradernetEvent,
// } from './types'
// import { TradernetConfig } from './types/api'
//
// // import { WebSocketClient, WebSocketConfig } from './websocket-client'
//
// export class TradernetApiClient extends EventEmitter {
//   private httpClient: HttpClient
//   // private wsClient?: WebSocketClient
//   // private isAuthenticated: boolean = false
//   // private authToken?: string
//   // private refreshToken?: string
//   // private wsConfig?: WebSocketConfig
//   private tokenRefreshTimer?: NodeJS.Timeout
//
//   constructor(config: TradernetConfig) {
//     super()
//     this.httpClient = new HttpClient(config)
//     // this.wsConfig = wsConfig
//   }
//
//   // Authentication methods
//   // async authenticate(credentials: AuthCredentials): Promise<ApiResponse<AuthResponse>> {
//   //   const response = await this.httpClient.post<AuthResponse>('/auth/login', credentials)
//   //
//   //   if (response.success && response.data) {
//   //     this.httpClient.setAuthToken(this.authToken)
//   //
//   //     // Set up WebSocket authentication if client exists
//   //     // if (this.wsClient) {
//   //     //   this.wsClient.setAuthToken(this.authToken)
//   //     // }
//   //
//   //     // Set up token refresh if expiration time is provided
//   //     if (response.data.expiresIn) {
//   //       this.scheduleTokenRefresh(response.data.expiresIn)
//   //     }
//   //   }
//   //
//   //   return response
//   // }
//   //
//   // async logout(): Promise<ApiResponse<void>> {
//   //   if (!this.isAuthenticated) {
//   //     return { success: false, error: 'Not authenticated' }
//   //   }
//   //
//   //   const response = await this.httpClient.post<void>('/auth/logout')
//   //
//   //   this.isAuthenticated = false
//   //   this.authToken = undefined
//   //   this.refreshToken = undefined
//   //   this.httpClient.clearAuthToken()
//   //   this.clearTokenRefreshTimer()
//   //
//   //   return response
//   // }
//
//   // private async refreshAuthToken(): Promise<boolean> {
//   //   if (!this.refreshToken) {
//   //     return false
//   //   }
//   //
//   //   const response = await this.httpClient.post<AuthResponse>('/auth/refresh', {
//   //     refreshToken: this.refreshToken,
//   //   })
//   //
//   //   if (response.success && response.data) {
//   //     this.authToken = response.data.token
//   //     this.httpClient.setAuthToken(this.authToken)
//   //
//   //     if (response.data.expiresIn) {
//   //       this.scheduleTokenRefresh(response.data.expiresIn)
//   //     }
//   //
//   //     return true
//   //   }
//   //
//   //   return false
//   // }
//
//   // private scheduleTokenRefresh(expiresIn: number): void {
//   //   // Clear any existing timer
//   //   this.clearTokenRefreshTimer()
//   //
//   //   // Refresh token 5 minutes before expiration
//   //   const refreshTime = (expiresIn - 300) * 1000
//   //   this.tokenRefreshTimer = setTimeout(() => {
//   //     this.refreshAuthToken()
//   //   }, refreshTime)
//   // }
//
//   // Market data methods
//   // async getTicker(symbol: string): Promise<ApiResponse<Ticker>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get<Ticker>(`/market/ticker/${symbol}`)
//   // }
//   //
//   // async getTickers(symbols?: string[]): Promise<ApiResponse<Ticker[]>> {
//   //   this.ensureAuthenticated()
//   //   const endpoint = symbols ? `/market/tickers?symbols=${symbols.join(',')}` : '/market/tickers'
//   //   return this.httpClient.get<Ticker[]>(endpoint)
//   // }
//   //
//   // async getQuote(symbol: string): Promise<ApiResponse<Quote>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get<Quote>(`/market/quote/${symbol}`)
//   // }
//   //
//   // async getCandles(symbol: string, interval: string = '1m', limit: number = 100): Promise<ApiResponse<Candle[]>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get<Candle[]>(`/market/candles/${symbol}?interval=${interval}&limit=${limit}`)
//   // }
//   //
//   // // Order management methods
//   // async createOrder(orderRequest: CreateOrderRequest): Promise<ApiResponse<Order>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.post<Order>('/orders', orderRequest)
//   // }
//   //
//   // async getOrder(orderId: string): Promise<ApiResponse<Order>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get<Order>(`/orders/${orderId}`)
//   // }
//   //
//   // async getOrders(symbol?: string, status?: string): Promise<ApiResponse<Order[]>> {
//   //   this.ensureAuthenticated()
//   //   let endpoint = '/orders'
//   //   const params = []
//   //
//   //   if (symbol) params.push(`symbol=${symbol}`)
//   //   if (status) params.push(`status=${status}`)
//   //
//   //   if (params.length > 0) {
//   //     endpoint += `?${params.join('&')}`
//   //   }
//   //
//   //   return this.httpClient.get<Order[]>(endpoint)
//   // }
//   //
//   // async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.delete<Order>(`/orders/${orderId}`)
//   // }
//   //
//   // async cancelAllOrders(symbol?: string): Promise<ApiResponse<Order[]>> {
//   //   this.ensureAuthenticated()
//   //   const endpoint = symbol ? `/orders/cancel-all?symbol=${symbol}` : '/orders/cancel-all'
//   //   return this.httpClient.post<Order[]>(endpoint)
//   // }
//   //
//   // // Portfolio methods
//   // async getPortfolio(): Promise<ApiResponse<Portfolio>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get<Portfolio>('/portfolio')
//   // }
//   //
//   // async getPositions(): Promise<ApiResponse<Position[]>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get<Position[]>('/portfolio/positions')
//   // }
//   //
//   // async getPosition(symbol: string): Promise<ApiResponse<Position>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get<Position>(`/portfolio/positions/${symbol}`)
//   // }
//   //
//   // // Account methods
//   // async getAccountInfo(): Promise<ApiResponse<any>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get('/account')
//   // }
//   //
//   // async getBalance(): Promise<ApiResponse<any>> {
//   //   this.ensureAuthenticated()
//   //   return this.httpClient.get('/account/balance')
//   // }
//   //
//   // // WebSocket methods
//   // async connectWebSocket(): Promise<void> {
//   //   if (!this.wsClient) {
//   //     this.wsClient = new WebSocketClient(this.wsConfig)
//   //     this.setupWebSocketEventHandlers()
//   //   }
//   //
//   //   if (this.authToken) {
//   //     this.wsClient.setAuthToken(this.authToken)
//   //   }
//   //
//   //   await this.wsClient.connect()
//   // }
//   //
//   // disconnectWebSocket(): void {
//   //   if (this.wsClient) {
//   //     this.wsClient.disconnect()
//   //   }
//   // }
//   //
//   // private setupWebSocketEventHandlers(): void {
//   //   if (!this.wsClient) return
//   //
//   //   this.wsClient.on('connected', () => {
//   //     this.emit('ws_connected')
//   //   })
//   //
//   //   this.wsClient.on('disconnected', (code: number, reason: string) => {
//   //     this.emit('ws_disconnected', code, reason)
//   //   })
//   //
//   //   this.wsClient.on('authenticated', () => {
//   //     this.emit('ws_authenticated')
//   //   })
//   //
//   //   this.wsClient.on('ticker', (ticker: Ticker) => {
//   //     this.emit('ticker', ticker)
//   //   })
//   //
//   //   this.wsClient.on('quote', (quote: Quote) => {
//   //     this.emit('quote', quote)
//   //   })
//   //
//   //   this.wsClient.on('order', (order: Order) => {
//   //     this.emit('order', order)
//   //   })
//   //
//   //   this.wsClient.on('portfolio', (portfolio: Portfolio) => {
//   //     this.emit('portfolio', portfolio)
//   //   })
//   //
//   //   this.wsClient.on('error', (error: Error) => {
//   //     this.emit('error', error)
//   //   })
//   // }
//
//   // Real-time subscription methods
//   // subscribeToTickers(symbols?: string[]): void {
//   //   if (!this.wsClient) {
//   //     throw new Error('WebSocket not connected. Call connectWebSocket() first.')
//   //   }
//   //   this.wsClient.subscribeToTickers(symbols)
//   // }
//
//   // subscribeToQuotes(symbols?: string[]): void {
//   //   if (!this.wsClient) {
//   //     throw new Error('WebSocket not connected. Call connectWebSocket() first.')
//   //   }
//   //   this.wsClient.subscribeToQuotes(symbols)
//   // }
//
//   // subscribeToOrders(): void {
//   //   if (!this.wsClient) {
//   //     throw new Error('WebSocket not connected. Call connectWebSocket() first.')
//   //   }
//   //   this.wsClient.subscribeToOrders()
//   // }
//   //
//   // subscribeToPortfolio(): void {
//   //   if (!this.wsClient) {
//   //     throw new Error('WebSocket not connected. Call connectWebSocket() first.')
//   //   }
//   //   this.wsClient.subscribeToPortfolio()
//   // }
//
//   // unsubscribe(channels: string[], symbols?: string[]): void {
//   //   if (!this.wsClient) {
//   //     throw new Error('WebSocket not connected. Call connectWebSocket() first.')
//   //   }
//   //   this.wsClient.unsubscribe(channels, symbols)
//   // }
//   //
//   // // Utility methods
//   // isConnected(): boolean {
//   //   return this.isAuthenticated
//   // }
//
//   // isWebSocketConnected(): boolean {
//   //   return this.wsClient?.isWebSocketConnected() || false
//   // }
//   //
//   // getWebSocketState(): 'disconnected' | 'connecting' | 'connected' {
//   //   return this.wsClient?.getConnectionState() || 'disconnected'
//   // }
//
//   // private ensureAuthenticated(): void {
//   //   if (!this.isAuthenticated) {
//   //     throw new Error('Client is not authenticated. Please call authenticate() first.')
//   //   }
//   // }
//
//   // Event handling
//   on(event: 'ticker', listener: (data: Ticker) => void): this
//   on(event: 'quote', listener: (data: Quote) => void): this
//   on(event: 'order', listener: (data: Order) => void): this
//   on(event: 'portfolio', listener: (data: Portfolio) => void): this
//   on(event: 'ws_connected', listener: () => void): this
//   on(event: 'ws_disconnected', listener: (code: number, reason: string) => void): this
//   on(event: 'ws_authenticated', listener: () => void): this
//   on(event: 'error', listener: (error: Error) => void): this
//   on(event: string, listener: (...args: any[]) => void): this {
//     return super.on(event, listener)
//   }
//
//   emit(event: 'ticker', data: Ticker): boolean
//   emit(event: 'quote', data: Quote): boolean
//   emit(event: 'order', data: Order): boolean
//   emit(event: 'portfolio', data: Portfolio): boolean
//   emit(event: 'ws_connected'): boolean
//   emit(event: 'ws_disconnected', code: number, reason: string): boolean
//   emit(event: 'ws_authenticated'): boolean
//   emit(event: 'error', error: Error): boolean
//   emit(event: string, ...args: any[]): boolean {
//     return super.emit(event, ...args)
//   }
// }
