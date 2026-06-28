import type { AuditAction, EmployeeStatus, JobStatus, Role } from './enums'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  department: string
  position: string
  hireDate: string
  salary: string | number | null
  status: EmployeeStatus
  countryId: string | null
  departmentId: string | null
  jobGradeId: string | null
  createdAt: string
  updatedAt: string
  salaryHistory?: SalaryRecord[]
}

export interface SalaryRevision {
  id: string
  salaryRecordId: string
  employeeId: string
  changedById: string | null
  fieldName: string
  oldValue: string
  newValue: string
  changedAt: string
  changedBy?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> | null
}

export interface SalaryRecord {
  id: string
  employeeId: string
  baseSalary: string | number
  bonus: string | number
  allowances: string | number
  currencyCode: string
  effectiveFrom: string
  effectiveTo: string | null
  isCurrent: boolean
  createdAt: string
  revisions?: SalaryRevision[]
}

export interface Country {
  id: string
  code: string
  name: string
  currencyCode: string
}

export interface Department {
  id: string
  code: string
  name: string
}

export interface JobGrade {
  id: string
  name: string
  level: number
  minSalary: string | number
  maxSalary: string | number
}

export interface AnalyticsSummary {
  headcount: number
  avgTotalComp: number
  medianTotalComp: number
  minTotalComp: number
  maxTotalComp: number
  totalPayroll: number
}

export interface AnalyticsByDepartment {
  department: string
  headcount: number
  avgSalary: number
  totalPayroll: number
}

export interface AnalyticsByStatus {
  status: EmployeeStatus
  headcount: number
}

export interface PayRange {
  p25: number
  p50: number
  p75: number
  p90: number
  count: number
}

export interface AnalyticsFilters {
  department?: string
  status?: EmployeeStatus
}

export interface AuditLog {
  id: string
  userId: string
  action: AuditAction
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: string
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>
}

export interface BulkAdjustmentPreview {
  affectedCount: number
  sample: Array<{
    id: string
    employeeCode: string
    name: string
    currentSalary: number
    newSalary: number
  }>
}

export interface BulkAdjustmentResult {
  affectedCount: number
}

export interface ImportJob {
  id: string
  userId: string
  fileKey: string
  status: JobStatus
  rowCount: number | null
  errorReport: { errors?: string[]; message?: string } | null
  createdAt: string
  updatedAt: string
}

export interface ExportJob {
  id: string
  userId: string
  fileKey: string
  status: JobStatus
  rowCount: number | null
  filters: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  expiresAt: string | null
}

export interface EmployeeListFilters {
  search?: string
  name?: string
  code?: string
  email?: string
  salaryMin?: number
  salaryMax?: number
  department?: string
  status?: EmployeeStatus
  countryId?: string
  departmentId?: string
  jobGradeId?: string
  sortBy?: 'employeeCode' | 'lastName' | 'hireDate' | 'createdAt' | 'salary'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedEmployees {
  items: Employee[]
  pagination: PaginationMeta
}

export interface PaginatedAuditLogs {
  items: AuditLog[]
  pagination: PaginationMeta
}

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface AuthResult {
  user: User
  token: string
  refreshToken: string
}
