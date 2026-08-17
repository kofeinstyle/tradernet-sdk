# User Cash Flows

Use `getUserCashFlows()` to retrieve account ledger operations such as dividends, taxes, commissions, refunds, and card transactions.
Examples assume `tradernet` is an initialized `TradernetApiClient` instance.

```ts
const result = await tradernet.getUserCashFlows({
  take: 100,
  skip: 0,
  filters: [{ field: 'type_code', operator: 'eq', value: 'dividend' }],
  sort: [{ field: 'date', dir: 'DESC' }],
})

if (!result.success) {
  throw new Error(result.message ?? result.error)
}

for (const operation of result.data.cashflow) {
  console.log(operation.date, operation.type_code, operation.sum, operation.currency)
}
```

Calling the method without parameters is also supported:

```ts
const result = await tradernet.getUserCashFlows()
```

## Pagination and Options

`UserCashFlowsParams` supports:

| Field            | Type                                  | Purpose                                 |
| ---------------- | ------------------------------------- | --------------------------------------- |
| `take`           | `number \| null`                      | Maximum number of rows.                 |
| `skip`           | `number \| null`                      | Number of rows to skip.                 |
| `user_id`        | `number \| null`                      | Account user identifier.                |
| `without_refund` | `number \| null`                      | Tradernet numeric flag for refunds.     |
| `hide_limits`    | `number \| null`                      | Tradernet numeric flag for limit data.  |
| `cash_totals`    | `number \| null`                      | Tradernet numeric flag for cash totals. |
| `groupByType`    | `number \| null`                      | Tradernet numeric grouping flag.        |
| `filters`        | `UserCashFlowsParamsFilter[] \| null` | Server-side filters.                    |
| `sort`           | `UserCashFlowsParamsSort[] \| null`   | Server-side sorting.                    |

## Filtering

Filter fields are `date`, `sum`, `currency`, `comment`, and `type_code`. Supported operators are:

```ts
type FilterOperator =
  | 'eq'
  | 'neq'
  | 'more'
  | 'eqormore'
  | 'eqorless'
  | 'contains'
  | 'doesnotcontain'
  | 'startswith'
  | 'endswith'
  | 'in'
```

Filter values are strings, including values used for numeric or date comparisons.

```ts
const result = await tradernet.getUserCashFlows({
  filters: [
    { field: 'date', operator: 'eqormore', value: '2026-01-01' },
    { field: 'currency', operator: 'eq', value: 'USD' },
  ],
})
```

## Sorting

Sorting uses an array of `{ field, dir }` descriptors. Directions are `ASC` and `DESC`.

```ts
import type { UserCashFlowsParams } from '@kofeinstyle/tradernet-sdk'

const params: UserCashFlowsParams = {
  sort: [
    { field: 'date', dir: 'DESC' },
    { field: 'sum', dir: 'ASC' },
  ],
}

const result = await tradernet.getUserCashFlows(params)
```

## Response Data

A successful response contains:

- `total`: numeric row count.
- `cashflow`: `CashFlowItem[]`; missing arrays are normalized to an empty array.
- `cash_totals`: optional cash totals returned by Tradernet.
- `limits`: optional server-provided filter limits.

The SDK normalizes `CashFlowItem.sum` and `CashFlowItem.sumRaw` to numbers. Transaction type and currency fields accept values added by Tradernet while preserving autocomplete for known values.

Cash flow dividend entries are account ledger operations. Use the `corporate_actions` broker report when ex-date, security quantity, or dividend tax details are required.
