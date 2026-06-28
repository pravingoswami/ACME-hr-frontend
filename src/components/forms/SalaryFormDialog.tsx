import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  salaryFormSchema,
  toSalaryPayload,
  type SalaryFormValues,
} from '../../schemas/salary.schema'

interface SalaryFormDialogProps {
  open: boolean
  currentSalary?: number | null
  loading?: boolean
  onClose: () => void
  onSubmit: (values: ReturnType<typeof toSalaryPayload>) => Promise<void>
}

export function SalaryFormDialog({
  open,
  currentSalary,
  loading = false,
  onClose,
  onSubmit,
}: SalaryFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      baseSalary: currentSalary ?? undefined,
      bonus: 0,
      allowances: 0,
      currencyCode: 'USD',
      effectiveFrom: new Date().toISOString().slice(0, 10),
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset({
      baseSalary: currentSalary ?? undefined,
      bonus: 0,
      allowances: 0,
      currencyCode: 'USD',
      effectiveFrom: new Date().toISOString().slice(0, 10),
    })
  }, [open, currentSalary, reset])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box
        component="form"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(toSalaryPayload(values))
        })}
      >
        <DialogTitle>Update Salary</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Base salary"
              type="number"
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              error={Boolean(errors.baseSalary)}
              helperText={errors.baseSalary?.message}
              {...register('baseSalary', { valueAsNumber: true })}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Bonus"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                error={Boolean(errors.bonus)}
                helperText={errors.bonus?.message}
                {...register('bonus', { valueAsNumber: true })}
              />
              <TextField
                label="Allowances"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                error={Boolean(errors.allowances)}
                helperText={errors.allowances?.message}
                {...register('allowances', { valueAsNumber: true })}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Currency"
                fullWidth
                slotProps={{ htmlInput: { maxLength: 3 } }}
                error={Boolean(errors.currencyCode)}
                helperText={errors.currencyCode?.message}
                {...register('currencyCode')}
              />
              <TextField
                label="Effective from"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.effectiveFrom)}
                helperText={errors.effectiveFrom?.message}
                {...register('effectiveFrom')}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Update salary'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
