'use strict'

import { TradernetApiClient } from '../src'
import { makeDateRange, useRealFetch } from '../src/helper'

// Mock fetch for testing
if (!useRealFetch()) {
  global.fetch = jest.fn()
}

describe('TradernetApiClient', () => {
  let client: TradernetApiClient

  beforeEach(() => {
    client = new TradernetApiClient({
      apiKey: process.env.API_KEY || 'your_test_api_key',
      apiSecret: process.env.API_SECRET || 'your_test_api_secret',
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
      if (!useRealFetch()) {
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
      }
      const dateRange = makeDateRange()
      const result = await client.getBrokerTrades(dateRange)

      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual(expect.anything())
      expect(result.error).toBeUndefined()
      expect(result.data).toHaveProperty('report.securities', { 'AAPL.US': 100 })
      expect(result.data).toHaveProperty('report.total', { USD: 100 })
      expect(result.data).toHaveProperty('report.detailed')
      expect(result.data).toHaveProperty('report.prtotal')
    })
  })

  describe('Get User Cash Flows report', () => {
    it('should get full report', async () => {
      if (!useRealFetch()) {
        const mockData = {
          success: true,
          total: 1,
          cashflow: [
            {
              id: 3301045607,
            },
          ],
        }
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        })
      }
      const result = await client.getUserCashFlows()

      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual(expect.anything())
      expect(result.error).toBeUndefined()
      expect(result.message).toBeUndefined()
      expect(result.data).toHaveProperty('cashflow')
      expect(result.data?.total).toBeGreaterThan(0)
    })
  })
})
