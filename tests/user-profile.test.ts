import { TradernetApiClient } from '../src'

global.fetch = jest.fn()

describe('getUserProfile', () => {
  let client: TradernetApiClient

  beforeEach(() => {
    client = new TradernetApiClient({
      apiKey: 'your_test_api_key',
      apiSecret: 'your_test_api_secret',
      retries: 0,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('returns the home currency from the getOPQ response envelope', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        OPQ: {
          homeCurrency: 'EUR',
          main_curr: 'EUR',
          ps: { key: 'not-exposed' },
          orders: { order: [] },
        },
      }),
    })

    const result = await client.getUserProfile()

    expect(result).toEqual({ success: true, data: { homeCurrency: 'EUR', main_curr: 'EUR' } })
    expect(log).not.toHaveBeenCalled()
  })

  it('accepts getOPQ inside a v2 result envelope', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { OPQ: { homeCurrency: 'UAH', main_curr: 'USD' } } }),
    })

    const result = await client.getUserProfile()

    expect(result).toEqual({ success: true, data: { homeCurrency: 'UAH', main_curr: 'USD' } })
  })

  it('accepts a direct getOPQ response', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ homeCurrency: 'USD', main_curr: 'USD' }),
    })

    const result = await client.getUserProfile()

    expect(result).toEqual({ success: true, data: { homeCurrency: 'USD', main_curr: 'USD' } })
  })

  it('omits params from the signed request', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ OPQ: { homeCurrency: 'EUR', main_curr: 'EUR' } }),
    })

    await client.getUserProfile()

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('cmd=getOPQ')
    expect(requestOptions.body).not.toContain('params')
  })

  it('rejects responses without a home currency', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { ps: {} } }),
    })

    const result = await client.getUserProfile()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Missing homeCurrency or main_curr data for getUserProfile')
  })

  it('returns Tradernet API errors without profile data', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: 'Access denied',
        errMsg: 'Profile access denied',
      }),
    })

    const result = await client.getUserProfile()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Freedom API error')
    expect(result.message).toBe('Profile access denied')
    expect(result.data).toBeUndefined()
  })
})
