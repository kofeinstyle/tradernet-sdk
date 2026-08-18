import type { CorporateActionTypesValue, InstrumentValue, TradeOperationValue } from '../enums'
import type { FiatCurrency } from './common'

export type TradeItem = {
  id: string
  trade_id: number
  transaction_id: number
  date: string
  short_date: string
  pay_d: string
  order_id: string
  operation: TradeOperationValue
  commission: number
  commission_currency: FiatCurrency
  q: number
  p: number
  summ: number
  instr_nm: string
  instr_type: InstrumentValue
  instr_kind: string
  issue_nb: string
  curr_c: FiatCurrency
  comment?: string
  broker: string
  isin: string
  das_exe_id?: string
  mkt_id?: number
  mkt_name?: string
}

export type CorporateActionsItem = {
  ticker: string
  isin: string
  corporate_action_id: string
  type_id: CorporateActionTypesValue
  date: string
  ex_date: string
  amount: number
  amount_per_one: number
  currency: FiatCurrency
  external_tax: number
  external_tax_currency: FiatCurrency
  tax_amount: number
  tax_currency: FiatCurrency
  q_on_ex_date: string
  comment?: string
}
