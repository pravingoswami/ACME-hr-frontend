import type { Country, Department, JobGrade } from '../types/api'
import { apiRequest } from './client'

export function listCountries() {
  return apiRequest<Country[]>('/api/reference/countries')
}

export function listDepartments() {
  return apiRequest<Department[]>('/api/reference/departments')
}

export function listJobGrades() {
  return apiRequest<JobGrade[]>('/api/reference/job-grades')
}
