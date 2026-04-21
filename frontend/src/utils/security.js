// Security utilities for HMS Frontend

// Rate limiting for login attempts
export const loginRateLimiter = new Map()

export const checkLoginRateLimit = (identifier = 'global') => {
  const now = Date.now()
  const attempts = loginRateLimiter.get(identifier) || []
  
  // Remove attempts older than 15 minutes
  const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000)
  
  if (recentAttempts.length >= 5) {
    return {
      allowed: false,
      remainingTime: Math.max(0, 15 * 60 * 1000 - (now - recentAttempts[0]))
    }
  }
  
  recentAttempts.push(now)
  loginRateLimiter.set(identifier, recentAttempts)
  
  return {
    allowed: true,
    remainingTime: 0
  }
}

// Session security
export const getSessionTimeout = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  
  try {
    const decoded = jwtDecode(token)
    const now = Date.now() / 1000
    const timeUntilExpiry = (decoded.exp - now) * 1000
    
    // Show warning 5 minutes before expiry
    if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
      return {
        expiresSoon: true,
        timeRemaining: timeUntilExpiry
      }
    }
    
    return {
      expiresSoon: false,
      timeRemaining: Math.max(0, timeUntilExpiry)
    }
  } catch (error) {
    return null
  }
}

// Input sanitization for search and display
export const sanitizeForDisplay = (input) => {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

// Validate file uploads (if any)
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
  } = options
  
  const errors = []
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must not exceed ${maxSize / (1024 * 1024)}MB`)
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }
  
  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`File extension ${fileExtension} is not allowed`)
  }
  
  // Check for malicious file names
  const maliciousPatterns = [
    /\.(exe|bat|cmd|scr|pif|com)$/i,
    /^(con|prn|aux|nul|clock\$|a:|b:|c:).*$/i,
    /[<>:"|?*]/,
    /^(.+)\.(js|vbs|sh|php|asp|jsp|cgi|pl|py|rb)$/i
  ]
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(file.name)) {
      errors.push('File name contains potentially malicious content')
      break
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

// CSRF protection helpers
export const addCSRFToken = (url, options = {}) => {
  const token = getCSRFToken()
  if (token) {
    if (url.includes('?')) {
      url += `&csrf_token=${token}`
    } else {
      url += `?csrf_token=${token}`
    }
  }
  return url
}

// Content Security Policy validation
export const validateContentSecurity = (content) => {
  if (!content || typeof content !== 'string') return true
  
  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return false
    }
  }
  
  return true
}

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key, value) => {
    try {
      // Simple obfuscation (not encryption - for demo only)
      const obfuscated = btoa(JSON.stringify(value))
      localStorage.setItem(key, obfuscated)
    } catch (error) {
      console.error('Error storing data:', error)
    }
  },
  
  getItem: (key) => {
    try {
      const obfuscated = localStorage.getItem(key)
      if (!obfuscated) return null
      
      return JSON.parse(atob(obfuscated))
    } catch (error) {
      console.error('Error retrieving data:', error)
      return null
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing data:', error)
    }
  },
  
  clear: () => {
    try {
      // Only clear app-specific items, not all localStorage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('hms_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }
}

// Audit logging helper
export const logSecurityEvent = (eventType, details) => {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    details: details,
    userAgent: navigator.userAgent,
    ip: null // Would need backend to provide this
  }
  
  // Store in secure storage for potential audit
  const existingLogs = secureStorage.getItem('hms_security_logs') || []
  existingLogs.push(event)
  
  // Keep only last 100 events
  if (existingLogs.length > 100) {
    existingLogs.splice(0, existingLogs.length - 100)
  }
  
  secureStorage.setItem('hms_security_logs', existingLogs)
  
  // In production, send to server
  console.log('Security Event:', event)
}

// Password strength indicator component helper
export const getPasswordStrengthColor = (strength) => {
  if (!strength || strength.errors.length > 0) return 'error'
  if (strength.errors.length === 0) return 'success'
  return 'warning'
}

// Form security validation
export const validateFormSecurity = (formData) => {
  const issues = []
  
  Object.keys(formData).forEach(key => {
    const value = formData[key]
    
    if (typeof value === 'string') {
      // Check for script injections
      if (!validateContentSecurity(value)) {
        issues.push(`Field "${key}" contains potentially unsafe content`)
      }
      
      // Check for extremely long values (potential DoS)
      if (value.length > 10000) {
        issues.push(`Field "${key}" is unusually long`)
      }
    }
  })
  
  return {
    isSecure: issues.length === 0,
    issues: issues
  }
}

// Import jwtDecode for token validation
import jwtDecode from 'jwt-decode'
import { getCSRFToken } from './validation'

export default {
  checkLoginRateLimit,
  getSessionTimeout,
  sanitizeForDisplay,
  validateFileUpload,
  addCSRFToken,
  validateContentSecurity,
  secureStorage,
  logSecurityEvent,
  getPasswordStrengthColor,
  validateFormSecurity
}
