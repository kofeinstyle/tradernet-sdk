import { Instruments, Operations } from '../enums'

export type TradeOperation = (typeof Operations)[keyof typeof Operations]
export type Instrument = (typeof Instruments)[keyof typeof Instruments]
export type FiatCurrency = 'USD' | 'EUR'
