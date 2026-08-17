import { dateFormat, getFullDate, getFullMonth, isTradernetError, useRealFetch } from '../src/helper'

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

  it('isTradernetError', async () => {
    const error = {
      error: 'Your request limit has been exceeded. Please try again later',
      errMsg: 'Your request limit has been exceeded. Please try again later',
      code: 429,
    }

    expect(isTradernetError(error)).toBe(true)
  })

  describe('useRealFetch', () => {
    const originalValue = process.env.USE_REAL_FETCH

    afterEach(() => {
      if (originalValue === undefined) {
        delete process.env.USE_REAL_FETCH
      } else {
        process.env.USE_REAL_FETCH = originalValue
      }
    })

    it.each([
      ['true', true],
      ['TRUE', true],
      ['1', true],
      ['false', false],
      ['0', false],
      ['', false],
    ])('parses %s as %s', (value, expected) => {
      process.env.USE_REAL_FETCH = value
      expect(useRealFetch()).toBe(expected)
    })
  })
})
