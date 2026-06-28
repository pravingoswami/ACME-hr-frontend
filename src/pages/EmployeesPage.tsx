import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Slider,
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
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PageLoader } from '../components/Layout'
import { StatusChip } from '../components/StatusChip'
import { EmployeeFormDialog } from '../components/forms/EmployeeFormDialog'
import { getErrorMessage, useNotification } from '../context/NotificationContext'
import { useAnalyticsSummary } from '../hooks/useAnalytics'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import {
  useCreateEmployeeMutation,
  useDeactivateEmployeeMutation,
  useDeleteEmployeeMutation,
  useEmployeesQuery,
  useUpdateEmployeeMutation,
} from '../hooks/useEmployees'
import { useDepartmentsQuery } from '../hooks/useReference'
import { toEmployeePayload, type CreateEmployeeInput } from '../schemas/employee.schema'
import type { Employee, EmployeeListFilters } from '../types/api'
import { employeeStatusValues } from '../types/enums'
import { formatDate, formatSalary, fullName } from '../utils/format'

const DEFAULT_SALARY_MAX = 200_000
const SALARY_STEP = 1_000

function roundDownToStep(value: number) {
  return Math.floor(value / SALARY_STEP) * SALARY_STEP
}

function roundUpToStep(value: number) {
  return Math.ceil(value / SALARY_STEP) * SALARY_STEP
}

export function EmployeesPage() {
  const { showSuccess, showError } = useNotification()
  const [page, setPage] = useState(1)

  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const debouncedName = useDebouncedValue(nameInput, 400)
  const debouncedEmail = useDebouncedValue(emailInput, 400)
  const debouncedCode = useDebouncedValue(codeInput, 400)

  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState<EmployeeListFilters['status'] | ''>('')

  const summaryQuery = useAnalyticsSummary()
  const salaryBounds = useMemo(() => {
    const min = roundDownToStep(summaryQuery.data?.minTotalComp ?? 0)
    const max = roundUpToStep(summaryQuery.data?.maxTotalComp ?? DEFAULT_SALARY_MAX) || DEFAULT_SALARY_MAX
    return { min, max: Math.max(max, min + SALARY_STEP) }
  }, [summaryQuery.data])

  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, DEFAULT_SALARY_MAX])
  const debouncedSalaryRange = useDebouncedValue(salaryRange, 400)

  useEffect(() => {
    setSalaryRange([salaryBounds.min, salaryBounds.max])
  }, [salaryBounds.min, salaryBounds.max])

  const isSalaryFilterActive =
    debouncedSalaryRange[0] > salaryBounds.min ||
    debouncedSalaryRange[1] < salaryBounds.max

  useEffect(() => {
    setPage(1)
  }, [debouncedName, debouncedEmail, debouncedCode, debouncedSalaryRange, department, status])

  const filters = useMemo<EmployeeListFilters>(() => {
    const next: EmployeeListFilters = {}

    if (debouncedName.trim()) {
      next.name = debouncedName.trim()
    }

    if (debouncedEmail.trim()) {
      next.email = debouncedEmail.trim()
    }

    if (debouncedCode.trim()) {
      next.code = debouncedCode.trim()
    }

    if (isSalaryFilterActive) {
      next.salaryMin = debouncedSalaryRange[0]
      next.salaryMax = debouncedSalaryRange[1]
    }

    if (department.trim()) {
      next.department = department.trim()
    }

    if (status) {
      next.status = status
    }

    return next
  }, [
    debouncedName,
    debouncedEmail,
    debouncedCode,
    debouncedSalaryRange,
    isSalaryFilterActive,
    department,
    status,
  ])

  const { data, isLoading, isError, error, isFetching } = useEmployeesQuery(page, 10, filters)
  const departmentsQuery = useDepartmentsQuery()
  const createMutation = useCreateEmployeeMutation()
  const updateMutation = useUpdateEmployeeMutation()
  const deleteMutation = useDeleteEmployeeMutation()
  const deactivateMutation = useDeactivateEmployeeMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Employee | null>(null)

  const employees = data?.items ?? []
  const pagination = data?.pagination

  const hasActiveFilters =
    Boolean(nameInput.trim()) ||
    Boolean(emailInput.trim()) ||
    Boolean(codeInput.trim()) ||
    Boolean(department) ||
    Boolean(status) ||
    isSalaryFilterActive

  function clearFilters() {
    setNameInput('')
    setEmailInput('')
    setCodeInput('')
    setDepartment('')
    setStatus('')
    setSalaryRange([salaryBounds.min, salaryBounds.max])
    setPage(1)
  }

  async function handleSubmit(values: CreateEmployeeInput) {
    const payload = toEmployeePayload(values)

    try {
      if (selectedEmployee) {
        await updateMutation.mutateAsync({
          id: selectedEmployee.id,
          input: payload,
        })
        showSuccess('Employee updated successfully')
      } else {
        await createMutation.mutateAsync(payload)
        showSuccess('Employee created successfully')
      }

      setDialogOpen(false)
      setSelectedEmployee(null)
    } catch (err) {
      showError(getErrorMessage(err, 'Request failed'))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      showSuccess('Employee deleted successfully')

      if (employees.length === 1 && page > 1) {
        setPage((current) => current - 1)
      }

      setDeleteTarget(null)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to delete employee'))
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) {
      return
    }

    try {
      await deactivateMutation.mutateAsync(deactivateTarget.id)
      showSuccess('Employee deactivated successfully')
      setDeactivateTarget(null)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to deactivate employee'))
    }
  }

  if (isLoading && !data) {
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
            Employees
          </Typography>
          <Typography color="text.secondary">
            Search by name, email, employee code, and salary range
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedEmployee(null)
            setDialogOpen(true)
          }}
        >
          Add Employee
        </Button>
      </Stack>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Name"
            placeholder="First or last name"
            size="small"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            sx={{ minWidth: 180, flex: 1 }}
          />
          <TextField
            label="Email"
            placeholder="name@company.com"
            size="small"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            sx={{ minWidth: 180, flex: 1 }}
          />
          <TextField
            label="Employee code"
            placeholder="EMP-001"
            size="small"
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value)}
            sx={{ minWidth: 160, flex: 1 }}
          />
          <TextField
            select
            label="Department"
            size="small"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            sx={{ minWidth: 160, flex: 1 }}
          >
            <MenuItem value="">All departments</MenuItem>
            {(departmentsQuery.data ?? []).map((item) => (
              <MenuItem key={item.id} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            size="small"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as EmployeeListFilters['status'] | '')
            }
            sx={{ minWidth: 140, flex: 1 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {employeeStatusValues.map((item) => (
              <MenuItem key={item} value={item}>
                {item.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Box sx={{ px: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, mb: 1 }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
              Salary range
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatSalary(salaryRange[0])} – {formatSalary(salaryRange[1])}
            </Typography>
            {hasActiveFilters && (
              <Button size="small" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
            {isFetching && (
              <Typography variant="body2" color="text.secondary">
                Updating…
              </Typography>
            )}
          </Stack>
          <Slider
            value={salaryRange}
            onChange={(_, value) => setSalaryRange(value as [number, number])}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatSalary(value)}
            min={salaryBounds.min}
            max={salaryBounds.max}
            step={SALARY_STEP}
            disableSwap
          />
        </Box>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error, 'Failed to load employees')}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hire Date</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No employees found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>{employee.employeeCode}</TableCell>
                  <TableCell>
                    <Typography
                      component={RouterLink}
                      to={`/employees/${employee.id}`}
                      sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}
                    >
                      {fullName(employee.firstName, employee.lastName)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {employee.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <StatusChip
                      label={employee.status.replace('_', ' ')}
                      status={employee.status}
                    />
                  </TableCell>
                  <TableCell>{formatDate(employee.hireDate)}</TableCell>
                  <TableCell>{formatSalary(employee.salary)}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}
                    >
                      <Button
                        size="small"
                        variant="text"
                        component={RouterLink}
                        to={`/employees/${employee.id}`}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setDialogOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      {employee.status !== 'INACTIVE' && (
                        <Button
                          size="small"
                          color="warning"
                          variant="outlined"
                          onClick={() => setDeactivateTarget(employee)}
                        >
                          Deactivate
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => setDeleteTarget(employee)}
                      >
                        Delete
                      </Button>
                    </Stack>
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
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} employees
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

      <EmployeeFormDialog
        open={dialogOpen}
        employee={selectedEmployee}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setDialogOpen(false)
          setSelectedEmployee(null)
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete employee"
        description={
          deleteTarget
            ? `Delete ${fullName(deleteTarget.firstName, deleteTarget.lastName)}? This cannot be undone.`
            : ''
        }
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title="Deactivate employee"
        confirmLabel="Deactivate"
        confirmColor="warning"
        description={
          deactivateTarget
            ? `Deactivate ${fullName(deactivateTarget.firstName, deactivateTarget.lastName)}?`
            : ''
        }
        loading={deactivateMutation.isPending}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => void handleDeactivate()}
      />
    </Paper>
  )
}
