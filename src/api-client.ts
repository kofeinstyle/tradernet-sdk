import { logger } from './helper'
import { HttpClient } from './http'
import { normalizeCorporateActionsItem } from './mappers'
import type { CashFlowItem } from './types/common'
import type {
  BrokerReportResponse,
  CashFlowResponse,
  ReportQueryFilter,
  ReportQueryParams,
  ReportQueryResult,
  ReportQueryType,
  TradernetConfig,
  UserCashFlowResponse,
  UserCashFlowsParams,
} from './types/api'

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
      time_period: 'timePeriod' in filter && filter.timePeriod ? filter.timePeriod : '08:40:00',
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
      result.data.report.detailed = result.data.report.detailed.map(item =>
        normalizeCorporateActionsItem(item)
      )
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

  private hasDetailedReport<T extends ReportQueryType>(data: ReportQueryResult<T> | null | undefined): data is ReportQueryResult<T> & ReportWithDetailed {
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
}
