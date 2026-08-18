import type { FiatCurrency, OpenString } from './common'

export type KnownTransactionTypeCode = 'tax' | 'dividend' | 'commission_for_trades' | 'refund' | 'card'
export type TransactionTypeCode = OpenString<KnownTransactionTypeCode>

export type CashFlowItem = {
  id: number
  type_code: TransactionTypeCode
  date: string
  datetime: string
  currency: FiatCurrency
  comment: string
  account: string
  sum: number
  min_step: string
  icon: string
  type_code_name: string
  sumRaw: number
}
