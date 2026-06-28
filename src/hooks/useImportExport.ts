import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as importExportApi from '../api/importExport'
import { queryKeys } from '../lib/queryKeys'

export function useUploadImportMutation() {
  return useMutation({
    mutationFn: (file: File) => importExportApi.uploadImport(file),
  })
}

export function useProcessImportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => importExportApi.processImport(jobId),
    onSuccess: (job) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.importExport.importStatus(job.id) })
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })
}

export function useImportStatusQuery(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.importExport.importStatus(jobId ?? ''),
    queryFn: () => importExportApi.getImportStatus(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (query) =>
      query.state.data?.status === 'PROCESSING' ? 2000 : false,
  })
}

export function useCreateExportMutation() {
  return useMutation({
    mutationFn: (filters?: Record<string, unknown>) => importExportApi.createExport(filters),
  })
}

export function useDownloadExportMutation() {
  return useMutation({
    mutationFn: ({ jobId, fileName }: { jobId: string; fileName: string }) =>
      importExportApi.downloadExport(jobId, fileName),
  })
}
