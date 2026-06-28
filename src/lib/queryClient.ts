import { QueryClient } from '@tanstack/react-query'
import { ApiClientError } from '../api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiClientError && error.status === 401) {
          return false
        }

        return failureCount < 1
      },
    },
  },
})
