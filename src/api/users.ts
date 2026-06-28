import type { CreateUserInput, UpdateUserInput } from '../schemas/user.schema'
import { apiRequest } from './client'
import type { User } from '../types/api'

export function listUsers() {
  return apiRequest<User[]>('/api/users')
}

export function getUser(id: string) {
  return apiRequest<User>(`/api/users/${id}`)
}

export function createUser(input: CreateUserInput) {
  return apiRequest<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateUser(id: string, input: UpdateUserInput) {
  return apiRequest<User>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: string) {
  return apiRequest<{ message: string }>(`/api/users/${id}`, {
    method: 'DELETE',
  })
}
