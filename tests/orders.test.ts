import { TradernetApiClient } from '../src'
import ordersFixture from './fixtures/get-notify-order-json.json'

global.fetch = jest.fn()

describe('Orders', () => {
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

  it('returns orders without account identifiers', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => structuredClone(ordersFixture),
    })

    const result = await client.getOrders()

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message ?? result.error)
    }

    expect(result.data.orders).toHaveLength(1)
    expect(result.data.orders[0]).toMatchObject({
      id: 123456789,
      instr: 'AAPL.US',
      cur: 'USD',
      q: 5,
      leaves_qty: 3,
    })
    expect(result.data).not.toHaveProperty('key')
    expect(result.data.orders[0]).not.toHaveProperty('owner_login')
    expect(result.data.orders[0]).not.toHaveProperty('creator_login')
  })

  it('requests only active orders by default', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => structuredClone(ordersFixture),
    })

    await client.getOrders()

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('cmd=getNotifyOrderJson')
    expect(requestOptions.body).toContain('params[active_only]=1')
  })

  it('can request all available orders', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => structuredClone(ordersFixture),
    })

    await client.getOrders({ activeOnly: false })

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('params[active_only]=0')
  })

  it('normalizes numeric strings without mutating the response', async () => {
    const order: Record<string, unknown> = {
      ...ordersFixture.result.orders.order[0],
      p: '190.50',
      q: '5',
      leaves_qty: '3',
      stop: null,
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { orders: { order: [order] } } }),
    })

    const result = await client.getOrders()

    expect(result.success).toBe(true)
    expect(result.data?.orders[0].p).toBe(190.5)
    expect(result.data?.orders[0].q).toBe(5)
    expect(result.data?.orders[0].leaves_qty).toBe(3)
    expect(result.data?.orders[0].stop).toBeNull()
    expect(order.p).toBe('190.50')
  })

  it('accepts a missing order property as an empty list', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { orders: { key: '%ignored-user' } } }),
    })

    const result = await client.getOrders()

    expect(result).toEqual({ success: true, data: { orders: [] } })
  })

  it('rejects a missing orders envelope', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const result = await client.getOrders()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Missing result.orders data for getOrders')
  })

  it('rejects a non-array order property', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { orders: { order: {} } } }),
    })

    const result = await client.getOrders()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('result.orders.order must be an array for getOrders')
  })

  it('rejects invalid order rows', async () => {
    const invalidOrder = { ...ordersFixture.result.orders.order[0], leaves_qty: 'not-a-number' }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { orders: { order: [invalidOrder] } } }),
    })

    const result = await client.getOrders()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Invalid order at index 0')
  })

  it('rejects an invalid all-or-none flag', async () => {
    const invalidOrder = { ...ordersFixture.result.orders.order[0], aon: 2 }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { orders: { order: [invalidOrder] } } }),
    })

    const result = await client.getOrders()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Invalid order at index 0')
  })

  it('returns Tradernet API errors without order data', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'Access denied', errMsg: 'Orders access denied' }),
    })

    const result = await client.getOrders()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Freedom API error')
    expect(result.message).toBe('Orders access denied')
    expect(result.data).toBeUndefined()
  })
})
