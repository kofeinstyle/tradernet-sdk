![Tradernet logo](https://github.com/kofeinstyle/tradernet-sdk/blob/main/logo_tradernet.png?raw=true)

# Tradernet SDK

A typed TypeScript/JavaScript client for supported Tradernet API endpoints.

[![Publish Package to npmjs](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/publish.yml/badge.svg)](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/@kofeinstyle/tradernet-sdk.svg)](https://www.npmjs.com/package/@kofeinstyle/tradernet-sdk)

[![Context7 Docs](https://img.shields.io/badge/Context7-Docs-6C47FF)](https://context7.com/kofeinstyle/tradernet-sdk)
[![Refresh Context7 Docs](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/context7-refresh.yml/badge.svg)](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/context7-refresh.yml)

[Tradernet API documentation](https://tradernet.com/tradernet-api/)

## Features

- Typed user profile, broker reports, user cash flows, read-only portfolio snapshots, and orders.
- ESM and CommonJS builds with generated TypeScript declarations.
- Retries for network errors, timeouts, HTTP 429, and HTTP 5xx responses.
- Runtime validation at supported API boundaries.
- No runtime dependencies.

## Documentation

- [Getting started](docs/getting-started.md)
- [User profile](docs/user-profile.md)
- [Broker reports](docs/broker-reports.md)
- [User cash flows](docs/cash-flows.md)
- [Portfolio snapshots](docs/portfolio.md)
- [Orders](docs/orders.md)
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

## User Profile

`getUserProfile()` returns Tradernet's user currency metadata without exposing the complete `getOPQ` payload.

```ts
const result = await client.getUserProfile()

if (result.success) {
  console.log(result.data.homeCurrency, result.data.main_curr)
}
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

## Portfolio Snapshot

`getPortfolio()` returns current account balances and open positions. It does not require request parameters.

```ts
const result = await client.getPortfolio()

if (result.success) {
  for (const position of result.data.positions) {
    console.log(position.i, position.q, position.curr, position.market_value)
  }
} else {
  console.error(result.error, result.message)
}
```

## Orders

`getOrders()` returns active orders by default. Pass `activeOnly: false` to include non-active orders in Tradernet's current period. The method does not place, modify, or cancel orders.

```ts
const result = await client.getOrders({ activeOnly: true })

if (result.success) {
  for (const order of result.data.orders) {
    console.log(order.instr, order.q, order.leaves_qty, order.cur, order.p)
  }
} else {
  console.error(result.error, result.message)
}
```

`getOrdersHistory()` returns orders and their execution trades for an explicit period:

```ts
const history = await client.getOrdersHistory({
  dateFrom: '2026-01-01',
  dateTo: '2026-01-31',
})
```

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
npm run playground -- help
```

Jest always uses mocked HTTP responses. Use the read-only [live API playground](playground/README.md) for explicit checks with local credentials.

See [AGENTS.md](AGENTS.md) for repository and release conventions.

## License

MIT. Do not commit API credentials or use production credentials in unit tests.
