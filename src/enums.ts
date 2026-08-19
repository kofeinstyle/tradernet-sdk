import type { OpenNumber } from './types/common'

//https://tradernet.ua/tradernet-api/instruments
export const Instrument = {
  STOCKS: 1,
  BONDS: 2,
  FUTURES: 3,
  OPTIONS: 4,
  INDICES: 5, //ex index
  CURRENCY: 6, //  fiat
  NIGHT_TRADING: 7,
  REPO_SECURITIES: 8,
  DIRECT_REPO: 9,
  REPO_WITH_NETTING: 10,
  BOND_YIELD: 11,
  CURRENCY_SWAP: 14, // swap fiat
} as const

export const TradeOperation = {
  BUY: 'buy',
  SELL: 'sell',
} as const

export const CorporateActionTypes = {
  DIVIDEND: 'dividend',
  DIVIDEND_REVERTED: 'dividend_reverted',
  SPLIT: 'split',
} as const

export const OrderStatuses = {
  IGNORED: 0,
  RECEIVED: 1,
  CANCEL_PENDING: 2,
  ACTIVE: 10,
  SENT: 11,
  PARTIALLY_COMPLETED: 12,
  PARTIALLY_EXECUTED: 20,
  EXECUTED: 21,
  PARTIALLY_CANCELED: 30,
  CANCELED: 31,
  REJECTED: 70,
  EXPIRED: 71,
  PARTIALLY_EXECUTED_AND_EXPIRED: 72,
  SEND_ERROR: 74,
  CANCEL_ERROR: 75,
} as const

export const OrderOperations = {
  BUY: 1,
  BUY_ON_MARGIN: 2,
  SELL: 3,
  SELL_SHORT: 4,
} as const

export const OrderTypes = {
  MARKET: 1,
  LIMIT: 2,
  STOP: 3,
  STOP_LIMIT: 4,
} as const

export const OrderExpirations = {
  DAY: 1,
  EXTENDED_DAY: 2,
  GOOD_TILL_CANCELED: 3,
} as const

export type KnownCorporateActionType = (typeof CorporateActionTypes)[keyof typeof CorporateActionTypes]
export type CorporateActionTypesValue = KnownCorporateActionType | (string & {})

export type TradeOperationValue = (typeof TradeOperation)[keyof typeof TradeOperation]
export type InstrumentValue = (typeof Instrument)[keyof typeof Instrument]
export type KnownOrderStatus = (typeof OrderStatuses)[keyof typeof OrderStatuses]
export type OrderStatus = OpenNumber<KnownOrderStatus>
export type KnownOrderOperation = (typeof OrderOperations)[keyof typeof OrderOperations]
export type OrderOperation = OpenNumber<KnownOrderOperation>
export type KnownOrderType = (typeof OrderTypes)[keyof typeof OrderTypes]
export type OrderType = OpenNumber<KnownOrderType>
export type KnownOrderExpiration = (typeof OrderExpirations)[keyof typeof OrderExpirations]
export type OrderExpiration = OpenNumber<KnownOrderExpiration>
