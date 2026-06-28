import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as employeesApi from '../api/employees'
import { queryKeys } from '../lib/queryKeys'
import type { CreateEmployeeInput, UpdateEmployeeInput } from '../schemas/employee.schema'
import type { UpdateSalaryInput } from '../schemas/salary.schema'
import type { EmployeeListFilters } from '../types/api'

export function useEmployeesQuery(page: number, limit = 10, filters?: EmployeeListFilters) {
  return useQuery({
    queryKey: queryKeys.employees.list(page, limit, filters),
    queryFn: () => employeesApi.listEmployees(page, limit, filters),
  })
}

export function useEmployeeQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeesApi.getEmployee(id),
    enabled: Boolean(id),
  })
}

export function useEmployeeSalaryHistoryQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.employees.salaryHistory(id),
    queryFn: () => employeesApi.getEmployeeSalaryHistory(id),
    enabled: Boolean(id),
  })
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeesApi.createEmployee(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) =>
      employeesApi.updateEmployee(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useUpdateEmployeeSalaryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSalaryInput }) =>
      employeesApi.updateEmployeeSalary(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.salaryHistory(variables.id) })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useDeactivateEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.deactivateEmployee(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
