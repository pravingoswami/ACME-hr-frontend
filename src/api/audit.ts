import type { PaginatedAuditLogs } from '../types/api'
import { apiRequest } from './client'

export function listAuditLogs(page = 1, limit = 20) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return apiRequest<PaginatedAuditLogs>(`/api/audit-logs?${params}`)
}
