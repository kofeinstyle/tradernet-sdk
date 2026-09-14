# Broker Reports

Use `getBrokerReport()` to request a typed section of the Tradernet broker report.
Examples assume `tradernet` is an initialized `TradernetApiClient` instance.

```ts
const result = await tradernet.getBrokerReport(
  {
    dateFrom: '2026-01-01',
    dateTo: '2026-12-31',
  },
  'trades'
)
```

Dates use `YYYY-MM-DD`. The default report cut-off is `23:59:59`; pass `timePeriod: '08:40:00'` only when an opening-of-day report is required.

## Report Types

The `type` argument controls the report structure and item type.

| Value               | Result structure / item type                                 |
| ------------------- | ------------------------------------------------------------ |
| `trades`            | `report.detailed: TradeItem[]`                               |
| `corporate_actions` | `report.detailed: CorporateActionsItem[]`                    |
| `account_at_end`    | `AccountAtEndReport` with `report.account.positions_from_ts` |
| `commissions`       | `report.detailed: CommissionItem[]`                          |
| `cash_flows`        | `report.detailed: CashFlowReportItem[]`                      |
| `securities_flows`  | `report.detailed: SecuritiesFlowItem[]`                      |

`TradeItem`, `CorporateActionsItem`, and `AccountAtEndReport` have endpoint-specific fields. Commission, cash-flow, and securities-flow items remain generic records until their response contracts are stabilized.

## Account at End

`account_at_end` returns a historical portfolio snapshot and does not contain `report.detailed`.

```ts
const result = await tradernet.getBrokerReport({ dateFrom: '2025-12-01', dateTo: '2025-12-31' }, 'account_at_end')

if (!result.success) {
  throw new Error(result.message ?? result.error)
}

const { account, date } = result.data.report
const { acc, pos } = account.positions_from_ts.ps
console.log(date, account.net_assets, acc, pos)
```

For historical snapshots, use `position.posval` as the position value; it is expected to equal `q * mkt_price`. Tradernet may return current quote values in `market_value` and `close_price`, even when the requested report date is in the past. The SDK preserves those fields unchanged.

A useful integrity check is `sum(pos[].posval) + sum(acc[].s) === account.net_assets`, allowing for normal floating-point rounding.

## Trades

```ts
import { TradeOperation } from '@kofeinstyle/tradernet-sdk'

const result = await tradernet.getBrokerReport({ dateFrom: '2026-01-01', dateTo: '2026-01-31' }, 'trades')

if (!result.success) {
  throw new Error(result.message ?? result.error)
}

const purchases = result.data.report.detailed.filter(trade => trade.operation === TradeOperation.BUY)

for (const trade of purchases) {
  console.log(trade.instr_nm, trade.q, trade.p, trade.curr_c)
}
```

## Dividends and Corporate Actions

Corporate actions contain dividend records with ex-date, quantity, gross amount, and tax fields.

```ts
import { CorporateActionTypes } from '@kofeinstyle/tradernet-sdk'

const result = await tradernet.getBrokerReport({ dateFrom: '2026-01-01', dateTo: '2026-12-31' }, 'corporate_actions')

if (!result.success) {
  throw new Error(result.message ?? result.error)
}

const dividends = result.data.report.detailed.filter(action => action.type_id === CorporateActionTypes.DIVIDEND)

for (const dividend of dividends) {
  console.log(dividend.ticker, dividend.amount, dividend.currency, dividend.tax_amount)
}
```

Numeric corporate action fields are normalized to numbers. Unknown action type and currency strings remain available even when they are not part of the SDK's known autocomplete values. `report.total` is optional for corporate action reports.

Broker-report dividends are not the same records as cash flow dividends. Use corporate actions for security-level dividend details and `getUserCashFlows()` for account ledger operations.

## Error Handling

Malformed response structures are returned as `{ success: false, error: 'Invalid API response' }`. Always narrow the response with `success` before using `report`.
