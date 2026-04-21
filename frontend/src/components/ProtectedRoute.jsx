import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const roleBasedRoute = {
      'ROLE_ADMIN': '/admin-dashboard',
      'ROLE_DOCTOR': '/doctor-dashboard', 
      'ROLE_RECEPTIONIST': '/dashboard',
      'ROLE_PATIENT': '/patient-dashboard'
    }
    
    return <Navigate to={roleBasedRoute[user?.role] || '/dashboard'} replace />
  }

  return children
}

export default ProtectedRoute
