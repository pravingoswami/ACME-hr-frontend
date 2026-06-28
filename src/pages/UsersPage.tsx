import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PageLoader } from '../components/Layout'
import { StatusChip } from '../components/StatusChip'
import { UserFormDialog } from '../components/forms/UserFormDialog'
import { getErrorMessage, useNotification } from '../context/NotificationContext'
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from '../hooks/useUsers'
import {
  toUpdateUserPayload,
  type CreateUserInput,
  type UpdateUserFormValues,
} from '../schemas/user.schema'
import type { User } from '../types/api'
import { formatDate, fullName } from '../utils/format'

export function UsersPage() {
  const { showSuccess, showError } = useNotification()
  const { data: users = [], isLoading, isError, error } = useUsersQuery()
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  const deleteMutation = useDeleteUserMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  async function handleCreate(values: CreateUserInput) {
    try {
      await createMutation.mutateAsync(values)
      showSuccess('HR manager created successfully')
      setDialogOpen(false)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to create user'))
    }
  }

  async function handleUpdate(values: UpdateUserFormValues) {
    if (!selectedUser) {
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedUser.id,
        input: toUpdateUserPayload(values),
      })
      showSuccess('User updated successfully')
      setDialogOpen(false)
      setSelectedUser(null)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update user'))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      showSuccess('User deleted successfully')
      setDeleteTarget(null)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to delete user'))
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Users
          </Typography>
          <Typography color="text.secondary">
            Create and manage HR manager accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedUser(null)
            setDialogOpen(true)
          }}
        >
          Add HR Manager
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error, 'Failed to load users')}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{fullName(user.firstName, user.lastName)}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role.replace('_', ' ')} size="small" />
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      status={user.isActive ? 'active' : 'inactive'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    {user.role !== 'ADMIN' && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: 'flex-end' }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedUser(user)
                            setDialogOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setDeleteTarget(user)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <UserFormDialog
        open={dialogOpen}
        user={selectedUser}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setDialogOpen(false)
          setSelectedUser(null)
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        description={
          deleteTarget
            ? `Delete ${fullName(deleteTarget.firstName, deleteTarget.lastName)}? This cannot be undone.`
            : ''
        }
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </Paper>
  )
}
