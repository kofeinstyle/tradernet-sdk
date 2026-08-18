import { TradernetApiClient } from '../src'
import portfolioFixture from './fixtures/get-position-json.json'

global.fetch = jest.fn()

describe('Portfolio snapshot', () => {
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

  it('returns a current portfolio snapshot', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => structuredClone(portfolioFixture),
    })

    const result = await client.getPortfolio()

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error(result.message ?? result.error)
    }

    expect(typeof result.data.loaded).toBe('boolean')
    expect(Array.isArray(result.data.accounts)).toBe(true)
    expect(Array.isArray(result.data.positions)).toBe(true)
    expect(result.data).not.toHaveProperty('key')
  })

  it('omits params from parameterless signed requests', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => structuredClone(portfolioFixture),
    })

    await client.getPortfolio()

    const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(requestOptions.body).toContain('cmd=getPositionJson')
    expect(requestOptions.body).not.toContain('params')
  })

  it('normalizes numeric strings and preserves optional nulls without mutating the response', async () => {
    const account: Record<string, unknown> = {
      ...portfolioFixture.result.ps.acc[0],
      s: '1000.50',
      t2_in: '.00000000',
    }
    const position: Record<string, unknown> = {
      ...portfolioFixture.result.ps.pos[0],
      q: '10.5',
      vm: '.00000000',
      Yield: null,
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          ps: {
            loaded: true,
            key: 'ignored',
            acc: [account],
            pos: [position],
          },
        },
      }),
    })

    const result = await client.getPortfolio()

    expect(result.success).toBe(true)
    expect(result.data?.accounts[0].s).toBe(1000.5)
    expect(result.data?.accounts[0].t2_in).toBe(0)
    expect(result.data?.positions[0].q).toBe(10.5)
    expect(result.data?.positions[0].vm).toBe(0)
    expect(result.data?.positions[0].Yield).toBeNull()
    expect(account.s).toBe('1000.50')
    expect(position.q).toBe('10.5')
  })

  it('accepts empty account and position arrays', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { ps: { loaded: true, key: 'ignored', acc: [], pos: [] } } }),
    })

    const result = await client.getPortfolio()

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ loaded: true, accounts: [], positions: [] })
  })

  it('rejects a missing portfolio envelope', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    const result = await client.getPortfolio()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Missing result.ps data for getPortfolio')
  })

  it('rejects invalid portfolio rows', async () => {
    const invalidPosition = {
      ...portfolioFixture.result.ps.pos[0],
      q: 'not-a-number',
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          ps: {
            loaded: true,
            key: 'ignored',
            acc: portfolioFixture.result.ps.acc,
            pos: [invalidPosition],
          },
        },
      }),
    })

    const result = await client.getPortfolio()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API response')
    expect(result.message).toBe('Invalid portfolio position at index 0')
  })

  it('returns Tradernet API errors without portfolio data', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: 'Access denied',
        errMsg: 'Portfolio access denied',
      }),
    })

    const result = await client.getPortfolio()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Freedom API error')
    expect(result.message).toBe('Portfolio access denied')
    expect(result.data).toBeUndefined()
  })
})
