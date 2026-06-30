import type { CorporateActionTypesValue, InstrumentValue, TradeOperationValue } from '../enums'

export { CorporateActionTypesValue, InstrumentValue, TradeOperationValue }

export type FiatCurrency = 'USD' | 'EUR'

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'more'
  | 'eqormore'
  | 'eqorless'
  | 'contains'
  | 'doesnotcontain'
  | 'startswith'
  | 'endswith'
  | 'in'

export type TransactionTypeCode = 'tax' | 'dividend' | 'commission_for_trades' | 'refund' | 'card'

export type TradeItem = {
  id: string
  trade_id: number
  transaction_id: number
  date: string
  short_date: string // '2025-01-14',
  pay_d: string // '2025-01-15',
  order_id: string
  operation: TradeOperationValue
  commission: number
  commission_currency: FiatCurrency
  q: number // quantity
  p: number // price
  summ: number // sum
  instr_nm: string // 'AAPL.US',
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
  //   turnover: '0.00000000',
  //   profit: 0,
  //   fifo_profit: '0.00000000',
  //   repo_operation: null,
  //   office: 35,
  //   yield: null,
  //   offbalance: 0,
  //   otc: 0,
  //   is_dvp: 0,
  //   stamp_tax: null,
  //   smat: 0,
  //   forts_exchange_fee: null,
  //   trade_nb: 'das_20250114_-T13424',
  //   market: 'N',
  //   itc_trd_match_id: null,
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
  comment: string
}

export type CashFlowItem = {
  id: number
  type_code: TransactionTypeCode | string
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
