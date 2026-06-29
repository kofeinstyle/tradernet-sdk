# WebSocket Roadmap

WebSocket support is planned, but the public API is not designed yet. Do not base implementation work on the removed commented prototypes; they were generic placeholders and may not match the actual Tradernet protocol or application needs.

## Goals

- Provide a typed client for Tradernet streaming data when the protocol and required channels are confirmed.
- Support Node.js first; browser compatibility should be explicit if needed.
- Keep the HTTP client and WebSocket client separate, with shared config only where it is useful.
- Preserve the current package entrypoint and avoid exposing unstable WebSocket APIs before they are tested.

## Design Questions

- Authentication: confirm whether the socket uses API key/signature, session token, or another handshake.
- Channels: define the first supported subscriptions, such as portfolio, orders, ticker updates, or account events.
- Message shape: capture real inbound/outbound examples before creating public types.
- Reconnection: define backoff, max attempts, resubscription behavior, and manual disconnect semantics.
- Errors: decide whether stream errors are emitted, returned through callbacks, or surfaced through a typed event handler.

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
