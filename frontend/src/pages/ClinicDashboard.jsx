import React, { useState, useEffect } from 'react'
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    Card,
    CardContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    useTheme,
    alpha,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material'
import {
    People,
    MedicalServices,
    Event,
    TrendingUp,
    AccountBalanceWallet,
    Notifications,
    CalendarMonth,
    AccessTime,
    CheckCircle,
    MoreVert,
} from '@mui/icons-material'
import axios from 'axios'
import { format } from 'date-fns'

const ClinicDashboard = () => {
    const theme = useTheme()
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        revenue: 0,
    })
    const [recentAppointments, setRecentAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const statsRes = await axios.get('/api/dashboard/stats')
                setStats(statsRes.data)

                const appointmentsRes = await axios.get('/api/appointments')
                setRecentAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data.slice(0, 5) : [])
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                setStats({
                    patients: 1240,
                    doctors: 48,
                    appointments: 156,
                    revenue: 45200,
                })
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const StatCard = ({ title, value, icon, color, trend }) => (
        <Card sx={{
            height: '100%',
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            overflow: 'visible',
            position: 'relative'
        }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="subtitle2" color="textSecondary" fontWeight="bold" sx={{ mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {title === 'Total Revenue' ? `LKR ${value.toLocaleString()}` : value.toLocaleString()}
                        </Typography>
                        {trend && (
                            <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', mt: 1, fontWeight: 'bold' }}>
                                <TrendingUp fontSize="inherit" sx={{ mr: 0.5 }} /> {trend} since last month
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        display: 'flex'
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Hospital Command Center
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Good morning! Here's what's happening in your clinic today.
                </Typography>
            </Box>

            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Patients" value={stats.patients} icon={<People />} color={theme.palette.primary.main} trend="+12%" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Active Doctors" value={stats.doctors} icon={<MedicalServices />} color={theme.palette.secondary.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Daily Appointments" value={stats.appointments} icon={<Event />} color="#f39c12" trend="+5%" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Revenue" value={stats.revenue} icon={<AccountBalanceWallet />} color="#27ae60" trend="+18%" />
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="bold">Upcoming Appointments</Typography>
                            <IconButton size="small"><MoreVert /></IconButton>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', color: 'text.secondary', fontWeight: 'bold' } }}>
                                        <TableCell>Patient</TableCell>
                                        <TableCell>Provider</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentAppointments.length > 0 ? (
                                        recentAppointments.map((app) => (
                                            <TableRow key={app.id} hover sx={{ '& td': { borderBottom: '1px solid #fafafa' } }}>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Avatar sx={{ width: 32, height: 32, mr: 1.5, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                                                            {app.patientName?.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight="medium">{app.patientName}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>Dr. {app.doctorName}</TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" color="text.secondary">
                                                        <AccessTime fontSize="inherit" sx={{ mr: 0.5 }} />
                                                        {app.appointmentDate ? format(new Date(app.appointmentDate), 'hh:mm a') : 'N/A'}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={app.status}
                                                        size="small"
                                                        color={app.status === 'BOOKED' ? 'info' : 'success'}
                                                        sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                No appointments scheduled for today.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="bold">Alerts & Notifications</Typography>
                            <Notifications color="action" />
                        </Box>
                        <List disablePadding>
                            <ListItem sx={{ px: 0, py: 2 }}>
                                <ListItemIcon>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }}>
                                        <Event fontSize="small" />
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary="Emergency in Room 302"
                                    secondary="Staff requested immediately"
                                    primaryTypographyProps={{ fontWeight: 'bold', variant: 'body2' }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" sx={{ opacity: 0.5 }} />
                            <ListItem sx={{ px: 0, py: 2 }}>
                                <ListItemIcon>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                                        <CheckCircle fontSize="small" />
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary="Billing Batch Completed"
                                    secondary="All invoices sent for today"
                                    primaryTypographyProps={{ fontWeight: 'bold', variant: 'body2' }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" sx={{ opacity: 0.5 }} />
                            <ListItem sx={{ px: 0, py: 2 }}>
                                <ListItemIcon>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                                        <CalendarMonth fontSize="small" />
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary="New Provider Onboarding"
                                    secondary="Dr. Sarah Johnson joined Pediatrics"
                                    primaryTypographyProps={{ fontWeight: 'bold', variant: 'body2' }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}

export default ClinicDashboard
