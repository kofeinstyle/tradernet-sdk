# Live API Playground

The playground is the only repository mechanism intended to call Tradernet with real credentials. Jest tests always mock `fetch` and never load `.env`.

Create a local `.env` file:

```dotenv
API_KEY=your_public_key
API_SECRET=your_private_key
```

Run one explicit read-only command:

```bash
npm run playground -- user-profile
npm run playground -- portfolio
npm run playground -- orders
npm run playground -- orders --all
npm run playground -- orders-history 2026-01-01 2026-12-31
npm run playground -- cash-flows 20
npm run playground -- broker-report corporate_actions 2026-01-01 2026-12-31
```

The default output contains counts and status summaries. Order history includes both numeric status codes and their documented names. Add `--full` to inspect real API rows locally:

```bash
npm run playground -- portfolio --full
npm run playground -- orders --full
npm run playground -- orders --all --full
npm run playground -- orders-history 2026-01-01 2026-12-31 --full
```

Full output can contain holdings, balances, orders, transactions, and account metadata. Do not commit it or paste it into issues and logs. Optional `PLAYGROUND_TIMEOUT`, `PLAYGROUND_RETRIES`, and `PLAYGROUND_VERBOSE` environment values override client diagnostics.
