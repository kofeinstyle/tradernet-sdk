![Tradernet logo](https://github.com/kofeinstyle/tradernet-sdk/blob/main/logo_tradernet.png?raw=true)

# Tradernet SDK

A typed TypeScript/JavaScript client for supported Tradernet API endpoints.

[![Publish Package to npmjs](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/publish.yml/badge.svg)](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/@kofeinstyle/tradernet-sdk.svg)](https://www.npmjs.com/package/@kofeinstyle/tradernet-sdk)

[Tradernet API documentation](https://tradernet.com/tradernet-api/)

## Features

- Typed broker reports and user cash flow requests.
- ESM and CommonJS builds with generated TypeScript declarations.
- Retries for network errors, timeouts, HTTP 429, and HTTP 5xx responses.
- Runtime validation at supported API boundaries.
- No runtime dependencies.

## Documentation

- [Getting started](docs/getting-started.md)
- [Broker reports](docs/broker-reports.md)
- [User cash flows](docs/cash-flows.md)
- [API reference](docs/api-reference.md)

## Installation

```bash
npm install @kofeinstyle/tradernet-sdk

# Bun
bun add @kofeinstyle/tradernet-sdk
```

## Quick Start

```ts
import { TradernetApiClient } from '@kofeinstyle/tradernet-sdk'

const client = new TradernetApiClient({
  apiKey: process.env.TRADERNET_API_KEY!,
  apiSecret: process.env.TRADERNET_API_SECRET!,
})
```

## Broker Reports

`getBrokerReport()` returns the selected report block. The default report cut-off is `23:59:59`; pass `08:40:00` explicitly when an opening-of-day cut is required.

```ts
const result = await client.getBrokerReport({ dateFrom: '2025-01-01', dateTo: '2025-12-31' }, 'trades')

if (result.success) {
  console.log(result.data.report.detailed)
} else {
  console.error(result.error, result.message)
}
```

### Dividends from corporate actions

Corporate actions contain broker-report dividend records, including tax and ex-date fields.

```ts
import { CorporateActionTypes } from '@kofeinstyle/tradernet-sdk'

const result = await client.getBrokerReport({ dateFrom: '2025-01-01', dateTo: '2025-12-31' }, 'corporate_actions')

if (result.success) {
  const dividends = result.data.report.detailed.filter(item => item.type_id === CorporateActionTypes.DIVIDEND)
  console.log(dividends)
}
```

## User Cash Flows

Cash flow dividend entries are account ledger operations. They are not the same records as corporate actions and have a different shape.

```ts
const result = await client.getUserCashFlows({
  take: 100,
  skip: 0,
  filters: [{ field: 'type_code', operator: 'eq', value: 'dividend' }],
  sort: [{ field: 'date', dir: 'DESC' }],
})

if (result.success) {
  console.log(result.data.cashflow)
} else {
  console.error(result.error, result.message)
}
```

Filtering and sorting support `date`, `sum`, `currency`, `comment`, and `type_code`. Sort directions are `ASC` and `DESC`.

## Error Handling

Methods return a discriminated `ApiResponse<T>` and do not throw for HTTP or Tradernet API errors. Checking `success` narrows the result to either data or error fields.

```ts
const result = await client.getUserCashFlows()

if (!result.success) {
  console.error(result.error, result.message, result.errorObject)
  return
}

console.log(result.data.cashflow)
```

## Configuration

`TradernetConfig` supports:

- `apiKey` and `apiSecret` - required API credentials.
- `baseUrl` - API base URL; defaults to `https://tradernet.com/api`.
- `timeout` - request timeout in milliseconds; defaults to `60000`.
- `retries` - retry count; defaults to `3`. Set `0` to disable retries.
- `verbose` - logs request and retry details when `true`.

The current HTTP transport targets Tradernet API v2. API v3 and WebSocket support are not part of the public package API yet.

## Development

```bash
npm install
npm run verify
npm run test:watch
npm run test:coverage
```

See [AGENTS.md](AGENTS.md) for repository and release conventions.

## License

MIT. Do not commit API credentials or use production credentials in unit tests.
