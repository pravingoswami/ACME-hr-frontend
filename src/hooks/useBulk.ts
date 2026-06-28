import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as bulkApi from '../api/bulk'
import type { BulkAdjustmentInput } from '../schemas/bulk.schema'

export function usePreviewBulkAdjustmentMutation() {
  return useMutation({
    mutationFn: (input: BulkAdjustmentInput) => bulkApi.previewBulkAdjustment(input),
  })
}

export function useApplyBulkAdjustmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BulkAdjustmentInput) => bulkApi.applyBulkAdjustment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })
}
