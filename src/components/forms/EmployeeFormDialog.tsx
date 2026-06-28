import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  employeeFormSchema,
  type CreateEmployeeInput,
  type EmployeeFormValues,
} from '../../schemas/employee.schema'
import { useCountriesQuery, useDepartmentsQuery, useJobGradesQuery } from '../../hooks/useReference'
import { employeeStatusValues } from '../../types/enums'
import type { Employee } from '../../types/api'
import { toDateInputValue } from '../../utils/format'

interface EmployeeFormDialogProps {
  open: boolean
  employee?: Employee | null
  loading?: boolean
  onClose: () => void
  onSubmit: (values: CreateEmployeeInput) => Promise<void>
}

export function EmployeeFormDialog({
  open,
  employee,
  loading = false,
  onClose,
  onSubmit,
}: EmployeeFormDialogProps) {
  const countriesQuery = useCountriesQuery()
  const departmentsQuery = useDepartmentsQuery()
  const jobGradesQuery = useJobGradesQuery()

  const {    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      hireDate: new Date().toISOString().slice(0, 10),
      salary: undefined,
      status: 'ACTIVE',
      countryId: '',
      departmentId: '',
      jobGradeId: '',
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    if (employee) {
      reset({
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone ?? '',
        department: employee.department,
        position: employee.position,
        hireDate: toDateInputValue(employee.hireDate),
        salary:
          employee.salary === null || employee.salary === undefined
            ? undefined
            : Number(employee.salary),
        status: employee.status,
        countryId: employee.countryId ?? '',
        departmentId: employee.departmentId ?? '',
        jobGradeId: employee.jobGradeId ?? '',
      })
    } else {
      reset({
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        hireDate: new Date().toISOString().slice(0, 10),
        salary: undefined,
        status: 'ACTIVE',
        countryId: '',
        departmentId: '',
        jobGradeId: '',
      })
    }
  }, [open, employee, reset])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Employee code"
                fullWidth
                error={Boolean(errors.employeeCode)}
                helperText={errors.employeeCode?.message}
                {...register('employeeCode')}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Status"
                    fullWidth
                    error={Boolean(errors.status)}
                    helperText={errors.status?.message}
                    {...field}
                  >
                    {employeeStatusValues.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First name"
                fullWidth
                error={Boolean(errors.firstName)}
                helperText={errors.firstName?.message}
                {...register('firstName')}
              />
              <TextField
                label="Last name"
                fullWidth
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message}
                {...register('lastName')}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email')}
              />
              <TextField
                label="Phone"
                fullWidth
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
                {...register('phone')}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Department"
                fullWidth
                error={Boolean(errors.department)}
                helperText={errors.department?.message}
                {...register('department')}
              />
              <TextField
                label="Position"
                fullWidth
                error={Boolean(errors.position)}
                helperText={errors.position?.message}
                {...register('position')}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Hire date"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.hireDate)}
                helperText={errors.hireDate?.message}
                {...register('hireDate')}
              />
              <TextField
                label="Salary"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                error={Boolean(errors.salary)}
                helperText={errors.salary?.message}
                {...register('salary', { valueAsNumber: true })}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="countryId"
                control={control}
                render={({ field }) => (
                  <TextField select label="Country" fullWidth {...field}>
                    <MenuItem value="">None</MenuItem>
                    {(countriesQuery.data ?? []).map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <TextField select label="Department (reference)" fullWidth {...field}>
                    <MenuItem value="">None</MenuItem>
                    {(departmentsQuery.data ?? []).map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="jobGradeId"
                control={control}
                render={({ field }) => (
                  <TextField select label="Job grade" fullWidth {...field}>
                    <MenuItem value="">None</MenuItem>
                    {(jobGradesQuery.data ?? []).map((grade) => (
                      <MenuItem key={grade.id} value={grade.id}>
                        {grade.name} (L{grade.level})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : employee ? 'Save changes' : 'Create employee'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
