import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'
import jwtDecode from 'jwt-decode'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      }
    case 'LOGIN_FAILURE':
      localStorage.removeItem('token')
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000
        
        if (decoded.exp < currentTime) {
          dispatch({ type: 'LOGOUT' })
        } else {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: decoded,
              token: token,
            },
          })
        }
      } catch (error) {
        dispatch({ type: 'LOGOUT' })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await axios.post('/api/auth/login', credentials)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: jwtDecode(response.data.token),
          token: response.data.token,
        },
      })
      
      return response.data
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || 'Login failed',
      })
      throw error
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await axios.post('/api/auth/register', userData)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: jwtDecode(response.data.token),
          token: response.data.token,
        },
      })
      
      return response.data
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || 'Registration failed',
      })
      throw error
    }
  }

  const logout = () => {
    delete axios.defaults.headers.common['Authorization']
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
