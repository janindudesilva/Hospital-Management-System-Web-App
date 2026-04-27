import React, { useState, useEffect } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Fade,
  useTheme,
  alpha,
  Avatar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
} from '@mui/material'
import {
  Visibility,
  MoreHoriz,
  FilterList,
  Tune,
  FiberManualRecord,
  Person,
  Search,
  Refresh,
  Add,
  Edit,
  Delete,
  Warning,
  NoteAdd,
  Medication,
} from '@mui/icons-material'
import axios from 'axios'
import { format, parseISO, differenceInYears } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PatientList = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [patients, searchTerm, genderFilter])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError('')
      
      let response
      if (user?.role === 'ROLE_DOCTOR') {
        const doctorRes = await axios.get(`/api/doctors/user/${user.id}`)
        const doctorId = doctorRes.data.id
        response = await axios.get(`/api/patients/doctor/${doctorId}`)
      } else {
        response = await axios.get('/api/patients')
      }
      
      setPatients(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching patients')
      console.error('Error fetching patients:', error)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const filterPatients = () => {
    let filtered = patients

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id?.toString().includes(searchTerm.toLowerCase()) ||
        patient.nicPassport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Gender filter
    if (genderFilter) {
      filtered = filtered.filter(patient => patient.gender === genderFilter)
    }


    setFilteredPatients(filtered)
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    try {
      return differenceInYears(new Date(), parseISO(dateOfBirth)) + ' years'
    } catch {
      return 'N/A'
    }
  }

  const handleViewPatient = (patient) => {
    navigate(`/patients/${patient.id}`)
  }

  const handleEditPatient = (patient) => {
    navigate(`/patients/${patient.id}/edit`)
  }

  const handleDeletePatient = (patient) => {
    setSelectedPatient(patient)
    setDeleteDialog(true)
  }

  const handleAddPrescription = (patient) => {
    navigate(`/prescriptions?patientId=${patient.id}`)
  }

  const handleAddMedicalRecord = (patient) => {
    navigate(`/medical-records?patientId=${patient.id}`)
  }

  const confirmDelete = async () => {
    if (!selectedPatient) return

    try {
      await axios.delete(`/api/patients/${selectedPatient.id}`)
      setSuccess('Patient deleted successfully')
      fetchPatients()
      setDeleteDialog(false)
      setSelectedPatient(null)
    } catch (error) {
      setError('Error deleting patient')
      console.error('Error deleting patient:', error)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setGenderFilter('')
  }


  return (
    <Container maxWidth="xl" sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" fontWeight={800} color="primary.main" mb={4}>
        Patient Registry
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ letterSpacing: 1 }}>TOTAL PATIENTS</Typography>
                <Typography variant="h3" fontWeight={800} color="textPrimary" my={1}>{patients.length}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Active profiles</Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#F4F7FE', color: '#4318FF', width: 56, height: 56, borderRadius: 2 }}>
                <Person fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ letterSpacing: 1 }}>MALE PATIENTS</Typography>
                <Typography variant="h3" fontWeight={800} color="textPrimary" my={1}>
                  {patients.filter(p => p.gender === 'MALE' || p.gender === 'Male').length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#05CD99', fontWeight: 600 }}>Registered males</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(5, 205, 153, 0.1)', color: '#05CD99', width: 56, height: 56, borderRadius: 2 }}>
                <Person fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ letterSpacing: 1 }}>FEMALE PATIENTS</Typography>
                <Typography variant="h3" fontWeight={800} color="textPrimary" my={1}>
                  {patients.filter(p => p.gender === 'FEMALE' || p.gender === 'Female').length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#EE5D50', fontWeight: 600 }}>Registered females</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(238, 93, 80, 0.1)', color: '#EE5D50', width: 56, height: 56, borderRadius: 2 }}>
                <Person fontSize="large" />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 0 }}>
          {error && <Alert severity="error" sx={{ m: 3 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ m: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Table Tools Header */}
          <Box sx={{ p: 3, borderBottom: '1px solid #E0E5F2', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search patients..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
                  sx: { bgcolor: '#F4F7FE', borderRadius: 3, minWidth: 250, '& fieldset': { border: 'none' } }
                }}
              />
            </Box>

            <Box display="flex" gap={2}>
              <Button onClick={fetchPatients} sx={{ color: '#A3AED0' }}><Refresh /></Button>
              {(user?.role === 'ADMIN' || user?.role === 'ROLE_RECEPTIONIST' || user?.role === 'ROLE_ADMIN') && (
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/patient-registration')} sx={{ borderRadius: 3, boxShadow: '0 10px 20px -10px rgba(67, 24, 255, 0.5)', px: 3 }}>
                  New Record
                </Button>
              )}
            </Box>
          </Box>

          {/* Data Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700, borderBottom: '1px solid #E0E5F2' }}>PATIENT ID</TableCell>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700, borderBottom: '1px solid #E0E5F2' }}>NAME & DEMOGRAPHICS</TableCell>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700, borderBottom: '1px solid #E0E5F2' }}>CONTACT</TableCell>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700, borderBottom: '1px solid #E0E5F2' }}>STATUS</TableCell>
                  <TableCell sx={{ color: '#A3AED0', fontWeight: 700, borderBottom: '1px solid #E0E5F2' }}>ADMISSION DATE</TableCell>
                  <TableCell align="right" sx={{ color: '#A3AED0', fontWeight: 700, borderBottom: '1px solid #E0E5F2' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((patient) => (
                  <TableRow key={patient.id} hover sx={{ '& td': { borderBottom: '1px solid #f0f0f0' } }}>
                    <TableCell>
                      <Box sx={{ display: 'inline-block', bgcolor: 'rgba(67, 24, 255, 0.05)', color: '#4318FF', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 700 }}>
                        #PT-{patient.id.toString().padStart(4, '0')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main, fontWeight: 700 }}>
                          {patient.fullName?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={800} color="textPrimary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => handleViewPatient(patient)}>
                            {patient.fullName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" fontWeight={600}>
                            {patient.gender} • {calculateAge(patient.dateOfBirth)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="textPrimary">{patient.phone || 'N/A'}</Typography>
                      <Typography variant="caption" color="textSecondary">{patient.email || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<FiberManualRecord sx={{ fontSize: '10px !important' }} />} 
                        label="Active" 
                        size="small" 
                        sx={{ bgcolor: 'rgba(5, 205, 153, 0.1)', color: '#05CD99', fontWeight: 800, borderRadius: 2, '& .MuiChip-icon': { color: '#05CD99', ml: 1 } }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="textPrimary">
                        {patient.lastVisitDate ? format(parseISO(patient.lastVisitDate), 'dd MMM yyyy') : 'Recently Added'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        <IconButton size="small" onClick={() => handleViewPatient(patient)} sx={{ bgcolor: '#F4F7FE', '&:hover': { bgcolor: 'rgba(67, 24, 255, 0.1)', color: '#4318FF' } }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') && (
                          <>
                            <IconButton size="small" onClick={() => handleEditPatient(patient)} sx={{ bgcolor: '#F4F7FE', '&:hover': { bgcolor: 'rgba(67, 24, 255, 0.1)', color: '#4318FF' } }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeletePatient(patient)} sx={{ bgcolor: '#F4F7FE', '&:hover': { bgcolor: 'rgba(238, 93, 80, 0.1)', color: '#EE5D50' } }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {(user?.role === 'ROLE_DOCTOR') && (
                          <>
                            <IconButton size="small" onClick={() => handleAddMedicalRecord(patient)} sx={{ bgcolor: '#F4F7FE', '&:hover': { bgcolor: 'rgba(67, 24, 255, 0.1)', color: '#4318FF' } }}>
                              <NoteAdd fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleAddPrescription(patient)} sx={{ bgcolor: '#F4F7FE', '&:hover': { bgcolor: 'rgba(5, 205, 153, 0.1)', color: '#05CD99' } }}>
                              <Medication fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="textSecondary" fontWeight={600}>No patients found matching your criteria</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E0E5F2' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPatients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ color: '#A3AED0', fontWeight: 600 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 800 }}>
          <Warning /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            You are about to permanently delete the records for <strong>{selectedPatient?.fullName}</strong>. This includes all associated medical histories and billing data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ color: '#A3AED0', fontWeight: 700 }}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Confirm Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PatientList
