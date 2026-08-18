import { TradernetApiClient } from '../src'

describe('TradernetApiClient', () => {
  it('creates a client with custom config', () => {
    const client = new TradernetApiClient({
      apiKey: 'testApiKey',
      apiSecret: 'testApiSecret',
      baseUrl: 'https://custom.api.com',
      timeout: 10000,
    })

    expect(client).toBeInstanceOf(TradernetApiClient)
  })
})
