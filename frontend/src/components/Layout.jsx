import React from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  MedicalServices,
  Business,
  Event,
  AccountCircle,
  Logout,
  Assignment,
  Receipt,
  Person,
  AdminPanelSettings,
  LocalHospital,
  Assessment,
  Medication,
  Star,
  Payment,
  Search,
  Notifications,
  Settings,
  Add,
  HelpOutline,
  ExitToApp,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import ChatBot from './ChatBot'


const getTopNavItems = (role) => {
  if (role === 'ROLE_ADMIN') {
    return [
      { text: 'Dashboard', path: '/admin-dashboard' },
      { text: 'Patients', path: '/patients' },
      { text: 'Doctors', path: '/doctors' },
      { text: 'Departments', path: '/departments' }
    ]
  }
  if (role === 'ROLE_PATIENT') {
    return [
      { text: 'Dashboard', path: '/patient-dashboard' },
      { text: 'Medical Records', path: '/medical-records' },
      { text: 'Prescriptions', path: '/prescriptions' },
      { text: 'Payments', path: '/payment-methods' }
    ]
  }
  if (role === 'ROLE_DOCTOR') {
    return [
      { text: 'Dashboard', path: '/doctor-dashboard' },
      { text: 'Appointments', path: '/appointments' },
      { text: 'Patients', path: '/patients' }
    ]
  }
  return []
}

const Layout = () => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleProfileMenuClose()
  }

  const handleProfile = () => {
    navigate('/profile')
    handleProfileMenuClose()
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: '100%' }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, height: 80 }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
            
            {/* Top Navigation Links */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 5 } }}>
              {getTopNavItems(user?.role).map((nav) => {
                const isActive = location.pathname.startsWith(nav.path)
                return (
                  <Typography 
                    key={nav.text} 
                    component={Link}
                    to={nav.path}
                    sx={{ 
                      textDecoration: 'none',
                      fontWeight: 600,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      borderBottom: isActive ? '3px solid #4318FF' : '3px solid transparent',
                      pb: 0.5,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {nav.text}
                  </Typography>
                )
              })}
            </Box>
          </Box>

          {/* Top Right Utilities */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ 
              bgcolor: '#4318FF', 
              color: 'white',
              width: 36,
              height: 36,
              ml: 1,
              cursor: 'pointer'
            }} onClick={handleProfileMenuOpen}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
                mt: 1,
                boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: '100%',
        }}
      >
        <Box sx={{ height: 80 }} />
        <Outlet />
      </Box>
      
      {/* AI Chatbot for Patients */}
      {user?.role === 'ROLE_PATIENT' && <ChatBot />}
    </Box>
  )
}

export default Layout
