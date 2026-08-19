# Orders

Use `getOrders()` to retrieve Tradernet orders through the signed API v2 transport. The method is read-only and returns active orders by default.

```ts
const result = await tradernet.getOrders({ activeOnly: true })

if (!result.success) {
  throw new Error(result.message ?? result.error)
}

for (const order of result.data.orders) {
  console.log(order.instr, order.q, order.leaves_qty, order.cur, order.p)
}
```

Use `OrderStatuses` instead of comparing status codes with unnamed numbers:

```ts
import { OrderStatuses } from '@kofeinstyle/tradernet-sdk'

const executed = result.data.orders.filter(order => order.stat === OrderStatuses.EXECUTED)
```

## Filtering

`OrdersFilter` controls the Tradernet `active_only` parameter:

```ts
await tradernet.getOrders() // activeOnly defaults to true
await tradernet.getOrders({ activeOnly: false }) // include non-active orders in the current period
```

Both filter values have been accepted by the live API and returned the documented response shape. The observed `activeOnly: false` result contained the same order as the active-only request. Use `getOrdersHistory()` for an explicit date range.

## Order History

`getOrdersHistory()` sends Tradernet's separate `getOrdersHistory` command:

```ts
const result = await tradernet.getOrdersHistory({
  dateFrom: '2026-01-01',
  dateTo: '2026-01-31',
})
```

Date-only values cover the complete days. Complete timestamps such as `2026-01-01T08:40:00` are passed through unchanged.

Historical orders can include execution rows in `order.trade`. The SDK exposes them as `OrderTrade[]`, normalizes numeric fields, and removes raw trade details and account identifiers.

## Response

`OrdersResponse` is an `ApiResponse<OrdersSnapshot>`:

```ts
type OrdersSnapshot = {
  orders: Order[]
}
```

Important `Order` fields include:

| Field        | Type                      | Description                                     |
| ------------ | ------------------------- | ----------------------------------------------- |
| `id`         | `number`                  | Tradernet order identifier.                     |
| `date`       | `string`                  | Order creation timestamp supplied by Tradernet. |
| `instr`      | `string`                  | Instrument ticker.                              |
| `cur`        | `FiatCurrency`            | Order currency.                                 |
| `p`          | `number`                  | Order price.                                    |
| `q`          | `number`                  | Original order quantity.                        |
| `leaves_qty` | `number`                  | Quantity that remains open.                     |
| `stat`       | `OrderStatus`             | Tradernet order status code.                    |
| `oper`       | `OrderOperation`          | Buy or sell operation code.                     |
| `type`       | `OrderType`               | Market, limit, or stop order code.              |
| `stop`       | `number \| null`          | Stop price when supplied.                       |
| `aon`        | `BinaryFlag \| null`      | All-or-none flag.                               |
| `exp`        | `OrderExpiration \| null` | Order lifetime code when supplied.              |
| `trade`      | `OrderTrade[]`            | Executions associated with a historical order.  |

Tradernet can return documented numeric fields as JSON numbers or numeric strings. The SDK normalizes them to numbers without mutating the HTTP response. Unknown status, operation, order-type, and expiration codes remain numeric for forward compatibility.

## Order Statuses

`OrderStatuses` provides names for the status codes documented by Tradernet:

| Constant                         | Code | Meaning                         |
| -------------------------------- | ---: | ------------------------------- |
| `IGNORED`                        |    0 | Ignored                         |
| `RECEIVED`                       |    1 | Received                        |
| `CANCEL_PENDING`                 |    2 | Cancellation is being processed |
| `ACTIVE`                         |   10 | Active                          |
| `SENT`                           |   11 | Sent                            |
| `PARTIALLY_COMPLETED`            |   12 | Partially completed             |
| `PARTIALLY_EXECUTED`             |   20 | Partially executed              |
| `EXECUTED`                       |   21 | Executed                        |
| `PARTIALLY_CANCELED`             |   30 | Partially canceled              |
| `CANCELED`                       |   31 | Canceled                        |
| `REJECTED`                       |   70 | Rejected                        |
| `EXPIRED`                        |   71 | Expired                         |
| `PARTIALLY_EXECUTED_AND_EXPIRED` |   72 | Partially executed and expired  |
| `SEND_ERROR`                     |   74 | Send error                      |
| `CANCEL_ERROR`                   |   75 | Cancellation error              |

`KnownOrderStatus` is the union of these known values. API responses use the open `OrderStatus` type, which also accepts unknown numeric codes added by Tradernet later.

## Order Codes

Use the exported constants instead of unnamed numeric values:

```ts
import { OrderExpirations, OrderOperations, OrderTypes } from '@kofeinstyle/tradernet-sdk'

order.oper === OrderOperations.BUY
order.type === OrderTypes.LIMIT
order.exp === OrderExpirations.GOOD_TILL_CANCELED
```

Known operations are `BUY` (`1`), `BUY_ON_MARGIN` (`2`), `SELL` (`3`), and `SELL_SHORT` (`4`). Known order types are `MARKET` (`1`), `LIMIT` (`2`), `STOP` (`3`), and `STOP_LIMIT` (`4`). Known expirations are `DAY` (`1`), `EXTENDED_DAY` (`2`), and `GOOD_TILL_CANCELED` (`3`).

`OrderOperation`, `OrderType`, and `OrderExpiration` accept unknown numeric codes for forward compatibility. `BinaryFlag` is strictly `0 | 1` and is used by `aon`.

A populated response has been verified through the repository playground with both `activeOnly` values. It confirmed the documented envelope, numeric order fields, string timestamps, and optional stop-order metadata. Account-specific values are intentionally not stored in repository fixtures.

When Tradernet omits the nested `order` property, the SDK returns `orders: []`. An invalid envelope, non-array order list, or malformed required order field produces an `ApiErrorResponse`.

The internal response key, account login fields, temporary order identifiers, and raw trade details are not exposed.
