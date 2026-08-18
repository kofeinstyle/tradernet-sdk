import { normalizeCorporateActionsItem } from '../src/mappers'

const makeCorporateActionsItem = (overrides: Record<string, unknown> = {}) => ({
  ticker: 'AAPL.US',
  isin: 'US0378331005',
  corporate_action_id: '2020-01-01_35_AAPL.US_0.25',
  type_id: 'dividend',
  date: '2020-01-10',
  ex_date: '2020-01-01',
  amount: 10,
  amount_per_one: 0,
  currency: 'USD',
  external_tax: 10,
  external_tax_currency: 'USD',
  tax_amount: 1.5,
  tax_currency: 'USD',
  q_on_ex_date: '100.00000000',
  comment: 'Test comment',
  ...overrides,
})

describe('normalizeCorporateActionsItem', () => {
  it('keeps valid tax fields unchanged', () => {
    const result = normalizeCorporateActionsItem(makeCorporateActionsItem())

    expect(result?.tax_amount).toBe(1.5)
    expect(result?.tax_currency).toBe('USD')
  })

  it('normalizes numeric strings and defaults invalid tax fields', () => {
    const result = normalizeCorporateActionsItem(
      makeCorporateActionsItem({
        amount: '10.5',
        amount_per_one: '0.25',
        external_tax: '2.5',
        currency: 'EUR',
        external_tax_currency: '',
        tax_amount: '-',
        tax_currency: '',
      })
    )

    expect(result?.amount).toBe(10.5)
    expect(result?.amount_per_one).toBe(0.25)
    expect(result?.external_tax).toBe(2.5)
    expect(result?.external_tax_currency).toBe('EUR')
    expect(result?.tax_amount).toBe(0)
    expect(result?.tax_currency).toBe('EUR')
  })

  it('rejects incomplete items', () => {
    const result = normalizeCorporateActionsItem({
      currency: 'USD',
      tax_amount: '-',
      tax_currency: '',
    })

    expect(result).toBeNull()
  })

  it('allows items without comments', () => {
    const result = normalizeCorporateActionsItem(makeCorporateActionsItem({ comment: undefined }))

    expect(result).not.toBeNull()
    expect(result?.comment).toBeUndefined()
  })
})
