import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { fullName } from '../utils/format'

const drawerWidth = 260

export function Layout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employees', path: '/employees' },
    { label: 'Salary Slips', path: '/salary-slips' },
    ...(isAdmin
      ? [
          { label: 'Users', path: '/users' },
          { label: 'Audit Logs', path: '/audit-logs' },
          { label: 'Bulk Adjustments', path: '/bulk-adjustments' },
          { label: 'Import / Export', path: '/import-export' },
        ]
      : []),
  ]

  const drawer = (
    <Box sx={{ p: 2, height: '100%', bgcolor: 'grey.900', color: 'grey.100' }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            fontWeight: 700,
          }}
        >
          A
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>ACME HR</Typography>
          <Typography variant="body2" color="grey.400">
            Recruitment Portal
          </Typography>
        </Box>
      </Stack>

      <List disablePadding>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'grey.300',
              '&.active, &.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.08)',
                color: 'common.white',
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: 0,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
            }}
          >
            <Box>
              {isMobile && (
                <Button size="small" onClick={() => setMobileOpen(true)} sx={{ mb: 1 }}>
                  Menu
                </Button>
              )}
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                HR Management
              </Typography>
              <Typography color="text.secondary">
                Manage employees, analytics, and HR operations
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {user ? fullName(user.firstName, user.lastName) : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Chip label={user?.role.replace('_', ' ')} color="primary" variant="outlined" />
              <Button variant="outlined" onClick={() => void logout()}>
                Logout
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Toolbar sx={{ minHeight: 16 }} />
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export function PageLoader() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
      <CircularProgress />
    </Box>
  )
}
