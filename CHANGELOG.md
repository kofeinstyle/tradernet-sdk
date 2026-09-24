# Changelog

## Unreleased

- `getUserCashFlows` `sort` is a single descriptor, not an array: Tradernet rejects the array form with "Incorrect request parameters", contrary to its docs.
- Type every documented `cash_flows` amount as a number: Tradernet sends the same field as a JSON number in one response and as a numeric string in the next, so `curr_commissioned` and `curr_flowed` are no longer typed as strings.
- Normalize the documented numeric fields of `cash_flows`, `securities_flows`, `trades`, `in_outs`, and account snapshot rows, and report a malformed row as `Invalid <type> item at index N`.
- Normalize `securities_flows.mkt_id`, `trades.id`, and `trades.order_id` to strings, and `in_outs.amount` and `in_outs.account_id` to numbers.
- Normalize the `report.total`, `report.totalTrading`, and `report.securities` numeric maps.
- Document that the row order of `cash_flows` and `securities_flows` is not stable.

## 0.0.8 - 2026-09-15

- Fix `cash_flows` and `securities_flows` broker reports to accept the arrays returned by Tradernet.
- Replace the incorrect indexed-object response types with `ArrayReportResponse` and `ArrayReportQueryType`.
- Correct broker-report tests, examples, and Context7 guidance to use `data.report` directly.

## 0.0.7 - 2026-09-15

- Support `account_at_start`, `in_outs`, and `in_outs_securities` broker report query types.
- Accept and type the indexed response containers returned by `cash_flows` and `securities_flows` reports.
- Expose typed cash-flow summaries, securities-flow summaries, and inbound/outbound cash records.
- Include Tradernet's `totalTrading` commissions total in detailed report types.

## 0.0.6 - 2026-09-14

- Fix `account_at_end` broker reports by validating their actual `report.account` structure instead of requiring `report.detailed`.
- Add typed account-at-end snapshots using the existing portfolio account and position contracts.
- Document `posval` as the historical position value while preserving Tradernet's current-quote fields unchanged.

## 0.0.5 - 2026-08-19

- Add a typed, read-only `getOrders()` method with an `activeOnly` filter.
- Add a typed, read-only `getOrdersHistory()` method with explicit date boundaries and normalized execution trades.
- Add open `OrderStatus` typing and constants for documented Tradernet order statuses.
- Add typed order operation, order type, expiration, and all-or-none values.
- Normalize documented order numeric fields and remove account login metadata, temporary identifiers, and raw trade details from the public response.
- Add mocked coverage for populated, empty, malformed, and API-error order responses.
- Add a read-only playground command and document the live-validated active-order mode.

## 0.0.4 - 2026-08-18

- Add a typed, read-only `getPortfolio()` snapshot for current account balances and open positions.
- Add a typed `getUserProfile()` method that exposes `homeCurrency` and `main_curr` without returning the complete `getOPQ` payload.
- Support signed Tradernet API v2 commands that do not have request parameters.
- Validate portfolio envelopes and rows while normalizing documented numeric fields.
- Separate live API diagnostics into an explicit playground and keep Jest tests fully mocked.

## 0.0.3 - 2026-08-17

- Export cash flow request, response, item, filtering, and sorting types from the package entrypoint.
- Add reusable `SortDescriptor` and `SortDirection` types with endpoint-specific cash flow fields.
- Make `ApiResponse` a discriminated success/error union.
- Default broker reports to the `23:59:59` cut-off while preserving explicit `08:40:00` requests.
- Allow corporate action reports without `report.total`.
- Preserve autocomplete for known currencies, transaction codes, and corporate action types while accepting new API values.
- Validate and normalize corporate action items without unsafe type assertions.
- Document Bun installation, cash flow sorting, and the distinction between corporate action and cash flow dividends.

## 0.0.2 - 2026-06-30

- Add structural runtime validation for broker report responses and cash flow responses.
- Return clearer `Invalid API response` messages when Tradernet returns an unexpected response shape.
- Remove commented roadmap/dead code from SDK source files.

## 0.0.1

- Publish the first non-prerelease package version.
- Stabilize HTTP retry behavior for network errors, timeouts, HTTP 429, and HTTP 5xx responses.
- Preserve `retries: 0` as an explicit config value.
- Normalize cash flow numeric fields without mutating raw response items.
- Publish only built `dist` artifacts in the npm package.
- Add CI, import verification, and trusted publishing release workflow.
