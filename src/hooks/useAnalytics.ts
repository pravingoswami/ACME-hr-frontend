import { useQuery } from '@tanstack/react-query'
import * as analyticsApi from '../api/analytics'
import { queryKeys } from '../lib/queryKeys'
import type { AnalyticsFilters } from '../types/api'

export function useAnalyticsSummary(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(filters),
    queryFn: () => analyticsApi.getAnalyticsSummary(filters),
  })
}

export function useAnalyticsByDepartment(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.byDepartment(filters),
    queryFn: () => analyticsApi.getAnalyticsByDepartment(filters),
  })
}

export function useAnalyticsByStatus(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.byStatus(filters),
    queryFn: () => analyticsApi.getAnalyticsByStatus(filters),
  })
}

export function usePayRange(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.payRange(filters),
    queryFn: () => analyticsApi.getPayRange(filters),
  })
}
