import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Alert, Snackbar } from '@mui/material'

type SnackbarSeverity = 'success' | 'error' | 'info'

interface NotificationContextValue {
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<SnackbarSeverity>('success')

  const show = useCallback((nextMessage: string, nextSeverity: SnackbarSeverity) => {
    setMessage(nextMessage)
    setSeverity(nextSeverity)
    setOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      showSuccess: (nextMessage: string) => show(nextMessage, 'success'),
      showError: (nextMessage: string) => show(nextMessage, 'error'),
    }),
    [show],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }

  return context
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
