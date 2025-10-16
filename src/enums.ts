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

export type TradeOperationValue = (typeof TradeOperation)[keyof typeof TradeOperation]
export type InstrumentValue = (typeof Instrument)[keyof typeof Instrument]
