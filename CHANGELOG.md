# Changelog

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
