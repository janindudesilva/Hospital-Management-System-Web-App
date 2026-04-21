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
  Avatar,
  useTheme,
  LinearProgress,
} from '@mui/material'
import { LocalHospital, LockOutlined } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../contexts/AuthContext'
import { checkLoginRateLimit, logSecurityEvent } from '../utils/security'
import { sanitizeInput, isValidUsername } from '../utils/validation'

const schema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .test('valid-username', 'Invalid username format', (value) => 
      value ? isValidUsername(value) : true
    ),
  password: yup.string().required('Password is required'),
})

const Login = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rateLimitError, setRateLimitError] = useState('')
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      // Check rate limiting
      const rateLimit = checkLoginRateLimit(data.username)
      if (!rateLimit.allowed) {
        setRateLimitError('Too many login attempts. Please try again later.')
        setRateLimitRemaining(rateLimit.remainingTime)
        
        // Log security event
        logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          username: data.username,
          remainingTime: rateLimit.remainingTime
        })
        
        return
      }

      setIsSubmitting(true)
      clearError()
      setRateLimitError('')
      
      // Sanitize input
      const sanitizedData = {
        username: sanitizeInput(data.username),
        password: data.password // Don't sanitize password
      }
      
      // Log login attempt
      logSecurityEvent('LOGIN_ATTEMPT', {
        username: sanitizedData.username
      })
      
      await login(sanitizedData)
      
      // Log successful login
      logSecurityEvent('LOGIN_SUCCESS', {
        username: sanitizedData.username
      })
      
      navigate('/dashboard')
    } catch (error) {
      // Log failed login attempt
      logSecurityEvent('LOGIN_FAILED', {
        username: sanitizeInput(data.username),
        error: error.message
      })
      
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
      <Container component="main" maxWidth="sm">
        <Paper 
          className="backdrop-blur-xl bg-white/90 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:-translate-y-4 hover:shadow-[0_50px_80px_-20px_rgba(0,0,0,0.6)]"
          elevation={8} 
          sx={{ 
            padding: 5, 
            width: '100%', 
            maxWidth: 450,
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                fontSize: '2rem'
              }}
            >
              <LocalHospital />
            </Avatar>
            <Typography component="h1" variant="h4" fontWeight={700} gutterBottom>
              HMS Login
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Hospital Management System
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              autoComplete="username"
              autoFocus
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-xl hover:shadow-2xl transform transition-transform hover:-translate-y-1 duration-300"
              sx={{ 
                mt: 2, 
                mb: 3,
                py: 1.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '12px'
              }}
              disabled={isSubmitting || loading}
              startIcon={isSubmitting || loading ? <CircularProgress size={20} color="inherit" /> : <LockOutlined />}
            >
              {isSubmitting || loading ? 'Signing in...' : 'Log In'}
            </Button>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{' '}
                <Link to="/register" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
