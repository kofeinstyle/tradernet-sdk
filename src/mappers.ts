import type { CorporateActionsItem } from './types/broker-reports'
import type { Order, OrderTrade } from './types/orders'
import type { PortfolioAccount, PortfolioPosition } from './types/portfolio'
import type { UserProfile } from './types/user-profile'

const numericFields = ['amount', 'amount_per_one', 'external_tax'] as const
const stringFields = [
  'ticker',
  'isin',
  'corporate_action_id',
  'type_id',
  'date',
  'ex_date',
  'currency',
  'external_tax_currency',
  'tax_currency',
  'q_on_ex_date',
] as const

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const isCorporateActionsItem = (item: unknown): item is CorporateActionsItem => {
  if (!isRecord(item)) {
    return false
  }

  return (
    stringFields.every(field => typeof item[field] === 'string') &&
    (item.comment === undefined || typeof item.comment === 'string') &&
    [...numericFields, 'tax_amount'].every(field => typeof item[field] === 'number' && Number.isFinite(item[field]))
  )
}

export const normalizeCorporateActionsItem = (item: unknown): CorporateActionsItem | null => {
  if (!isRecord(item)) {
    return null
  }

  const result = { ...item }

  for (const field of numericFields) {
    const value = toNumber(result[field])
    if (value === null) {
      return null
    }
    result[field] = value
  }

  result.tax_amount = toNumber(result.tax_amount) ?? 0

  if (typeof result.currency === 'string') {
    if (typeof result.tax_currency !== 'string' || result.tax_currency === '') {
      result.tax_currency = result.currency
    }
    if (typeof result.external_tax_currency !== 'string' || result.external_tax_currency === '') {
      result.external_tax_currency = result.currency
    }
  }

  return isCorporateActionsItem(result) ? result : null
}

const portfolioAccountRequiredNumericFields = ['currval', 'forecast_in', 'forecast_out', 's'] as const
const portfolioAccountOptionalNumericFields = ['k', 't', 't2_in', 't2_out'] as const
const portfolioAccountOptionalStringFields = ['sql_exec_tm'] as const

const portfolioPositionRequiredNumericFields = ['acc_pos_id', 'currval', 'market_value', 'mkt_price', 'q'] as const
const portfolioPositionOptionalNumericFields = [
  'accruedint_a',
  'acd',
  'bal_price_a',
  'close_price',
  'face_val_a',
  'fv',
  'go',
  'instr_id',
  'k',
  'mkt_id',
  'open_bal',
  'price_a',
  'profit_close',
  'profit_price',
  's',
  't',
  'vm',
  'Yield',
] as const
const portfolioPositionOptionalStringFields = [
  'base_contract_code',
  'base_currency',
  'issue_nb',
  'ltr',
  'name',
  'name2',
  'scheme_calc',
  'sql_exec_tm',
  'sql_signal_tm',
] as const

const orderRequiredNumericFields = ['id', 'stat', 'oper', 'type', 'p', 'q', 'leaves_qty'] as const
const orderOptionalNumericFields = [
  'order_id',
  'stat_orig',
  'stop',
  'stop_init_price',
  'stop_activated',
  'aon',
  'exp',
  'rep',
  'stat_prev',
  'trailing',
  'trailing_price',
  'instr_type',
  'curr_q',
  'mkt_id',
] as const
const orderRequiredStringFields = ['date', 'instr', 'cur'] as const
const orderOptionalStringFields = ['stat_d', 'name', 'name2', 'order_nb', 'condition', 'text'] as const
const orderTradeRequiredNumericFields = ['id', 'p', 'q', 'v'] as const
const orderTradeOptionalNumericFields = ['profit', 'acd', 'fv', 'go_sum', 'before_q', 'after_q'] as const
const orderTradeRequiredStringFields = ['date'] as const
const orderTradeOptionalStringFields = ['trade_d_exch', 'pay_d'] as const
const orderTradePublicFields = [
  ...orderTradeRequiredNumericFields,
  ...orderTradeOptionalNumericFields,
  ...orderTradeRequiredStringFields,
  ...orderTradeOptionalStringFields,
] as const
const orderPublicFields = [
  ...orderRequiredNumericFields,
  ...orderOptionalNumericFields,
  ...orderRequiredStringFields,
  ...orderOptionalStringFields,
  'trade',
] as const

const normalizeNumericFields = (
  result: Record<string, unknown>,
  requiredFields: readonly string[],
  optionalFields: readonly string[]
): boolean => {
  for (const field of requiredFields) {
    const value = toNumber(result[field])
    if (value === null) {
      return false
    }
    result[field] = value
  }

  for (const field of optionalFields) {
    if (result[field] === undefined || result[field] === null) {
      continue
    }

    const value = toNumber(result[field])
    if (value === null) {
      return false
    }
    result[field] = value
  }

  return true
}

const hasNumericFields = (
  item: Record<string, unknown>,
  requiredFields: readonly string[],
  optionalFields: readonly string[]
): boolean => {
  return (
    requiredFields.every(field => typeof item[field] === 'number' && Number.isFinite(item[field])) &&
    optionalFields.every(
      field =>
        item[field] === undefined ||
        item[field] === null ||
        (typeof item[field] === 'number' && Number.isFinite(item[field]))
    )
  )
}

const hasOptionalStringFields = (item: Record<string, unknown>, fields: readonly string[]): boolean => {
  return fields.every(field => item[field] === undefined || item[field] === null || typeof item[field] === 'string')
}

const hasRequiredStringFields = (item: Record<string, unknown>, fields: readonly string[]): boolean => {
  return fields.every(field => typeof item[field] === 'string' && item[field].trim() !== '')
}

const isBinaryFlag = (value: unknown): value is 0 | 1 => value === 0 || value === 1

const pickFields = (item: Record<string, unknown>, fields: readonly string[]): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    if (item[field] !== undefined) {
      result[field] = item[field]
    }
  }
  return result
}

const isPortfolioAccount = (item: unknown): item is PortfolioAccount => {
  if (!isRecord(item)) {
    return false
  }

  return (
    typeof item.curr === 'string' &&
    hasNumericFields(item, portfolioAccountRequiredNumericFields, portfolioAccountOptionalNumericFields) &&
    hasOptionalStringFields(item, portfolioAccountOptionalStringFields)
  )
}

const isPortfolioPosition = (item: unknown): item is PortfolioPosition => {
  if (!isRecord(item)) {
    return false
  }

  return (
    typeof item.curr === 'string' &&
    typeof item.i === 'string' &&
    hasNumericFields(item, portfolioPositionRequiredNumericFields, portfolioPositionOptionalNumericFields) &&
    hasOptionalStringFields(item, portfolioPositionOptionalStringFields)
  )
}

const isOrder = (item: unknown): item is Order => {
  if (!isRecord(item)) {
    return false
  }

  return (
    hasRequiredStringFields(item, orderRequiredStringFields) &&
    hasNumericFields(item, orderRequiredNumericFields, orderOptionalNumericFields) &&
    (item.aon === undefined || item.aon === null || isBinaryFlag(item.aon)) &&
    hasOptionalStringFields(item, orderOptionalStringFields) &&
    (item.trade === undefined || item.trade === null || (Array.isArray(item.trade) && item.trade.every(isOrderTrade)))
  )
}

const isOrderTrade = (item: unknown): item is OrderTrade => {
  if (!isRecord(item)) {
    return false
  }

  return (
    hasRequiredStringFields(item, orderTradeRequiredStringFields) &&
    hasNumericFields(item, orderTradeRequiredNumericFields, orderTradeOptionalNumericFields) &&
    hasOptionalStringFields(item, orderTradeOptionalStringFields)
  )
}

export const normalizePortfolioAccount = (item: unknown): PortfolioAccount | null => {
  if (!isRecord(item)) {
    return null
  }

  const result = { ...item }
  if (!normalizeNumericFields(result, portfolioAccountRequiredNumericFields, portfolioAccountOptionalNumericFields)) {
    return null
  }

  return isPortfolioAccount(result) ? result : null
}

export const normalizePortfolioPosition = (item: unknown): PortfolioPosition | null => {
  if (!isRecord(item)) {
    return null
  }

  const result = { ...item }
  if (!normalizeNumericFields(result, portfolioPositionRequiredNumericFields, portfolioPositionOptionalNumericFields)) {
    return null
  }

  return isPortfolioPosition(result) ? result : null
}

export const normalizeOrder = (item: unknown): Order | null => {
  if (!isRecord(item)) {
    return null
  }

  const result = { ...item }
  if (!normalizeNumericFields(result, orderRequiredNumericFields, orderOptionalNumericFields)) {
    return null
  }

  if (result.trade !== undefined && result.trade !== null) {
    if (!Array.isArray(result.trade)) {
      return null
    }

    const trades = []
    for (const trade of result.trade) {
      const normalizedTrade = normalizeOrderTrade(trade)
      if (!normalizedTrade) {
        return null
      }
      trades.push(normalizedTrade)
    }
    result.trade = trades
  }

  const publicOrder = pickFields(result, orderPublicFields)
  return isOrder(publicOrder) ? publicOrder : null
}

export const normalizeOrderTrade = (item: unknown): OrderTrade | null => {
  if (!isRecord(item)) {
    return null
  }

  const result = { ...item }
  if (!normalizeNumericFields(result, orderTradeRequiredNumericFields, orderTradeOptionalNumericFields)) {
    return null
  }

  const publicTrade = pickFields(result, orderTradePublicFields)
  return isOrderTrade(publicTrade) ? publicTrade : null
}

export const normalizeUserProfile = (data: unknown): UserProfile | null => {
  if (!isRecord(data)) {
    return null
  }

  const response = isRecord(data.result) ? data.result : data
  const profile = isRecord(response.OPQ) ? response.OPQ : response
  if (
    typeof profile.homeCurrency !== 'string' ||
    profile.homeCurrency.trim() === '' ||
    typeof profile.main_curr !== 'string' ||
    profile.main_curr.trim() === ''
  ) {
    return null
  }

  return { homeCurrency: profile.homeCurrency, main_curr: profile.main_curr }
}
