import { TradernetApiClient } from '../src'
import { HttpClient } from '../src/http'

global.fetch = jest.fn()

describe('getUserCashFlows', () => {
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

  it('gets a complete cash flow response', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        total: 1,
        cashflow: [{ id: 3301045607 }],
      }),
    })

    const result = await client.getUserCashFlows()

    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual(expect.anything())
    expect(result.error).toBeUndefined()
    expect(result.message).toBeUndefined()
    expect(result.data).toHaveProperty('cashflow')
    expect(result.data?.total).toBeGreaterThan(0)
  })

  it('returns an error response without data when the request fails', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Bad request',
    })

    const result = await client.getUserCashFlows()

    expect(result.success).toBe(false)
    expect(result.error).toBe('HTTP 400')
    expect(result.message).toBe('Bad request')
    expect(result.data).toBeUndefined()
  })

  it('normalizes sums without mutating the raw response item', async () => {
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
  })

  it('sends filters as form encoded params', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, total: 0, cashflow: [] }),
    })

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

  it('sends sorting as form encoded params', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, total: 0, cashflow: [] }),
    })

    await client.getUserCashFlows({
      sort: [{ field: 'date', dir: 'DESC' }],
    })

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('params[sort][0][field]=date')
    expect(requestOptions.body).toContain('params[sort][0][dir]=DESC')
  })

  it('returns Tradernet API errors without successful data', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: 'Invalid params',
        errMsg: 'Invalid cash flow filters',
      }),
    })

    const result = await client.getUserCashFlows()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Freedom API error')
    expect(result.message).toBe('Invalid cash flow filters')
    expect(result.data).toBeUndefined()
  })

  it('handles missing cashflow arrays as an empty list', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, total: 0 }),
    })

    const result = await client.getUserCashFlows()

    expect(result.success).toBe(true)
    expect(result.data?.cashflow).toEqual([])
  })

  it('returns an invalid response error when cashflow is not an array', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, total: 0, cashflow: {} }),
    })

    const result = await client.getUserCashFlows()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('cashflow must be an array for getUserCashFlows')
    expect(result.data).toBeUndefined()
  })

  it('does not retry network errors when retries is 0', async () => {
    const noRetryClient = new TradernetApiClient({
      apiKey: 'testApiKey',
      apiSecret: 'testApiSecret',
      retries: 0,
    })
    ;(fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network failure'))

    const result = await noRetryClient.getUserCashFlows()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Network failure')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries retryable HTTP responses', async () => {
    jest
      .spyOn(HttpClient.prototype as unknown as { delay: (ms: number) => Promise<void> }, 'delay')
      .mockResolvedValue(undefined)
    const retryClient = new TradernetApiClient({
      apiKey: 'testApiKey',
      apiSecret: 'testApiSecret',
      retries: 1,
    })
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, total: 1, cashflow: [] }),
      })

    const result = await retryClient.getUserCashFlows()

    expect(result.success).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('retries Tradernet request limit responses', async () => {
    jest
      .spyOn(HttpClient.prototype as unknown as { delay: (ms: number) => Promise<void> }, 'delay')
      .mockResolvedValue(undefined)
    const retryClient = new TradernetApiClient({
      apiKey: 'testApiKey',
      apiSecret: 'testApiSecret',
      retries: 1,
    })
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
        json: async () => ({ success: true, total: 1, cashflow: [] }),
      })

    const result = await retryClient.getUserCashFlows()

    expect(result.success).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
