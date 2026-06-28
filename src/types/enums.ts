export const employeeStatusValues = ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] as const

export type EmployeeStatus = (typeof employeeStatusValues)[number]

export type Role = 'ADMIN' | 'HR_MANAGER'

export const auditActionValues = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'BULK_ADJUST',
  'IMPORT',
  'EXPORT',
] as const

export type AuditAction = (typeof auditActionValues)[number]

export const jobStatusValues = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const

export type JobStatus = (typeof jobStatusValues)[number]
