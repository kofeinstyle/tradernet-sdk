import { logger } from './helper'
import { HttpClient } from './http'
import {
  normalizeAccountSnapshotReport,
  normalizeCashFlowReportItem,
  normalizeCorporateActionsItem,
  normalizeInOutItem,
  normalizeOrder,
  normalizePortfolioAccount,
  normalizePortfolioPosition,
  normalizeReportTotals,
  normalizeSecuritiesFlowItem,
  normalizeTradeItem,
  normalizeUserProfile,
} from './mappers'
import type {
  ArrayReportQueryType,
  BrokerReportResponse,
  CashFlowResponse,
  OrdersFilter,
  OrdersHistoryFilter,
  OrdersHistoryResponse,
  OrdersResponse,
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
import type { AccountSnapshotReport } from './types/broker-reports'
import type { CashFlowItem } from './types/cash-flows'

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/

const toOrderHistoryTimestamp = (value: string, endOfDay: boolean): string => {
  if (!dateOnlyPattern.test(value)) {
    return value
  }

  return `${value}T${endOfDay ? '23:59:59' : '00:00:00'}`
}

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

    if (type === 'account_at_start' || type === 'account_at_end') {
      normalizeAccountSnapshotReport(result.data)
      if (!this.hasAccountSnapshotReport(result.data)) {
        return {
          success: false,
          error: 'Invalid API response',
          message: `Missing report.account data for ${type} report`,
        }
      }

      return {
        success: true,
        data: result.data,
      }
    }

    if (type === 'cash_flows' || type === 'securities_flows') {
      if (!this.hasArrayReport(result.data)) {
        return {
          success: false,
          error: 'Invalid API response',
          message: `Missing report array data for ${type} report`,
        }
      }

      const normalizeItem = this.getArrayReportItemNormalizer(type)
      const report: Record<string, unknown>[] = result.data.report
      for (const [index, item] of report.entries()) {
        const normalizedItem = normalizeItem(item)
        if (!normalizedItem) {
          return {
            success: false,
            error: 'Invalid API response',
            message: `Invalid ${type} item at index ${index}`,
          }
        }
        report[index] = normalizedItem
      }

      return {
        success: true,
        data: result.data,
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

    normalizeReportTotals(result.data.report)

    const normalizeDetailedItem = this.getDetailedReportItemNormalizer(type)
    if (normalizeDetailedItem) {
      const normalizedItems = []
      for (const [index, item] of result.data.report.detailed.entries()) {
        const normalizedItem = normalizeDetailedItem(item)
        if (!normalizedItem) {
          return {
            success: false,
            error: 'Invalid API response',
            message: `Invalid ${type} item at index ${index}`,
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

  async getOrders(filter: OrdersFilter = {}): Promise<OrdersResponse> {
    const result = await this.httpClient.makeRequest<unknown>('getNotifyOrderJson', {
      active_only: filter.activeOnly === false ? 0 : 1,
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        errorObject: result.errorObject,
        message: result.message,
      }
    }

    const state = this.getOrdersState(result.data)
    if (!state) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'Missing result.orders data for getOrders',
      }
    }

    if (state.order === undefined) {
      return { success: true, data: { orders: [] } }
    }

    if (!Array.isArray(state.order)) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'result.orders.order must be an array for getOrders',
      }
    }

    const orders = []
    for (const [index, item] of state.order.entries()) {
      const order = normalizeOrder(item)
      if (!order) {
        return {
          success: false,
          error: 'Invalid API response',
          message: `Invalid order at index ${index}`,
        }
      }
      orders.push(order)
    }

    return { success: true, data: { orders } }
  }

  async getOrdersHistory(filter: OrdersHistoryFilter): Promise<OrdersHistoryResponse> {
    const result = await this.httpClient.makeRequest<unknown>('getOrdersHistory', {
      from: toOrderHistoryTimestamp(filter.dateFrom, false),
      till: toOrderHistoryTimestamp(filter.dateTo, true),
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        errorObject: result.errorObject,
        message: result.message,
      }
    }

    const state = this.getOrdersHistoryState(result.data)
    if (!state) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'Missing orders data for getOrdersHistory',
      }
    }

    if (state.order === undefined) {
      return { success: true, data: { orders: [] } }
    }

    if (!Array.isArray(state.order)) {
      return {
        success: false,
        error: 'Invalid API response',
        message: 'orders.order must be an array for getOrdersHistory',
      }
    }

    const orders = []
    for (const [index, item] of state.order.entries()) {
      const order = normalizeOrder(item)
      if (!order) {
        return {
          success: false,
          error: 'Invalid API response',
          message: `Invalid historical order at index ${index}`,
        }
      }
      orders.push(order)
    }

    return { success: true, data: { orders } }
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

  private getArrayReportItemNormalizer(type: ArrayReportQueryType): (item: unknown) => Record<string, unknown> | null {
    return type === 'cash_flows' ? normalizeCashFlowReportItem : normalizeSecuritiesFlowItem
  }

  private getDetailedReportItemNormalizer(
    type: ReportQueryType
  ): ((item: unknown) => Record<string, unknown> | null) | null {
    switch (type) {
      case 'corporate_actions':
        return normalizeCorporateActionsItem
      case 'trades':
        return normalizeTradeItem
      case 'in_outs':
        return normalizeInOutItem
      default:
        return null
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

  private hasAccountSnapshotReport(data: unknown): data is AccountSnapshotReport {
    if (!this.isRecord(data) || !this.isRecord(data.report) || !this.isRecord(data.report.account)) {
      return false
    }

    const { account, date } = data.report
    if (
      typeof date !== 'string' ||
      typeof account.net_assets !== 'number' ||
      !this.isRecord(account.positions_from_ts) ||
      !this.isRecord(account.positions_from_ts.ps)
    ) {
      return false
    }

    const { acc, pos } = account.positions_from_ts.ps
    return Array.isArray(acc) && Array.isArray(pos) && this.hasObjectItems(acc) && this.hasObjectItems(pos)
  }

  private hasArrayReport(data: unknown): data is { report: Record<string, unknown>[] } {
    if (!this.isRecord(data) || !Array.isArray(data.report)) {
      return false
    }

    return this.hasObjectItems(data.report)
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

  private getOrdersState(data: unknown): Record<string, unknown> | null {
    if (!this.isRecord(data) || !this.isRecord(data.result) || !this.isRecord(data.result.orders)) {
      return null
    }

    return data.result.orders
  }

  private getOrdersHistoryState(data: unknown): Record<string, unknown> | null {
    if (!this.isRecord(data) || !this.isRecord(data.orders)) {
      return null
    }

    return data.orders
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
