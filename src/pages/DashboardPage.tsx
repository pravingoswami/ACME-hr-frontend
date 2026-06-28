import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
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
import { useMemo, useState } from 'react'
import { PageLoader } from '../components/Layout'
import { StatusChip } from '../components/StatusChip'
import {
  useAnalyticsByDepartment,
  useAnalyticsByStatus,
  useAnalyticsSummary,
  usePayRange,
} from '../hooks/useAnalytics'
import { useDepartmentsQuery } from '../hooks/useReference'
import { employeeStatusValues } from '../types/enums'
import type { AnalyticsFilters } from '../types/api'
import { formatSalary } from '../utils/format'
import { getErrorMessage } from '../context/NotificationContext'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState<AnalyticsFilters['status'] | ''>('')
  const departmentsQuery = useDepartmentsQuery()

  const filters = useMemo<AnalyticsFilters>(() => {
    const next: AnalyticsFilters = {}
    if (department.trim()) {
      next.department = department.trim()
    }
    if (status) {
      next.status = status
    }
    return next
  }, [department, status])

  const summaryQuery = useAnalyticsSummary(filters)
  const byDepartmentQuery = useAnalyticsByDepartment(filters)
  const byStatusQuery = useAnalyticsByStatus(filters)
  const payRangeQuery = usePayRange(filters)

  const loading =
    summaryQuery.isLoading ||
    byDepartmentQuery.isLoading ||
    byStatusQuery.isLoading ||
    payRangeQuery.isLoading

  const error =
    summaryQuery.error ??
    byDepartmentQuery.error ??
    byStatusQuery.error ??
    payRangeQuery.error

  if (loading) {
    return <PageLoader />
  }

  const summary = summaryQuery.data
  const byDepartment = byDepartmentQuery.data ?? []
  const byStatus = byStatusQuery.data ?? []
  const payRange = payRangeQuery.data

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Analytics Dashboard
            </Typography>
            <Typography color="text.secondary">
              Workforce headcount, compensation, and payroll insights
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Department"
              size="small"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              sx={{ minWidth: 180 }}
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
                setStatus(event.target.value as AnalyticsFilters['status'] | '')
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {employeeStatusValues.map((item) => (
                <MenuItem key={item} value={item}>
                  {item.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error">
          {getErrorMessage(error, 'Failed to load analytics')}
        </Alert>
      )}

      {summary && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Headcount" value={String(summary.headcount)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Average comp" value={formatSalary(summary.avgTotalComp)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Median comp" value={formatSalary(summary.medianTotalComp)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Min comp" value={formatSalary(summary.minTotalComp)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Max comp" value={formatSalary(summary.maxTotalComp)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Total payroll" value={formatSalary(summary.totalPayroll)} />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              By department
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Headcount</TableCell>
                    <TableCell align="right">Avg salary</TableCell>
                    <TableCell align="right">Total payroll</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {byDepartment.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No data
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    byDepartment.map((row) => (
                      <TableRow key={row.department}>
                        <TableCell>{row.department}</TableCell>
                        <TableCell align="right">{row.headcount}</TableCell>
                        <TableCell align="right">{formatSalary(row.avgSalary)}</TableCell>
                        <TableCell align="right">{formatSalary(row.totalPayroll)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              By status
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Headcount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {byStatus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No data
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    byStatus.map((row) => (
                      <TableRow key={row.status}>
                        <TableCell>
                          <StatusChip label={row.status.replace('_', ' ')} status={row.status} />
                        </TableCell>
                        <TableCell align="right">{row.headcount}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {payRange && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Pay range percentiles
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="P25" value={formatSalary(payRange.p25)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="P50 (median)" value={formatSalary(payRange.p50)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="P75" value={formatSalary(payRange.p75)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="P90" value={formatSalary(payRange.p90)} />
            </Grid>
          </Grid>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Based on {payRange.count} employees with salary data
          </Typography>
        </Paper>
      )}
    </Stack>
  )
}
