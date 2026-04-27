import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  Fade,
  useTheme,
  alpha,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Grid,
} from '@mui/material'
import {
  Warning,
  Delete,
  ArrowBack,
  Person,
  Event,
  MedicalServices,
  Receipt,
  Assignment,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material'
import axios from 'axios'
import { format, parseISO } from 'date-fns'

const PatientDelete = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [patient, setPatient] = useState(null)
  const [relatedData, setRelatedData] = useState({
    appointments: [],
    medicalRecords: [],
    prescriptions: [],
    bills: []
  })
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [understandRisks, setUnderstandRisks] = useState(false)
  const [deleteType, setDeleteType] = useState('soft') // 'soft' or 'hard'

  useEffect(() => {
    if (id) {
      fetchPatientData()
    }
  }, [id])

  const fetchPatientData = async () => {
    try {
      setInitialLoading(true)
      
      // Fetch patient data and related records
      const [patientRes, appointmentsRes, medicalRes, prescriptionsRes, billsRes] = await Promise.all([
        axios.get(`/api/patients/${id}`),
        axios.get(`/api/appointments/patient/${id}`),
        axios.get(`/api/medical-records/patient/${id}`),
        axios.get(`/api/prescriptions/patient/${id}`),
        axios.get(`/api/bills/patient/${id}`)
      ])

      setPatient(patientRes.data)
      setRelatedData({
        appointments: appointmentsRes.data,
        medicalRecords: medicalRes.data,
        prescriptions: prescriptionsRes.data,
        bills: billsRes.data
      })
    } catch (error) {
      setError('Error fetching patient data')
      console.error('Error fetching patient data:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleDeletePatient = async () => {
    if (!understandRisks) {
      setError('Please acknowledge that you understand the risks before proceeding')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (deleteType === 'soft') {
        // Soft delete - deactivate patient
        await axios.patch(`/api/patients/${id}/deactivate`)
        setSuccess('Patient has been deactivated successfully')
      } else {
        // Hard delete - permanent removal
        await axios.delete(`/api/patients/${id}?hard=true`)
        setSuccess('Patient and all related data have been permanently deleted')
      }
      
      // Redirect to patient list after successful deletion
      setTimeout(() => {
        navigate('/patients')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting patient')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/patients/${id}`)
  }

  const getDataSummary = () => {
    const summary = {
      total: 0,
      items: []
    }

    if (relatedData.appointments.length > 0) {
      summary.total += relatedData.appointments.length
      summary.items.push({
        type: 'Appointments',
        count: relatedData.appointments.length,
        icon: <Event />,
        color: 'primary'
      })
    }

    if (relatedData.medicalRecords.length > 0) {
      summary.total += relatedData.medicalRecords.length
      summary.items.push({
        type: 'Medical Records',
        count: relatedData.medicalRecords.length,
        icon: <MedicalServices />,
        color: 'warning'
      })
    }

    if (relatedData.prescriptions.length > 0) {
      summary.total += relatedData.prescriptions.length
      summary.items.push({
        type: 'Prescriptions',
        count: relatedData.prescriptions.length,
        icon: <Assignment />,
        color: 'info'
      })
    }

    if (relatedData.bills.length > 0) {
      summary.total += relatedData.bills.length
      summary.items.push({
        type: 'Billing Records',
        count: relatedData.bills.length,
        icon: <Receipt />,
        color: 'success'
      })
    }

    return summary
  }

  const dataSummary = getDataSummary()

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

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Patient not found
          </Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={800}>
        <Card 
          sx={{ 
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <IconButton onClick={handleCancel}>
                <ArrowBack />
              </IconButton>
              <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
                <Warning sx={{ fontSize: 40, color: theme.palette.error.main }} />
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold" color="error.main">
                    Delete Patient
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This action will affect patient: {patient.fullName} (ID: #{patient.id})
                  </Typography>
                </Box>
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

            {/* Patient Information */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.error.main, 0.02) }}>
              <Typography variant="h6" fontWeight="bold" mb={2} color="error.main">
                Patient Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">Full Name</Typography>
                  <Typography variant="body1" fontWeight="bold">{patient.fullName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">Patient ID</Typography>
                  <Typography variant="body1" fontWeight="bold">#{patient.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">NIC/Passport</Typography>
                  <Typography variant="body1">{patient.nicPassport}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">Contact</Typography>
                  <Typography variant="body1">{patient.contactNumber}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{patient.email}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Related Data Summary */}
            {dataSummary.total > 0 && (
              <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.warning.main, 0.02) }}>
                <Typography variant="h6" fontWeight="bold" mb={2} color="warning.main">
                  Related Data That Will Be Affected
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  This patient has {dataSummary.total} related records that will be affected:
                </Typography>
                <Grid container spacing={2}>
                  {dataSummary.items.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Box display="flex" alignItems="center" gap={2} p={2} border={`1px solid ${theme.palette.divider}`} borderRadius={2}>
                        {React.cloneElement(item.icon, { color: item.color })}
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{item.type}</Typography>
                          <Typography variant="h6" color={item.color}>{item.count}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Warning Messages */}
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>⚠️ Important Warning</AlertTitle>
              <Typography variant="body2" component="div">
                <ul>
                  <li><strong>Soft Delete:</strong> Patient will be deactivated but data remains in system for audit purposes</li>
                  <li><strong>Hard Delete:</strong> All patient data and related records will be permanently removed</li>
                  <li>This action cannot be undone</li>
                  <li>All related appointments, medical records, prescriptions, and billing information will be affected</li>
                </ul>
              </Typography>
            </Alert>

            {/* Delete Type Selection */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Choose Delete Type
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper
                    variant={deleteType === 'soft' ? 'elevation' : 'outlined'}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: deleteType === 'soft' ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                      '&:hover': { boxShadow: theme.shadows[4] }
                    }}
                    onClick={() => setDeleteType('soft')}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <CheckCircle color="primary" />
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">Soft Delete</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Deactivate patient but keep data for audit and compliance
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    variant={deleteType === 'hard' ? 'elevation' : 'outlined'}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: deleteType === 'hard' ? `2px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
                      '&:hover': { boxShadow: theme.shadows[4] }
                    }}
                    onClick={() => setDeleteType('hard')}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Error color="error" />
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="error.main">Hard Delete</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Permanently remove all patient data and related records
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* Risk Acknowledgment */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.error.main, 0.02) }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={understandRisks}
                    onChange={(e) => setUnderstandRisks(e.target.checked)}
                    color="error"
                  />
                }
                label={
                  <Typography variant="body2">
                    I understand that this action is irreversible and will permanently affect patient data. 
                    I have the necessary authorization to perform this action.
                  </Typography>
                }
              />
            </Paper>

            {/* Action Buttons */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<ArrowBack />}
                size="large"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setDeleteDialog(true)}
                disabled={!understandRisks}
                startIcon={<Delete />}
                size="large"
              >
                {deleteType === 'soft' ? 'Deactivate Patient' : 'Delete Patient Permanently'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Final Confirmation Dialog */}
      <Dialog open={deleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Delete color="error" />
            <Typography variant="h6" fontWeight="bold" color="error">
              Final Confirmation
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This is your final chance to cancel this action.
          </Alert>
          <Typography variant="body1" mb={2}>
            Are you absolutely sure you want to {deleteType === 'soft' ? 'deactivate' : 'permanently delete'}:
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
            {patient.fullName} (ID: #{patient.id})
          </Typography>
          {dataSummary.total > 0 && (
            <Typography variant="body2" color="textSecondary">
              This will also affect {dataSummary.total} related records.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            No, Cancel
          </Button>
          <Button
            onClick={handleDeletePatient}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <></> : <Delete />}
          >
            {loading ? 'Processing...' : (deleteType === 'soft' ? 'Yes, Deactivate' : 'Yes, Delete Permanently')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PatientDelete
