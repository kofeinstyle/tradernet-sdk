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

### getUserProfile

```ts
getUserProfile(): Promise<UserProfileResponse>
```

Returns a `UserProfile` containing `homeCurrency` and the original `main_curr` field. The underlying `getOPQ` request has no parameters, and unrelated initial-user-data sections are not exposed.

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

### getPortfolio

```ts
getPortfolio(): Promise<PortfolioResponse>
```

Returns a read-only `PortfolioSnapshot` with normalized `accounts` and `positions` arrays. The request has no parameters.

## Response Types

Public methods return `ApiResponse<T>`:

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
| Responses      | `ApiResponse`, `ApiSuccessResponse`, `ApiErrorResponse`, `CashFlowResponse`, `PortfolioResponse`, `UserProfileResponse`                          |
| Broker reports | `BrokerReportResponse`, `ReportQueryFilter`, `ReportQueryResult`, `ReportQueryType`, `ReportTimePeriod`, `ReportResponse`, `ReportResponseShort` |
| Report items   | `TradeItem`, `CorporateActionsItem`, `AccountAtEndItem`, `CommissionItem`, `CashFlowReportItem`, `SecuritiesFlowItem`                            |
| Cash flows     | `UserCashFlowResponse`, `UserCashFlowsParams`, `UserCashFlowsParamsFilter`, `UserCashFlowsParamsSort`, `UserCashFlowsField`, `CashFlowItem`      |
| Portfolio      | `PortfolioSnapshot`, `PortfolioAccount`, `PortfolioPosition`                                                                                     |
| User profile   | `UserProfile`                                                                                                                                    |
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
