import { dateFormat, getFullDate, getFullMonth, isTradernetError, makeDateRange } from '../src/helper'

describe('Helper', () => {
  it('getFullMonth', async () => {
    const month01 = getFullMonth(new Date('2021-01-31T00:00:00.000Z'))
    const month12 = getFullMonth(new Date('2021-12-31T00:00:00.000Z'))
    expect(month01).toBe('01')
    expect(month12).toBe('12')
  })

  it('getFullMonth', async () => {
    expect(getFullDate(new Date('2021-12-01T00:00:00.000Z'))).toBe('01')
    expect(getFullDate(new Date('2021-12-31T00:00:00.000Z'))).toBe('31')
  })

  it('dateFormat', async () => {
    const date = dateFormat(new Date('2021-12-01T00:00:00.000Z'))
    expect(date).toBe('2021-12-01')
  })

  it('makeDateRange', async () => {
    const date = new Date()
    const range = makeDateRange()
    expect(range.dateFrom).toBe(date.getFullYear() + '-01-01')
    expect(range.dateTo).toBe(date.getFullYear() + '-12-31')
  })

  it('isTradernetError', async () => {
    const error = {
      error: 'Your request limit has been exceeded. Please try again later',
      errMsg: 'Your request limit has been exceeded. Please try again later',
      code: 429,
    }

    expect(isTradernetError(error)).toBe(true)
  })
})
