import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { loginSchema, type LoginInput } from '../schemas/auth.schema'
import { getErrorMessage, useNotification } from '../context/NotificationContext'
import { useAuth } from '../providers/AuthProvider'

export function LoginPage() {
  const { user, login, loading } = useAuth()
  const { showError } = useNotification()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@acme.com',
      password: 'Admin@12345',
    },
  })

  if (!loading && user) {
    return <Navigate to="/employees" replace />
  }

  async function onSubmit(values: LoginInput) {
    try {
      await login(values)
    } catch (error) {
      showError(getErrorMessage(error, 'Unable to sign in'))
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background:
          'radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 30%), radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.12), transparent 30%), #f8fafc',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                fontWeight: 700,
              }}
            >
              A
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ACME HR
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to manage employees and users
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                autoComplete="email"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email')}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                autoComplete="current-password"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register('password')}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
