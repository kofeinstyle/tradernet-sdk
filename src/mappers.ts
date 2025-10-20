import type { CorporateActionsItem } from './types/common'

export const normalizeCorporateActionsItem = (item: object) => {
  let result = { ...item }

  if ('tax_currency' in result && result.tax_currency === '' && 'currency' in result) {
    result = Object.assign(result, { tax_amount: 0, tax_currency: result.currency })
  }

  return result as CorporateActionsItem
}
