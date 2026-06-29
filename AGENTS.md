# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript SDK for the Tradernet API. Public exports are collected in `src/index.ts`. Core client code lives in `src/api-client.ts`, HTTP helpers in `src/http.ts`, and transformations in `src/helper.ts` and `src/mappers.ts`. API/domain types are under `src/types/`; enums are in `src/enums.ts`. Planned WebSocket work is documented in `docs/websocket-roadmap.md`.

Tests live in `tests/` and use Jest with `ts-jest`. `tests/setup-env.js` loads test environment values. Build output goes to `dist/` and should not be edited by hand.

## Build, Test, and Development Commands

- `npm test` runs the Jest test suite once.
- `npm run test:watch` runs Jest in watch mode.
- `npm run test:coverage` runs Jest with coverage reporting.
- `npm run check` runs TypeScript type checking without emitting files.
- `npm run build` bundles `src/index.ts` with tsup and emits ESM, CJS, and `.d.ts` files.
- `npm run verify` runs type checking, tests, build, and import verification.
- `npm run prepublishOnly` runs build and tests before publishing.
- `make build` and `make test` are thin wrappers around the npm commands.

## Coding Style & Naming Conventions

Use TypeScript ESM syntax and keep package-facing exports explicit through `src/index.ts`. Follow Prettier: 2-space indentation, single quotes, no semicolons, ES5 trailing commas, and 120-character lines. Imports are sorted by `@trivago/prettier-plugin-sort-imports`.

Use PascalCase for exported classes, types, and enums, such as `TradernetApiClient` and `CorporateActionTypes`. Use camelCase for functions, variables, and object fields. Keep files focused and prefer existing helper modules before adding abstractions.

## Testing Guidelines

Add tests under `tests/` using the `*.test.ts` naming pattern, for example `tests/helper.test.ts`. Prefer focused tests for mappers, helpers, request normalization, and public client behavior. If a test depends on credentials or API-like settings, route them through `tests/setup-env.js` and document required `.env` keys. Run `npm test` and `npm run check` before submitting changes.

## Commit & Pull Request Guidelines

Recent history uses short, imperative or release-oriented messages, for example `update readme` and `0.0.1-beta.8 change report request filter`. Keep commits concise and scoped to one change.

Use release tags without a `v` prefix to match existing project history, for example `0.0.1` instead of `v0.0.1`.

Pull requests should include a short description, test results, and any API surface changes. Link related issues when available. For behavior changes, include a minimal usage example or before/after note. Do not include generated `dist/` changes unless the release process requires them.

## Security & Configuration Tips

Do not commit secrets from `.env` or broker credentials used during local tests. Keep network-facing tests isolated and avoid making live API calls in unit tests unless explicitly marked and documented.
