# Getting Started

`@kofeinstyle/tradernet-sdk` is a server-side TypeScript client for the supported Tradernet API v2 endpoints. It provides typed user profile data, broker reports, user cash flow requests, and read-only portfolio snapshots.

## Installation

Use npm:

```bash
npm install @kofeinstyle/tradernet-sdk
```

Or Bun:

```bash
bun add @kofeinstyle/tradernet-sdk
```

## Create a Client

Keep the API secret in a server-side environment. The SDK does not read environment variables itself, so pass the credentials when creating the client.

```ts
import { TradernetApiClient } from '@kofeinstyle/tradernet-sdk'

const apiKey = process.env.TRADERNET_API_KEY
const apiSecret = process.env.TRADERNET_API_SECRET

if (!apiKey || !apiSecret) {
  throw new Error('Tradernet credentials are not configured')
}

export const tradernet = new TradernetApiClient({
  apiKey,
  apiSecret,
})
```

Do not expose `apiSecret` in browser code, logs, or client-side environment variables.

## Handle Responses

Every public method returns a discriminated response. Check `success` before reading `data` or error fields.

```ts
const result = await tradernet.getUserCashFlows({ take: 20 })

if (!result.success) {
  console.error(result.error, result.message)
  return
}

console.log(result.data.cashflow)
```

HTTP and Tradernet API failures are returned as error responses. Network failures are also returned after configured retries are exhausted.

## Configuration

`TradernetConfig` accepts:

| Option      | Required | Default                     | Description                                                                       |
| ----------- | -------- | --------------------------- | --------------------------------------------------------------------------------- |
| `apiKey`    | Yes      | None                        | Public API key.                                                                   |
| `apiSecret` | Yes      | None                        | Secret used to sign requests.                                                     |
| `baseUrl`   | No       | `https://tradernet.com/api` | API base URL without the `/v2/cmd/...` path.                                      |
| `timeout`   | No       | `60000`                     | Request timeout in milliseconds.                                                  |
| `retries`   | No       | `3`                         | Retries for network errors, timeouts, HTTP 429, and HTTP 5xx. Use `0` to disable. |
| `verbose`   | No       | `false`                     | Logs request and retry details.                                                   |

## Supported API Surface

The client currently exposes:

- `getUserProfile()`
- `getBrokerReport(filter, type)`
- `getUserCashFlows(params?)`
- `getPortfolio()`

API v3 and WebSocket functionality are not part of the public package API.
