import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import { getToken } from '../api/client'
import { queryKeys } from '../lib/queryKeys'
import type { LoginInput } from '../schemas/auth.schema'

export function useAuthUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getMe,
    enabled: Boolean(getToken()),
    retry: false,
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input.email, input.password),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.auth.me, result.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return async () => {
    await authApi.logout()

    queryClient.removeQueries({ queryKey: queryKeys.auth.me })
    queryClient.clear()

    navigate('/login', { replace: true })
  }
}
