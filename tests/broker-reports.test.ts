import { TradernetApiClient } from '../src'
import { makeDateRange } from '../src/helper'

global.fetch = jest.fn()

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

describe('getBrokerReport', () => {
  let client: TradernetApiClient

  beforeEach(() => {
    client = new TradernetApiClient({
      apiKey: 'your_test_api_key',
      apiSecret: 'your_test_api_secret',
      timeout: 5000,
      retries: 0,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('gets reports by date range', async () => {
    const mockBrokerTrades = {
      success: true,
      report: {
        detailed: [],
        securities: { 'AAPL.US': 100 },
        prtotal: [],
        total: { USD: 100 },
      },
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrokerTrades,
    })

    const result = await client.getBrokerReport(makeDateRange(), 'trades')

    expect(result.error).toBeUndefined()
    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual(expect.anything())
    expect(result.data).toHaveProperty('report.securities')
    expect(result.data).toHaveProperty('report.total')
    expect(result.data).toHaveProperty('report.detailed')
    expect(result.data).toHaveProperty('report.prtotal')
  })

  it('uses the end-of-day report period by default', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: { detailed: [], total: {} } }),
    })

    await client.getBrokerReport({ dateFrom: '2025-01-01', dateTo: '2025-01-31' }, 'trades')

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('params[time_period]=23%3A59%3A59')
  })

  it('preserves an explicit morning report period', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: { detailed: [], total: {} } }),
    })

    await client.getBrokerReport({ dateFrom: '2025-01-01', dateTo: '2025-01-31', timePeriod: '08:40:00' }, 'trades')

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('params[time_period]=08%3A40%3A00')
  })

  it('returns an invalid response error when report.detailed is missing', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        report: { total: { USD: 100 } },
      }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'trades')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Missing report.detailed data for trades report')
    expect(result.data).toBeUndefined()
  })

  it('returns an invalid response error when report.detailed contains non-object items', async () => {
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

    const result = await client.getBrokerReport(makeDateRange(), 'corporate_actions')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('report.detailed must contain objects for corporate_actions report')
    expect(result.data).toBeUndefined()
  })

  it('gets a complete corporate actions report', async () => {
    const item = makeCorporateActionsItem({ tax_amount: '-', tax_currency: '' })
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        report: { detailed: [item] },
      }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'corporate_actions')

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

  it('rejects incomplete corporate action items', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        report: { detailed: [{ currency: 'USD' }] },
      }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'corporate_actions')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Invalid corporate_actions item at index 0')
  })
})
