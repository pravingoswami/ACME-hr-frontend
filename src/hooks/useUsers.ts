import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as usersApi from '../api/users'
import { queryKeys } from '../lib/queryKeys'
import type { CreateUserInput, UpdateUserInput } from '../schemas/user.schema'

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: usersApi.listUsers,
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersApi.updateUser(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
