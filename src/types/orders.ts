import type { OrderExpiration, OrderOperation, OrderStatus, OrderType } from '../enums'
import type { BinaryFlag, FiatCurrency } from './common'

export type OrderTrade = {
  id: number
  p: number
  q: number
  v: number
  date: string
  profit?: number | null
  acd?: number | null
  fv?: number | null
  go_sum?: number | null
  before_q?: number | null
  after_q?: number | null
  trade_d_exch?: string | null
  pay_d?: string | null
}

export type Order = {
  id: number
  date: string
  stat: OrderStatus
  instr: string
  oper: OrderOperation
  type: OrderType
  cur: FiatCurrency
  p: number
  q: number
  leaves_qty: number
  order_id?: number | null
  stat_orig?: OrderStatus | null
  stat_d?: string | null
  stop?: number | null
  stop_init_price?: number | null
  stop_activated?: number | null
  aon?: BinaryFlag | null
  exp?: OrderExpiration | null
  rep?: number | null
  name?: string | null
  name2?: string | null
  stat_prev?: OrderStatus | null
  trailing?: number | null
  trailing_price?: number | null
  instr_type?: number | null
  curr_q?: number | null
  mkt_id?: number | null
  order_nb?: string | null
  condition?: string | null
  text?: string | null
  trade?: OrderTrade[] | null
}

export type OrdersSnapshot = {
  orders: Order[]
}
