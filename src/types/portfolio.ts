import type { FiatCurrency } from './common'

export type PortfolioAccount = {
  curr: FiatCurrency
  currval: number
  forecast_in: number
  forecast_out: number
  s: number
  k?: number | null
  sql_exec_tm?: string | null
  t?: number | null
  t2_in?: number | null
  t2_out?: number | null
}

export type PortfolioPosition = {
  acc_pos_id: number
  curr: FiatCurrency
  currval: number
  i: string
  market_value: number
  mkt_price: number
  q: number
  accruedint_a?: number | null
  acd?: number | null
  bal_price_a?: number | null
  base_contract_code?: string | null
  base_currency?: FiatCurrency | null
  close_price?: number | null
  face_val_a?: number | null
  fv?: number | null
  go?: number | null
  instr_id?: number | null
  issue_nb?: string | null
  k?: number | null
  ltr?: string | null
  mkt_id?: number | null
  name?: string | null
  name2?: string | null
  open_bal?: number | null
  price_a?: number | null
  profit_close?: number | null
  profit_price?: number | null
  s?: number | null
  scheme_calc?: string | null
  sql_exec_tm?: string | null
  sql_signal_tm?: string | null
  t?: number | null
  vm?: number | null
  Yield?: number | null
}

export type PortfolioSnapshot = {
  loaded: boolean
  accounts: PortfolioAccount[]
  positions: PortfolioPosition[]
}
