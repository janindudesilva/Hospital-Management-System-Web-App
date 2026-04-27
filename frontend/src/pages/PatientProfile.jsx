import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Container, Paper, Typography, Box, Grid, Divider, 
  List, ListItem, ListItemText, Chip, IconButton,
  CircularProgress, Alert, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField
} from '@mui/material'
import { 
  ArrowBack, CalendarToday, Person, Phone, Wc, MedicalServices, 
  Medication, Edit, Delete, Save 
} from '@mui/icons-material'
import axios from 'axios'
import { format, parseISO } from 'date-fns'

const PatientProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [patient, setPatient] = useState(null)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  // Dialog States
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, type: null })
  const [editRecord, setEditRecord] = useState({ open: false, data: null })
  const [editPrescription, setEditPrescription] = useState({ open: false, data: null })

  // Safe date formatter
  const safeFormatDate = (dateString, formatStr = 'dd MMM yyyy') => {
    if (!dateString) return 'N/A'
    try {
      const normalizedDate = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString
      const date = typeof normalizedDate === 'string' ? parseISO(normalizedDate) : new Date(normalizedDate)
      if (isNaN(date.getTime())) return 'N/A'
      return format(date, formatStr)
    } catch (err) {
      return 'N/A'
    }
  }

  const fetchData = async () => {
    try {
      if (!id) return
      setLoading(true)
      const patientRes = await axios.get(`/api/patients/${id}`)
      setPatient(patientRes.data)
      
      const [recordsRes, prescriptionsRes] = await Promise.all([
        axios.get(`/api/medical-records/patient/${id}`).catch(() => ({ data: [] })),
        axios.get(`/api/prescriptions/patient/${id}`).catch(() => ({ data: [] }))
      ])
      
      setMedicalRecords(Array.isArray(recordsRes.data) ? recordsRes.data : [])
      setPrescriptions(Array.isArray(prescriptionsRes.data) ? prescriptionsRes.data : [])
      setError(null)
    } catch (err) {
      setError('Failed to load patient data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // --- Deletion Logic ---
  const handleDeleteConfirm = (id, type) => {
    setDeleteConfirm({ open: true, id, type })
  }

  const executeDelete = async () => {
    const { id: itemId, type } = deleteConfirm
    try {
      const endpoint = type === 'record' ? `/api/medical-records/${itemId}` : `/api/prescriptions/${itemId}`
      await axios.delete(endpoint)
      setDeleteConfirm({ open: false, id: null, type: null })
      fetchData() // Refresh list
    } catch (err) {
      alert('Failed to delete item. Please try again.')
    }
  }

  // --- Medical Record Edit Logic ---
  const handleEditRecordOpen = (record) => {
    setEditRecord({ open: true, data: { ...record } })
  }

  const handleUpdateRecord = async () => {
    try {
      await axios.put(`/api/medical-records/${editRecord.data.id}`, editRecord.data)
      setEditRecord({ open: false, data: null })
      fetchData()
    } catch (err) {
      alert('Failed to update medical record.')
    }
  }

  // --- Prescription Edit Logic ---
  const handleEditPrescriptionOpen = (prescription) => {
    setEditPrescription({ open: true, data: { ...prescription } })
  }

  const handleUpdatePrescription = async () => {
    try {
      await axios.put(`/api/prescriptions/${editPrescription.data.id}`, editPrescription.data)
      setEditPrescription({ open: false, data: null })
      fetchData()
    } catch (err) {
      alert('Failed to update prescription.')
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Patient Profile...</Typography>
      </Container>
    )
  }

  if (error || !patient) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error">
          {error || 'Patient not found.'}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton onClick={() => navigate('/patients')} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="800" color="primary">
          Patient Profile
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Basic Info */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', p: 3, textAlign: 'center', color: 'white' }}>
              <Person sx={{ fontSize: 60, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{patient.fullName}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Patient ID: #{patient.id}</Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <CalendarToday color="primary" />
                <Box>
                  <Typography variant="caption" color="textSecondary">Age</Typography>
                  <Typography variant="body1" fontWeight="600">{patient.age} years</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Wc color="primary" />
                <Box>
                  <Typography variant="caption" color="textSecondary">Gender</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                    {patient.gender?.toLowerCase() || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Phone color="primary" />
                <Box>
                  <Typography variant="caption" color="textSecondary">Phone Number</Typography>
                  <Typography variant="body1" fontWeight="600">{patient.phone || 'N/A'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Clinical Management */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={4}>
            {/* Medical Records Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <MedicalServices color="primary" />
                  <Typography variant="h6" fontWeight="bold">Medical Records</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {medicalRecords.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    No medical records available for this patient.
                  </Typography>
                ) : (
                  <List dense>
                    {medicalRecords.map((record) => (
                      <ListItem 
                        key={record.id} 
                        divider 
                        sx={{ py: 2 }}
                        secondaryAction={
                          <Box>
                            <IconButton edge="end" color="primary" onClick={() => handleEditRecordOpen(record)} sx={{ mr: 1 }}>
                              <Edit />
                            </IconButton>
                            <IconButton edge="end" color="error" onClick={() => handleDeleteConfirm(record.id, 'record')}>
                              <Delete />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={<Typography variant="subtitle1" fontWeight="700">{record.diagnosis}</Typography>}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="textPrimary"><strong>Symptoms:</strong> {record.symptoms}</Typography>
                              <Typography variant="body2" color="textPrimary"><strong>Treatment:</strong> {record.treatment}</Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                Date: {safeFormatDate(record.recordDate)} • Dr. {record.doctorName || 'N/A'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/* Prescriptions Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Medication color="primary" />
                  <Typography variant="h6" fontWeight="bold">Prescriptions</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {prescriptions.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    No prescriptions available for this patient.
                  </Typography>
                ) : (
                  <List dense>
                    {prescriptions.map((prescription) => (
                      <ListItem 
                        key={prescription.id} 
                        divider 
                        sx={{ py: 2 }}
                        secondaryAction={
                          <Box>
                            <IconButton edge="end" color="primary" onClick={() => handleEditPrescriptionOpen(prescription)} sx={{ mr: 1 }}>
                              <Edit />
                            </IconButton>
                            <IconButton edge="end" color="error" onClick={() => handleDeleteConfirm(prescription.id, 'prescription')}>
                              <Delete />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight="700" color="secondary.dark">{prescription.medicineName}</Typography>
                              <Chip size="small" label={prescription.dosage} color="info" variant="outlined" />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2"><strong>Frequency:</strong> {prescription.frequency} times/day</Typography>
                              <Typography variant="body2"><strong>Instructions:</strong> {prescription.instructions}</Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                Issued: {safeFormatDate(prescription.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* --- Dialogs --- */}

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, type: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to <strong>permanently delete</strong> this clinical item? This action will remove it from the database and cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null, type: null })}>Cancel</Button>
          <Button onClick={executeDelete} color="error" variant="contained">Delete Permanently</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Medical Record */}
      <Dialog open={editRecord.open} onClose={() => setEditRecord({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Medical Record</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField 
            fullWidth label="Diagnosis" margin="dense" value={editRecord.data?.diagnosis || ''} 
            onChange={(e) => setEditRecord({ ...editRecord, data: { ...editRecord.data, diagnosis: e.target.value } })}
          />
          <TextField 
            fullWidth label="Symptoms" margin="dense" value={editRecord.data?.symptoms || ''} 
            onChange={(e) => setEditRecord({ ...editRecord, data: { ...editRecord.data, symptoms: e.target.value } })}
          />
          <TextField 
            fullWidth label="Treatment" margin="dense" multiline rows={2} value={editRecord.data?.treatment || ''} 
            onChange={(e) => setEditRecord({ ...editRecord, data: { ...editRecord.data, treatment: e.target.value } })}
          />
          <TextField 
            fullWidth label="Additional Notes" margin="dense" multiline rows={2} value={editRecord.data?.notes || ''} 
            onChange={(e) => setEditRecord({ ...editRecord, data: { ...editRecord.data, notes: e.target.value } })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRecord({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleUpdateRecord} variant="contained" startIcon={<Save />}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Prescription */}
      <Dialog open={editPrescription.open} onClose={() => setEditPrescription({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Prescription</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField 
            fullWidth label="Medicine Name" margin="dense" value={editPrescription.data?.medicineName || ''} 
            onChange={(e) => setEditPrescription({ ...editPrescription, data: { ...editPrescription.data, medicineName: e.target.value } })}
          />
          <TextField 
            fullWidth label="Dosage" margin="dense" value={editPrescription.data?.dosage || ''} 
            onChange={(e) => setEditPrescription({ ...editPrescription, data: { ...editPrescription.data, dosage: e.target.value } })}
          />
          <TextField 
            fullWidth label="Frequency" margin="dense" value={editPrescription.data?.frequency || ''} 
            onChange={(e) => setEditPrescription({ ...editPrescription, data: { ...editPrescription.data, frequency: e.target.value } })}
          />
          <TextField 
            fullWidth label="Instructions" margin="dense" multiline rows={2} value={editPrescription.data?.instructions || ''} 
            onChange={(e) => setEditPrescription({ ...editPrescription, data: { ...editPrescription.data, instructions: e.target.value } })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPrescription({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleUpdatePrescription} variant="contained" startIcon={<Save />}>Save Changes</Button>
        </DialogActions>
      </Dialog>

    </Container>
  )
}

export default PatientProfile
