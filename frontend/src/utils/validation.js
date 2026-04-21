// Validation utilities for HMS Frontend

// XSS Protection - Sanitize HTML input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

// Enhanced email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

// Enhanced Sri Lankan phone validation
export const isValidPhone = (phone) => {
  if (!phone) return false
  // Clean phone: remove spaces, hyphens, parentheses
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // International format: + followed by 7-15 digits
  // Or local format: 10 digits starting with 0
  const phoneRegex = /^(\+[1-9]{1,3}[0-9]{7,12})|(0[0-9]{9})$/
  return phoneRegex.test(cleanedPhone)
}

// Enhanced NIC validation for Sri Lanka
export const isValidSriLankanNIC = (nic) => {
  const cleanedNIC = nic.replace(/[^0-9vVxX]/g, '')
  
  // Old format: 9 digits + V/X
  const oldNICRegex = /^[0-9]{9}[vVxX]$/
  // New format: 12 digits
  const newNICRegex = /^[0-9]{12}$/
  
  return oldNICRegex.test(cleanedNIC) || newNICRegex.test(cleanedNIC)
}

// Password strength validation
export const validatePasswordStrength = (password) => {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i
  ]
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password cannot contain common patterns')
      break
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

// Date validation utilities
export const isValidDateOfBirth = (dateString) => {
  if (!dateString) return false
  
  const date = new Date(dateString)
  const now = new Date()
  const minDate = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate()) // 120 years ago
  const maxDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()) // 5 years ago
  
  return date instanceof Date && 
         !isNaN(date) && 
         date <= maxDate && 
         date >= minDate
}

export const isValidFutureDate = (dateString, minDaysFromNow = 0) => {
  if (!dateString) return false
  
  const date = new Date(dateString)
  const now = new Date()
  const minDate = new Date(now.getTime() + (minDaysFromNow * 24 * 60 * 60 * 1000))
  
  return date instanceof Date && 
         !isNaN(date) && 
         date >= minDate
}

// Blood group validation
export const isValidBloodGroup = (bloodGroup) => {
  const validBloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
    'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
    'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
  ]
  
  return validBloodGroups.includes(bloodGroup.toUpperCase().replace('_', '_'))
}

// Name validation (letters, spaces, hyphens only)
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false
  
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/
  return nameRegex.test(name.trim())
}

// Address validation
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') return false
  
  // Basic validation: allow letters, numbers, spaces, commas, hyphens, periods
  const addressRegex = /^[a-zA-Z0-9\s,\-.'#]{10,200}$/
  return addressRegex.test(address.trim())
}

// Medical text validation (symptoms, diagnosis, treatment)
export const isValidMedicalText = (text, minLength = 5, maxLength = 1000) => {
  if (!text || typeof text !== 'string') return false
  
  const sanitized = sanitizeInput(text)
  return sanitized.length >= minLength && sanitized.length <= maxLength
}

// Username validation
export const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false
  
  // Username: 3-30 characters, letters, numbers, underscores, hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

// Form field validation helper
export const validateField = (fieldName, value, options = {}) => {
  const { required = false, minLength, maxLength, customValidator } = options
  
  if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${fieldName} is required`
  }
  
  if (value && typeof value === 'string') {
    if (minLength && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`
    }
    
    if (maxLength && value.length > maxLength) {
      return `${fieldName} must not exceed ${maxLength} characters`
    }
  }
  
  if (customValidator && value) {
    const customResult = customValidator(value)
    if (customResult !== true) {
      return customResult
    }
  }
  
  return null
}

// Comprehensive form validator
export const validateForm = (formData, validationRules) => {
  const errors = {}
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field]
    const value = formData[field]
    
    const error = validateField(
      rules.label || field, 
      value, 
      rules
    )
    
    if (error) {
      errors[field] = error
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  }
}

// Rate limiting helper (client-side)
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.attempts = []
  }
  
  canAttempt() {
    const now = Date.now()
    // Remove attempts outside the window
    this.attempts = this.attempts.filter(time => now - time < this.windowMs)
    
    if (this.attempts.length >= this.maxAttempts) {
      return false
    }
    
    this.attempts.push(now)
    return true
  }
  
  getRemainingTime() {
    const now = Date.now()
    const oldestAttempt = this.attempts[0]
    
    if (!oldestAttempt) return 0
    
    const timeUntilReset = this.windowMs - (now - oldestAttempt)
    return Math.max(0, timeUntilReset)
  }
}

// CSRF token helper (placeholder - should be implemented with backend)
export const getCSRFToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
}

// Export all utilities
export default {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidSriLankanNIC,
  validatePasswordStrength,
  isValidDateOfBirth,
  isValidFutureDate,
  isValidBloodGroup,
  isValidName,
  isValidAddress,
  isValidMedicalText,
  isValidUsername,
  validateField,
  validateForm,
  RateLimiter,
  getCSRFToken
}
