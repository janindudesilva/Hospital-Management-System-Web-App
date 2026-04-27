import React, { useState, useEffect } from 'react'
import {
  Autocomplete,
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
  CircularProgress,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Person,
  MedicalServices,
  Event,
  CalendarToday,
  AccessTime,
  Search,
  FilterList,
  Refresh,
  Cancel,
  Schedule,
  Payment,
  LocalHospital,
  Edit,
  Delete,
  CreditCard,
  Receipt,
} from '@mui/icons-material'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { format, parseISO, addMinutes, isAfter, isBefore, isValid } from 'date-fns'

// Safe date formatter to prevent Invalid Date crashes
const safeFormatDate = (dateVal, formatStr) => {
  if (!dateVal) return 'N/A';
  try {
    let d;
    if (typeof dateVal === 'string') {
      d = parseISO(dateVal);
      // Fallback for strings that parseISO can't handle
      if (!isValid(d)) d = new Date(dateVal);
    } else if (Array.isArray(dateVal)) {
      // Spring Boot default LocalDateTime serialization fallback
      d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0);
    } else {
      d = new Date(dateVal);
    }
    return isValid(d) ? format(d, formatStr) : 'Invalid Date';
  } catch (e) {
    return 'Invalid Date';
  }
}

const PatientDashboard = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [doctorAvailability, setDoctorAvailability] = useState([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [visitType, setVisitType] = useState('')
  const [bookingDialog, setBookingDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [cardPaymentDialog, setCardPaymentDialog] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })
  const [rescheduleDialog, setRescheduleDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [temporarilyLockedSlots, setTemporarilyLockedSlots] = useState(new Set())
  const [patientBills, setPatientBills] = useState([])
  const [paymentTransactions, setPaymentTransactions] = useState([])
  const [storedCards, setStoredCards] = useState([])
  const [selectedCardId, setSelectedCardId] = useState('')
  const [billsLoading, setBillsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('doctors') // doctors, appointments, bills
  const [selectedBillId, setSelectedBillId] = useState(null)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [doctorSlotCounts, setDoctorSlotCounts] = useState({})
  const [patientId, setPatientId] = useState(null)

  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      if (!user?.id) {
        setError('User ID not found. Please log in again.')
        return
      }
      
      const [doctorsRes, patientRes] = await Promise.all([
        axios.get('/api/doctors'),
        axios.get(`/api/patients/user/${user.id}`)
      ])
      
      const pId = patientRes.data.id;
      setPatientId(pId);
      
      const [appointmentsRes, billsRes, cardsRes, transactionsRes] = await Promise.all([
        axios.get(`/api/appointments/patient/${pId}`),
        axios.get(`/api/bills/patient/${pId}`),
        axios.get(`/api/payment-cards/patient/${pId}`),
        axios.get(`/api/transactions/patient/${pId}`)
      ]);
      setDoctors(doctorsRes.data)
      setAppointments(appointmentsRes.data)
      setPatientBills(billsRes.data)
      setStoredCards(cardsRes.data)
      setPaymentTransactions(transactionsRes.data)
    } catch (error) {
      console.error('Error fetching patient data:', error)
      setError('Failed to fetch patient data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      calculateTimeSlots(selectedDoctor, selectedDate, doctorAvailability);
    }
  }, [selectedDate, doctorAvailability, selectedDoctor])

  const fetchDoctorAvailability = async (doctorId) => {
    try {
      // New: Fetch actual TimeSlots from the backend
      const response = await axios.get(`/api/timeslots/available?doctorId=${doctorId}&date=${selectedDate}`)
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error)
      return [];
    }
  }

  // Update: Simplified to use backend data directly
  const calculateTimeSlots = (doctor, dateStr, slotsData) => {
    if (!doctor || !dateStr || !slotsData) {
        setAvailableSlots([]);
        return;
    }
    
    // Map backend TimeSlot objects to the format expected by the UI
    const formattedSlots = slotsData.map(slot => ({
      id: slot.id, // This is the database ID
      startTime: parseISO(`${dateStr}T${slot.startTime}`),
      endTime: parseISO(`${dateStr}T${slot.endTime}`),
      time: safeFormatDate(`1970-01-01T${slot.startTime}`, 'h:mm a'),
      available: slot.status === 'AVAILABLE',
      type: 'online'
    }));
    
    setAvailableSlots(formattedSlots)
    return formattedSlots;
  }

  // Effect to fetch slot counts for visible doctors
  useEffect(() => {
    const fetchCounts = async () => {
      const counts = {};
      // To avoid hammering the server, we only fetch for the current filtered list 
      // but only if there aren't too many
      const doctorsToFetch = filteredDoctors.slice(0, 20);
      
      await Promise.all(doctorsToFetch.map(async (doc) => {
        try {
          const res = await axios.get(`/api/timeslots/available?doctorId=${doc.id}&date=${selectedDate}`);
          counts[doc.id] = res.data.length;
        } catch (e) {
          counts[doc.id] = 0;
        }
      }));
      setDoctorSlotCounts(prev => ({ ...prev, ...counts }));
    };

    if (doctors.length > 0) {
      fetchCounts();
    }
  }, [selectedDate, searchTerm, specializationFilter]);

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor)
    setSelectedAppointment(null)
    // Use the date selected in the search bar
    const availabilityData = await fetchDoctorAvailability(doctor.id);
    calculateTimeSlots(doctor, selectedDate, availabilityData);
    
    setBookingDialog(true)
  }

  const handleSlotSelect = (slot) => {
    if (!slot.available) return
    
    setSelectedSlot(slot)
    // Temporarily lock the slot for 15 minutes
    const lockKey = `${selectedDoctor.id}-${selectedDate}-${slot.id}`
    setTemporarilyLockedSlots(prev => new Set(prev).add(lockKey))
    
    // Auto-release lock after 15 minutes
    setTimeout(() => {
      setTemporarilyLockedSlots(prev => {
        const newSet = new Set(prev)
        newSet.delete(lockKey)
        return newSet
      })
    }, 15 * 60 * 1000)
    
    setBookingDialog(false)
    setPaymentDialog(true)
  }

  const handleVisitTypeSelect = async (type) => {
    setVisitType(type)
    setPaymentDialog(false)
    
    try {
      const bookingData = {
        doctorId: selectedDoctor.id,
        patientId: patientId,
        appointmentDate: `${selectedDate}T00:00:00`,
        slotId: selectedSlot.id,
        type: 'OFFLINE',
        symptoms: type,
        notes: ''
      }
      
      if (selectedAppointment) {
        await axios.delete(`/api/appointments/${selectedAppointment.id}`)
      }
      
      await axios.post('/api/appointments', bookingData)
      
      fetchPatientData()
      setBookingDialog(false)
      setSelectedDoctor(null)
      setSelectedSlot(null)
      setSelectedAppointment(null)
      setVisitType('')
      
      alert(selectedAppointment ? 'Appointment rescheduled successfully!' : 'Appointment booked successfully! You can find the bill in the Bills & Payments section to pay later.')
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert(selectedAppointment ? 'Failed to reschedule. The slot might have been taken.' : 'Failed to book appointment. The slot might have been taken.')
    }
  }

  const handleCardPayment = async () => {
    try {
      setPaymentProcessing(true)
      let billIdToPay = selectedBillId;
      
      // 1. If it's a NEW booking
      if (!billIdToPay) {
        const bookingData = {
          doctorId: selectedDoctor.id,
          patientId: patientId,
          appointmentDate: `${selectedDate}T00:00:00`,
          slotId: selectedSlot.id,
          type: visitType,
          symptoms: '',
          notes: ''
        }
        
        const apptRes = await axios.post('/api/appointments', bookingData)
        billIdToPay = apptRes.data.billId
      }
      
      // 2. Process Payment for the bill
      const paymentRequest = {
        billId: billIdToPay,
        amount: selectedDoctor.consultationFee,
        paymentMethod: 'CARD',
        paymentCardId: selectedCardId || null,
        notes: selectedBillId ? 'Paid from dashboard' : 'Paid during online booking'
      }
      
      await axios.post('/api/bills/process-payment', paymentRequest)
      
      setPaymentProcessing(false)
      setPaymentSuccess(true)
      
      // After showing success, proceed
      setTimeout(() => {
        setCardPaymentDialog(false)
        setPaymentDialog(false)
        setBookingDialog(false)
        setPaymentSuccess(false)
        setSelectedDoctor(null)
        setSelectedBillId(null)
        fetchPatientData()
        // Reset card details
        setCardDetails({
          cardNumber: '',
          cardName: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: ''
        })
        setSelectedCardId('')
      }, 2000)
    } catch (err) {
      console.error('Payment/Booking failed:', err)
      setError('Payment failed. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const handlePayBill = (bill) => {
    setSelectedDoctor({ consultationFee: bill.finalAmount, fullName: 'Hospital Services' });
    setSelectedBillId(bill.id);
    setCardPaymentDialog(true);
  };


  const handleCardDetailsChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBookingConfirmation = async () => {
    try {
      const bookingData = {
        doctorId: selectedDoctor.id,
        patientId: patientId,
        appointmentDate: `${selectedDate}T00:00:00`,
        slotId: selectedSlot.id,
        type: visitType,
        symptoms: '',
        notes: ''
      }
      
      await axios.post('/api/appointments', bookingData)
      
      fetchPatientData()
      setPaymentDialog(false)
      setBookingDialog(false)
      setSelectedDoctor(null)
      setSelectedSlot(null)
      setVisitType('')
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment. The slot might have been taken.')
    }
  }

  const handleReschedule = async (appointment) => {
    setSelectedAppointment(appointment)
    
    const doctorObj = doctors.find(d => d.id === appointment.doctorId) || {
      id: appointment.doctorId,
      fullName: appointment.doctorName,
      consultationFee: appointment.consultationFee,
      departmentName: appointment.doctorSpecialization,
      specialization: appointment.doctorSpecialization
    }
    
    setSelectedDoctor(doctorObj)
    const availabilityData = await fetchDoctorAvailability(appointment.doctorId);
    calculateTimeSlots(doctorObj, selectedDate, availabilityData);
    setBookingDialog(true)
  }

  const handleCancel = (appointment) => {
    setSelectedAppointment(appointment)
    setCancelDialog(true)
  }

  const handleCancelConfirmation = async () => {
    try {
      await axios.delete(`/api/appointments/${selectedAppointment.id}`)
      
      fetchPatientData()
      setCancelDialog(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter
    
    // New: Filter by availability if toggled
    const isAvailable = doctorSlotCounts[doctor.id] > 0
    const matchesAvailability = !showAvailableOnly || isAvailable
    
    return matchesSearch && matchesSpecialization && matchesAvailability
  })

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))]

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading your dashboard...
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
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            p: 4,
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            },
          }}
        >
          <CardContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
            <Box display="flex" alignItems="center" gap={4}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  width: 80, 
                  height: 80,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                  Welcome back, {user?.username}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Patient Dashboard - Book and manage your appointments
                </Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="h4" fontWeight={700}>
                  {appointments.filter(a => a.status === 'BOOKED').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Active Appointments
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* AI Disease Prediction Banner */}
      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4], mb: 4, background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`, color: 'white' }}>
          <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box display="flex" alignItems="center" gap={3}>
              <MedicalServices sx={{ fontSize: 50 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">AI Disease Prediction</Typography>
                <Typography variant="body1">Check your symptoms and get a quick AI assessment</Typography>
              </Box>
            </Box>
            <Button variant="contained" color="secondary" href="/disease-prediction" sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}>
              Check Symptoms
            </Button>
          </CardContent>
        </Card>
      </Fade>

      {/* Doctor Selection */}
      <Fade in timeout={1200}>
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4], mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              Find and Book Doctors
            </Typography>
            
            <Grid container spacing={2} mb={3} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="textSecondary" mb={0.5}>Doctor name</Typography>
                <Autocomplete
                  freeSolo
                  options={[...new Set(doctors.map(d => d.fullName).filter(Boolean))]}
                  inputValue={searchTerm}
                  onInputChange={(event, newInputValue) => {
                    setSearchTerm(newInputValue || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      placeholder="e.g. Rajitha Y. De Silva"
                    />
                  )}
                  renderOption={(props, option, { inputValue }) => {
                    const matches = option.toLowerCase().indexOf(inputValue.toLowerCase());
                    let content = option;
                    if (matches >= 0 && inputValue.length > 0) {
                      const before = option.substring(0, matches);
                      const match = option.substring(matches, matches + inputValue.length);
                      const after = option.substring(matches + inputValue.length);
                      content = (
                        <span style={{ textTransform: 'uppercase' }}>
                          {before}<strong style={{ fontWeight: 800 }}>{match}</strong>{after}
                        </span>
                      );
                    } else {
                      content = <span style={{ textTransform: 'uppercase' }}>{option}</span>;
                    }
                    return (
                      <li {...props} key={option}>
                        {content}
                      </li>
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="textSecondary" mb={0.5}>Specialization</Typography>
                <Select
                  fullWidth
                  size="small"
                  displayEmpty
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                  <MenuItem value="">Select Specialization</MenuItem>
                  {specializations.map(spec => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary" mb={0.5}>Date</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={showAvailableOnly} 
                      onChange={(e) => setShowAvailableOnly(e.target.checked)} 
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">Show Available Only</Typography>
                      {showAvailableOnly && <Chip label="Active" size="small" color="success" sx={{ height: 20 }} />}
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth 
                  startIcon={<Refresh />}
                  onClick={fetchPatientData}
                  sx={{ height: 40, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {filteredDoctors.map(doctor => (
                <Grid item xs={12} key={doctor.id}>
                  <Card 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', md: 'row' },
                      borderRadius: 3, 
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid #eee'
                    }}
                  >
                    {/* Left Panel */}
                    <Box 
                      sx={{ 
                        p: 3, 
                        width: { xs: '100%', md: 280 }, 
                        borderRight: { xs: 'none', md: '1px solid #eee' }, 
                        borderBottom: { xs: '1px solid #eee', md: 'none' },
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        bgcolor: 'white'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          bgcolor: alpha(theme.palette.primary.main, 0.4), 
                          color: 'white',
                          fontSize: 48,
                          fontFamily: 'serif',
                          mb: 1 
                        }}
                      >
                        @
                      </Avatar>
                      <Typography variant="caption" color="textSecondary" mb={1}>Male</Typography>
                      <Typography variant="subtitle2" fontWeight={700} align="center" sx={{ textTransform: 'uppercase', mb: 0.5 }}>
                        DR {doctor.fullName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" align="center" sx={{ textTransform: 'uppercase', mb: 3, display: 'block' }}>
                        {doctor.specialization}
                      </Typography>
                      
                      {doctorSlotCounts[doctor.id] !== undefined && (
                        <Chip 
                          label={doctorSlotCounts[doctor.id] > 0 ? `${doctorSlotCounts[doctor.id]} Slots Available` : 'No Slots Available Today'}
                          color={doctorSlotCounts[doctor.id] > 0 ? 'success' : 'default'}
                          variant={doctorSlotCounts[doctor.id] > 0 ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.65rem',
                            height: 24,
                            mb: 1,
                            animation: doctorSlotCounts[doctor.id] > 0 ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.7 },
                              '100%': { opacity: 1 }
                            }
                          }}
                        />
                      )}
                      

                    </Box>

                    {/* Right Panel */}
                    <Box 
                      sx={{ 
                        p: 4, 
                        flex: 1, 
                        bgcolor: '#f5f5f5', 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                          DR {doctor.fullName}
                        </Typography>
                        <Typography variant="h6" color="#0055a4" fontWeight={600} mb={1.5}>
                          {doctor.departmentName || '23 Nawaloka Hospital Colombo'}
                        </Typography>
                        
                        <Box display="flex" alignItems="center">
                          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary', mr: 1.5 }} />
                          <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                            {doctor.specialization}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ minWidth: 140 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          onClick={() => handleDoctorSelect(doctor)}
                          sx={{ 
                            borderRadius: '8px', 
                            py: 1,
                            px: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#0055a4',
                            '&:hover': { backgroundColor: '#004080' },
                            boxShadow: 'none'
                          }}
                        >
                          Book Now
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* My Appointments */}
      <Fade in timeout={1400}>
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4] }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              My Appointments
            </Typography>
            
            {appointments.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="textSecondary">
                  No appointments scheduled yet
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {appointments.map(appointment => (
                  <Grid item xs={12} md={6} lg={4} key={appointment.id}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Chip
                            label={appointment.status}
                            color={appointment.status === 'BOOKED' ? 'primary' : 
                                   appointment.status === 'COMPLETED' ? 'success' : 'error'}
                            size="small"
                          />
                          <Typography variant="body2" color="textSecondary">
                            #{appointment.id}
                          </Typography>
                        </Box>
                        
                        <Typography variant="h6" fontWeight="bold" mb={1}>
                          Dr. {appointment.doctorName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mb={1}>
                          {appointment.doctorSpecialization}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <CalendarToday fontSize="small" />
                          <Typography variant="body2">
                            {safeFormatDate(appointment.appointmentDate, 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <AccessTime fontSize="small" />
                          <Typography variant="body2">
                            {appointment.timeSlot}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" mb={2}>
                          Visit Type: {appointment.visitType || appointment.symptoms || appointment.type}
                        </Typography>
                        
                        {appointment.status === 'BOOKED' && (
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleReschedule(appointment)}
                              startIcon={<Schedule />}
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleCancel(appointment)}
                              startIcon={<Cancel />}
                            >
                              Cancel
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* My Bills & Transactions */}
      <Fade in timeout={1600}>
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4], mt: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Bills & Payments
              </Typography>
              <Button 
                startIcon={<Receipt />} 
                variant="outlined"
                onClick={() => navigate('/payment-methods')}
              >
                Manage Cards
              </Button>
            </Box>
            
            {patientBills.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="textSecondary">
                  No billing records found
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell align="right"><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patientBills.map(bill => (
                      <TableRow key={bill.id}>
                        <TableCell>#{bill.id}</TableCell>
                        <TableCell>Hospital Services</TableCell>
                        <TableCell>LKR {Number(bill.finalAmount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={bill.paymentStatus} 
                            size="small" 
                            color={bill.paymentStatus === 'PAID' ? 'success' : 'error'} 
                          />
                        </TableCell>
                        <TableCell>{safeFormatDate(bill.createdAt, 'MMM dd')}</TableCell>
                        <TableCell align="right">
                          {bill.paymentStatus !== 'PAID' && (
                            <Button size="small" variant="contained" onClick={() => handlePayBill(bill)}>
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Fade>


      {/* Doctor Selection Dialog */}
      <Dialog open={bookingDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Select Time Slot - Dr. {selectedDoctor?.fullName}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="body2" color="textSecondary">
                Choose a date to view available time slots for this doctor.
              </Typography>
              <TextField
                type="date"
                size="small"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
              />
          </Box>
          
          <Grid container spacing={2}>
            {availableSlots.length === 0 ? (
                <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No availability bounds found for Dr. {selectedDoctor?.fullName} on this date. Please try another date.
                    </Alert>
                </Grid>
            ) : availableSlots.map(slot => (
              <Grid item xs={12} sm={6} md={4} key={slot.id}>
                <Card
                  sx={{
                    cursor: slot.available ? 'pointer' : 'not-allowed',
                    opacity: slot.available ? 1 : 0.5,
                    border: slot.available ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                    '&:hover': slot.available ? { boxShadow: theme.shadows[4] } : {}
                  }}
                  onClick={() => handleSlotSelect(slot)}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {slot.time}
                    </Typography>
                    <Chip
                      label={slot.type}
                      size="small"
                      color={slot.type === 'online' ? 'primary' : 'secondary'}
                      sx={{ mt: 1 }}
                    />
                    {!slot.available && (
                      <Typography variant="caption" color="error" display="block" mt={1}>
                        {temporarilyLockedSlots.has(`${selectedDoctor?.id}-${selectedDate}-${slot.id}`) ? 'Locked' : 'Booked'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Visit Type Selection Dialog */}
      <Dialog open={paymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Select Visit Type
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Please select the type of consultation you need
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: visitType === 'Disease Consultation' ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                  '&:hover': { boxShadow: theme.shadows[4] }
                }}
                onClick={() => handleVisitTypeSelect('Disease Consultation')}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <MedicalServices sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Disease Consultation
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Full medical examination and diagnosis
                  </Typography>
                  <Typography variant="body1" color="success.main" fontWeight="bold" mt={1}>
                    LKR {selectedDoctor?.consultationFee}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: visitType === 'Report Review' ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                  '&:hover': { boxShadow: theme.shadows[4] }
                }}
                onClick={() => handleVisitTypeSelect('Report Review')}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Event sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Report Review
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Review of medical reports and tests
                  </Typography>
                  <Typography variant="body1" color="success.main" fontWeight="bold" mt={1}>
                    LKR {selectedDoctor?.consultationFee}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Back</Button>
        </DialogActions>
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={cancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" color="error">
            Cancel Appointment
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>No, Keep Appointment</Button>
          <Button 
            onClick={handleCancelConfirmation} 
            variant="contained" 
            color="error"
            startIcon={<Cancel />}
          >
            Yes, Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Card Payment Dialog */}
      <Dialog open={cardPaymentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <CreditCard sx={{ fontSize: 28, color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="bold">
              Card Payment
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {!paymentSuccess ? (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Total Amount: LKR {selectedDoctor?.consultationFee}
                </Typography>
              </Alert>

              {storedCards.length > 0 && (
                <Box mb={3}>
                  <FormControl fullWidth>
                    <InputLabel>Select Stored Card</InputLabel>
                    <Select
                      value={selectedCardId}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      label="Select Stored Card"
                    >
                      <MenuItem value=""><em>Enter New Card</em></MenuItem>
                      {storedCards.map(card => (
                        <MenuItem key={card.id} value={card.id}>
                          {card.cardType} **** {card.cardNumberMasked.slice(-4)} ({card.cardHolderName})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              
              {selectedCardId && (
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm CVV"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardDetailsChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      disabled={paymentProcessing}
                      type="password"
                      helperText="Please enter the CVV of your saved card"
                    />
                  </Grid>
                </Grid>
              )}
              
              {!selectedCardId && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value.replace(/\s/g, '').slice(0, 16))}
                      disabled={paymentProcessing}
                      InputProps={{
                        startAdornment: <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      placeholder="John Doe"
                      value={cardDetails.cardName}
                      onChange={(e) => handleCardDetailsChange('cardName', e.target.value)}
                      disabled={paymentProcessing}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControl fullWidth disabled={paymentProcessing}>
                      <InputLabel>Expiry Month</InputLabel>
                      <Select
                        value={cardDetails.expiryMonth}
                        onChange={(e) => handleCardDetailsChange('expiryMonth', e.target.value)}
                        label="Expiry Month"
                      >
                        <MenuItem value="01">01 - January</MenuItem>
                        <MenuItem value="02">02 - February</MenuItem>
                        <MenuItem value="03">03 - March</MenuItem>
                        <MenuItem value="04">04 - April</MenuItem>
                        <MenuItem value="05">05 - May</MenuItem>
                        <MenuItem value="06">06 - June</MenuItem>
                        <MenuItem value="07">07 - July</MenuItem>
                        <MenuItem value="08">08 - August</MenuItem>
                        <MenuItem value="09">09 - September</MenuItem>
                        <MenuItem value="10">10 - October</MenuItem>
                        <MenuItem value="11">11 - November</MenuItem>
                        <MenuItem value="12">12 - December</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControl fullWidth disabled={paymentProcessing}>
                      <InputLabel>Expiry Year</InputLabel>
                      <Select
                        value={cardDetails.expiryYear}
                        onChange={(e) => handleCardDetailsChange('expiryYear', e.target.value)}
                        label="Expiry Year"
                      >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="CVV"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardDetailsChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                      disabled={paymentProcessing}
                      type="password"
                    />
                  </Grid>
                </Grid>
              )}
              
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  This is a demo payment form. No actual charges will be made.
                </Typography>
              </Alert>
            </>
          ) : (
            <Box textAlign="center" py={4}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Payment Successful!
                </Typography>
                <Typography variant="body2">
                  Your appointment has been booked and payment processed.
                </Typography>
              </Alert>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Redirecting to confirm your appointment...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCardPaymentDialog(false)} 
            disabled={paymentProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCardPayment}
            variant="contained"
            disabled={paymentProcessing || (selectedCardId ? !cardDetails.cvv : (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv))}
            startIcon={paymentProcessing ? <CircularProgress size={20} /> : <Payment />}
          >
            {paymentProcessing ? 'Processing...' : `Pay LKR ${selectedDoctor?.consultationFee}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PatientDashboard
