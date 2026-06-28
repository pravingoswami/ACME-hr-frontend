import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { getErrorMessage, useNotification } from '../context/NotificationContext'
import { useDownloadBulkSalarySlipsMutation } from '../hooks/usePayroll'
import { useDepartmentsQuery } from '../hooks/useReference'
import type { EmployeeStatus } from '../types/enums'
import { employeeStatusValues } from '../types/enums'
import { currentPayMonth } from '../utils/payroll'

export function SalarySlipsPage() {
  const { showSuccess, showError } = useNotification()
  const [month, setMonth] = useState(currentPayMonth())
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState<EmployeeStatus | ''>('')

  const departmentsQuery = useDepartmentsQuery()
  const bulkMutation = useDownloadBulkSalarySlipsMutation()

  async function handleBulkDownload() {
    if (!month) {
      showError('Please select a pay month')
      return
    }

    try {
      await bulkMutation.mutateAsync({
        month,
        department: department || undefined,
        status: status || undefined,
      })
      showSuccess('Salary slips downloaded as ZIP')
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to generate salary slips'))
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Salary Slips
        </Typography>
        <Typography color="text.secondary">
          Generate PDF salary slips for one month. Bulk download returns a ZIP of all matching
          employees.
        </Typography>
      </Stack>

      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField
          label="Pay month"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <TextField
          select
          label="Department"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          fullWidth
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
          value={status}
          onChange={(event) => setStatus(event.target.value as EmployeeStatus | '')}
          fullWidth
        >
          <MenuItem value="">All statuses</MenuItem>
          {employeeStatusValues.map((item) => (
            <MenuItem key={item} value={item}>
              {item.replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>

        <Box>
          <Button
            variant="contained"
            disabled={bulkMutation.isPending}
            onClick={() => void handleBulkDownload()}
          >
            {bulkMutation.isPending ? 'Generating...' : 'Download bulk salary slips (ZIP)'}
          </Button>
        </Box>
      </Stack>

      <Alert severity="info" sx={{ mt: 3 }}>
        To generate a slip for one employee, open their profile from the Employees page and use
        &quot;Download salary slip&quot;.
      </Alert>
    </Paper>
  )
}
