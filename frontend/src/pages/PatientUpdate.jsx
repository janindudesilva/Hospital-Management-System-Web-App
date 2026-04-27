import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Fade,
  useTheme,
  Divider,
  Avatar,
  LinearProgress,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Person,
  Phone,
  Home,
  CalendarToday,
  Assignment,
  Save,
  Clear,
  ArrowBack,
  Edit,
} from '@mui/icons-material'
import axios from 'axios'
import { format, parseISO } from 'date-fns'
import { sanitizeInput } from '../utils/validation'

const PatientUpdate = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [originalData, setOriginalData] = useState(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    phone: '',
    address: '',
    bloodGroup: '',
    dateOfBirth: '',
    emergencyContact: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (id) {
      fetchPatientData()
    }
  }, [id])

  const calculateAge = (dob) => {
    if (!dob) return 0
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const fetchPatientData = async () => {
    try {
      setInitialLoading(true)
      const response = await axios.get(`/api/patients/${id}`)
      const patientData = response.data
      
      const formattedData = {
        fullName: patientData.fullName || '',
        gender: patientData.gender || '',
        phone: patientData.phone ? patientData.phone.replace('+94', '') : '',
        address: patientData.address || '',
        bloodGroup: patientData.bloodGroup || '',
        dateOfBirth: patientData.dateOfBirth ? format(parseISO(patientData.dateOfBirth), 'yyyy-MM-dd') : '',
        emergencyContact: patientData.emergencyContact ? patientData.emergencyContact.replace('+94', '') : ''
      }
      
      setFormData(formattedData)
      setOriginalData(formattedData)
    } catch (error) {
      setError('Error fetching patient data')
      console.error('Error fetching patient data:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter exactly 9 digits'
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required'
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    } else if (new Date(formData.dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future'
    }
    
    // Emergency contact validation
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required'
    } else if (!/^[0-9]{9}$/.test(formData.emergencyContact)) {
      newErrors.emergencyContact = 'Please enter exactly 9 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field) => (event) => {
    let value = event.target.value
    
    if (field === 'phone' || field === 'emergencyContact') {
      value = value.replace(/[^0-9]/g, '').slice(0, 9)
    }

    setFormData({
      ...formData,
      [field]: value
    })
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      })
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const requestData = {
        fullName: sanitizeInput(formData.fullName),
        age: calculateAge(formData.dateOfBirth),
        gender: formData.gender,
        phone: '+94' + formData.phone,
        address: sanitizeInput(formData.address),
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: '+94' + formData.emergencyContact
      }
      await axios.put(`/api/patients/${id}`, requestData)
      setSuccess('Patient information updated successfully!')
      setTimeout(() => {
        navigate(`/patients/${id}`)
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating patient information')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/patients/${id}`)
  }

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData)
      setErrors({})
      setError('')
      setSuccess('')
    }
  }

  const hasChanges = () => {
    if (!originalData) return false
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }

  if (initialLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading patient data...
            </Typography>
          </Paper>
        </Fade>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={800}>
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[8] }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <IconButton onClick={handleCancel}>
                <ArrowBack />
              </IconButton>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
                <Edit sx={{ fontSize: 28 }} />
              </Avatar>
              <Box flexGrow={1}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
                  Update Patient Information
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Edit details for {originalData?.fullName} (ID: #{id})
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <Box mb={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange('dateOfBirth')}
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth}
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: format(new Date(), 'yyyy-MM-dd') }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={handleInputChange('gender')}
                      label="Gender"
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    placeholder="77XXXXXXX"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone || "Enter 9 digits after +94"}
                    required
                    inputProps={{ maxLength: 9 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">+94</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    placeholder="77XXXXXXX"
                    value={formData.emergencyContact}
                    onChange={handleInputChange('emergencyContact')}
                    error={!!errors.emergencyContact}
                    helperText={errors.emergencyContact || "Enter 9 digits after +94"}
                    required
                    inputProps={{ maxLength: 9 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">+94</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.bloodGroup}>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={formData.bloodGroup}
                      onChange={handleInputChange('bloodGroup')}
                      label="Blood Group"
                    >
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    error={!!errors.address}
                    helperText={errors.address}
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box display="flex" justifyContent="flex-end" alignItems="center">
              <Button
                onClick={handleReset}
                variant="outlined"
                startIcon={<Clear />}
                sx={{ mr: 2 }}
                disabled={!hasChanges() || loading}
              >
                Reset
              </Button>
              <Button
                onClick={handleCancel}
                variant="outlined"
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || !hasChanges()}
                startIcon={loading ? null : <Save />}
                sx={{ minWidth: 150 }}
              >
                {loading ? 'Updating...' : 'Update Patient'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  )
}

export default PatientUpdate
