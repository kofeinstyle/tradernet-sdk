import crypto from 'crypto'
import { TradernetApiClient } from '../src'
import type { UserCashFlowsParams } from '../src'

global.fetch = jest.fn()

const apiKey = 'testApiKey'
const apiSecret = 'testApiSecret'
const nonce = 10000000

const sign = (preSignString: string): string =>
  crypto.createHmac('sha256', apiSecret).update(preSignString).digest('hex')

const getRequest = (): { body: string; signature: string } => {
  const requestOptions = (fetch as jest.Mock).mock.calls[0][1] as RequestInit
  const headers = requestOptions.headers as Record<string, string>

  return { body: String(requestOptions.body), signature: headers['X-NtApi-Sig'] }
}

describe('HttpClient request serialization', () => {
  let client: TradernetApiClient

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(nonce / 10000)
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, total: 0, cashflow: [] }),
    })
    client = new TradernetApiClient({ apiKey, apiSecret, retries: 0 })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('omits top-level null and undefined params from the body and signature', async () => {
    await client.getUserCashFlows({
      take: null,
      skip: undefined,
      filters: [{ field: 'type_code', operator: 'eq', value: 'dividend' }],
      sort: null,
    })

    const { body, signature } = getRequest()
    expect(body).toBe(
      `cmd=getUserCashFlows&params[filters][0][field]=type_code&params[filters][0][operator]=eq` +
        `&params[filters][0][value]=dividend&apiKey=${apiKey}&nonce=${nonce}`
    )
    expect(body).not.toContain('null')
    expect(body).not.toContain('undefined')
    expect(signature).toBe(
      sign(
        `apiKey=${apiKey}&cmd=getUserCashFlows&nonce=${nonce}` +
          `&params=filters=0=field=type_code&operator=eq&value=dividend`
      )
    )
  })

  it('omits nested null and undefined values from the body and signature', async () => {
    const params = {
      filters: [{ field: 'date', operator: 'eqormore', value: '2026-01-01', extra: null }],
      sort: { field: 'date', dir: 'DESC', extra: undefined },
    } as unknown as UserCashFlowsParams

    await client.getUserCashFlows(params)

    const { body, signature } = getRequest()
    expect(body).toBe(
      `cmd=getUserCashFlows&params[filters][0][field]=date&params[filters][0][operator]=eqormore` +
        `&params[filters][0][value]=2026-01-01&params[sort][field]=date&params[sort][dir]=DESC` +
        `&apiKey=${apiKey}&nonce=${nonce}`
    )
    expect(signature).toBe(
      sign(
        `apiKey=${apiKey}&cmd=getUserCashFlows&nonce=${nonce}` +
          `&params=filters=0=field=date&operator=eqormore&value=2026-01-01&sort=dir=DESC&field=date`
      )
    )
  })

  it('omits objects left without values from the body and signature', async () => {
    await client.getUserCashFlows({ take: null, sort: null })

    const { body, signature } = getRequest()
    expect(body).toBe(`cmd=getUserCashFlows&apiKey=${apiKey}&nonce=${nonce}`)
    expect(signature).toBe(sign(`apiKey=${apiKey}&cmd=getUserCashFlows&nonce=${nonce}`))
  })

  it('sends getUserCashFlows without params when called without arguments', async () => {
    await client.getUserCashFlows()

    const { body, signature } = getRequest()
    expect(body).toBe(`cmd=getUserCashFlows&apiKey=${apiKey}&nonce=${nonce}`)
    expect(body).not.toContain('take')
    expect(signature).toBe(sign(`apiKey=${apiKey}&cmd=getUserCashFlows&nonce=${nonce}`))
  })
})
