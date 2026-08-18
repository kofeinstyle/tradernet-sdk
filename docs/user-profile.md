# User Profile

Use `getUserProfile()` to retrieve Tradernet's user currency metadata. The method calls `getOPQ` without parameters but exposes only confirmed currency fields instead of the complete initial-user-data payload.

```ts
const result = await tradernet.getUserProfile()

if (!result.success) {
  throw new Error(result.message ?? result.error)
}

console.log(result.data.homeCurrency, result.data.main_curr)
```

## Response

`UserProfileResponse` is an `ApiResponse<UserProfile>`:

```ts
type UserProfile = {
  homeCurrency: FiatCurrency
  main_curr: FiatCurrency
}
```

- `homeCurrency` maps `OPQ.homeCurrency`.
- `main_curr` preserves Tradernet's original field name because its separate meaning is undocumented.

Both fields were `USD` in the observed response, while an EUR account had `currval: 97.5141`. This proves that account `currval` is not an EUR-to-`homeCurrency` or EUR-to-`main_curr` rate in that response. Do not infer a currency pair from `currval`. Explicit cross-rate support is deferred until the consuming application requires currency conversion and the Tradernet response contract is confirmed.

The SDK discards other `getOPQ` sections because they contain unrelated and potentially sensitive account, order, session, and portfolio data whose structure is not part of this method's public contract.
