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
    this.baseUrl = config.baseUrl || 'https://tradernet.com/api'
    this.timeout = config.timeout || 60000
    this.retries = config.retries || 3
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
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: await response.text(),
        }
      }

      const responseData = await response.json()

      if (responseData.error) {
        if (isTradernetError(responseData) && responseData.code === 429) {
          throw new TradernetRequestLimitError(responseData.errMsg)
        }
        return {
          success: false,
          error: 'Freedom API error',
          message: responseData.error,
        }
      }

      return {
        success: true,
        data: responseData,
      }
    } catch (error) {
      if (attempt < this.retries && this.shouldRetry(error)) {
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

  private calcSign(params: Record<string, any>): string {
    const preSignString = this.preSign(params)
    return crypto.createHmac('sha256', this.apiSecret).update(preSignString).digest('hex')
  }

  private preSign(params: Record<string, any>): string {
    const keys = Object.keys(params).sort()
    const parts: string[] = []

    for (const key of keys) {
      const value = params[key]
      if (typeof value === 'object' && value !== null) {
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

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx, 429 status codes,
    return (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      error.name === 'RequestLimitError' ||
      (error.status && error.status >= 500 && error.status < 600)
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
