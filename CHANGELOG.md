# Changelog

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
