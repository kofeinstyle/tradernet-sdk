import type { CorporateActionsItem } from './types/common'

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
