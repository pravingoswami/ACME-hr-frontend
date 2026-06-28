import { z } from 'zod'

export const salaryFormSchema = z.object({
  baseSalary: z.number().positive('Base salary must be positive'),
  bonus: z.number().min(0).optional(),
  allowances: z.number().min(0).optional(),
  currencyCode: z.string().length(3).optional(),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
})

export type SalaryFormValues = z.infer<typeof salaryFormSchema>
export type UpdateSalaryInput = SalaryFormValues

export function toSalaryPayload(values: SalaryFormValues): UpdateSalaryInput {
  return {
    baseSalary: values.baseSalary,
    bonus: values.bonus ?? 0,
    allowances: values.allowances ?? 0,
    currencyCode: values.currencyCode ?? 'USD',
    effectiveFrom: values.effectiveFrom,
  }
}
