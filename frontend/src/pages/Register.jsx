import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Collapse
} from '@mui/material'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../contexts/AuthContext'
import {
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength,
  isValidUsername,
} from '../utils/validation'

const schema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .test(
      'valid-username',
      'Username can only contain letters, numbers, underscores, and hyphens',
      (value) => (value ? isValidUsername(value) : true)
    ),

  email: yup
    .string()
    .required('Email is required')
    .max(100, 'Email must not exceed 100 characters')
    .test(
      'valid-email',
      'Please enter a valid email address (e.g. user@example.com)',
      (value) => (value ? isValidEmail(value) : true)
    ),

  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{9}$/, 'Please enter exactly 9 digits after +94'),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .test('strong-password', 'Password does not meet security requirements', (value) => {
      if (!value) return true
      const validation = validatePasswordStrength(value)
      return validation.isValid
    }),

  fullName: yup
    .string()
    .required('Full name is required')
    .max(100, 'Full name must not exceed 100 characters'),

  age: yup.number().nullable().transform((v, o) => o === '' ? null : v).min(0, 'Age cannot be negative'),
  gender: yup.string(),
  address: yup.string(),
  dateOfBirth: yup.string().test('valid-dob', 'Date of birth cannot be in the future', (value) => {
    if (!value) return true
    return new Date(value) <= new Date()
  }),
  role: yup.string().required('Role is required'),
  departmentId: yup.number().nullable().transform((v, o) => o === '' ? null : v),
  specialization: yup.string(),
  qualification: yup.string(),
  experience: yup.string(),
  consultationFee: yup.number().nullable().transform((v, o) => o === '' ? null : v).min(0, 'Fee cannot be negative'),
})

const Register = () => {
  const navigate = useNavigate()
  const { register: registerUser, loading, error, clearError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(null)
  const [departments, setDepartments] = useState([])
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'ROLE_PATIENT',
      gender: '',
      fullName: '',
      age: '',
      address: '',
      dateOfBirth: '',
      departmentId: '',
      specialization: '',
      qualification: '',
      experience: '',
      consultationFee: '',
    },
  })

  const password = watch('password')
  const dob = watch('dateOfBirth')
  const selectedRole = watch('role')

  React.useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      if (age >= 0) {
        setValue('age', age)
        trigger('age')
      }
    }
  }, [dob, setValue, trigger])

  React.useEffect(() => {
    if (selectedRole === 'ROLE_DOCTOR' && departments.length === 0) {
      axios.get('/api/departments/public')
        .then(res => setDepartments(res.data))
        .catch(err => console.error(err))
    }
  }, [selectedRole, departments.length])

  React.useEffect(() => {
    if (password) {
      const validation = validatePasswordStrength(password)
      setPasswordStrength(validation)
      trigger('password')
    } else {
      setPasswordStrength(null)
    }
  }, [password, trigger])

  const onSubmit = async (data) => {
    try {
      // Manual required checks due to relaxed schema
      if (data.role === 'ROLE_PATIENT' && (!data.age || !data.gender || !data.address || !data.dateOfBirth)) {
        trigger(['age', 'gender', 'address', 'dateOfBirth'])
        return
      }
      if (data.role === 'ROLE_DOCTOR' && (!data.departmentId || !data.specialization || !data.qualification || !data.experience || !data.consultationFee)) {
        trigger(['departmentId', 'specialization', 'qualification', 'experience', 'consultationFee'])
        return
      }

      setIsSubmitting(true)
      clearError()

      const sanitizedData = {
        username: sanitizeInput(data.username),
        email: sanitizeInput(data.email).toLowerCase(),
        phone: '+94' + sanitizeInput(data.phone),
        password: data.password,
        role: data.role,
        fullName: sanitizeInput(data.fullName),
        age: data.age ? Number(data.age) : null,
        gender: data.gender || null,
        address: data.address ? sanitizeInput(data.address) : null,
        dateOfBirth: data.dateOfBirth || null,
        departmentId: data.departmentId || null,
        specialization: data.specialization ? sanitizeInput(data.specialization) : null,
        qualification: data.qualification ? sanitizeInput(data.qualification) : null,
        experience: data.experience ? sanitizeInput(data.experience) : null,
        consultationFee: data.consultationFee ? Number(data.consultationFee) : null
      }

      if (data.role === 'ROLE_DOCTOR') {
        await axios.post('/api/auth/register', sanitizedData)
        setRegistrationSuccess(true)
        setIsSubmitting(false)
      } else {
        await registerUser(sanitizedData)
        navigate('/dashboard')
      }
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      className="bg-gradient-to-br from-blue-600 via-sky-300 to-green-300"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper 
          elevation={8} 
          className="backdrop-blur-xl bg-white/90 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/40"
          sx={{ padding: { xs: 3, md: 5 }, width: '100%', borderRadius: 4 }}
        >
          <Typography component="h1" variant="h4" align="center" fontWeight={700} color="primary.main" gutterBottom>
            Create Your Account
          </Typography>

          {registrationSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Doctor registration successful! Your account is currently pending Admin approval before you can log in.
              <Box mt={2} textAlign="center">
                <Button variant="outlined" component={Link} to="/login">Go to Login</Button>
              </Box>
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
              <Box display="flex" justifyContent="center" mb={3}>
                <ToggleButtonGroup
                  color="primary"
                  value={selectedRole}
                  exclusive
                  onChange={(e, newRole) => {
                    if (newRole) {
                      setValue('role', newRole)
                      clearError()
                    }
                  }}
                >
                  <ToggleButton value="ROLE_PATIENT" sx={{ px: 3 }}>Patient</ToggleButton>
                  <ToggleButton value="ROLE_DOCTOR" sx={{ px: 3 }}>Doctor</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                  {error}
                </Alert>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                autoComplete="username"
                autoFocus
                {...register('username')}
                inputProps={{ maxLength: 50 }}
                error={!!errors.username}
                helperText={errors.username?.message}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                autoComplete="name"
                {...register('fullName')}
                inputProps={{ maxLength: 100 }}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                placeholder="example@email.com"
                inputProps={{ maxLength: 100 }}
                {...register('email', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9.@\-_+%]/g, '').toLowerCase()
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label="Phone Number"
                autoComplete="tel"
                helperText={errors.phone?.message || 'Enter 9 digits after +94 (e.g. 771234567)'}
                placeholder="77XXXXXXX"
                inputProps={{ maxLength: 9, inputMode: 'numeric' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+94</InputAdornment>,
                }}
                {...register('phone', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '')
                  },
                })}
                error={!!errors.phone}
              />

              <Collapse in={selectedRole === 'ROLE_PATIENT'}>
                <Box>
                  <TextField
                    margin="normal"
                    fullWidth
                    id="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register('dateOfBirth')}
                    inputProps={{ max: new Date().toISOString().split('T')[0] }}
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth?.message || (selectedRole === 'ROLE_PATIENT' && !dob ? 'Required' : '')}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    id="age"
                    label="Age"
                    type="number"
                    InputLabelProps={{ shrink: true }}
                    {...register('age')}
                    inputProps={{ min: 0 }}
                    error={!!errors.age}
                    helperText={errors.age?.message || (selectedRole === 'ROLE_PATIENT' && !watch('age') ? 'Required' : '')}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    select
                    id="gender"
                    label="Gender"
                    defaultValue=""
                    {...register('gender')}
                    error={!!errors.gender}
                    helperText={errors.gender?.message || (selectedRole === 'ROLE_PATIENT' && !watch('gender') ? 'Required' : '')}
                  >
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>

                  <TextField
                    margin="normal"
                    fullWidth
                    id="address"
                    label="Address"
                    multiline
                    rows={3}
                    {...register('address')}
                    inputProps={{ maxLength: 255 }}
                    error={!!errors.address}
                    helperText={errors.address?.message || (selectedRole === 'ROLE_PATIENT' && !watch('address') ? 'Required' : '')}
                  />
                </Box>
              </Collapse>

              <Collapse in={selectedRole === 'ROLE_DOCTOR'}>
                <Box>
                  <TextField
                    margin="normal"
                    fullWidth
                    select
                    label="Department"
                    defaultValue=""
                    {...register('departmentId')}
                    error={!!errors.departmentId}
                    helperText={errors.departmentId?.message || (selectedRole === 'ROLE_DOCTOR' && !watch('departmentId') ? 'Required' : '')}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Specialization"
                    {...register('specialization')}
                    error={!!errors.specialization}
                    helperText={errors.specialization?.message || (selectedRole === 'ROLE_DOCTOR' && !watch('specialization') ? 'Required' : '')}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Qualification"
                    {...register('qualification')}
                    error={!!errors.qualification}
                    helperText={errors.qualification?.message || (selectedRole === 'ROLE_DOCTOR' && !watch('qualification') ? 'Required' : '')}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Experience (Years)"
                    {...register('experience', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '')
                      }
                    })}
                    error={!!errors.experience}
                    helperText={errors.experience?.message || (selectedRole === 'ROLE_DOCTOR' && !watch('experience') ? 'Required' : '')}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Consultation Fee"
                    type="number"
                    {...register('consultationFee')}
                    inputProps={{ min: 0 }}
                    error={!!errors.consultationFee}
                    helperText={errors.consultationFee?.message || (selectedRole === 'ROLE_DOCTOR' && !watch('consultationFee') ? 'Required' : '')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                    }}
                  />
                </Box>
              </Collapse>

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                {...register('password')}
                error={!!errors.password}
                helperText={
                  errors.password?.message ||
                  'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
                }
              />

              {passwordStrength && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Password Strength:
                  </Typography>
                  {passwordStrength.errors.length > 0 ? (
                    <List dense>
                      {passwordStrength.errors.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{
                              variant: 'caption',
                              color: 'error',
                              fontSize: '0.75rem',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                      ✓ Strong password
                    </Typography>
                  )}
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-xl hover:shadow-2xl transform transition-transform hover:-translate-y-1 duration-300"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '12px'
                }}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? <CircularProgress size={24} /> : 'Create Account ✨'}
              </Button>

              <Box textAlign="center">
                <Link to="/login">
                  Already have an account? Log In
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default Register