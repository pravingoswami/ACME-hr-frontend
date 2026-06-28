import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { queryKeys } from '../lib/queryKeys'
import { useAuthUser, useLoginMutation, useLogout } from '../hooks/useAuth'
import type { User } from '../types/api'
import type { LoginInput } from '../schemas/auth.schema'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data: user = null, isLoading, isFetching, isError } = useAuthUser()
  const loginMutation = useLoginMutation()
  const logout = useLogout()

  useEffect(() => {
    if (isError) {
      void authApi.logout().finally(() => {
        queryClient.removeQueries({ queryKey: queryKeys.auth.me })
        queryClient.clear()
      })
    }
  }, [isError, queryClient])

  const value = useMemo(
    () => ({
      user,
      loading: isLoading || isFetching,
      login: async (input: LoginInput) => {
        await loginMutation.mutateAsync(input)
      },
      logout,
      isAdmin: user?.role === 'ADMIN',
    }),
    [user, isLoading, isFetching, loginMutation, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
