import type { CorporateActionsItem } from './types/common'

export const normalizeCorporateActionsItem = (item: object) => {
  let result = { ...item }

  if (
    'tax_currency' in result &&
    'tax_amount' in result &&
    'currency' in result &&
    (result.tax_currency === '' || typeof result.tax_amount !== 'number')
  ) {
    result = Object.assign(result, { tax_amount: 0, tax_currency: result.currency })
  }

  return result as CorporateActionsItem
}
