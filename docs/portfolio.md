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

Tradernet's legacy `SocketPortfolioResponseRow` documentation uses the same `acc` and `pos` row names and provides useful field descriptions. The signed API v2 response remains the source of truth: field types and semantics below reflect live responses where they differ from that legacy documentation.

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

| Field          | Type             | Description                                                                                                                                         |
| -------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `acc_pos_id`   | `number`         | Tradernet position identifier.                                                                                                                      |
| `i`            | `string`         | Security ticker.                                                                                                                                    |
| `q`            | `number`         | Position quantity.                                                                                                                                  |
| `curr`         | `FiatCurrency`   | Position currency.                                                                                                                                  |
| `currval`      | `number`         | Tradernet position conversion coefficient; reference and direction are not documented.                                                              |
| `mkt_price`    | `number`         | Current market price.                                                                                                                               |
| `market_value` | `number`         | Current position market value.                                                                                                                      |
| `bal_price_a`  | `number \| null` | Book price when supplied.                                                                                                                           |
| `accruedint_a` | `number \| null` | Accrued coupon interest when supplied.                                                                                                              |
| `fv`           | `number \| null` | Face-value coefficient used by Tradernet calculations.                                                                                              |
| `go`           | `number \| null` | Position collateral requirement.                                                                                                                    |
| `k`            | `number \| null` | Tradernet calculation coefficient; exact semantics are not documented.                                                                              |
| `vm`           | `number \| null` | Position variation margin.                                                                                                                          |
| `open_bal`     | `number \| null` | Opening book value of the position.                                                                                                                 |
| `price_a`      | `number \| null` | Book price supplied by Tradernet.                                                                                                                   |
| `close_price`  | `number \| null` | Closing price supplied by Tradernet.                                                                                                                |
| `profit_close` | `number \| null` | Position profit at the previous close according to the legacy documentation.                                                                        |
| `profit_price` | `number \| null` | Legacy documentation calls this current position profit, but live values can be price-like; do not treat it as P&L without validating the response. |

Tradernet may return numeric values as either JSON numbers or numeric strings. The SDK normalizes documented numeric fields to numbers without mutating the raw HTTP response. Optional fields can be absent or `null`.

The legacy socket documentation declares `t2_in` and `t2_out` as strings, while signed API v2 responses have been observed returning numbers. The SDK follows the live numeric representation. It also documents an optional `trade` array on socket position rows; this field is not part of `PortfolioPosition` until its signed API response shape is verified.

`getUserProfile()` exposes Tradernet's `homeCurrency` and `main_curr`, but the API does not document how either relates to `currval`. Do not use `currval` alone for conversions where the currency pair direction must be explicit.

When Tradernet supplies empty account or position arrays, the SDK returns empty `accounts` or `positions` arrays. Unexpected envelopes or invalid required row fields produce an `ApiErrorResponse` with `error: 'Invalid API response'`.
