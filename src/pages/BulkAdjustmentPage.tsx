import {
  Alert,
  Box,
  Button,
  MenuItem,
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
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { getErrorMessage, useNotification } from '../context/NotificationContext'
import {
  useApplyBulkAdjustmentMutation,
  usePreviewBulkAdjustmentMutation,
} from '../hooks/useBulk'
import { useCountriesQuery, useDepartmentsQuery } from '../hooks/useReference'
import {
  bulkAdjustmentSchema,
  defaultBulkAdjustmentFormValues,
  toBulkAdjustmentPayload,
  type BulkAdjustmentFormValues,
  type BulkAdjustmentInput,
} from '../schemas/bulk.schema'
import { employeeStatusValues } from '../types/enums'
import type { BulkAdjustmentPreview } from '../types/api'
import { formatSalary } from '../utils/format'
import { readSessionJson, writeSessionJson } from '../utils/sessionStorage'

const BULK_STORAGE_KEY = 'acme-bulk-adjustment'

type BulkPageState = {
  form: BulkAdjustmentFormValues
  preview: BulkAdjustmentPreview | null
}

function loadBulkPageState(): BulkPageState {
  return readSessionJson(BULK_STORAGE_KEY, {
    form: defaultBulkAdjustmentFormValues,
    preview: null,
  })
}

function saveBulkPageState(state: BulkPageState) {
  writeSessionJson(BULK_STORAGE_KEY, state)
}

export function BulkAdjustmentPage() {
  const savedState = loadBulkPageState()
  const { showSuccess, showError } = useNotification()
  const [preview, setPreview] = useState<BulkAdjustmentPreview | null>(savedState.preview)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingInput, setPendingInput] = useState<BulkAdjustmentInput | null>(null)

  const countriesQuery = useCountriesQuery()
  const departmentsQuery = useDepartmentsQuery()
  const previewMutation = usePreviewBulkAdjustmentMutation()
  const applyMutation = useApplyBulkAdjustmentMutation()

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BulkAdjustmentFormValues>({
    defaultValues: savedState.form,
  })

  useEffect(() => {
    const subscription = watch((values) => {
      saveBulkPageState({
        form: values as BulkAdjustmentFormValues,
        preview,
      })
    })

    return () => subscription.unsubscribe()
  }, [watch, preview])

  function updatePreview(nextPreview: BulkAdjustmentPreview | null) {
    setPreview(nextPreview)
    saveBulkPageState({
      form: watch(),
      preview: nextPreview,
    })
  }

  async function handlePreview(values: BulkAdjustmentFormValues) {
    const input = toBulkAdjustmentPayload(values)
    const parsed = bulkAdjustmentSchema.safeParse(input)

    if (!parsed.success) {
      showError(parsed.error.issues[0]?.message ?? 'Invalid adjustment input')
      return
    }

    try {
      const result = await previewMutation.mutateAsync(parsed.data)
      updatePreview(result)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to preview adjustment'))
    }
  }

  async function handleApply() {
    if (!pendingInput) {
      return
    }

    try {
      const result = await applyMutation.mutateAsync(pendingInput)
      showSuccess(`Updated salaries for ${result.affectedCount} employees`)
      updatePreview(null)
      setConfirmOpen(false)
      setPendingInput(null)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to apply adjustment'))
    }
  }

  function clearForm() {
    reset(defaultBulkAdjustmentFormValues)
    updatePreview(null)
    setPendingInput(null)
    setConfirmOpen(false)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Bulk Salary Adjustment
          </Typography>
          <Typography color="text.secondary">
            Preview and apply percentage or flat salary changes to filtered employees
          </Typography>
        </Box>
        <Button size="small" onClick={clearForm}>
          Clear form
        </Button>
      </Stack>

      <Box
        component="form"
        onSubmit={handleSubmit((values) => {
          const input = toBulkAdjustmentPayload(values)
          const parsed = bulkAdjustmentSchema.safeParse(input)

          if (!parsed.success) {
            showError(parsed.error.issues[0]?.message ?? 'Invalid adjustment input')
            return
          }

          setPendingInput(parsed.data)
          setConfirmOpen(true)
        })}
      >
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <TextField select label="Department" fullWidth {...field}>
                  <MenuItem value="">All departments</MenuItem>
                  {(departmentsQuery.data ?? []).map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select label="Status" fullWidth {...field}>
                  <MenuItem value="">All statuses</MenuItem>
                  {employeeStatusValues.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="countryId"
              control={control}
              render={({ field }) => (
                <TextField select label="Country" fullWidth {...field}>
                  <MenuItem value="">All countries</MenuItem>
                  {(countriesQuery.data ?? []).map((country) => (
                    <MenuItem key={country.id} value={country.id}>
                      {country.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="adjustmentType"
              control={control}
              render={({ field }) => (
                <TextField select label="Adjustment type" fullWidth {...field}>
                  <MenuItem value="PERCENT">Percentage</MenuItem>
                  <MenuItem value="FLAT">Flat amount</MenuItem>
                </TextField>
              )}
            />
            <TextField
              label="Adjustment value"
              type="number"
              fullWidth
              slotProps={{ htmlInput: { step: '0.01' } }}
              error={Boolean(errors.adjustmentValue)}
              helperText={
                errors.adjustmentValue?.message ??
                'Use positive for increase, negative for decrease'
              }
              {...register('adjustmentValue', { valueAsNumber: true })}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              disabled={previewMutation.isPending}
              onClick={handleSubmit(handlePreview)}
            >
              {previewMutation.isPending ? 'Previewing...' : 'Preview'}
            </Button>
            <Button type="submit" variant="contained" disabled={applyMutation.isPending}>
              Apply adjustment
            </Button>
          </Stack>
        </Stack>
      </Box>

      {preview && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {preview.affectedCount} employees will be affected
        </Alert>
      )}

      {preview && preview.sample.length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">New</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.sample.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.employeeCode}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{formatSalary(row.currentSalary)}</TableCell>
                  <TableCell align="right">{formatSalary(row.newSalary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Apply bulk adjustment"
        confirmLabel="Apply"
        confirmColor="primary"
        description={
          preview
            ? `Apply salary changes to ${preview.affectedCount} employees? This cannot be undone.`
            : 'Apply salary changes to matching employees?'
        }
        loading={applyMutation.isPending}
        onClose={() => {
          setConfirmOpen(false)
          setPendingInput(null)
        }}
        onConfirm={() => void handleApply()}
      />
    </Paper>
  )
}
