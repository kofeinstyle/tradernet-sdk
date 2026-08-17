'use strict'

import { TradernetApiClient } from '../src'
import { makeDateRange, useRealFetch } from '../src/helper'
import { HttpClient } from '../src/http'
import { normalizeCorporateActionsItem } from '../src/mappers'

// Mock fetch for testing
if (!useRealFetch()) {
  global.fetch = jest.fn()
}

const makeCorporateActionsItem = (overrides: Record<string, unknown> = {}) => ({
  ticker: 'AAPL.US',
  isin: 'US0378331005',
  corporate_action_id: '2020-01-01_35_AAPL.US_0.25',
  type_id: 'dividend',
  date: '2020-01-10',
  ex_date: '2020-01-01',
  amount: 10,
  amount_per_one: 0,
  currency: 'USD',
  external_tax: 10,
  external_tax_currency: 'USD',
  tax_amount: 1.5,
  tax_currency: 'USD',
  q_on_ex_date: '100.00000000',
  comment: 'Test comment',
  ...overrides,
})

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
    jest.restoreAllMocks()
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

    it('should use the end-of-day report period by default', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ report: { detailed: [], total: {} } }),
        })
      }

      await client.getBrokerReport({ dateFrom: '2025-01-01', dateTo: '2025-01-31' }, 'trades')

      const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
      expect(requestOptions.body).toContain('params[time_period]=23%3A59%3A59')
    })

    it('should preserve an explicit morning report period', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ report: { detailed: [], total: {} } }),
        })
      }

      await client.getBrokerReport({ dateFrom: '2025-01-01', dateTo: '2025-01-31', timePeriod: '08:40:00' }, 'trades')

      const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
      expect(requestOptions.body).toContain('params[time_period]=08%3A40%3A00')
    })

    it('should return an invalid response error when report.detailed is missing', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            report: {
              total: { USD: 100 },
            },
          }),
        })
      }

      const result = await client.getBrokerReport(makeDateRange(), 'trades')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid API response')
      expect(result.message).toBe('Missing report.detailed data for trades report')
      expect(result.data).toBeUndefined()
    })

    it('should return an invalid response error when report.detailed contains non-object items', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            report: {
              detailed: [null],
              total: { USD: 100 },
            },
          }),
        })
      }

      const result = await client.getBrokerReport(makeDateRange(), 'corporate_actions')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid API response')
      expect(result.message).toBe('report.detailed must contain objects for corporate_actions report')
      expect(result.data).toBeUndefined()
    })
  })

  describe('Get Depositary corporate_actions report', () => {
    it('should get full report', async () => {
      if (!useRealFetch()) {
        const item = makeCorporateActionsItem({ tax_amount: '-', tax_currency: '' })
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
      expect(result.data?.report.detailed[0].tax_amount).toEqual(expect.any(Number))
    })

    it('should reject incomplete corporate action items', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            report: {
              detailed: [{ currency: 'USD' }],
            },
          }),
        })
      }

      const result = await client.getBrokerReport(makeDateRange(), 'corporate_actions')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid API response')
      expect(result.message).toBe('Invalid corporate_actions item at index 0')
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

    it('should return an error response without data when cash flows request fails', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Bad request',
        })
      }

      const result = await client.getUserCashFlows()

      expect(result.success).toBe(false)
      expect(result.error).toBe('HTTP 400')
      expect(result.message).toBe('Bad request')
      expect(result.data).toBeUndefined()
    })

    it('should normalize cash flow sums without mutating the raw response item', async () => {
      if (!useRealFetch()) {
        const item = {
          id: 3301045607,
          sumRaw: '12.50',
          sum: '10.25',
        }
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            total: '1',
            cashflow: [item],
          }),
        })

        const result = await client.getUserCashFlows()

        expect(result.success).toBe(true)
        expect(result.data?.cashflow[0].sumRaw).toBe(12.5)
        expect(result.data?.cashflow[0].sum).toBe(10.25)
        expect(item.sumRaw).toBe('12.50')
        expect(item.sum).toBe('10.25')
      }
    })

    it('should send user cash flow filters as form encoded params', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            total: 0,
            cashflow: [],
          }),
        })
      }

      await client.getUserCashFlows({
        take: 100,
        skip: 0,
        filters: [{ field: 'type_code', operator: 'eq', value: 'dividend' }],
      })

      const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
      expect(requestOptions.body).toContain('params[filters][0][field]=type_code')
      expect(requestOptions.body).toContain('params[filters][0][operator]=eq')
      expect(requestOptions.body).toContain('params[filters][0][value]=dividend')
    })

    it('should send user cash flow sorting as form encoded params', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            total: 0,
            cashflow: [],
          }),
        })
      }

      await client.getUserCashFlows({
        sort: [{ field: 'date', dir: 'DESC' }],
      })

      const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
      expect(requestOptions.body).toContain('params[sort][0][field]=date')
      expect(requestOptions.body).toContain('params[sort][0][dir]=DESC')
    })

    it('should return Tradernet API errors without successful data', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            error: 'Invalid params',
            errMsg: 'Invalid cash flow filters',
          }),
        })
      }

      const result = await client.getUserCashFlows()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Freedom API error')
      expect(result.message).toBe('Invalid cash flow filters')
      expect(result.data).toBeUndefined()
    })

    it('should handle missing cashflow arrays as an empty list', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            total: 0,
          }),
        })
      }

      const result = await client.getUserCashFlows()

      expect(result.success).toBe(true)
      expect(result.data?.cashflow).toEqual([])
    })

    it('should return an invalid response error when cashflow is not an array', async () => {
      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            total: 0,
            cashflow: {},
          }),
        })
      }

      const result = await client.getUserCashFlows()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid API response')
      expect(result.message).toBe('cashflow must be an array for getUserCashFlows')
      expect(result.data).toBeUndefined()
    })
  })

  describe('Retry behavior', () => {
    beforeEach(() => {
      jest
        .spyOn(HttpClient.prototype as unknown as { delay: (ms: number) => Promise<void> }, 'delay')
        .mockResolvedValue(undefined)
    })

    it('should not retry network errors when retries is 0', async () => {
      const noRetryClient = new TradernetApiClient({
        apiKey: 'testApiKey',
        apiSecret: 'testApiSecret',
        retries: 0,
      })

      if (!useRealFetch()) {
        ;(fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network failure'))
      }

      const result = await noRetryClient.getUserCashFlows()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network failure')
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should retry retryable HTTP responses', async () => {
      const retryClient = new TradernetApiClient({
        apiKey: 'testApiKey',
        apiSecret: 'testApiSecret',
        retries: 1,
      })

      if (!useRealFetch()) {
        ;(fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'Server error',
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              success: true,
              total: 1,
              cashflow: [],
            }),
          })
      }

      const result = await retryClient.getUserCashFlows()

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should retry Tradernet request limit responses', async () => {
      const retryClient = new TradernetApiClient({
        apiKey: 'testApiKey',
        apiSecret: 'testApiSecret',
        retries: 1,
      })

      if (!useRealFetch()) {
        ;(fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              error: 'Your request limit has been exceeded. Please try again later',
              errMsg: 'Your request limit has been exceeded. Please try again later',
              code: 429,
            }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              success: true,
              total: 1,
              cashflow: [],
            }),
          })
      }

      const result = await retryClient.getUserCashFlows()

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Corporate action normalization', () => {
    it('should keep valid tax fields unchanged', () => {
      const item = makeCorporateActionsItem()

      const result = normalizeCorporateActionsItem(item)

      expect(result?.tax_amount).toBe(1.5)
      expect(result?.tax_currency).toBe('USD')
    })

    it('should normalize numeric strings and default invalid tax fields', () => {
      const result = normalizeCorporateActionsItem(
        makeCorporateActionsItem({
          amount: '10.5',
          amount_per_one: '0.25',
          external_tax: '2.5',
          currency: 'EUR',
          external_tax_currency: '',
          tax_amount: '-',
          tax_currency: '',
        })
      )

      expect(result?.amount).toBe(10.5)
      expect(result?.amount_per_one).toBe(0.25)
      expect(result?.external_tax).toBe(2.5)
      expect(result?.external_tax_currency).toBe('EUR')
      expect(result?.tax_amount).toBe(0)
      expect(result?.tax_currency).toBe('EUR')
    })

    it('should reject incomplete items', () => {
      const result = normalizeCorporateActionsItem({
        currency: 'USD',
        tax_amount: '-',
        tax_currency: '',
      })

      expect(result).toBeNull()
    })

    it('should allow items without comments', () => {
      const result = normalizeCorporateActionsItem(makeCorporateActionsItem({ comment: undefined }))

      expect(result).not.toBeNull()
      expect(result?.comment).toBeUndefined()
    })
  })
})
