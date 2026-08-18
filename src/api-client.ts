import { logger } from './helper'
import { HttpClient } from './http'
import {
  normalizeCorporateActionsItem,
  normalizePortfolioAccount,
  normalizePortfolioPosition,
  normalizeUserProfile,
} from './mappers'
import type {
  BrokerReportResponse,
  CashFlowResponse,
  PortfolioResponse,
  ReportQueryFilter,
  ReportQueryParams,
  ReportQueryResult,
  ReportQueryType,
  TradernetConfig,
  UserCashFlowResponse,
  UserCashFlowsParams,
  UserProfileResponse,
} from './types/api'
import type { CashFlowItem } from './types/cash-flows'

type ReportWithDetailed = {
  report: {
    detailed: Record<string, unknown>[]
  }
}

export class TradernetApiClient {
  private httpClient: HttpClient

  constructor(config: TradernetConfig) {
    this.httpClient = new HttpClient(config)
  }

  async getBrokerReport<T extends ReportQueryType>(filter: ReportQueryFilter, type: T): Promise<BrokerReportResponse<T>>

  async getBrokerReport<T extends ReportQueryType>(
    filter: ReportQueryFilter,
    type: T
  ): Promise<BrokerReportResponse<T>> {
    const payload: ReportQueryParams = {
      date_start: filter.dateFrom,
      date_end: filter.dateTo,
      time_period: filter.timePeriod ?? '23:59:59',
      type: type,
    }
    if (this.httpClient.verbose) {
      logger('getBrokerReport', payload)
    }
    const result = await this.httpClient.makeRequest<ReportQueryResult<T>>('getBrokerReport', payload, 1)

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        errorObject: result.errorObject,
        message: result.message,
      }
    }

    if (!this.hasDetailedReport(result.data)) {
      return {
        success: false,
        error: 'Invalid API response',
        message: `Missing report.detailed data for ${type} report`,
      }
    }

    if (!this.hasObjectItems(result.data.report.detailed)) {
      return {
        success: false,
        error: 'Invalid API response',
        message: `report.detailed must contain objects for ${type} report`,
      }
    }

    if (type === 'corporate_actions') {
      const normalizedItems = []
      for (const [index, item] of result.data.report.detailed.entries()) {
        const normalizedItem = normalizeCorporateActionsItem(item)
        if (!normalizedItem) {
          return {
            success: false,
            error: 'Invalid API response',
            message: `Invalid corporate_actions item at index ${index}`,
          }
        }
        normalizedItems.push(normalizedItem)
      }
      result.data.report.detailed = normalizedItems
    }

    return {
      success: true,
      data: result.data,
    }
  }

  async getUserCashFlows(params?: UserCashFlowsParams): Promise<UserCashFlowResponse> {
    const payload: UserCashFlowsParams = params ? { ...params } : { take: null }
    const result = await this.httpClient.makeRequest<CashFlowResponse>('getUserCashFlows', payload, 1)

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        errorObject: result.errorObject,
        message: result.message,
      }
    }

    if (!result.data) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'Missing cash flow data for getUserCashFlows',
      }
    }

    if ('cashflow' in result.data && !Array.isArray(result.data.cashflow)) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'cashflow must be an array for getUserCashFlows',
      }
    }

    const cashflow: CashFlowItem[] = Array.isArray(result.data.cashflow) ? result.data.cashflow : []

    return {
      success: true,
      data: {
        limits: result.data.limits,
        cash_totals: result.data.cash_totals,
        total: Number(result.data.total || 0),
        cashflow: cashflow.map(item => ({
          ...item,
          sumRaw: Number(item.sumRaw),
          sum: Number(item.sum),
        })),
      },
    }
  }

  async getPortfolio(): Promise<PortfolioResponse> {
    const result = await this.httpClient.makeRequest<unknown>('getPositionJson')

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        errorObject: result.errorObject,
        message: result.message,
      }
    }

    const state = this.getPortfolioState(result.data)
    if (!state) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'Missing result.ps data for getPortfolio',
      }
    }

    if (!Array.isArray(state.acc)) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'result.ps.acc must be an array for getPortfolio',
      }
    }

    if (!Array.isArray(state.pos)) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'result.ps.pos must be an array for getPortfolio',
      }
    }

    if (typeof state.loaded !== 'boolean') {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'result.ps.loaded must be a boolean for getPortfolio',
      }
    }

    const accounts = []
    for (const [index, item] of state.acc.entries()) {
      const account = normalizePortfolioAccount(item)
      if (!account) {
        return {
          success: false,
          error: 'Invalid API response',
          message: `Invalid portfolio account at index ${index}`,
        }
      }
      accounts.push(account)
    }

    const positions = []
    for (const [index, item] of state.pos.entries()) {
      const position = normalizePortfolioPosition(item)
      if (!position) {
        return {
          success: false,
          error: 'Invalid API response',
          message: `Invalid portfolio position at index ${index}`,
        }
      }
      positions.push(position)
    }

    return {
      success: true,
      data: {
        loaded: state.loaded,
        accounts,
        positions,
      },
    }
  }

  async getUserProfile(): Promise<UserProfileResponse> {
    const result = await this.httpClient.makeRequest<unknown>('getOPQ')

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        errorObject: result.errorObject,
        message: result.message,
      }
    }

    const profile = normalizeUserProfile(result.data)
    if (!profile) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'Missing homeCurrency or main_curr data for getUserProfile',
      }
    }

    return {
      success: true,
      data: profile,
    }
  }

  private hasDetailedReport<T extends ReportQueryType>(
    data: ReportQueryResult<T> | null | undefined
  ): data is ReportQueryResult<T> & ReportWithDetailed {
    return (
      typeof data === 'object' &&
      data !== null &&
      'report' in data &&
      typeof data.report === 'object' &&
      data.report !== null &&
      'detailed' in data.report &&
      Array.isArray(data.report.detailed)
    )
  }

  private hasObjectItems(items: unknown[]): items is Record<string, unknown>[] {
    return items.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))
  }

  private getPortfolioState(data: unknown): Record<string, unknown> | null {
    if (!this.isRecord(data) || !this.isRecord(data.result) || !this.isRecord(data.result.ps)) {
      return null
    }

    return data.result.ps
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
