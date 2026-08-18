# Portfolio Snapshot

Use `getPortfolio()` to retrieve the current account balances and open positions through the signed Tradernet API v2 transport. The method is read-only and does not require parameters.

```ts
const result = await tradernet.getPortfolio()

if (!result.success) {
  throw new Error(result.message ?? result.error)
}

for (const position of result.data.positions) {
  console.log(position.i, position.q, position.curr, position.mkt_price, position.market_value)
}
```

## Response

`PortfolioResponse` is an `ApiResponse<PortfolioSnapshot>`. A successful snapshot contains:

```ts
type PortfolioSnapshot = {
  loaded: boolean
  accounts: PortfolioAccount[]
  positions: PortfolioPosition[]
}
```

The SDK removes the internal Tradernet response envelope and does not expose its internal key.

## Account Rows

Important `PortfolioAccount` fields include:

| Field          | Type           | Description                                                                                       |
| -------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| `curr`         | `FiatCurrency` | Account currency.                                                                                 |
| `currval`      | `number`       | Tradernet account currency exchange-rate coefficient; reference and direction are not documented. |
| `s`            | `number`       | Available funds.                                                                                  |
| `forecast_in`  | `number`       | Forecast incoming funds.                                                                          |
| `forecast_out` | `number`       | Forecast outgoing funds.                                                                          |

## Position Rows

Important `PortfolioPosition` fields include:

| Field          | Type             | Description                                                                            |
| -------------- | ---------------- | -------------------------------------------------------------------------------------- |
| `acc_pos_id`   | `number`         | Tradernet position identifier.                                                         |
| `i`            | `string`         | Security ticker.                                                                       |
| `q`            | `number`         | Position quantity.                                                                     |
| `curr`         | `FiatCurrency`   | Position currency.                                                                     |
| `currval`      | `number`         | Tradernet position conversion coefficient; reference and direction are not documented. |
| `mkt_price`    | `number`         | Current market price.                                                                  |
| `market_value` | `number`         | Current position market value.                                                         |
| `bal_price_a`  | `number \| null` | Book price when supplied.                                                              |
| `profit_price` | `number \| null` | Current position profit.                                                               |

Tradernet may return numeric values as either JSON numbers or numeric strings. The SDK normalizes documented numeric fields to numbers without mutating the raw HTTP response. Optional fields can be absent or `null`.

`getUserProfile()` exposes Tradernet's `homeCurrency` and `main_curr`, but the API does not document how either relates to `currval`. Do not use `currval` alone for conversions where the currency pair direction must be explicit.

When Tradernet supplies empty account or position arrays, the SDK returns empty `accounts` or `positions` arrays. Unexpected envelopes or invalid required row fields produce an `ApiErrorResponse` with `error: 'Invalid API response'`.
