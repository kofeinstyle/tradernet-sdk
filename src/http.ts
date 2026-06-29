import crypto from 'crypto'
import { TradernetRequestLimitError, isTradernetError, logger } from './helper'
import { ApiCommand, ApiResponse, ReportQueryParams, TradernetConfig, UserCashFlowsParams } from './types/api'

type RequestHeaders = {
  'Content-Type': string
  'X-NtApi-Sig': string
  'X-NtApi-PublicKey': string
}

type RequestParams = ReportQueryParams | UserCashFlowsParams

type RequestPayload = {
  cmd: ApiCommand
  params: RequestParams
  apiKey: string
  nonce: number
}

type ApiErrorResponse = {
  error: string
  errMsg?: string
}

class RetryableHttpStatusError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message || `HTTP ${status}`)
    this.name = 'RetryableHttpStatusError'
  }
}

export class HttpClient {
  private readonly apiKey: string
  private readonly apiSecret: string
  private readonly baseUrl: string
  private readonly timeout: number
  private readonly retries: number
  public readonly verbose: boolean

  constructor(config: TradernetConfig) {
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
    this.baseUrl = config.baseUrl ?? 'https://tradernet.com/api'
    this.timeout = config.timeout ?? 60000
    this.retries = config.retries ?? 3
    this.verbose = config.verbose === true
  }

  public async makeRequest<T>(cmd: ApiCommand, params: RequestParams, attempt: number = 1): Promise<ApiResponse<T>> {
    const payload: RequestPayload = {
      cmd: cmd,
      params,
      apiKey: this.apiKey,
      nonce: Math.floor(Date.now() * 10000),
    }
    const headers: RequestHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-NtApi-Sig': this.calcSign(payload),
      'X-NtApi-PublicKey': this.apiKey,
    }

    try {
      const response = await fetch(`${this.baseUrl}/v2/cmd/${cmd}`, {
        method: 'POST',
        headers: headers,
        body: this.toFormUrlEncoded(payload),
        signal: AbortSignal.timeout(this.timeout),
      })

      if (!response.ok) {
        const message = await response.text()
        if (this.isRetryableStatus(response.status)) {
          throw new RetryableHttpStatusError(response.status, message)
        }

        return {
          success: false,
          error: `HTTP ${response.status}`,
          message,
        }
      }

      const responseData: unknown = await response.json()

      if (this.hasApiError(responseData)) {
        if (isTradernetError(responseData) && responseData.code === 429) {
          throw new TradernetRequestLimitError(responseData.errMsg)
        }
        return {
          success: false,
          error: 'Freedom API error',
          message: responseData.errMsg ?? responseData.error,
        }
      }

      return {
        success: true,
        data: responseData as T,
      }
    } catch (error) {
      if (attempt <= this.retries && this.shouldRetry(error)) {
        const delayMs = Math.pow(2, attempt) * 3000
        if (this.verbose) {
          logger('retry', { cmd, attempt, delayMs })
        }
        await this.delay(delayMs) // Exponential backoff
        return this.makeRequest<T>(cmd, params, attempt + 1)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Freedom API error',
        errorObject: error instanceof Error ? error : null,
      }
    }
  }

  private calcSign(params: RequestPayload): string {
    const preSignString = this.preSign({ ...params })
    return crypto.createHmac('sha256', this.apiSecret).update(preSignString).digest('hex')
  }

  private preSign(params: Record<string, unknown>): string {
    const keys = Object.keys(params).sort()
    const parts: string[] = []

    for (const key of keys) {
      const value = params[key]
      if (Array.isArray(value)) {
        parts.push(`${key}=${this.preSign(Object.fromEntries(value.entries()))}`)
      } else if (this.isRecord(value)) {
        parts.push(`${key}=${this.preSign(value)}`)
      } else {
        parts.push(`${key}=${value}`)
      }
    }

    return parts.join('&')
  }

  private toFormUrlEncoded<T>(data: T, prefix: string = ''): string {
    const formBody: string[] = []

    if (!data || typeof data !== 'object') {
      throw new Error('Input data must be an object')
    }

    for (const [key, value] of Object.entries(data)) {
      const encodedKey = prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key)
      if (value !== null && typeof value === 'object') {
        formBody.push(this.toFormUrlEncoded(value, encodedKey))
      } else {
        const encodedValue = encodeURIComponent(String(value))
        formBody.push(`${encodedKey}=${encodedValue}`)
      }
    }

    return formBody.join('&')
  }

  private shouldRetry(error: unknown): boolean {
    // Retry on network errors, timeouts, and 5xx, 429 status codes,
    if (!(error instanceof Error)) {
      return false
    }

    return (
      error.name === 'AbortError' ||
      error.name === 'TimeoutError' ||
      error.name === 'TypeError' ||
      error.name === 'RequestLimitError' ||
      error instanceof RetryableHttpStatusError
    )
  }

  private isRetryableStatus(status: number): boolean {
    return status === 429 || (status >= 500 && status < 600)
  }

  private hasApiError(response: unknown): response is ApiErrorResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'error' in response &&
      typeof response.error === 'string'
    )
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
