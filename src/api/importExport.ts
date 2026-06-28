import type { ExportJob, ImportJob } from '../types/api'
import { apiDownload, apiRequest, apiUpload } from './client'

export function uploadImport(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return apiUpload<ImportJob>('/api/import/upload', formData)
}

export function processImport(jobId: string) {
  return apiRequest<ImportJob>(`/api/import/${jobId}/process`, {
    method: 'POST',
  })
}

export function getImportStatus(jobId: string) {
  return apiRequest<ImportJob>(`/api/import/${jobId}/status`)
}

export function createExport(filters?: Record<string, unknown>) {
  return apiRequest<ExportJob>('/api/export', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  })
}

export function downloadExport(jobId: string, fileName: string) {
  return apiDownload(`/api/export/${jobId}/download`, fileName)
}
