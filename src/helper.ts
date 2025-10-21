import type { QueryDateRange } from './types/api'

export class TradernetRequestLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestLimitError'
  }
}

export function dateFormat(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getFullDate(date: Date) {
  return ('0' + date.getDate()).slice(-2).toString()
}

export function getFullMonth(date: Date) {
  return ('0' + (date.getMonth() + 1)).slice(-2).toString()
}

export function makeDateRange(): QueryDateRange {
  const date = new Date()

  return {
    dateFrom: dateFormat(new Date(`${date.getFullYear()}-01-01T00:00:00.000Z`)).toString(),
    dateTo: dateFormat(new Date(`${date.getFullYear()}-12-31T23:59:59.999Z`)).toString(),
  }
}

export function useRealFetch() {
  return !!process.env.USE_REAL_FETCH
}

export interface ApiError {
  errMsg: string
  error: string
  code: number
}

export function isTradernetError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errMsg' in error &&
    typeof error.errMsg === 'string' &&
    'error' in error &&
    typeof error.error === 'string' &&
    'code' in error &&
    typeof error.code === 'number'
  )
}
