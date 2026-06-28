import type { AnalyticsFilters, AnalyticsByDepartment, AnalyticsByStatus, AnalyticsSummary, PayRange } from '../types/api'
import { apiRequest } from './client'

function buildQuery(filters?: AnalyticsFilters) {
  const params = new URLSearchParams()

  if (filters?.department) {
    params.set('department', filters.department)
  }

  if (filters?.status) {
    params.set('status', filters.status)
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getAnalyticsSummary(filters?: AnalyticsFilters) {
  return apiRequest<AnalyticsSummary>(`/api/analytics/summary${buildQuery(filters)}`)
}

export function getAnalyticsByDepartment(filters?: AnalyticsFilters) {
  return apiRequest<AnalyticsByDepartment[]>(`/api/analytics/by-department${buildQuery(filters)}`)
}

export function getAnalyticsByStatus(filters?: AnalyticsFilters) {
  return apiRequest<AnalyticsByStatus[]>(`/api/analytics/by-status${buildQuery(filters)}`)
}

export function getPayRange(filters?: AnalyticsFilters) {
  return apiRequest<PayRange>(`/api/analytics/pay-range${buildQuery(filters)}`)
}
