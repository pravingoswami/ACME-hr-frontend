import type { CreateEmployeeInput, UpdateEmployeeInput } from '../schemas/employee.schema'
import type { UpdateSalaryInput } from '../schemas/salary.schema'
import { apiRequest } from './client'
import type { Employee, EmployeeListFilters, PaginatedEmployees, SalaryRecord } from '../types/api'

function buildListQuery(page: number, limit: number, filters?: EmployeeListFilters) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (filters?.search) {
    params.set('search', filters.search)
  }

  if (filters?.name) {
    params.set('name', filters.name)
  }

  if (filters?.code) {
    params.set('code', filters.code)
  }

  if (filters?.email) {
    params.set('email', filters.email)
  }

  if (filters?.salaryMin !== undefined) {
    params.set('salaryMin', String(filters.salaryMin))
  }

  if (filters?.salaryMax !== undefined) {
    params.set('salaryMax', String(filters.salaryMax))
  }

  if (filters?.department) {
    params.set('department', filters.department)
  }

  if (filters?.status) {
    params.set('status', filters.status)
  }

  if (filters?.countryId) {
    params.set('countryId', filters.countryId)
  }

  if (filters?.departmentId) {
    params.set('departmentId', filters.departmentId)
  }

  if (filters?.jobGradeId) {
    params.set('jobGradeId', filters.jobGradeId)
  }

  if (filters?.sortBy) {
    params.set('sortBy', filters.sortBy)
  }

  if (filters?.sortOrder) {
    params.set('sortOrder', filters.sortOrder)
  }

  return params
}

export function listEmployees(page = 1, limit = 10, filters?: EmployeeListFilters) {
  return apiRequest<PaginatedEmployees>(`/api/employees?${buildListQuery(page, limit, filters)}`)
}

export function getEmployee(id: string) {
  return apiRequest<Employee>(`/api/employees/${id}`)
}

export function getEmployeeSalaryHistory(id: string) {
  return apiRequest<SalaryRecord[]>(`/api/employees/${id}/salary-history`)
}

export function createEmployee(input: CreateEmployeeInput) {
  return apiRequest<Employee>('/api/employees', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateEmployee(id: string, input: UpdateEmployeeInput) {
  return apiRequest<Employee>(`/api/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function updateEmployeeSalary(id: string, input: UpdateSalaryInput) {
  return apiRequest<SalaryRecord>(`/api/employees/${id}/salary`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deactivateEmployee(id: string) {
  return apiRequest<Employee>(`/api/employees/${id}/deactivate`, {
    method: 'PATCH',
  })
}

export function deleteEmployee(id: string) {
  return apiRequest<{ message: string }>(`/api/employees/${id}`, {
    method: 'DELETE',
  })
}
