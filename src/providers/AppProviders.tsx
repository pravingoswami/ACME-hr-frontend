import { QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from '../context/NotificationContext'
import { queryClient } from '../lib/queryClient'
import { theme } from '../lib/theme'
import { AuthProvider } from './AuthProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <NotificationProvider>
            <AuthProvider>{children}</AuthProvider>
          </NotificationProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
