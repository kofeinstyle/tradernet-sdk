# Tradernet SDK

A comprehensive TypeScript/JavaScript client library for the Tradernet trading platform API.

[![Publish Package to npmjs](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/publish.yml/badge.svg)](https://github.com/kofeinstyle/tradernet-sdk/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/@kofeinstyle/tradernet-sdk.svg)](https://www.npmjs.com/package/@kofeinstyle/tradernet-sdk)

### Docs - https://tradernet.ua/tradernet-api

## Features

- 💼 **Report Data** - Data array on trades for the requested report period
- 📝 **User Cash flow** - Obtaining data on the client's cash flow
- 📊 **Market Data** - Real-time and historical market data (🔮 Coming Soon)
- 💼 **Portfolio** - Portfolio and position tracking (🔮 Coming Soon)
- 🔌 **WebSocket** - Real-time data streaming with auto-reconnection (🔮 Coming Soon)
- 📝 **TypeScript** - Full TypeScript support with comprehensive types
- 🧪 **Tested** - Comprehensive test suite with Jest
- 🔄 **Retry Logic** - Automatic retry with exponential backoff
- 📦 **Lightweight** - Zero external dependencies

## Installation

```bash
npm install @kofeinstyle/tradernet-sdk
```

## Quick Start

```javascript
import { TradernetApiClient } from '@kofeinstyle/tradernet-sdk';

// Initialize client
const client = new TradernetApiClient({
  apiKey: 'testApiKey',
  apiSecret: 'testApiSecret',
});
```

* #### Get report data
```javascript
const result = await client.getBrokerTrades({dateFrom: '2025-01-01', dateTo: '2025-21-31'});
console.log('Report data:', result.data);
```

* #### Get user cash flow data
```javascript
const filter = [{ field: 'type_code', operator: 'eq', value: 'dividend'}]
const result = await client.getUserCashFlows({take: 100, skip: 0, filter: filter});
console.log('Cashflow data:', result.data.cashflow);
```

[//]: # (## WebSocket Real-time Data &#40;to be implemented&#41;)

[//]: # ()
[//]: # (```javascript)

[//]: # (// Connect to WebSocket)

[//]: # (await client.connectWebSocket&#40;&#41;;)

[//]: # ()
[//]: # (// Subscribe to real-time data)

[//]: # (client.subscribeToTickers&#40;['AAPL', 'GOOGL', 'MSFT']&#41;;)

[//]: # (client.subscribeToOrders&#40;&#41;;)

[//]: # (client.subscribeToPortfolio&#40;&#41;;)

[//]: # ()
[//]: # (// Listen for events)

[//]: # (client.on&#40;'ticker', &#40;ticker&#41; => {)

[//]: # (  console.log&#40;`${ticker.symbol}: $${ticker.price}`&#41;;)

[//]: # (}&#41;;)

[//]: # ()
[//]: # (client.on&#40;'order', &#40;order&#41; => {)

[//]: # (  console.log&#40;`Order ${order.id} status: ${order.status}`&#41;;)

[//]: # (}&#41;;)

[//]: # ()
[//]: # (client.on&#40;'portfolio', &#40;portfolio&#41; => {)

[//]: # (  console.log&#40;`Portfolio value: $${portfolio.totalValue}`&#41;;)

[//]: # (}&#41;;)

[//]: # (```)

## API Methods

### Reports
- `getBrokerTrades(dateRange, attempt)` - Getting the broker's report by date range
- `getUserCashFlows(params)` - Getting the user's cash flow by filter. (Like tax, dividend, etc)

### Market Data (🚧 Planned for Future Versions)
- `getTicker(symbol)` - Get ticker data for a symbol
- `getTickers(symbols)` - Get ticker data for multiple symbols
- `getQuote(symbol)` - Get bid/ask quote data
- `getCandles(symbol, interval, limit)` - Get historical candle data

### Portfolio (🚧 Planned for Future Versions)
- `getPortfolio()` - Get portfolio summary
- `getPositions()` - Get all positions
- `getPosition(symbol)` - Get position for a symbol
- `getAccountInfo()` - Get account information
- `getBalance()` - Get account balance

### WebSocket (🚧 Planned for Future Versions)
- `connectWebSocket()` - Connect to real-time data stream
- `disconnectWebSocket()` - Disconnect from WebSocket
- `subscribeToTickers(symbols)` - Subscribe to ticker updates
- `subscribeToQuotes(symbols)` - Subscribe to quote updates
- `subscribeToOrders()` - Subscribe to order updates
- `subscribeToPortfolio()` - Subscribe to portfolio updates
- `unsubscribe(channels, symbols)` - Unsubscribe from channels


## Error Handling

All API methods return an ApiResponse object with success/error information:

```javascript
const result = await client.getBrokerTrades({dateFrom: '2021-01-01', dateTo: '2021-21-31'});
if (result.success) {
  console.log('Report data:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Configuration

### TradernetConfig
- `baseUrl` - API base URL (default: 'https://tradernet.com/api')
- `timeout` - Request timeout in milliseconds (default: 30000)
- `retries` - Number of retry attempts (default: 3)


## Events (🚧 Planned for Future Versions)

The client emits the following events:
- `ticker` - Real-time ticker updates
- `quote` - Real-time quote updates
- `order` - Order status updates
- `portfolio` - Portfolio updates
- `ws_connected` - WebSocket connected
- `ws_disconnected` - WebSocket disconnected
- `ws_authenticated` - WebSocket authenticated
- `error` - Error events

## WebSocketConfig (🚧 Planned for Future Versions)
- `url` - WebSocket URL (default: 'wss://ws.tradernet.com')
- `reconnectInterval` - Reconnection interval in ms (default: 5000)
- `maxReconnectAttempts` - Max reconnection attempts (default: 10)
- `pingInterval` - Ping interval in ms (default: 30000)

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
