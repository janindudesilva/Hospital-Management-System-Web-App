import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Fade,
  useTheme,
  alpha,
  Divider,
} from '@mui/material'
import {
  People,
  MedicalServices,
  Business,
  Event,
  TrendingUp,
  LocalHospital,
  Schedule,
  Person,
  HealthAndSafety,
  Assessment,
} from '@mui/icons-material'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const StatCard = ({ title, value, icon, color, trend }) => {
  const theme = useTheme()
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flexGrow={1}>
            <Typography 
              color="textSecondary" 
              gutterBottom 
              variant="overline"
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 'bold',
                letterSpacing: 1
              }}
            >
              {title}
            </Typography>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography 
                variant="h3" 
                fontWeight="bold"
                color={color}
                sx={{ lineHeight: 1 }}
              >
                {value}
              </Typography>
              {trend && (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  sx={{ 
                    color: trend > 0 ? theme.palette.success.main : theme.palette.error.main 
                  }}
                >
                  <TrendingUp fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {Math.abs(trend)}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: alpha(color, 0.1), 
              color: color,
              width: 56, 
              height: 56,
              boxShadow: `0 4px 12px ${alpha(color, 0.15)}`
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

const Dashboard = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let endpoint = '/api/dashboard/statistics'
        
        if (user?.role === 'ROLE_DOCTOR') {
          endpoint = '/api/dashboard/doctor'
        } else if (user?.role === 'ROLE_RECEPTIONIST') {
          endpoint = '/api/dashboard/receptionist'
        } else if (user?.role === 'ROLE_PATIENT') {
          endpoint = '/api/dashboard/patient'
        }

        const response = await axios.get(endpoint)
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading dashboard...
            </Typography>
          </Paper>
        </Fade>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Fade in timeout={800}>
        <Card 
          sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
            color: 'white',
            p: 4,
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            mb: 4
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar 
                sx={{ 
                  bgcolor: 'white', 
                  color: theme.palette.primary.main,
                  width: 64, 
                  height: 64 
                }}
              >
                <Person sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                  Welcome back, {user?.username}!
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {user?.role === 'ROLE_ADMIN' && 'Administrator Dashboard'}
                  {user?.role === 'ROLE_DOCTOR' && 'Doctor Dashboard'}
                  {user?.role === 'ROLE_RECEPTIONIST' && 'Receptionist Dashboard'}
                  {user?.role === 'ROLE_PATIENT' && 'Patient Dashboard'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Statistics Cards */}
      <Fade in timeout={1000}>
        <Grid container spacing={3}>
          {user?.role === 'ROLE_ADMIN' && (
            <>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Total Patients"
                  value={stats.totalPatients || 0}
                  icon={<People fontSize="large" />}
                  color={theme.palette.primary.main}
                  trend={12}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Total Doctors"
                  value={stats.totalDoctors || 0}
                  icon={<MedicalServices fontSize="large" />}
                  color={theme.palette.success.main}
                  trend={8}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Total Appointments"
                  value={stats.totalAppointments || 0}
                  icon={<Event fontSize="large" />}
                  color={theme.palette.warning.main}
                  trend={15}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Departments"
                  value={stats.totalDepartments || 0}
                  icon={<Business fontSize="large" />}
                  color={theme.palette.info.main}
                  trend={5}
                />
              </Grid>
            </>
          )}

          {user?.role === 'ROLE_DOCTOR' && (
            <>
              <Grid item xs={12} sm={6} lg={4}>
                <StatCard
                  title="My Appointments"
                  value={stats.myAppointments || 0}
                  icon={<Schedule fontSize="large" />}
                  color={theme.palette.primary.main}
                  trend={20}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <StatCard
                  title="Patients Today"
                  value={stats.patientsToday || 0}
                  icon={<People fontSize="large" />}
                  color={theme.palette.success.main}
                  trend={10}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <StatCard
                  title="Completed"
                  value={stats.completedAppointments || 0}
                  icon={<HealthAndSafety fontSize="large" />}
                  color={theme.palette.info.main}
                  trend={5}
                />
              </Grid>
            </>
          )}

          {user?.role === 'ROLE_RECEPTIONIST' && (
            <>
              <Grid item xs={12} sm={6} lg={4}>
                <StatCard
                  title="Today's Appointments"
                  value={stats.todayAppointments || 0}
                  icon={<Event fontSize="large" />}
                  color={theme.palette.primary.main}
                  trend={25}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <StatCard
                  title="New Patients"
                  value={stats.newPatients || 0}
                  icon={<Person fontSize="large" />}
                  color={theme.palette.success.main}
                  trend={18}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <StatCard
                  title="Pending"
                  value={stats.pendingAppointments || 0}
                  icon={<Assessment fontSize="large" />}
                  color={theme.palette.warning.main}
                  trend={-5}
                />
              </Grid>
            </>
          )}

          {user?.role === 'ROLE_PATIENT' && (
            <>
              <Grid item xs={12} sm={6} lg={6}>
                <StatCard
                  title="My Appointments"
                  value={stats.myAppointments || 0}
                  icon={<Event fontSize="large" />}
                  color={theme.palette.primary.main}
                  trend={15}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <StatCard
                  title="Upcoming"
                  value={stats.upcomingAppointments || 0}
                  icon={<Schedule fontSize="large" />}
                  color={theme.palette.success.main}
                  trend={8}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Fade>
    </Container>
  )
}

export default Dashboard
