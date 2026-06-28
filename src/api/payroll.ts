import { apiDownload, apiDownloadPost } from './client'
import type { EmployeeStatus } from '../types/enums'

export interface BulkSalarySlipInput {
  month: string
  employeeIds?: string[]
  department?: string
  status?: EmployeeStatus
}

export function downloadEmployeeSalarySlip(
  employeeId: string,
  month: string,
  employeeCode?: string,
) {
  const params = new URLSearchParams({ month })
  const fileName = employeeCode
    ? `salary-slip-${employeeCode}-${month}.pdf`
    : `salary-slip-${month}.pdf`

  return apiDownload(`/api/employees/${employeeId}/salary-slip?${params}`, fileName)
}

export function downloadBulkSalarySlips(input: BulkSalarySlipInput) {
  return apiDownloadPost('/api/payroll/salary-slips/bulk', input, `salary-slips-${input.month}.zip`)
}
