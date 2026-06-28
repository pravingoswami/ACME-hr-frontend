import {
  Alert,
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
import { PageLoader } from '../components/Layout'
import { getErrorMessage } from '../context/NotificationContext'
import { useAuditLogsQuery } from '../hooks/useAudit'
import { formatDate, fullName } from '../utils/format'

export function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useAuditLogsQuery(page, 20)

  if (isLoading) {
    return <PageLoader />
  }

  const logs = data?.items ?? []
  const pagination = data?.pagination

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Audit Logs
        </Typography>
        <Typography color="text.secondary">
          Track create, update, delete, import, export, and bulk adjustment actions
        </Typography>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error, 'Failed to load audit logs')}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No audit logs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {fullName(log.user.firstName, log.user.lastName)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={log.action.replace('_', ' ')} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography>{log.entityType}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.entityId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {log.metadata ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 320, wordBreak: 'break-word' }}
                      >
                        {JSON.stringify(log.metadata)}
                      </Typography>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mt: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Typography color="text.secondary">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} entries
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  )
}
