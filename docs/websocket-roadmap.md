# WebSocket Roadmap

WebSocket support is planned, but the public API is not designed yet. Do not base implementation work on the removed commented prototypes; they were generic placeholders and may not match the actual Tradernet protocol or application needs.

## Goals

- Provide a typed client for Tradernet streaming data when the protocol and required channels are confirmed.
- Support Node.js first; browser compatibility should be explicit if needed.
- Keep the HTTP client and WebSocket client separate, with shared config only where it is useful.
- Preserve the current package entrypoint and avoid exposing unstable WebSocket APIs before they are tested.

## Design Questions

- Compatibility: decide whether WebSocket configuration should share API v2 settings or use a separate Freedom24/API v3 config.
- Message shape: capture real inbound/outbound examples before creating public types.
- Reconnection: define backoff, max attempts, resubscription behavior, and manual disconnect semantics.
- Errors: decide whether stream errors are emitted, returned through callbacks, or surfaced through a typed event handler.

## Reference Protocol

Tradernet's Python SDK 2.2.0 provides a current reference implementation. It connects to `wss://wss.freedom24.com` with `X-NtApi-PublicKey`, `X-NtApi-Timestamp`, and `X-NtApi-Sig` query parameters. Its subscriptions include:

- `["quotes", [symbols]]` with `q` events.
- `["orderBook", [symbol]]` with `b` events.
- `["portfolio"]`, `["orders"]`, and `["markets"]` with matching event names.

Treat this as a protocol reference, not a complete client design. The Python implementation does not provide reconnection, resubscription, or heartbeat behavior, and message payloads still require live fixtures before TypeScript types are published.

## Proposed Public Surface

The final API should be small and typed. A possible shape:

```ts
const ws = client.createWebSocketClient()
await ws.connect()
await ws.subscribe('portfolio')
ws.on('message', message => {})
await ws.disconnect()
```

This is only a sketch. Do not implement this exact API until real protocol examples and application requirements are available.

## Testing Plan

- Unit test message parsing and subscription payload generation.
- Use fake timers for reconnect and ping behavior.
- Add integration tests only when a stable sandbox or mock server exists.
- Verify that WebSocket code does not affect the HTTP-only SDK bundle path.
