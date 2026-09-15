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

  it('gets an account-at-end report without report.detailed', async () => {
    const accountAtEnd = {
      report: {
        date: '2025-12-31 23:59:59',
        account: {
          net_assets: 68507.8,
          positions_from_ts: {
            ps: {
              acc: [
                {
                  curr: 'USD',
                  currval: 1,
                  forecast_in: 0,
                  forecast_out: 0,
                  s: 500,
                },
              ],
              pos: [
                {
                  acc_pos_id: 1,
                  curr: 'USD',
                  currval: 1,
                  i: 'ABNB.US',
                  market_value: 1700.8,
                  mkt_price: 135.72,
                  posval: 1357.2,
                  q: 10,
                },
              ],
            },
          },
          repo_positions: {},
        },
      },
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => accountAtEnd,
    })

    const result = await client.getBrokerReport(
      { dateFrom: '2025-12-01', dateTo: '2025-12-31', timePeriod: '23:59:59' },
      'account_at_end'
    )

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    expect(result.data).toEqual(accountAtEnd)
    expect(result.data.report.date).toBe('2025-12-31 23:59:59')
    expect(result.data.report.account.positions_from_ts.ps.pos[0].posval).toBe(1357.2)
  })

  it('rejects an account-at-end report without a positions array', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        report: {
          date: '2025-12-31 23:59:59',
          account: {
            net_assets: 68507.8,
            positions_from_ts: { ps: { acc: [] } },
          },
        },
      }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'account_at_end')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Missing report.account data for account_at_end report')
  })

  it('gets an account-at-start report through the account snapshot validation', async () => {
    const accountAtStart = {
      report: {
        date: '2022-01-01 23:59:59',
        account: {
          net_assets: 0,
          positions_from_ts: { ps: { acc: [], pos: [] } },
          repo_positions: [],
        },
      },
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => accountAtStart,
    })

    const result = await client.getBrokerReport(makeDateRange(), 'account_at_start')

    expect(result).toEqual({ success: true, data: accountAtStart })
  })

  it('gets an indexed cash-flows report and preserves mixed numeric fields', async () => {
    const item = {
      date_start: '2022-01-01 23:59:59',
      date_end: '2022-12-31 23:59:59',
      curr: 'USD',
      curr_at_start: 0,
      curr_traded: -48000,
      curr_commissioned: '500.00',
      curr_flowed: '50000.00',
      curr_at_end: 1500,
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: { '0': item } }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'cash_flows')

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    const [cashFlow] = Object.values(result.data.report)
    expect(cashFlow).toEqual(item)
    expect(
      cashFlow.curr_at_start + Number(cashFlow.curr_flowed) - Number(cashFlow.curr_commissioned) + cashFlow.curr_traded
    ).toBeCloseTo(cashFlow.curr_at_end, 2)
  })

  it('gets an indexed securities-flows report', async () => {
    const item = {
      date_start: '2022-01-01 23:59:59',
      date_end: '2022-12-31 23:59:59',
      ticker: 'C.US',
      isin: 'US1729674242',
      quantity_at_start: 0,
      securities_traded: 20,
      securities_flowed: 0,
      quantity_at_end: 20,
      security_price_at_start: 0,
      security_price: 45.16,
      security_currency: 'USD',
      position_value: 903.2,
      mkt_id: '30000000001',
      instr_type: 1,
      instr_kind: 1,
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: { '0': item } }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'securities_flows')

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    expect(Object.values(result.data.report)).toEqual([item])
  })

  it.each(['cash_flows', 'securities_flows'] as const)('rejects a missing indexed report for %s', async type => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    const result = await client.getBrokerReport(makeDateRange(), type)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe(`Missing indexed report data for ${type} report`)
  })

  it.each(['commissions', 'in_outs', 'in_outs_securities'] as const)('accepts detailed report type %s', async type => {
    const report = { detailed: [], total: {}, totalTrading: {} }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report }),
    })

    const result = await client.getBrokerReport(makeDateRange(), type)

    expect(result).toEqual({ success: true, data: { report } })
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
