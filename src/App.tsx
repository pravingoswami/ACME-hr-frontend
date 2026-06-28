import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { BulkAdjustmentPage } from './pages/BulkAdjustmentPage'
import { DashboardPage } from './pages/DashboardPage'
import { EmployeeDetailPage } from './pages/EmployeeDetailPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { ImportExportPage } from './pages/ImportExportPage'
import { LoginPage } from './pages/LoginPage'
import { SalarySlipsPage } from './pages/SalarySlipsPage'
import { UsersPage } from './pages/UsersPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute roles={['ADMIN', 'HR_MANAGER']} />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/salary-slips" element={<SalarySlipsPage />} />

          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/bulk-adjustments" element={<BulkAdjustmentPage />} />
            <Route path="/import-export" element={<ImportExportPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
