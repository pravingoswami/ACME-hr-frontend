import { z } from 'zod'
import { employeeStatusValues } from '../types/enums'

export const bulkAdjustmentSchema = z.object({
  filters: z.object({
    status: z.enum(employeeStatusValues).optional(),
    countryId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
  }),
  adjustment: z.discriminatedUnion('type', [
    z.object({ type: z.literal('PERCENT'), value: z.number() }),
    z.object({ type: z.literal('FLAT'), value: z.number() }),
  ]),
})

export type BulkAdjustmentInput = z.infer<typeof bulkAdjustmentSchema>

export type BulkAdjustmentFormValues = {
  status: '' | (typeof employeeStatusValues)[number]
  countryId: string
  departmentId: string
  adjustmentType: 'PERCENT' | 'FLAT'
  adjustmentValue: number
}

export const defaultBulkAdjustmentFormValues: BulkAdjustmentFormValues = {
  status: '',
  countryId: '',
  departmentId: '',
  adjustmentType: 'PERCENT',
  adjustmentValue: 0,
}

export function toBulkAdjustmentPayload(values: BulkAdjustmentFormValues): BulkAdjustmentInput {
  const filters: BulkAdjustmentInput['filters'] = {}

  if (values.status) {
    filters.status = values.status
  }

  if (values.countryId) {
    filters.countryId = values.countryId
  }

  if (values.departmentId) {
    filters.departmentId = values.departmentId
  }

  return {
    filters,
    adjustment: {
      type: values.adjustmentType,
      value: values.adjustmentValue,
    },
  }
}
