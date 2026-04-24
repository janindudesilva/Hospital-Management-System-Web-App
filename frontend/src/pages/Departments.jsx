import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Business,
  Healing,
  Assessment,
  LocalHospital,
  LocalPharmacy,
  ArrowForward,
  TrendingUp,
  AccountCircle,
  History,
} from '@mui/icons-material'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object().shape({
  name: yup.string().required('Department name is required').max(100, 'Name too long'),
  description: yup.string().required('Description is required'),
})

const Departments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/departments')
      setDepartments(response.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`/api/departments/${id}`)
        fetchDepartments()
      } catch (error) {
        console.error('Error deleting department:', error)
        alert(typeof error.response?.data === 'string' ? error.response.data : (error.response?.data?.message || 'Failed to delete department.'));
      }
    }
  }

  const handleEditClick = (department) => {
    setSelectedDepartment(department)
    setValue('name', department.name)
    setValue('description', department.description)
    setOpenDialog(true)
  }

  const handleAddClick = () => {
    setSelectedDepartment(null)
    reset({ name: '', description: '' })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedDepartment(null)
    reset({ name: '', description: '' })
  }

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      if (selectedDepartment) {
        await axios.put(`/api/departments/${selectedDepartment.id}`, data)
      } else {
        await axios.post('/api/departments', data)
      }
      handleCloseDialog()
      fetchDepartments()
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to save department.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && departments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={800} color="primary.main" gutterBottom>
            Departmental Management
          </Typography>
          <Typography variant="body2" color="textSecondary" fontWeight={500}>
            Oversee clinical units, resource allocation, and specialized medical divisions from a unified prism view.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddClick}
          sx={{ borderRadius: 3, boxShadow: '0 10px 20px -10px rgba(67, 24, 255, 0.5)' }}
        >
          New Department
        </Button>
      </Box>

      {/* Top KPI Summary Cards */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, bgcolor: '#4318FF', color: 'white' }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 1, opacity: 0.8 }}>SPECIALIST DOCTORS</Typography>
              <Typography variant="h2" fontWeight={800} my={1}>
                {departments.reduce((acc, dept) => acc + (dept.doctorCount || 0), 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                <AccountCircle sx={{ fontSize: 24, mr: 1, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total specialists across all units</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#E6FFF5', borderRadius: 4 }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="caption" fontWeight={700} color="#04A076" sx={{ letterSpacing: 1 }}>ACTIVE DEPARTMENTS</Typography>
              <Typography variant="h2" fontWeight={800} color="#04A076" my={1}>{departments.length}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                <TrendingUp sx={{ color: '#04A076', fontSize: 18 }} />
                <Typography variant="body2" color="#04A076" fontWeight={600}>Currently operational units</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Department Cards Grid */}
      <Grid container spacing={3}>
        {departments.map((dept, index) => {
          const isUrgent = index % 3 === 0
          const colorMain = isUrgent ? '#EE5D50' : '#4318FF'
          const colorLight = isUrgent ? 'rgba(238, 93, 80, 0.1)' : 'rgba(67, 24, 255, 0.1)'
          const tagLabel = isUrgent ? 'URGENT FOCUS' : 'STABLE'
          
          return (
            <Grid item xs={12} sm={6} md={4} key={dept.id}>
              <Card sx={{ borderRadius: 5, overflow: 'visible', position: 'relative', pt: 2, pb: 1 }}>
                {/* Top colored indicator bar */}
                <Box sx={{ position: 'absolute', top: 0, left: 32, right: 32, height: 4, bgcolor: colorMain, borderRadius: '0 0 4px 4px' }} />
                
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: colorLight, color: colorMain }}>
                      <Healing />
                    </Avatar>
                    <Chip label={tagLabel} size="small" sx={{ bgcolor: colorLight, color: colorMain, fontWeight: 800, borderRadius: 1.5 }} />
                  </Box>
                  
                  <Typography variant="h5" fontWeight={800} color="textPrimary" mb={1}>
                    {dept.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ height: 60, overflow: 'hidden', mb: 3 }}>
                    {dept.description || 'Specialized unit providing comprehensive care and advanced diagnostics.'}
                  </Typography>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#F4F7FE', p: 2, borderRadius: 3 }}>
                        <Typography variant="caption" color="textSecondary" fontWeight={700}>DOCTORS</Typography>
                        <Typography variant="subtitle1" fontWeight={800} color="textPrimary">{dept.doctorCount || dept.doctors?.length || 0} Experts</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#F4F7FE', p: 2, borderRadius: 3 }}>
                        <Typography variant="caption" color="textSecondary" fontWeight={700}>STATUS</Typography>
                        <Typography variant="subtitle1" fontWeight={800} color="primary.main">Active</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} sx={{ borderTop: '1px solid #E0E5F2' }}>
                    <Typography variant="caption" color="textSecondary" fontWeight={600} display="flex" alignItems="center" gap={0.5}>
                      <Business fontSize="small" /> Wing {String.fromCharCode(65 + index)}, Level {index + 1}
                    </Typography>
                    
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary" onClick={() => handleEditClick(dept)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(dept.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}

        {/* Add Department Ghost Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card onClick={handleAddClick} sx={{ height: '100%', minHeight: 350, bgcolor: 'transparent', border: '3px dashed #E0E5F2', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'white', borderColor: '#4318FF' } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#F4F7FE', color: '#A3AED0', mb: 2, mx: 'auto', width: 56, height: 56 }}>
                <Add fontSize="large" />
              </Avatar>
              <Typography variant="h6" fontWeight={700} color="textPrimary" mb={1}>Add Department</Typography>
              <Typography variant="body2" color="textSecondary">Expand hospital capabilities with a new clinical unit</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* Add/Edit Department Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle fontWeight="bold">{selectedDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department Name"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
            </Grid>
            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (selectedDepartment ? 'Save Changes' : 'Create Department')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </Container>
  )
}

export default Departments
