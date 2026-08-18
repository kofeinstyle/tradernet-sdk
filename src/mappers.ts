import type { CorporateActionsItem } from './types/broker-reports'
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
