import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useRef } from 'react'
import { getErrorMessage, useNotification } from '../context/NotificationContext'
import {
  useCreateExportMutation,
  useDownloadExportMutation,
  useImportStatusQuery,
  useProcessImportMutation,
  useUploadImportMutation,
} from '../hooks/useImportExport'
import type { ImportJob } from '../types/api'
import { readSessionJson, useSessionStorageState } from '../utils/sessionStorage'

const IMPORT_EXPORT_STORAGE_KEY = 'acme-import-export'

type ImportExportPageState = {
  importJobId: string | null
  exportJobId: string | null
  exportFileName: string
  selectedFileName: string | null
}

const defaultPageState: ImportExportPageState = {
  importJobId: null,
  exportJobId: null,
  exportFileName: 'employees.csv',
  selectedFileName: null,
}

function JobStatusChip({ status }: { status: ImportJob['status'] }) {
  const color =
    status === 'COMPLETED'
      ? 'success'
      : status === 'FAILED'
        ? 'error'
        : status === 'PROCESSING'
          ? 'warning'
          : 'default'

  return <Chip label={status} color={color} size="small" />
}

export function ImportExportPage() {
  const { showSuccess, showError } = useNotification()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pageState, setPageState] = useSessionStorageState<ImportExportPageState>(
    IMPORT_EXPORT_STORAGE_KEY,
    readSessionJson(IMPORT_EXPORT_STORAGE_KEY, defaultPageState),
  )

  const uploadMutation = useUploadImportMutation()
  const processMutation = useProcessImportMutation()
  const createExportMutation = useCreateExportMutation()
  const downloadExportMutation = useDownloadExportMutation()

  const statusQuery = useImportStatusQuery(pageState.importJobId)
  const currentJob = statusQuery.data

  useEffect(() => {
    if (statusQuery.error) {
      showError(getErrorMessage(statusQuery.error, 'Failed to load import status'))
    }
  }, [statusQuery.error, showError])

  async function processUploadedJob(jobId: string) {
    const job = await processMutation.mutateAsync(jobId)
    setPageState((current) => ({ ...current, importJobId: job.id }))

    if (job.status === 'COMPLETED') {
      showSuccess(`Import completed with ${job.rowCount ?? 0} rows`)
    } else if (job.status === 'FAILED') {
      showError(job.errorReport?.message ?? 'Import failed')
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showError('Please choose a .csv file')
      event.target.value = ''
      return
    }

    try {
      const job = await uploadMutation.mutateAsync(file)
      setPageState((current) => ({
        ...current,
        importJobId: job.id,
        selectedFileName: file.name,
      }))
      showSuccess('File uploaded. Processing import...')
      await processUploadedJob(job.id)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to upload or process file'))
    } finally {
      event.target.value = ''
    }
  }

  async function handleRetryProcess() {
    if (!pageState.importJobId || currentJob?.status === 'COMPLETED') {
      return
    }

    try {
      await processUploadedJob(pageState.importJobId)
    } catch (err) {
      showError(getErrorMessage(err, 'Import failed'))
    }
  }

  function startNewImport() {
    setPageState((current) => ({
      ...current,
      importJobId: null,
      selectedFileName: null,
    }))
  }

  async function handleExport() {
    try {
      const job = await createExportMutation.mutateAsync(undefined)
      setPageState((current) => ({
        ...current,
        exportJobId: job.id,
        exportFileName: job.fileKey,
      }))
      showSuccess(`Export ready with ${job.rowCount ?? 0} rows`)
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to create export'))
    }
  }

  async function handleDownload() {
    if (!pageState.exportJobId) {
      return
    }

    try {
      await downloadExportMutation.mutateAsync({
        jobId: pageState.exportJobId,
        fileName: pageState.exportFileName,
      })
      showSuccess('Export downloaded')
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to download export'))
    }
  }

  const isImporting = uploadMutation.isPending || processMutation.isPending
  const canRetry =
    Boolean(pageState.importJobId) &&
    currentJob &&
    (currentJob.status === 'PENDING' || currentJob.status === 'FAILED')

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Import Employees
          </Typography>
          <Typography color="text.secondary">
            Upload a CSV with columns: employeeCode, firstName, lastName, email, department,
            position
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(event) => void handleFileSelect(event)}
          />
          <Button
            variant="outlined"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            {isImporting ? 'Importing...' : 'Choose CSV file'}
          </Button>
          {canRetry && (
            <Button
              variant="contained"
              disabled={processMutation.isPending}
              onClick={() => void handleRetryProcess()}
            >
              {processMutation.isPending ? 'Processing...' : 'Retry import'}
            </Button>
          )}
          {currentJob && (
            <Button variant="text" onClick={startNewImport}>
              Start new import
            </Button>
          )}
        </Stack>

        {pageState.selectedFileName && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Selected file: {pageState.selectedFileName}
          </Typography>
        )}

        {statusQuery.isLoading && pageState.importJobId && !currentJob && (
          <Typography color="text.secondary">Loading import status...</Typography>
        )}

        {currentJob && (
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>Job {currentJob.id.slice(0, 8)}...</Typography>
              <JobStatusChip status={currentJob.status} />
            </Stack>
            <Typography color="text.secondary">File: {currentJob.fileKey}</Typography>
            {currentJob.rowCount !== null && (
              <Typography color="text.secondary">
                Rows imported: {currentJob.rowCount}
              </Typography>
            )}
            {currentJob.errorReport?.errors && currentJob.errorReport.errors.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {currentJob.errorReport.errors.slice(0, 5).join(' · ')}
                {currentJob.errorReport.errors.length > 5 && ' ...'}
              </Alert>
            )}
            {currentJob.errorReport?.message && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {currentJob.errorReport.message}
              </Alert>
            )}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Export Employees
          </Typography>
          <Typography color="text.secondary">
            Generate a CSV export of all employee records
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            disabled={createExportMutation.isPending}
            onClick={() => void handleExport()}
          >
            {createExportMutation.isPending ? 'Creating export...' : 'Create export'}
          </Button>
          <Button
            variant="outlined"
            disabled={!pageState.exportJobId || downloadExportMutation.isPending}
            onClick={() => void handleDownload()}
          >
            {downloadExportMutation.isPending ? 'Downloading...' : 'Download CSV'}
          </Button>
        </Stack>

        {pageState.exportJobId && (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Export job ready: {pageState.exportFileName}
          </Typography>
        )}
      </Paper>
    </Stack>
  )
}
