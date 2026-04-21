import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { Person, Edit, Delete } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    specialization: '',
    availableFrom: '',
    availableTo: '',
    consultationFee: ''
  })

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (user && user.id) {
        try {
          let endpoint = ''
          if (user.role === 'ROLE_PATIENT') {
            endpoint = `/api/patients/user/${user.id}`
          } else if (user.role === 'ROLE_DOCTOR') {
            endpoint = `/api/doctors/user/${user.id}`
          }

          if (endpoint) {
            const response = await axios.get(endpoint)
            const data = response.data
            // Java LocalDate serializes as an array [year, month, day]
            let dob = ''
            if (data.dateOfBirth) {
              if (Array.isArray(data.dateOfBirth)) {
                const [y, m, d] = data.dateOfBirth
                dob = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
              } else {
                dob = data.dateOfBirth
              }
            } else if (user.dateOfBirth) {
              dob = user.dateOfBirth
            }
            setProfileData({
              username: user.username || '',
              email: user.email || '',
              phone: data.phone || user.phone || '',
              address: data.address || user.address || '',
              dateOfBirth: dob,
              specialization: data.specialization || '',
              availableFrom: data.availableFrom || '',
              availableTo: data.availableTo || '',
              consultationFee: data.consultationFee || ''
            })
          } else {
            // Fallback to JWT data if no specific endpoint
            setProfileData({
              username: user.username || '',
              email: user.email || '',
              phone: user.phone || '',
              address: user.address || '',
              dateOfBirth: user.dateOfBirth || '',
              specialization: '',
              availableFrom: '',
              availableTo: '',
              consultationFee: ''
            })
          }
        } catch (error) {
          console.error('Error fetching profile details:', error)
          // Fallback to JWT data on error
          setProfileData({
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            dateOfBirth: user.dateOfBirth || ''
          })
        }
      }
    }

    fetchProfileDetails()
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (user && user.role === 'ROLE_PATIENT' && profileData.dateOfBirth && new Date(profileData.dateOfBirth) > new Date()) {
      alert('Date of birth cannot be in the future')
      return;
    }
    if (user && user.role === 'ROLE_DOCTOR' && profileData.consultationFee < 0) {
      alert('Consultation fee cannot be negative')
      return;
    }

    try {
      if (user && user.id && user.role === 'ROLE_PATIENT') {
        // Fetch the current patient record to get its ID
        const patientRes = await axios.get(`/api/patients/user/${user.id}`)
        const patientId = patientRes.data.id
        await axios.put(`/api/patients/${patientId}`, {
          ...patientRes.data,
          phone: profileData.phone,
          address: profileData.address,
          dateOfBirth: profileData.dateOfBirth || null,
        })
      } else if (user && user.id && user.role === 'ROLE_DOCTOR') {
        const doctorRes = await axios.get(`/api/doctors/user/${user.id}`)
        const doctorId = doctorRes.data.id
        await axios.put(`/api/doctors/${doctorId}`, {
          ...doctorRes.data,
          phone: profileData.phone,
          specialization: profileData.specialization,
          availableFrom: profileData.availableFrom,
          availableTo: profileData.availableTo,
          consultationFee: profileData.consultationFee
        })
      } else if (user && user.id && user.role === 'ROLE_ADMIN') {
        await axios.put(`/api/users/${user.id}/profile`, {
          email: profileData.email,
          phone: profileData.phone
        })
      }
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
      const errorMsg = error.response ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : error.message;
      alert(`Failed to save profile changes. ${errorMsg}`);
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Re-fetch to restore original values
    if (user && user.id) {
      const endpoint = user.role === 'ROLE_PATIENT'
        ? `/api/patients/user/${user.id}`
        : user.role === 'ROLE_DOCTOR'
          ? `/api/doctors/user/${user.id}`
          : null
      if (endpoint) {
        axios.get(endpoint).then(res => {
          const data = res.data
          let dob = ''
          if (data.dateOfBirth) {
            if (Array.isArray(data.dateOfBirth)) {
              const [y, m, d] = data.dateOfBirth
              dob = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            } else {
              dob = data.dateOfBirth
            }
          }
          setProfileData({
            username: user.username || '',
            email: user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            dateOfBirth: dob,
            specialization: data.specialization || '',
            availableFrom: data.availableFrom || '',
            availableTo: data.availableTo || '',
            consultationFee: data.consultationFee || ''
          })
        }).catch(() => {})
      }
    }
  }

  const handleChange = (field) => (event) => {
    setProfileData({
      ...profileData,
      [field]: event.target.value,
    })
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete('/api/auth/delete-profile')
      setDeleteDialogOpen(false)
      logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to delete profile:', error)
      alert(typeof error.response?.data === 'string' ? error.response.data : (error.response?.data?.message || 'Failed to delete profile. Please try again.'))
      setDeleteDialogOpen(false)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'error'
      case 'ROLE_DOCTOR':
        return 'primary'
      case 'ROLE_RECEPTIONIST':
        return 'secondary'
      case 'ROLE_PATIENT':
        return 'success'
      default:
        return 'default'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Administrator'
      case 'ROLE_DOCTOR':
        return 'Doctor'
      case 'ROLE_RECEPTIONIST':
        return 'Receptionist'
      case 'ROLE_PATIENT':
        return 'Patient'
      default:
        return 'User'
    }
  }

  if (!user) {
    return (
      <Container>
        <Typography>Loading profile...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: 32,
              mr: 3,
            }}
          >
            <Person fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {profileData.username}
            </Typography>
            <Chip
              label={getRoleLabel(user.role)}
              color={getRoleColor(user.role)}
              size="medium"
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={profileData.username}
              onChange={handleChange('username')}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              onChange={handleChange('email')}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={profileData.phone}
              onChange={handleChange('phone')}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
            />
          </Grid>
          {user.role === 'ROLE_PATIENT' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Address"
                    value={profileData.address}
                    onChange={handleChange('address')}
                    disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={handleChange('dateOfBirth')}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
            </>
          )}
          {user.role === 'ROLE_DOCTOR' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialization"
                  value={profileData.specialization}
                  onChange={handleChange('specialization')}
                  disabled={!isEditing}
                  variant={isEditing ? 'outlined' : 'filled'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Consultation Fee"
                  type="number"
                  value={profileData.consultationFee}
                  onChange={handleChange('consultationFee')}
                  disabled={!isEditing}
                  variant={isEditing ? 'outlined' : 'filled'}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Available From"
                  type="time"
                  value={profileData.availableFrom}
                  onChange={handleChange('availableFrom')}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Available To"
                  type="time"
                  value={profileData.availableTo}
                  onChange={handleChange('availableTo')}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role"
              value={getRoleLabel(user.role)}
              disabled
              variant="filled"
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          {isEditing ? (
            <>
              <Button onClick={handleCancel} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteClick}
                sx={{ mr: 2 }}
              >
                Delete Profile
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
            </>
          )}
        </Box>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {"Delete Profile?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete your profile? This action is irreversible
            and you will lose access to your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Profile
