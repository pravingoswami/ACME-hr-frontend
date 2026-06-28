import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  createUserSchema,
  updateUserFormSchema,
  type CreateUserInput,
  type UpdateUserFormValues,
} from '../../schemas/user.schema'
import type { User } from '../../types/api'

interface UserFormDialogProps {
  open: boolean
  user?: User | null
  loading?: boolean
  onClose: () => void
  onCreate: (values: CreateUserInput) => Promise<void>
  onUpdate: (values: UpdateUserFormValues) => Promise<void>
}

export function UserFormDialog({
  open,
  user,
  loading = false,
  onClose,
  onCreate,
  onUpdate,
}: UserFormDialogProps) {
  const isEdit = Boolean(user)

  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  })

  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    if (user) {
      editForm.reset({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      })
    } else {
      createForm.reset({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      })
    }
  }, [open, user, createForm, editForm])

  async function handleCreateSubmit(values: CreateUserInput) {
    await onCreate(values)
  }

  async function handleEditSubmit(values: UpdateUserFormValues) {
    await onUpdate(values)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit User' : 'Create HR Manager'}</DialogTitle>

      {isEdit ? (
        <Box component="form" onSubmit={editForm.handleSubmit(handleEditSubmit)}>
          <DialogContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="First name"
                  fullWidth
                  error={Boolean(editForm.formState.errors.firstName)}
                  helperText={editForm.formState.errors.firstName?.message}
                  {...editForm.register('firstName')}
                />
                <TextField
                  label="Last name"
                  fullWidth
                  error={Boolean(editForm.formState.errors.lastName)}
                  helperText={editForm.formState.errors.lastName?.message}
                  {...editForm.register('lastName')}
                />
              </Stack>

              <TextField
                label="Email"
                type="email"
                fullWidth
                error={Boolean(editForm.formState.errors.email)}
                helperText={editForm.formState.errors.email?.message}
                {...editForm.register('email')}
              />

              <TextField
                label="New password (optional)"
                type="password"
                fullWidth
                error={Boolean(editForm.formState.errors.password)}
                helperText={editForm.formState.errors.password?.message}
                {...editForm.register('password')}
              />

              <Controller
                name="isActive"
                control={editForm.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox checked={field.value} onChange={field.onChange} />
                    }
                    label="Active account"
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogActions>
        </Box>
      ) : (
        <Box component="form" onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
          <DialogContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="First name"
                  fullWidth
                  error={Boolean(createForm.formState.errors.firstName)}
                  helperText={createForm.formState.errors.firstName?.message}
                  {...createForm.register('firstName')}
                />
                <TextField
                  label="Last name"
                  fullWidth
                  error={Boolean(createForm.formState.errors.lastName)}
                  helperText={createForm.formState.errors.lastName?.message}
                  {...createForm.register('lastName')}
                />
              </Stack>

              <TextField
                label="Email"
                type="email"
                fullWidth
                error={Boolean(createForm.formState.errors.email)}
                helperText={createForm.formState.errors.email?.message}
                {...createForm.register('email')}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                error={Boolean(createForm.formState.errors.password)}
                helperText={createForm.formState.errors.password?.message}
                {...createForm.register('password')}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Creating...' : 'Create user'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  )
}
