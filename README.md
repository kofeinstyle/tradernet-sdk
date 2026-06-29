
![alt text](https://github.com/kofeinstyle/tradernet-sdk/blob/main/logo_tradernet.png?raw=true)

# Tradernet SDK

A TypeScript/JavaScript client library for the Tradernet trading platform API.

[![Publish Package to npmjs](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/publish.yml/badge.svg)](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/@kofeinstyle/tradernet-sdk.svg)](https://www.npmjs.com/package/@kofeinstyle/tradernet-sdk)

### Tradernet Docs - https://tradernet.com/tradernet-api/instruments

## Features

- 💼 **Broker Reports** - Trades, corporate actions, cash flows, commissions, and related report data
- 📝 **User Cash Flows** - Cash flow data with filters and pagination
- 📝 **TypeScript** - Typed public methods and response shapes for supported endpoints
- 🧪 **Tested** - Jest coverage for current client behavior
- 🔄 **Retry Logic** - Retry support for network errors, timeouts, HTTP 429, and HTTP 5xx responses
- 📦 **Lightweight** - No runtime dependencies

## Installation

```bash
npm install @kofeinstyle/tradernet-sdk
```

## Quick Start

```javascript
import { TradernetApiClient } from '@kofeinstyle/tradernet-sdk'

// Initialize client
const client = new TradernetApiClient({
  apiKey: 'testApiKey',
  apiSecret: 'testApiSecret',
})
```

#### Get a dividends report

```javascript
import { CorporateActionTypes } from '@kofeinstyle/tradernet-sdk'

const apiResult = await client.getBrokerReport({ dateFrom: '2025-01-01', dateTo: '2025-12-31' }, 'corporate_actions')

if (apiResult.success) {
  const dividends = apiResult.data.report.detailed.filter(item => item.type_id === CorporateActionTypes.DIVIDEND)
  console.log('Dividends:', dividends)
} else {
  console.error('Error:', apiResult.error, apiResult.message)
}
```

#### Get user cash flow data

```javascript
const filters = [{ field: 'type_code', operator: 'eq', value: 'dividend' }]
const result = await client.getUserCashFlows({ take: 100, skip: 0, filters })

if (result.success) {
  console.log('Cashflow data:', result.data.cashflow)
} else {
  console.error('Error:', result.error, result.message)
}
```

## API Methods

### Reports

- `getBrokerReport(dateRange, type)` - Gets a broker report by date range and report type, such as `trades` or `corporate_actions`.
- `getUserCashFlows(params)` - Gets user cash flow records with optional pagination, sorting, and filters.

## Error Handling

All API methods return an ApiResponse object with success/error information:

```javascript
const result = await client.getBrokerReport({ dateFrom: '2025-01-01', dateTo: '2025-12-31' }, 'trades')

if (result.success) {
  console.log('Report data:', result.data)
} else {
  console.error('Error:', result.error, result.message)
}
```

## Configuration

### TradernetConfig
- `apiKey` - Tradernet public API key.
- `apiSecret` - Tradernet API secret used to sign requests.
- `baseUrl` - API base URL (default: 'https://tradernet.com/api')
- `timeout` - Request timeout in milliseconds (default: 60000)
- `retries` - Number of retry attempts (default: 3)
- `verbose` - Enables SDK debug logs when set to `true`

## Roadmap

Market data, portfolio, and WebSocket APIs are planned for future versions. They are not part of the current public API.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build TypeScript
npm run build

# Build in watch mode
npm run build:watch

```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the maintainers.

---

**Note:** This SDK is designed to work with the Tradernet trading platform. Make sure you have valid API credentials and understand the risks involved in automated trading.
