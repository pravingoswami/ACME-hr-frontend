import { useQuery } from '@tanstack/react-query'
import * as referenceApi from '../api/reference'
import { queryKeys } from '../lib/queryKeys'

export function useCountriesQuery() {
  return useQuery({
    queryKey: queryKeys.reference.countries,
    queryFn: referenceApi.listCountries,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: queryKeys.reference.departments,
    queryFn: referenceApi.listDepartments,
    staleTime: 5 * 60 * 1000,
  })
}

export function useJobGradesQuery() {
  return useQuery({
    queryKey: queryKeys.reference.jobGrades,
    queryFn: referenceApi.listJobGrades,
    staleTime: 5 * 60 * 1000,
  })
}
