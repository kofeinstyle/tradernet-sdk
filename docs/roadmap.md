# SDK Roadmap

This is an internal planning document, not a public API contract. Planned names and shapes can change after checking official documentation and real responses. Exclude this file from Context7 indexing.

## Status

- **Delivered:** signed Tradernet API v2 transport, broker reports, user cash flows, typed success/error responses, runtime validation, retries, ESM/CJS builds, automated npm publishing, Context7 documentation, typed read-only portfolio snapshots, and confirmed user currency metadata through `getUserProfile()`.
- **In progress:** prepare the portfolio and user-profile additions for the `0.0.4` release and consumer integration.
- **Next functional milestone:** upgrade the consuming server and validate portfolio retrieval against the production account.
- **Backlog:** explicit cross-rate support when conversion is required, API v3 transport, additional read-only endpoints, and WebSocket updates when a concrete consumer workflow requires them.

## Portfolio Snapshot

### Goal

Return the current account and open-position state through a typed, read-only SDK method. A single HTTP snapshot is the first requirement; real-time subscriptions are not required for this milestone.

Tradernet and the Python SDK use the `getPositionJson` command without request parameters. Known response sections include account rows and position rows. Position data can include ticker, quantity, currency, market price, market value, book price, and profit fields.

### Phase 1: Confirm the Contract

- [x] Call `getPositionJson` through the current API v2 transport using a private diagnostic request.
- [x] Record the complete observed response structure without committing credentials, account identifiers, or real holdings.
- [x] Create a sanitized multi-currency fixture at `tests/fixtures/get-position-json.json`.
- [x] Define empty-portfolio handling: empty arrays are valid, while missing or non-array sections are invalid responses.
- [x] Compare the command with Python SDK 2.2.0 before fixing public names.

#### Confirmed Contract

- Python SDK 2.2.0 exposes the operation as `account_summary()` and sends `getPositionJson` without parameters.
- Tradernet API v2 accepts the same command at `/api/v2/cmd/getPositionJson`.
- The v2 signed payload must omit `params` entirely. Signing an empty `params` object while omitting it from the encoded body produces `Invalid signature provided`.
- The observed envelope is `result.ps`. It contains `acc` and `pos` arrays, a string `key`, and a boolean `loaded` flag.
- Observed account numeric fields are JSON numbers. Currency and execution-time fields are strings.
- Observed position numeric fields are JSON numbers. Ticker, currency, instrument metadata, calculation scheme, and timestamps are strings.
- No `null` or numeric-string values occurred in the observed live response. Runtime validation should still report malformed values without unsafe casts.

### Phase 2: Add SDK Support

- [x] Extend the internal command and request types for a command with no parameters.
- [x] Expose the confirmed public method as `getPortfolio()`.
- [x] Add dedicated response, account, and position types based on observed data.
- [x] Normalize documented numeric fields while retaining unknown runtime fields.
- [x] Validate the top-level response and required portfolio rows at runtime.
- [x] Add unit tests for normal, empty, malformed, and API-error responses.
- [x] Export the method's public types and document a complete usage example.

### Phase 3: Consumer Integration

- Publish a new SDK version and identify any required consumer changes before release.
- Upgrade the consuming server and map SDK rows at the application boundary.
- Expose a read-only portfolio endpoint or scheduled snapshot workflow.
- Start without database persistence. Add snapshot history only when a reporting or change-tracking requirement is defined.
- Verify the integration against the production account without logging sensitive portfolio data.

### Acceptance Criteria

- A live portfolio request succeeds with existing API credentials.
- Empty and multi-currency portfolios have deterministic typed results.
- Unexpected response shapes return `ApiErrorResponse` instead of unsafe casts.
- Unit tests, type checking, build, and package import verification pass.
- The consuming server can retrieve and map the current portfolio after upgrading the package.

## Later Work

Prioritize later endpoints from actual consumer requirements rather than adding broad API coverage speculatively.

1. Evaluate API v3 as a separate transport change after the portfolio snapshot works on the current v2 client.
2. Add read-only orders, security reference data, or quotes when required by a server workflow.
3. Add portfolio/order WebSocket subscriptions only when polling or on-demand snapshots are insufficient.
4. Do not add order placement or other write operations without explicit safety requirements and integration tests.

The detailed WebSocket investigation remains in [websocket-roadmap.md](websocket-roadmap.md), but it is not the next implementation milestone.

## Delivery Rules

- Base each endpoint on official documentation, a maintained reference SDK, and a sanitized real response fixture.
- Keep transport details private and expose endpoint-specific methods and types.
- Add runtime validation at every new API boundary.
- Document consumer impact before changing a public type or method.
- Complete tests, changelog, versioning, and import verification before tagging a release.
