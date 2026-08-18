# API Reference

All public values and types are exported from `@kofeinstyle/tradernet-sdk`.

## TradernetApiClient

```ts
import { TradernetApiClient } from '@kofeinstyle/tradernet-sdk'

const client = new TradernetApiClient({
  apiKey: process.env.TRADERNET_API_KEY!,
  apiSecret: process.env.TRADERNET_API_SECRET!,
})
```

### getBrokerReport

```ts
getBrokerReport<T extends ReportQueryType>(
  filter: ReportQueryFilter,
  type: T,
): Promise<BrokerReportResponse<T>>
```

`ReportQueryFilter` contains `dateFrom`, `dateTo`, and optional `timePeriod`. The default time period is `23:59:59`.

### getUserCashFlows

```ts
getUserCashFlows(params?: UserCashFlowsParams): Promise<UserCashFlowResponse>
```

Parameters support pagination, filtering, sorting, grouping, and Tradernet numeric flags.

## Response Types

Both methods return `ApiResponse<T>`:

```ts
type ApiSuccessResponse<T> = {
  success: true
  data: T
}

type ApiErrorResponse = {
  success: false
  error: string
  message?: string
  errorObject?: Error | null
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
```

Use the literal `success` field for TypeScript narrowing.

## Constants

```ts
import { CorporateActionTypes, Instrument, TradeOperation } from '@kofeinstyle/tradernet-sdk'
```

### CorporateActionTypes

```ts
CorporateActionTypes.DIVIDEND // 'dividend'
CorporateActionTypes.DIVIDEND_REVERTED // 'dividend_reverted'
CorporateActionTypes.SPLIT // 'split'
```

### TradeOperation

```ts
TradeOperation.BUY // 'buy'
TradeOperation.SELL // 'sell'
```

### Instrument

Known numeric instrument values include `STOCKS`, `BONDS`, `FUTURES`, `OPTIONS`, `INDICES`, `CURRENCY`, and supported repo or swap categories.

## Main Public Types

| Group          | Exported types                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Client         | `TradernetConfig`                                                                                                                                |
| Responses      | `ApiResponse`, `ApiSuccessResponse`, `ApiErrorResponse`, `CashFlowResponse`                                                                      |
| Broker reports | `BrokerReportResponse`, `ReportQueryFilter`, `ReportQueryResult`, `ReportQueryType`, `ReportTimePeriod`, `ReportResponse`, `ReportResponseShort` |
| Report items   | `TradeItem`, `CorporateActionsItem`, `AccountAtEndItem`, `CommissionItem`, `CashFlowReportItem`, `SecuritiesFlowItem`                            |
| Cash flows     | `UserCashFlowResponse`, `UserCashFlowsParams`, `UserCashFlowsParamsFilter`, `UserCashFlowsParamsSort`, `UserCashFlowsField`, `CashFlowItem`      |
| Sorting        | `SortDescriptor`, `SortDirection`, `FilterOperator`                                                                                              |
| Totals         | `CashTotal`, `ReportTotal`, `ReportProjectedTotal`                                                                                               |
| Open values    | `FiatCurrency`, `TransactionTypeCode`, `CorporateActionTypesValue`, `TradeOperationValue`, `InstrumentValue`                                     |
| Known values   | `KnownFiatCurrency`, `KnownTransactionTypeCode`, `KnownCorporateActionType`                                                                      |

## Open String Values

Tradernet can add currencies, transaction codes, or corporate action types without an SDK release. These fields therefore accept arbitrary strings while known values remain available for autocomplete.

`KnownFiatCurrency` currently contains `'USD' | 'EUR' | 'UAH'`. Use `FiatCurrency` for API data because it also accepts currency codes introduced by Tradernet after the current SDK release.

```ts
import type { FiatCurrency, KnownFiatCurrency, TransactionTypeCode } from '@kofeinstyle/tradernet-sdk'

const knownCurrency: KnownFiatCurrency = 'USD'
const newApiCurrency: FiatCurrency = 'GBP'

const knownTransaction: TransactionTypeCode = 'dividend'
const newTransaction: TransactionTypeCode = 'custom_operation'
```

Do not reject an API response only because one of these open fields contains a value not listed by the current SDK.
