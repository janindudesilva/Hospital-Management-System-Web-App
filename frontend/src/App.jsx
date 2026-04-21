import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import PatientRegistration from './pages/PatientRegistration'
import PatientList from './pages/PatientList'
import PatientProfile from './pages/PatientProfile'
import PatientUpdate from './pages/PatientUpdate'
import PatientDelete from './pages/PatientDelete'
import Doctors from './pages/Doctors'
import Departments from './pages/Departments'
import Appointments from './pages/Appointments'
import MedicalRecords from './pages/MedicalRecords'
import Prescriptions from './pages/Prescriptions'
import Billing from './pages/Billing'
import Profile from './pages/Profile'
import DiseasePrediction from './pages/DiseasePrediction'
import PaymentMethods from './pages/PaymentMethods'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        Loading...
      </Box>
    )
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />

        <Route element={<Layout />}>
          {/* Role-based dashboard routes */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_RECEPTIONIST']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="patient-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="payment-methods" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                <PaymentMethods />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="disease-prediction" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                <DiseasePrediction />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="doctor-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Role-based access to other pages */}
          <Route 
            path="patients" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR']}>
                <PatientList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="patient-registration" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST']}>
                <PatientRegistration />
              </ProtectedRoute>
            } 
          />
          <Route path="patient registration" element={<Navigate to="/patient-registration" replace />} />
          <Route 
            path="patients/:id" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_PATIENT', 'ROLE_DOCTOR']}>
                <PatientProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="patients/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST']}>
                <PatientUpdate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="patients/:id/delete" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <PatientDelete />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="doctors" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Doctors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="departments" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Departments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="appointments" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_RECEPTIONIST', 'ROLE_DOCTOR']}>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="medical-records" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_RECEPTIONIST', 'ROLE_DOCTOR', 'ROLE_PATIENT']}>
                <MedicalRecords />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="prescriptions" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_DOCTOR', 'ROLE_PATIENT']}>
                <Prescriptions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="billing" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_RECEPTIONIST']}>
                <Billing />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
