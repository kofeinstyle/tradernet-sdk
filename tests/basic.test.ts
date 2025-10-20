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
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
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
      const result = await client.getBrokerReport(dateRange, 'trades')

      expect(result.error).toBeUndefined()
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual(expect.anything())
      expect(result.data).toHaveProperty('report.securities')
      expect(result.data).toHaveProperty('report.total')
      expect(result.data).toHaveProperty('report.detailed')
      expect(result.data).toHaveProperty('report.prtotal')
    })
  })

  describe('Get Depositary corporate_actions report', () => {
    it('should get full report', async () => {
      if (!useRealFetch()) {
        const item = {
          amount: 10,
          type_id: 'dividend',
          date: '2020-01-10',
          amount_per_one: 0,
          ticker: 'AAPL.US',
          isin: 'US0378331005',
          corporate_action_id: '2020-01-01_35_AAPL.US_0.25',
          ex_date: '2020-01-01',
          currency: 'USD',
          external_tax: 10,
          external_tax_currency: 'USD',
          tax_amount: '-',
          tax_currency: '',
          q_on_ex_date: '100.00000000',
          comment: 'Test comment',
        }
        const mockData = {
          success: true,
          report: {
            detailed: [item],
          },
        }
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        })
      }
      const dateRange = makeDateRange()
      const result = await client.getBrokerReport(dateRange, 'corporate_actions')

      expect(result.message).toBeUndefined()
      expect(result.success).toBeTruthy()
      expect(result.data).toStrictEqual(expect.anything())
      expect(result.error).toBeUndefined()
      expect(result.data).toHaveProperty('report.detailed')
      expect(result.data?.report.detailed[0]).toHaveProperty('amount')
      expect(result.data?.report.detailed[0]).toHaveProperty('tax_amount')
      expect(result.data?.report.detailed[0]).toHaveProperty('tax_currency')
      expect(result.data?.report.detailed[0].tax_amount).toEqual(0)
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
