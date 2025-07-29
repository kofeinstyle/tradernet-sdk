import { TradernetApiClient } from '../src'
import { makeDateRange } from '../src/helper'

// Mock fetch for testing
global.fetch = jest.fn()

describe('TradernetApiClient', () => {
  let client: TradernetApiClient

  beforeEach(() => {
    client = new TradernetApiClient({
      apiKey: 'apiKey',
      apiSecret: 'apiSecret',
      baseUrl: 'https://api.test.tradernet.com',
      timeout: 5000,
      retries: 0,
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('Constructor', () => {
    it('should create client with custom config', () => {
      const config = {
        apiKey: 'testApiKey',
        apiSecret: 'testApiSecret',
        baseUrl: 'https://custom.api.com',
        timeout: 10000,
      }
      const customClient = new TradernetApiClient(config)
      expect(customClient).toBeInstanceOf(TradernetApiClient)
    })
  })

  describe('Broker reports', () => {
    beforeEach(async () => {})

    it('should get reports by date range', async () => {
      const mockBrokerTrades = {
        success: true,
        report: {
          detailed: [],
          securities: { 'AAPL.US': 100 },
          prtotal: [],
          total: {
            USD: 100,
          },
        },
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBrokerTrades,
      })
      const dateRange = makeDateRange()
      const result = await client.getBrokerTrades(dateRange)

      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual(expect.anything())
      expect(result.error).toBeUndefined()
      expect(result.data).toHaveProperty('report.securities', { 'AAPL.US': 100 })
      expect(result.data).toHaveProperty('report.total', { USD: 100 })
    })

    // it('should get positions', async () => {
    //   const mockPositions = [
    //     {
    //       symbol: 'AAPL',
    //       quantity: 100,
    //       averagePrice: 145.0,
    //       currentPrice: 150.0,
    //       unrealizedPnL: 500,
    //       realizedPnL: 0,
    //       side: 'long',
    //     },
    //   ]
    //
    //   ;(fetch as jest.Mock).mockResolvedValueOnce({
    //     ok: true,
    //     json: async () => mockPositions,
    //   })
    //
    //   const result = await client.getPositions()
    //   expect(result.success).toBe(true)
    //   expect(result.data).toHaveLength(1)
    //   expect(result.data?.[0].symbol).toBe('AAPL')
    // })
  })

  // describe('Authentication', () => {
  //   it('should authenticate successfully', async () => {
  //     const mockResponse = {
  //       success: true,
  //       data: {
  //         token: 'test-token',
  //         refreshToken: 'refresh-token',
  //         expiresIn: 3600,
  //       },
  //     }
  //
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => mockResponse.data,
  //     })
  //
  //     const credentials = { login: 'testuser', password: 'testpass' }
  //     const result = await client.authenticate(credentials)
  //
  //     expect(result.success).toBe(true)
  //     expect(result.data?.token).toBe('test-token')
  //     expect(client.isConnected()).toBe(true)
  //   })
  //
  //   it('should handle authentication failure', async () => {
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: false,
  //       status: 401,
  //       statusText: 'Unauthorized',
  //       json: async () => ({ error: 'Invalid credentials' }),
  //     })
  //
  //     const credentials = { login: 'invalid', password: 'invalid' }
  //     const result = await client.authenticate(credentials)
  //
  //     expect(result.success).toBe(false)
  //     expect(result.error).toBe('Invalid credentials')
  //     expect(client.isConnected()).toBe(false)
  //   })
  // })

  // describe('Market Data', () => {
  //   beforeEach(async () => {
  //     // Mock authentication
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => ({
  //         token: 'test-token',
  //       }),
  //     })
  //     await client.authenticate({ login: 'test', password: 'test' })
  //     jest.clearAllMocks()
  //   })
  //   it('should get ticker data', async () => {
  //     const mockTicker = {
  //       symbol: 'AAPL',
  //       name: 'Apple Inc.',
  //       price: 150.25,
  //       change: 2.5,
  //       changePercent: 1.69,
  //       volume: 1000000,
  //       high: 152.0,
  //       low: 148.0,
  //       open: 149.0,
  //       close: 150.25,
  //       timestamp: Date.now(),
  //     }
  //
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => mockTicker,
  //     })
  //
  //     const result = await client.getTicker('AAPL')
  //     expect(result.success).toBe(true)
  //     expect(result.data?.symbol).toBe('AAPL')
  //     expect(result.data?.price).toBe(150.25)
  //   })
  //   it('should get multiple tickers', async () => {
  //     const mockTickers = [
  //       { symbol: 'AAPL', price: 150.25 },
  //       { symbol: 'GOOGL', price: 2800.5 },
  //     ]
  //
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => mockTickers,
  //     })
  //
  //     const result = await client.getTickers(['AAPL', 'GOOGL'])
  //     expect(result.success).toBe(true)
  //     expect(result.data).toHaveLength(2)
  //   })
  //   it('should get quote data', async () => {
  //     const mockQuote = {
  //       symbol: 'AAPL',
  //       bid: 150.2,
  //       ask: 150.25,
  //       bidSize: 100,
  //       askSize: 200,
  //       timestamp: Date.now(),
  //     }
  //
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => mockQuote,
  //     })
  //
  //     const result = await client.getQuote('AAPL')
  //     expect(result.success).toBe(true)
  //     expect(result.data?.bid).toBe(150.2)
  //     expect(result.data?.ask).toBe(150.25)
  //   })
  // })

  // describe('Order Management', () => {
  // beforeEach(async () => {
  //   // Mock authentication
  //   ;(fetch as jest.Mock).mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => ({
  //       token: 'test-token',
  //     }),
  //   })
  //   await client.authenticate({ login: 'test', password: 'test' })
  //   jest.clearAllMocks()
  // })
  //
  // it('should create order successfully', async () => {
  //   const mockOrder = {
  //     id: 'order-123',
  //     symbol: 'AAPL',
  //     type: OrderType.LIMIT,
  //     side: OrderSide.BUY,
  //     quantity: 100,
  //     price: 150.0,
  //     status: 'pending',
  //     filledQuantity: 0,
  //     remainingQuantity: 100,
  //     createdAt: Date.now(),
  //     updatedAt: Date.now(),
  //   }
  //
  //   ;(fetch as jest.Mock).mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => mockOrder,
  //   })
  //
  //   const orderRequest = {
  //     symbol: 'AAPL',
  //     type: OrderType.LIMIT,
  //     side: OrderSide.BUY,
  //     quantity: 100,
  //     price: 150.0,
  //   }
  //
  //   const result = await client.createOrder(orderRequest)
  //   expect(result.success).toBe(true)
  //   expect(result.data?.id).toBe('order-123')
  //   expect(result.data?.symbol).toBe('AAPL')
  // })
  // it('should get order by id', async () => {
  //   const mockOrder = {
  //     id: 'order-123',
  //     symbol: 'AAPL',
  //     status: 'filled',
  //   }
  //
  //   ;(fetch as jest.Mock).mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => mockOrder,
  //   })
  //
  //   const result = await client.getOrder('order-123')
  //   expect(result.success).toBe(true)
  //   expect(result.data?.id).toBe('order-123')
  // })
  // it('should cancel order', async () => {
  //   const mockOrder = {
  //     id: 'order-123',
  //     status: 'cancelled',
  //   }
  //
  //   ;(fetch as jest.Mock).mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => mockOrder,
  //   })
  //
  //   const result = await client.cancelOrder('order-123')
  //   expect(result.success).toBe(true)
  //   expect(result.data?.status).toBe('cancelled')
  // })
  // })

  // describe('Portfolio', () => {
  //   beforeEach(async () => {
  //     // Mock authentication
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => ({
  //         token: 'test-token',
  //       }),
  //     })
  //     await client.authenticate({ login: 'test', password: 'test' })
  //     jest.clearAllMocks()
  //   })
  //
  //   it('should get portfolio', async () => {
  //     const mockPortfolio = {
  //       totalValue: 100000,
  //       availableCash: 50000,
  //       usedMargin: 25000,
  //       freeMargin: 25000,
  //       positions: [],
  //       totalPnL: 5000,
  //       dayPnL: 1000,
  //     }
  //
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => mockPortfolio,
  //     })
  //
  //     const result = await client.getPortfolio()
  //     expect(result.success).toBe(true)
  //     expect(result.data?.totalValue).toBe(100000)
  //   })
  //
  //   it('should get positions', async () => {
  //     const mockPositions = [
  //       {
  //         symbol: 'AAPL',
  //         quantity: 100,
  //         averagePrice: 145.0,
  //         currentPrice: 150.0,
  //         unrealizedPnL: 500,
  //         realizedPnL: 0,
  //         side: 'long',
  //       },
  //     ]
  //
  //     ;(fetch as jest.Mock).mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => mockPositions,
  //     })
  //
  //     const result = await client.getPositions()
  //     expect(result.success).toBe(true)
  //     expect(result.data).toHaveLength(1)
  //     expect(result.data?.[0].symbol).toBe('AAPL')
  //   })
  // })
  //
  // describe('Error Handling', () => {
  //   it('should throw error when not authenticated', async () => {
  //     await expect(client.getTicker('AAPL')).rejects.toThrow('Client is not authenticated')
  //   })
  //
  //   it('should handle network errors', async () => {
  //     ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
  //
  //     const credentials = { login: 'test', password: 'test' }
  //     const result = await client.authenticate(credentials)
  //
  //     expect(result.success).toBe(false)
  //     expect(result.error).toBe('Network error')
  //   })
  // })
})
