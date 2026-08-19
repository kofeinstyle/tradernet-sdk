import { TradernetApiClient } from '../src'
import ordersHistoryFixture from './fixtures/get-orders-history.json'

global.fetch = jest.fn()

describe('Orders history', () => {
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

  it('returns normalized history without account identifiers or raw trade details', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => structuredClone(ordersHistoryFixture),
    })

    const result = await client.getOrdersHistory({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message ?? result.error)
    }

    expect(result.data.orders).toHaveLength(1)
    expect(result.data.orders[0]).toMatchObject({
      id: 123456789,
      stat: 21,
      instr: 'AAPL.US',
      leaves_qty: 0,
      trade: [
        {
          id: 987654321,
          p: 190.4,
          q: 5,
          v: 952,
          fv: 100,
        },
      ],
    })
    expect(result.data.orders[0]).not.toHaveProperty('login')
    expect(result.data.orders[0]).not.toHaveProperty('auth_login')
    expect(result.data.orders[0]).not.toHaveProperty('owner_login')
    expect(result.data.orders[0]).not.toHaveProperty('creator_login')
    expect(result.data.orders[0]).not.toHaveProperty('temp_order_id')
    expect(result.data.orders[0].trade?.[0]).not.toHaveProperty('details')
    expect(ordersHistoryFixture.orders.order[0].trade[0].p).toBe('190.40')
  })

  it('requests the complete date range when dates omit time', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orders: {} }),
    })

    await client.getOrdersHistory({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('cmd=getOrdersHistory')
    expect(requestOptions.body).toContain('params[from]=2026-01-01T00%3A00%3A00')
    expect(requestOptions.body).toContain('params[till]=2026-01-31T23%3A59%3A59')
  })

  it('preserves explicit timestamps', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orders: {} }),
    })

    await client.getOrdersHistory({
      dateFrom: '2026-01-01T08:40:00',
      dateTo: '2026-01-31T12:30:00',
    })

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('params[from]=2026-01-01T08%3A40%3A00')
    expect(requestOptions.body).toContain('params[till]=2026-01-31T12%3A30%3A00')
  })

  it('accepts a missing order property as empty history', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orders: {} }),
    })

    const result = await client.getOrdersHistory({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })

    expect(result).toEqual({ success: true, data: { orders: [] } })
  })

  it('rejects a missing history envelope', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const result = await client.getOrdersHistory({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Missing orders data for getOrdersHistory')
  })

  it('rejects a non-array history order property', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orders: { order: {} } }),
    })

    const result = await client.getOrdersHistory({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('orders.order must be an array for getOrdersHistory')
  })

  it('rejects malformed historical trades', async () => {
    const order = structuredClone(ordersHistoryFixture.orders.order[0])
    order.trade[0].q = 'not-a-number' as unknown as number
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orders: { order: [order] } }),
    })

    const result = await client.getOrdersHistory({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Invalid historical order at index 0')
  })

  it('returns Tradernet API errors without history data', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'Access denied', errMsg: 'Order history access denied' }),
    })

    const result = await client.getOrdersHistory({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Freedom API error')
    expect(result.message).toBe('Order history access denied')
    expect(result.data).toBeUndefined()
  })
})
