import { Chip, type ChipProps } from '@mui/material'
import type { EmployeeStatus } from '../types/enums'

const employeeStatusColor: Record<
  EmployeeStatus,
  ChipProps['color']
> = {
  ACTIVE: 'success',
  INACTIVE: 'error',
  ON_LEAVE: 'warning',
}

interface StatusChipProps {
  label: string
  status?: EmployeeStatus | 'active' | 'inactive'
}

export function StatusChip({ label, status }: StatusChipProps) {
  if (status === 'active' || status === 'ACTIVE') {
    return <Chip label={label} color="success" size="small" />
  }

  if (status === 'inactive' || status === 'INACTIVE') {
    return <Chip label={label} color="error" size="small" />
  }

  if (status && status in employeeStatusColor) {
    return (
      <Chip
        label={label}
        color={employeeStatusColor[status as EmployeeStatus]}
        size="small"
      />
    )
  }

  return <Chip label={label} size="small" />
}
