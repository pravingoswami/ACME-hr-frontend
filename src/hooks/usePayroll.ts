import { useMutation } from '@tanstack/react-query'
import * as payrollApi from '../api/payroll'
import type { BulkSalarySlipInput } from '../api/payroll'

export function useDownloadEmployeeSalarySlipMutation() {
  return useMutation({
    mutationFn: ({
      employeeId,
      month,
      employeeCode,
    }: {
      employeeId: string
      month: string
      employeeCode?: string
    }) => payrollApi.downloadEmployeeSalarySlip(employeeId, month, employeeCode),
  })
}

export function useDownloadBulkSalarySlipsMutation() {
  return useMutation({
    mutationFn: (input: BulkSalarySlipInput) => payrollApi.downloadBulkSalarySlips(input),
  })
}
