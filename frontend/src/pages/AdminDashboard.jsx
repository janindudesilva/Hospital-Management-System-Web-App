import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  LinearProgress,
  Fade,
  useTheme,
  alpha,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material'
import {
  AdminPanelSettings,
  People,
  MedicalServices,
  Business,
  LocalHospital,
  Assessment,
  TrendingUp,
  Person,
  CalendarToday,
  LocalPharmacy,
  LocalShipping,
  Healing,
  ErrorOutline,
  CheckCircle,
  AccountBalanceWallet,
  WarningAmber,
  Add
} from '@mui/icons-material'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const AdminDashboard = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [stats, setStats] = useState({})
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [departments, setDepartments] = useState([])
  const [bills, setBills] = useState([])

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, doctorsRes, patientsRes, departmentsRes, billsRes] = await Promise.all([
        axios.get('/api/dashboard/statistics').catch(() => ({ data: {} })),
        axios.get('/api/doctors').catch(() => ({ data: [] })),
        axios.get('/api/patients').catch(() => ({ data: [] })),
        axios.get('/api/departments').catch(() => ({ data: [] })),
        axios.get('/api/bills').catch(() => ({ data: [] }))
      ])

      setStats(statsRes.data || {})
      setDoctors(doctorsRes.data || [])
      setPatients(patientsRes.data || [])
      setDepartments(departmentsRes.data || [])
      setBills(billsRes.data || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading admin dashboard...
            </Typography>
          </Paper>
        </Fade>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mb: 4 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={800} color="primary.main" gutterBottom>
            Executive Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary" fontWeight={500}>
            Hospital metrics for Central Medical Center • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Typography>
        </Box>
      </Box>

      {/* KPI Cards Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Avatar sx={{ bgcolor: '#F4F7FE', color: '#4318FF', width: 48, height: 48, borderRadius: 2 }}>
                  <People />
                </Avatar>
              </Box>
              <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ letterSpacing: 1 }}>TOTAL PATIENTS</Typography>
              <Typography variant="h3" fontWeight={800} color="textPrimary" my={1}>{patients.length}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Active patient records</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Avatar sx={{ bgcolor: 'rgba(5, 205, 153, 0.1)', color: '#05CD99', width: 48, height: 48, borderRadius: 2 }}>
                  <MedicalServices />
                </Avatar>
              </Box>
              <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ letterSpacing: 1 }}>REGISTERED DOCTORS</Typography>
              <Typography variant="h3" fontWeight={800} color="textPrimary" my={1}>{doctors.length}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Medical staff available</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Avatar sx={{ bgcolor: 'rgba(238, 93, 80, 0.1)', color: '#EE5D50', width: 48, height: 48, borderRadius: 2 }}>
                  <Business />
                </Avatar>
              </Box>
              <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ letterSpacing: 1 }}>ACTIVE DEPARTMENTS</Typography>
              <Typography variant="h3" fontWeight={800} color="textPrimary" my={1}>{departments.length}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Operational hospital units</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ letterSpacing: 1 }}>TOTAL REVENUE</Typography>
              <Typography variant="h3" fontWeight={800} color="textPrimary" my={1}>
                LKR {bills.reduce((sum, bill) => sum + (bill.finalAmount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Accumulated payments</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Demographics Chart */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={700} color="textPrimary">Patient Demographics</Typography>
          </Box>
          
          <Card sx={{ mb: 5, height: 300, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {patients.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Male', value: patients.filter(p => p.gender === 'MALE' || p.gender === 'Male').length },
                      { name: 'Female', value: patients.filter(p => p.gender === 'FEMALE' || p.gender === 'Female').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#4318FF" />
                    <Cell fill="#05CD99" />
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No demographic data available.</Typography>
            )}
          </Card>

          {/* Department Management */}
          <Typography variant="h5" fontWeight={700} color="textPrimary" mb={3}>Department Management</Typography>
          <Grid container spacing={3}>
            {departments.slice(0, 5).map((dept) => (
              <Grid item xs={12} sm={4} key={dept.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Avatar sx={{ bgcolor: '#F4F7FE', color: '#2B3674', mb: 2 }}><Healing /></Avatar>
                    <Typography variant="h6" fontWeight={700}>{dept.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{dept.doctorCount || 0} Doctors • Active</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} sm={4}>
              <Card sx={{ height: '100%', minHeight: 120, bgcolor: 'transparent', border: '2px dashed #A3AED0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'white' } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: '#E0E5F2', color: '#A3AED0', mb: 1, mx: 'auto', width: 32, height: 32 }}><Add /></Avatar>
                  <Typography variant="caption" fontWeight={700} color="textSecondary">New Dept</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', p: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={4}>Recent Registrations</Typography>
            
            {patients.slice(0, 5).map((p, index) => (
              <Box display="flex" gap={2} mb={4} key={p.id}>
                <Avatar sx={{ bgcolor: index % 2 === 0 ? 'rgba(67, 24, 255, 0.1)' : 'rgba(5, 205, 153, 0.1)', color: index % 2 === 0 ? '#4318FF' : '#05CD99' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="textPrimary">
                    Patient Onboarded: <Box component="span" fontWeight={500} color="textSecondary">{p.fullName}</Box>
                  </Typography>
                  <Typography variant="caption" color="primary.main" fontWeight={700}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Active'}
                  </Typography>
                </Box>
              </Box>
            ))}
            
            <Button fullWidth sx={{ mt: 2, color: '#4318FF', fontWeight: 700 }}>
              View All Activities
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AdminDashboard
