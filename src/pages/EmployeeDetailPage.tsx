import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PageLoader } from '../components/Layout'
import { StatusChip } from '../components/StatusChip'
import { SalaryFormDialog } from '../components/forms/SalaryFormDialog'
import { getErrorMessage, useNotification } from '../context/NotificationContext'
import {
  useDeactivateEmployeeMutation,
  useEmployeeQuery,
  useUpdateEmployeeSalaryMutation,
} from '../hooks/useEmployees'
import { useDownloadEmployeeSalarySlipMutation } from '../hooks/usePayroll'
import { formatDate, formatSalary, fullName } from '../utils/format'
import { currentPayMonth } from '../utils/payroll'

export function EmployeeDetailPage() {
  const { id = '' } = useParams()
  const { showSuccess, showError } = useNotification()
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [slipMonth, setSlipMonth] = useState(currentPayMonth())

  const { data: employee, isLoading, isError, error } = useEmployeeQuery(id)
  const updateSalaryMutation = useUpdateEmployeeSalaryMutation()
  const deactivateMutation = useDeactivateEmployeeMutation()
  const salarySlipMutation = useDownloadEmployeeSalarySlipMutation()

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !employee) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error, 'Employee not found')}
        </Alert>
        <Button component={RouterLink} to="/employees" variant="outlined">
          Back to employees
        </Button>
      </Paper>
    )
  }

  const salaryHistory = employee.salaryHistory ?? []
  const currentSalary =
    employee.salary === null || employee.salary === undefined
      ? null
      : Number(employee.salary)

  async function handleSalaryUpdate(
    input: Parameters<typeof updateSalaryMutation.mutateAsync>[0]['input'],
  ) {
    try {
      await updateSalaryMutation.mutateAsync({ id: employee!.id, input })
      showSuccess('Salary updated successfully')
      setSalaryDialogOpen(false)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update salary'))
    }
  }

  async function handleDownloadSalarySlip() {
    try {
      await salarySlipMutation.mutateAsync({
        employeeId: employee!.id,
        month: slipMonth,
        employeeCode: employee!.employeeCode,
      })
      showSuccess('Salary slip downloaded')
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to generate salary slip'))
    }
  }

  async function handleDeactivate() {
    try {
      await deactivateMutation.mutateAsync(employee!.id)
      showSuccess('Employee deactivated')
      setDeactivateOpen(false)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to deactivate employee'))
    }
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
        >
          <Box>
            <Button component={RouterLink} to="/employees" size="small" sx={{ mb: 1 }}>
              ← Back to employees
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {fullName(employee.firstName, employee.lastName)}
            </Typography>
            <Typography color="text.secondary">
              {employee.employeeCode} · {employee.email}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <TextField
              label="Pay month"
              type="month"
              size="small"
              value={slipMonth}
              onChange={(event) => setSlipMonth(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <Button
              variant="outlined"
              disabled={salarySlipMutation.isPending}
              onClick={() => void handleDownloadSalarySlip()}
            >
              {salarySlipMutation.isPending ? 'Generating...' : 'Download salary slip'}
            </Button>
            <Button variant="contained" onClick={() => setSalaryDialogOpen(true)}>
              Update salary
            </Button>
            {employee.status !== 'INACTIVE' && (
              <Button
                color="warning"
                variant="outlined"
                onClick={() => setDeactivateOpen(true)}
              >
                Deactivate
              </Button>
            )}
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography color="text.secondary">Department</Typography>
            <Typography sx={{ fontWeight: 600 }}>{employee.department}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography color="text.secondary">Position</Typography>
            <Typography sx={{ fontWeight: 600 }}>{employee.position}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography color="text.secondary">Status</Typography>
            <StatusChip label={employee.status.replace('_', ' ')} status={employee.status} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography color="text.secondary">Hire date</Typography>
            <Typography sx={{ fontWeight: 600 }}>{formatDate(employee.hireDate)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography color="text.secondary">Phone</Typography>
            <Typography sx={{ fontWeight: 600 }}>{employee.phone ?? '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography color="text.secondary">Current salary</Typography>
            <Typography sx={{ fontWeight: 600 }}>{formatSalary(employee.salary)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Salary history
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Effective from</TableCell>
                <TableCell>Effective to</TableCell>
                <TableCell align="right">Base</TableCell>
                <TableCell align="right">Bonus</TableCell>
                <TableCell align="right">Allowances</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salaryHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No salary records yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                salaryHistory.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{formatDate(record.effectiveFrom)}</TableCell>
                    <TableCell>
                      {record.effectiveTo ? formatDate(record.effectiveTo) : '—'}
                    </TableCell>
                    <TableCell align="right">{formatSalary(record.baseSalary)}</TableCell>
                    <TableCell align="right">{formatSalary(record.bonus)}</TableCell>
                    <TableCell align="right">{formatSalary(record.allowances)}</TableCell>
                    <TableCell>
                      {record.isCurrent ? (
                        <Chip label="Current" color="success" size="small" />
                      ) : (
                        'Past'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <SalaryFormDialog
        open={salaryDialogOpen}
        currentSalary={currentSalary}
        loading={updateSalaryMutation.isPending}
        onClose={() => setSalaryDialogOpen(false)}
        onSubmit={handleSalaryUpdate}
      />

      <ConfirmDialog
        open={deactivateOpen}
        title="Deactivate employee"
        confirmLabel="Deactivate"
        confirmColor="warning"
        description={`Deactivate ${fullName(employee.firstName, employee.lastName)}? Their status will be set to INACTIVE.`}
        loading={deactivateMutation.isPending}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={() => void handleDeactivate()}
      />
    </Stack>
  )
}
