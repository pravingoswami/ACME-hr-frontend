import type { AnalyticsFilters, EmployeeListFilters } from '../types/api'

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (page: number, limit: number, filters?: EmployeeListFilters) =>
      ['employees', page, limit, filters ?? {}] as const,
    detail: (id: string) => ['employees', id] as const,
    salaryHistory: (id: string) => ['employees', id, 'salary-history'] as const,
  },
  analytics: {
    summary: (filters?: AnalyticsFilters) => ['analytics', 'summary', filters ?? {}] as const,
    byDepartment: (filters?: AnalyticsFilters) =>
      ['analytics', 'by-department', filters ?? {}] as const,
    byStatus: (filters?: AnalyticsFilters) => ['analytics', 'by-status', filters ?? {}] as const,
    payRange: (filters?: AnalyticsFilters) => ['analytics', 'pay-range', filters ?? {}] as const,
  },
  audit: {
    list: (page: number, limit: number) => ['audit-logs', page, limit] as const,
  },
  reference: {
    countries: ['reference', 'countries'] as const,
    departments: ['reference', 'departments'] as const,
    jobGrades: ['reference', 'job-grades'] as const,
  },
  importExport: {
    importStatus: (jobId: string) => ['import', jobId] as const,
  },
}
