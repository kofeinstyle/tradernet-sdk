import type { CorporateActionTypesValue, InstrumentValue, TradeOperationValue } from '../enums'
import type { FiatCurrency } from './common'
import type { PortfolioAccount, PortfolioPosition } from './portfolio'

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

export type AccountAtEndPortfolioAccount = PortfolioAccount & {
  net_assets?: number | null
  posval?: number | null
}

/**
 * Historical portfolio position returned by the `account_at_end` report.
 * Use `posval` (`q * mkt_price`) for the value at the requested date. Tradernet
 * may populate `market_value` and `close_price` with current quote data.
 */
export type AccountAtEndPortfolioPosition = PortfolioPosition & {
  posval: number
  mval?: number | null
  profit?: number | null
  profit_in_position_currency?: number | null
  unrealized_profit?: number | null
  gain?: number | null
  total_securities?: number | null
  total_stocks?: number | null
  total_bonds?: number | null
  total_forts?: number | null
  total_crypto?: number | null
  margin_securities?: number | null
  net_assets?: number | null
  code_nm?: string | null
  mkt_price_updated_from_quotes?: boolean | number | null
}

export type AccountAtEndReport = {
  report: {
    date: string
    account: {
      net_assets: number
      positions_from_ts: {
        ps: {
          acc: AccountAtEndPortfolioAccount[]
          pos: AccountAtEndPortfolioPosition[]
        }
      }
      repo_positions?: unknown
    }
  }
}
