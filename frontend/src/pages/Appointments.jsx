import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Fade,
  Divider,
  Tooltip,
  useTheme,
  alpha,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Event,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  CalendarToday,
  AccessTime,
  MedicalServices,
  Search,
  Refresh,
} from '@mui/icons-material'
import axios from 'axios'
import { format, parseISO } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../contexts/AuthContext'
import { sanitizeInput, isValidFutureDate, isValidMedicalText } from '../utils/validation'

const schema = yup.object().shape({
  patientId: yup.number().required('Patient is required').positive('Patient ID must be positive'),
  doctorId: yup.number().required('Doctor is required').positive('Doctor ID must be positive'),
  appointmentDate: yup
    .string()
    .required('Date is required')
    .test('valid-date', 'Appointment date must be in the future', (value) => {
      if (!value) return true // Let required validation handle it
      return isValidFutureDate(value, 0) // Must be today or future
    }),
  slotId: yup.number().required('Time slot is required').positive('Invalid time slot'),
  symptoms: yup
    .string()
    .required('Symptoms are required')
    .min(5, 'Symptoms must be at least 5 characters long')
    .max(500, 'Symptoms must not exceed 500 characters')
    .test('valid-symptoms', 'Invalid symptoms format', (value) => {
      if (!value) return true // Let required validation handle it
      return isValidMedicalText(value, 5, 500)
    }),
  notes: yup
    .string()
    .optional()
    .max(1000, 'Notes must not exceed 1000 characters')
    .test('valid-notes', 'Invalid notes format', (value) => {
      if (!value) return true // Optional field
      return isValidMedicalText(value, 0, 1000)
    }),
})

const Appointments = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  
  // Real-time explicit slot management
  const [availableSlots, setAvailableSlots] = useState([])

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      slotId: '',
      appointmentDate: format(new Date(), 'yyyy-MM-dd')
    }
  })

  const selectedDoctorId = watch('doctorId');
  const selectedDate = watch('appointmentDate');

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
    fetchDoctors()
  }, [user])

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchAvailableSlots(selectedDoctorId, selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctorId, selectedDate])

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const formattedDate = format(new Date(date), 'yyyy-MM-dd')
      const response = await axios.get(`/api/timeslots/available?doctorId=${doctorId}&date=${formattedDate}`)
      setAvailableSlots(response.data)
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setAvailableSlots([])
    }
  }


  const fetchAppointments = async () => {
    try {
      setLoading(true)
      let response
      
      if (user?.role === 'ROLE_DOCTOR') {
        // Doctors can only see their own appointments. Resolve Doctor ID from User ID.
        const doctorRes = await axios.get(`/api/doctors/user/${user.id}`)
        response = await axios.get(`/api/appointments/doctor/${doctorRes.data.id}`)
      } else {
        // Admin and Receptionist can see all appointments
        response = await axios.get('/api/appointments')
      }
      
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/patients')
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors')
      setDoctors(response.data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`/api/appointments/${id}`)
        fetchAppointments()
      } catch (error) {
        console.error('Error deleting appointment:', error)
      }
    }
  }

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Cancel this appointment? This will free the doctor time slot.')) {
      try {
        await axios.delete(`/api/appointments/${id}`)
        fetchAppointments()
      } catch (error) {
        console.error('Error cancelling appointment:', error)
      }
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}/status?status=${status}`)
      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment status:', error)
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Sanitize input data before sending
      const sanitizedData = {
        ...data,
        symptoms: sanitizeInput(data.symptoms),
        notes: data.notes ? sanitizeInput(data.notes) : '',
      }

      // LocalDateTime conversion for backend
      const appointmentDateTime = `${sanitizedData.appointmentDate}T00:00:00`

      const payload = {
        ...sanitizedData,
        appointmentDate: appointmentDateTime
      }

      await axios.post('/api/appointments', payload)
      setOpenDialog(false)
      reset()
      fetchAppointments()
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to book appointment. Please check availability.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'BOOKED': return 'primary'
      case 'COMPLETED': return 'success'
      case 'CANCELLED': return 'error'
      case 'NO_SHOW': return 'warning'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'BOOKED': return <Schedule />
      case 'COMPLETED': return <CheckCircle />
      case 'CANCELLED': return <Cancel />
      default: return <Event />
    }
  }

  if (loading && appointments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={800}>
        <Box mb={4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
              color: 'white',
              p: 4,
              borderRadius: 3,
              boxShadow: theme.shadows[8]
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                    {user?.role === 'ROLE_DOCTOR' ? 'My Appointments' : 'Appointments'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {user?.role === 'ROLE_DOCTOR' 
                      ? 'View and manage your scheduled appointments'
                      : 'Schedule and manage patient clinical visits'
                    }
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  <IconButton onClick={fetchAppointments} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <Refresh />
                  </IconButton>
                  {user?.role !== 'ROLE_DOCTOR' && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.9) }
                    }}
                  >
                    New Booking
                  </Button>
                )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                <Event />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {appointments.filter(a => a.status === 'BOOKED').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">Active Bookings</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
          }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {appointments.filter(a => a.status === 'COMPLETED').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">Completed</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
          }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 48, height: 48 }}>
                <Schedule />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {appointments.filter(a => a.status === 'PENDING').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">Pending</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: theme.palette.info.main, width: 48, height: 48 }}>
                <Cancel />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {appointments.filter(a => a.status === 'CANCELLED').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">Cancelled</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <Search sx={{ mr: 1, color: 'text.secondary' }} />
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search by patient, doctor or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ disableUnderline: true }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="standard">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="BOOKED">Booked</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[4] }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell><strong>Patient</strong></TableCell>
                {user?.role !== 'ROLE_DOCTOR' && <TableCell><strong>Doctor</strong></TableCell>}
                <TableCell><strong>Scheduled Time</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments
                .filter(a => {
                  const matchesSearch = 
                    a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
                  
                  const matchesStatus = !statusFilter || a.status === statusFilter
                  
                  return matchesSearch && matchesStatus
                })
                .map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>{a.patientName?.charAt(0)}</Avatar>
                        <Typography variant="body2" fontWeight="medium">{a.patientName}</Typography>
                      </Box>
                    </TableCell>
                    {user?.role !== 'ROLE_DOCTOR' && (
                      <TableCell>
                        <Typography variant="body2">Dr. {a.doctorName}</Typography>
                        <Typography variant="caption" color="textSecondary">{a.doctorSpecialization}</Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">{format(parseISO(a.appointmentDate), 'MMM dd, yyyy')}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">{a.timeSlot}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={a.status}
                        color={getStatusColor(a.status)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setSelectedAppointment(a)} color="info"><Visibility fontSize="small" /></IconButton>
                      </Tooltip>
                      {a.status === 'BOOKED' && (
                        <>
                          <Tooltip title="Complete">
                            <IconButton size="small" color="success" onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}><CheckCircle fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton size="small" color="error" onClick={() => handleCancelAppointment(a.id)}><Cancel fontSize="small" /></IconButton>
                          </Tooltip>
                        </>
                      )}
                      {user?.role !== 'ROLE_DOCTOR' && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><Delete fontSize="small" /></IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Booking Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle fontWeight="bold">Create New Appointment</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={patients}
                      getOptionLabel={(option) => option.fullName || ''}
                      onChange={(_, data) => field.onChange(data?.id)}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Patient" error={!!errors.patientId} helperText={errors.patientId?.message} />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="doctorId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={doctors}
                      getOptionLabel={(option) => `Dr. ${option.fullName} (${option.specialization})` || ''}
                      onChange={(_, data) => field.onChange(data?.id)}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Doctor" error={!!errors.doctorId} helperText={errors.doctorId?.message} />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="appointmentDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Appointment Date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.appointmentDate}
                      helperText={errors.appointmentDate?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth error={!!errors.slotId} disabled={availableSlots.length === 0}>
                  <InputLabel>{availableSlots.length === 0 ? "No availability" : "Time Slot"}</InputLabel>
                  <Controller
                    name="slotId"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Time Slot">
                        {availableSlots.map(slot => (
                          <MenuItem key={slot.id} value={slot.id}>
                            {format(parseISO(`1970-01-01T${slot.startTime}`), 'h:mm a')} - {format(parseISO(`1970-01-01T${slot.endTime}`), 'h:mm a')}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Symptoms"
                  multiline
                  rows={2}
                  {...control.register('symptoms')}
                  error={!!errors.symptoms}
                  helperText={errors.symptoms?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={2}
                  {...control.register('notes')}
                />
              </Grid>
            </Grid>
            {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!selectedAppointment} onClose={() => setSelectedAppointment(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Appointment Details</DialogTitle>
        <DialogContent dividers>
          {selectedAppointment && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip label={selectedAppointment.status} color={getStatusColor(selectedAppointment.status)} sx={{ fontWeight: 'bold' }} />
                  <Typography variant="caption">#{selectedAppointment.id}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Patient</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedAppointment.patientName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Doctor</Typography>
                <Typography variant="body1" fontWeight="bold">Dr. {selectedAppointment.doctorName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Date</Typography>
                <Typography variant="body1">{format(parseISO(selectedAppointment.appointmentDate), 'PPPP')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Time Slot</Typography>
                <Typography variant="body1">{selectedAppointment.timeSlot}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                  <Typography variant="subtitle2" fontWeight="bold">Symptoms</Typography>
                  <Typography variant="body2">{selectedAppointment.symptoms}</Typography>
                </Paper>
              </Grid>
              {selectedAppointment.notes && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Notes</Typography>
                  <Typography variant="body2">{selectedAppointment.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAppointment(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Appointments
