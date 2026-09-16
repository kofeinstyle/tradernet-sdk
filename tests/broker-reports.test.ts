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

  it('gets an indexed cash-flows report and normalizes mixed numeric fields', async () => {
    // Shape observed live on 2026-09-16: the same field arrives as a number in one row and as a
    // numeric string in the next one, and the row order is not stable.
    const items = [
      {
        date_start: '2026-09-15 23:59:59',
        date_end: '2026-09-16 23:59:59',
        curr: 'USD',
        curr_at_start: 1655.66,
        curr_traded: 114.95,
        curr_commissioned: '0.2',
        curr_flowed: '10',
        curr_at_end: 1780.41,
      },
      {
        date_start: '2026-09-15 23:59:59',
        date_end: '2026-09-16 23:59:59',
        curr: 'EUR',
        curr_at_start: 0,
        curr_traded: -100,
        curr_commissioned: 0,
        curr_flowed: '100',
        curr_at_end: 0,
      },
    ]
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: items }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'cash_flows')

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    const [usd, eur] = result.data.report
    expect(usd.curr_commissioned).toBe(0.2)
    expect(usd.curr_flowed).toBe(10)
    expect(eur.curr_flowed).toBe(100)
    expect(eur.curr_traded).toBe(-100)
    for (const flow of result.data.report) {
      expect(flow.curr_at_start + flow.curr_flowed - flow.curr_commissioned + flow.curr_traded).toBeCloseTo(
        flow.curr_at_end,
        2
      )
    }
  })

  it('rejects a cash-flows row with an unusable amount', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        report: [
          {
            date_start: '2026-09-16 23:59:59',
            date_end: '2026-09-16 23:59:59',
            curr: 'USD',
            curr_at_start: 0,
            curr_traded: 0,
            curr_commissioned: '-',
            curr_flowed: 0,
            curr_at_end: 0,
          },
        ],
      }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'cash_flows')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Invalid cash_flows item at index 0')
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
      json: async () => ({ report: [item] }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'securities_flows')

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    expect(result.data.report).toEqual([item])
  })

  it.each(['cash_flows', 'securities_flows'] as const)('rejects a missing report array for %s', async type => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    const result = await client.getBrokerReport(makeDateRange(), type)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe(`Missing report array data for ${type} report`)
  })

  it('rejects the obsolete object-shaped cash-flows fixture', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: { '0': {} } }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'cash_flows')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Missing report array data for cash_flows report')
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

  it('normalizes numeric strings in a securities-flows report', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        report: [
          {
            date_start: '2022-01-01 23:59:59',
            date_end: '2022-12-31 23:59:59',
            ticker: 'C.US',
            isin: 'US1729674242',
            quantity_at_start: '0',
            securities_traded: '20',
            securities_flowed: 0,
            quantity_at_end: '20',
            security_price_at_start: 0,
            security_price: '45.16',
            security_currency: 'USD',
            position_value: '903.2',
            mkt_id: 30000000001,
            instr_type: '1',
            instr_kind: 1,
          },
        ],
      }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'securities_flows')

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    const [flow] = result.data.report
    expect(flow.quantity_at_end).toBe(20)
    expect(flow.security_price).toBe(45.16)
    expect(flow.position_value).toBe(903.2)
    expect(flow.instr_type).toBe(1)
    expect(flow.mkt_id).toBe('30000000001')
  })

  it('normalizes trade amounts delivered as numeric strings', async () => {
    const item = {
      id: 123456789,
      trade_id: '123456789',
      transaction_id: '987654321',
      date: '2026-09-16 15:30:00',
      short_date: '2026-09-16',
      pay_d: '2026-09-18',
      order_id: 55555555,
      operation: 'buy',
      commission: '0.35',
      commission_currency: 'USD',
      q: '10',
      p: '114.95',
      summ: '1149.5',
      instr_nm: 'ABNB.US',
      instr_type: '1',
      instr_kind: 'stock',
      issue_nb: 'US0090661010',
      curr_c: 'USD',
      broker: 'FFIN',
      isin: 'US0090661010',
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: { detailed: [item], total: { USD: '1149.5' } } }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'trades')

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    const [trade] = result.data.report.detailed
    expect(trade.id).toBe('123456789')
    expect(trade.order_id).toBe('55555555')
    expect(trade.trade_id).toBe(123456789)
    expect(trade.q).toBe(10)
    expect(trade.p).toBe(114.95)
    expect(trade.summ).toBe(1149.5)
    expect(trade.commission).toBe(0.35)
    expect(trade.instr_type).toBe(1)
    expect(result.data.report.total).toEqual({ USD: 1149.5 })
  })

  it('normalizes in-out amounts delivered as numeric strings', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        report: {
          detailed: [
            {
              date: '2026-09-16',
              account: 'trading',
              account_id: '42',
              sum: 10,
              amount: '10',
              currency: 'USD',
              type: 'Card',
              type_id: 'card',
              comment: 'Top up account',
            },
          ],
          total: {},
        },
      }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'in_outs')

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    const [inOut] = result.data.report.detailed
    expect(inOut.amount).toBe(10)
    expect(inOut.account_id).toBe(42)
    expect(inOut.sum).toBe('10')
  })

  it('normalizes numeric strings inside an account snapshot without rejecting rows', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        report: {
          date: '2025-12-31 23:59:59',
          account: {
            net_assets: '1857.2',
            positions_from_ts: {
              ps: {
                acc: [{ curr: 'USD', currval: 1, forecast_in: 0, forecast_out: 0, s: '500' }],
                pos: [
                  {
                    acc_pos_id: 1,
                    curr: 'USD',
                    currval: 1,
                    i: 'ABNB.US',
                    market_value: '1700.8',
                    mkt_price: '135.72',
                    posval: '1357.2',
                    q: '10',
                  },
                ],
              },
            },
          },
        },
      }),
    })

    const result = await client.getBrokerReport(makeDateRange(), 'account_at_end')

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message)
    }
    const { acc, pos } = result.data.report.account.positions_from_ts.ps
    expect(result.data.report.account.net_assets).toBe(1857.2)
    expect(acc[0].s).toBe(500)
    expect(pos[0].posval).toBe(1357.2)
    expect(pos[0].q).toBe(10)
    expect(pos[0].mkt_price).toBe(135.72)
  })
})
