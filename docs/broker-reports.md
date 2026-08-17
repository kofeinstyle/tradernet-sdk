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

The `type` argument controls the item type returned in `report.detailed`.

| Value               | Detailed item type     |
| ------------------- | ---------------------- |
| `trades`            | `TradeItem`            |
| `corporate_actions` | `CorporateActionsItem` |
| `account_at_end`    | `AccountAtEndItem`     |
| `commissions`       | `CommissionItem`       |
| `cash_flows`        | `CashFlowReportItem`   |
| `securities_flows`  | `SecuritiesFlowItem`   |

`TradeItem` and `CorporateActionsItem` have endpoint-specific fields. The remaining report item types are currently generic records because their full response contracts have not been stabilized.

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
