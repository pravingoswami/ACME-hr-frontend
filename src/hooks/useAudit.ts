import { useQuery } from '@tanstack/react-query'
import * as auditApi from '../api/audit'
import { queryKeys } from '../lib/queryKeys'

export function useAuditLogsQuery(page: number, limit = 20) {
  return useQuery({
    queryKey: queryKeys.audit.list(page, limit),
    queryFn: () => auditApi.listAuditLogs(page, limit),
  })
}
