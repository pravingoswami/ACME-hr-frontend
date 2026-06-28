import type { BulkAdjustmentResult, BulkAdjustmentPreview } from '../types/api'
import type { BulkAdjustmentInput } from '../schemas/bulk.schema'
import { apiRequest } from './client'

export function previewBulkAdjustment(input: BulkAdjustmentInput) {
  return apiRequest<BulkAdjustmentPreview>('/api/bulk/adjustment/preview', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function applyBulkAdjustment(input: BulkAdjustmentInput) {
  return apiRequest<BulkAdjustmentResult>('/api/bulk/adjustment/apply', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
