import type { CorporateActionsItem } from './types/common'

type CorporateActionsInput = Omit<Partial<CorporateActionsItem>, 'tax_amount' | 'tax_currency'> & {
  tax_amount?: unknown
  tax_currency?: unknown
}

export const normalizeCorporateActionsItem = (item: CorporateActionsInput): CorporateActionsItem => {
  const result = { ...item }

  if (
    'tax_currency' in result &&
    'tax_amount' in result &&
    'currency' in result &&
    (result.tax_currency === '' || typeof result.tax_amount !== 'number')
  ) {
    return {
      ...result,
      tax_amount: 0,
      tax_currency: result.currency,
    } as CorporateActionsItem
  }

  return result as CorporateActionsItem
}
