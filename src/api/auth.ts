import {
  apiRequest,
  clearSession,
  getRefreshToken,
  setRefreshToken,
  setToken,
} from './client'
import type { AuthResult, User } from '../types/api'

export async function login(email: string, password: string): Promise<AuthResult> {
  const result = await apiRequest<AuthResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  setToken(result.token)
  setRefreshToken(result.refreshToken)
  return result
}

export async function getMe(): Promise<User> {
  return apiRequest<User>('/api/auth/me')
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()

  try {
    if (refreshToken) {
      await apiRequest<{ message: string }>('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    }
  } catch {
    // Always clear the local session even if the server call fails.
  } finally {
    clearSession()
  }
}
