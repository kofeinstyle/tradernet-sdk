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

| Value                | Result structure / item type                                   |
| -------------------- | -------------------------------------------------------------- |
| `trades`             | `report.detailed: TradeItem[]`                                 |
| `corporate_actions`  | `report.detailed: CorporateActionsItem[]`                      |
| `account_at_start`   | `AccountAtStartReport` with `report.account.positions_from_ts` |
| `account_at_end`     | `AccountAtEndReport` with `report.account.positions_from_ts`   |
| `commissions`        | `report.detailed: CommissionItem[]`                            |
| `cash_flows`         | `report: CashFlowReportItem[]`                                 |
| `securities_flows`   | `report: SecuritiesFlowItem[]`                                 |
| `in_outs`            | `report.detailed: InOutItem[]`                                 |
| `in_outs_securities` | `report.detailed: InOutSecuritiesItem[]`                       |

`TradeItem`, `CorporateActionsItem`, account snapshots, cash-flow summaries, securities-flow summaries, and `InOutItem` have endpoint-specific fields. Commission and inbound/outbound securities items remain generic records until their contracts are stabilized.

Detailed commission reports can also include `report.totalTrading` alongside `report.total`.

## Account Snapshots

`account_at_start` and `account_at_end` return historical portfolio snapshots and do not contain `report.detailed`.

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

Documented numeric fields of the snapshot rows are normalized to numbers when Tradernet sends them as numeric strings. Snapshot rows are never rejected for a missing field: the SDK validates the report structure and leaves unknown row fields untouched.

## Cash Flow Summaries

The `cash_flows` broker report is a per-currency summary. Its `report` property is an array, not an object containing `detailed`.

```ts
const result = await tradernet.getBrokerReport({ dateFrom: '2022-01-01', dateTo: '2022-12-31' }, 'cash_flows')

if (!result.success) {
  throw new Error(result.message ?? result.error)
}

for (const flow of result.data.report) {
  const expectedEnd = flow.curr_at_start + flow.curr_flowed - flow.curr_commissioned + flow.curr_traded
  console.log(flow.curr, flow.curr_at_end, expectedEnd)
}
```

Tradernet returns each amount either as a JSON number or as a numeric string, and the representation of a single field changes between responses for the same date range. The SDK normalizes every documented amount to a number, so `curr_at_start + curr_flowed - curr_commissioned + curr_traded` equals `curr_at_end` without further conversion. A row whose amount cannot be read as a number makes the request fail with `Invalid cash_flows item at index N` instead of returning an unusable value.

Row order is not stable between responses. Match rows by `curr` rather than by position.

## Securities Flow Summaries

The `securities_flows` block has the same array container shape, with one `SecuritiesFlowItem` per ticker:

```ts
const result = await tradernet.getBrokerReport({ dateFrom: '2022-01-01', dateTo: '2022-12-31' }, 'securities_flows')

if (result.success) {
  for (const flow of result.data.report) {
    console.log(flow.ticker, flow.quantity_at_start, flow.quantity_at_end, flow.position_value)
  }
}
```

Quantities, prices, and position values are normalized to numbers, and `mkt_id` is normalized to a string. As with cash flows, row order is not stable.

## Inbound and Outbound Transfers

`in_outs` and `in_outs_securities` use the regular `report.detailed` structure. `InOutItem.type_id` provides autocomplete for observed cash values such as `bank`, `card`, `dividend`, and `tax`, while still accepting new strings returned by Tradernet. `amount` and `account_id` are normalized to numbers; `sum` stays the rendered string Tradernet puts in the report, such as `'3000 USD'`.

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

Trade quantities, prices, sums, commissions, and `instr_type` are normalized to numbers, while `id` and `order_id` are normalized to strings. Use `instr_type` with the `Instrument` constants; comparing it against a numeric constant is safe after normalization.

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

A row whose documented numeric field cannot be read as a number is reported the same way, with a message naming the block and the row index, for example `Invalid trades item at index 3`.
