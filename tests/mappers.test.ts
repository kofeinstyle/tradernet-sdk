import { normalizeCashFlowReportItem, normalizeCorporateActionsItem, normalizeSecuritiesFlowItem } from '../src/mappers'

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

const makeCashFlowItem = (overrides: Record<string, unknown> = {}) => ({
  date_start: '2026-09-15 23:59:59',
  date_end: '2026-09-16 23:59:59',
  curr: 'USD',
  curr_at_start: 1655.66,
  curr_traded: 114.95,
  curr_commissioned: '0.2',
  curr_flowed: '10',
  curr_at_end: 1780.41,
  ...overrides,
})

describe('normalizeCashFlowReportItem', () => {
  it('converts every amount to a number regardless of its representation', () => {
    const result = normalizeCashFlowReportItem(makeCashFlowItem())

    expect(result).toEqual({
      date_start: '2026-09-15 23:59:59',
      date_end: '2026-09-16 23:59:59',
      curr: 'USD',
      curr_at_start: 1655.66,
      curr_traded: 114.95,
      curr_commissioned: 0.2,
      curr_flowed: 10,
      curr_at_end: 1780.41,
    })
  })

  it('keeps negative amounts', () => {
    const result = normalizeCashFlowReportItem(
      makeCashFlowItem({ curr: 'EUR', curr_traded: -100, curr_flowed: '100', curr_at_end: 0, curr_at_start: 0 })
    )

    expect(result?.curr_traded).toBe(-100)
    expect(result?.curr_flowed).toBe(100)
  })

  it('preserves unknown fields', () => {
    const result = normalizeCashFlowReportItem(makeCashFlowItem({ curr_unknown: 'x' }))

    expect(result).toHaveProperty('curr_unknown', 'x')
  })

  it('rejects unusable and missing amounts', () => {
    expect(normalizeCashFlowReportItem(makeCashFlowItem({ curr_commissioned: '-' }))).toBeNull()
    expect(normalizeCashFlowReportItem(makeCashFlowItem({ curr_flowed: undefined }))).toBeNull()
    expect(normalizeCashFlowReportItem(makeCashFlowItem({ curr: '' }))).toBeNull()
    expect(normalizeCashFlowReportItem(null)).toBeNull()
  })
})

describe('normalizeSecuritiesFlowItem', () => {
  const makeSecuritiesFlowItem = (overrides: Record<string, unknown> = {}) => ({
    date_start: '2022-01-01 23:59:59',
    date_end: '2022-12-31 23:59:59',
    ticker: 'C.US',
    isin: 'US1729674242',
    quantity_at_start: '0',
    securities_traded: '20',
    securities_flowed: 0,
    quantity_at_end: 20,
    security_price_at_start: 0,
    security_price: '45.16',
    security_currency: 'USD',
    position_value: '903.2',
    mkt_id: 30000000001,
    instr_type: 1,
    instr_kind: 1,
    ...overrides,
  })

  it('normalizes quantities, prices, and the market identifier', () => {
    const result = normalizeSecuritiesFlowItem(makeSecuritiesFlowItem())

    expect(result?.quantity_at_start).toBe(0)
    expect(result?.securities_traded).toBe(20)
    expect(result?.security_price).toBe(45.16)
    expect(result?.position_value).toBe(903.2)
    expect(result?.mkt_id).toBe('30000000001')
  })

  it('accepts rows without instrument metadata', () => {
    const result = normalizeSecuritiesFlowItem(makeSecuritiesFlowItem({ instr_type: undefined, instr_kind: undefined }))

    expect(result).not.toBeNull()
  })

  it('rejects unusable quantities', () => {
    expect(normalizeSecuritiesFlowItem(makeSecuritiesFlowItem({ quantity_at_end: 'n/a' }))).toBeNull()
  })
})
