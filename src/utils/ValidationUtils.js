/**
 * ValidationUtils - Comprehensive validation functions for forms and data
 */

const ValidationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate phone number (Indian format)
   */
  isValidPhone: (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  },

  /**
   * Validate password strength
   */
  validatePassword: (password) => {
    const result = {
      strength: 'weak',
      score: 0,
      feedback: []
    }

    if (password.length >= 8) result.score += 1
    else result.feedback.push('At least 8 characters')

    if (/[a-z]/.test(password)) result.score += 1
    else result.feedback.push('Add lowercase letters')

    if (/[A-Z]/.test(password)) result.score += 1
    else result.feedback.push('Add uppercase letters')

    if (/\d/.test(password)) result.score += 1
    else result.feedback.push('Add numbers')

    if (/[!@#$%^&*]/.test(password)) result.score += 1
    else result.feedback.push('Add special characters (!@#$%^&*)')

    if (result.score <= 2) result.strength = 'weak'
    else if (result.score === 3) result.strength = 'fair'
    else if (result.score === 4) result.strength = 'good'
    else result.strength = 'strong'

    return result
  },

  /**
   * Validate PAN (Permanent Account Number)
   */
  isValidPAN: (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    return panRegex.test(pan)
  },

  /**
   * Validate Aadhaar number
   */
  isValidAadhaar: (aadhaar) => {
    const aadhaarRegex = /^[0-9]{12}$/
    return aadhaarRegex.test(aadhaar.replace(/\D/g, ''))
  },

  /**
   * Validate GST number
   */
  isValidGST: (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    return gstRegex.test(gst)
  },

  /**
   * Validate IFSC code
   */
  isValidIFSC: (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    return ifscRegex.test(ifsc)
  },

  /**
   * Validate loan amount
   */
  isValidLoanAmount: (amount, minAmount = 10000, maxAmount = 10000000) => {
    const num = parseFloat(amount)
    return !isNaN(num) && num >= minAmount && num <= maxAmount
  },

  /**
   * Validate interest rate
   */
  isValidInterestRate: (rate, minRate = 5, maxRate = 36) => {
    const num = parseFloat(rate)
    return !isNaN(num) && num >= minRate && num <= maxRate
  },

  /**
   * Validate loan term (in months)
   */
  isValidLoanTerm: (term, minTerm = 6, maxTerm = 360) => {
    const num = parseInt(term)
    return !isNaN(num) && num >= minTerm && num <= maxTerm
  },

  /**
   * Validate date format (YYYY-MM-DD)
   */
  isValidDate: (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateString)) return false
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date)
  },

  /**
   * Validate future date
   */
  isFutureDate: (dateString) => {
    if (!ValidationUtils.isValidDate(dateString)) return false
    const date = new Date(dateString)
    return date > new Date()
  },

  /**
   * Validate name (alphanumeric and spaces)
   */
  isValidName: (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,}$/
    return nameRegex.test(name)
  },

  /**
   * Validate username (alphanumeric, underscore, hyphen)
   */
  isValidUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    return usernameRegex.test(username)
  },

  /**
   * Validate form fields
   */
  validateForm: (formData, rules) => {
    const errors = {}

    Object.keys(rules).forEach(field => {
      const rule = rules[field]
      const value = formData[field]

      // Required validation
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = `${rule.label || field} is required`
        return
      }

      // Type validation
      if (rule.type === 'email' && value && !ValidationUtils.isValidEmail(value)) {
        errors[field] = 'Invalid email address'
      }

      if (rule.type === 'phone' && value && !ValidationUtils.isValidPhone(value)) {
        errors[field] = 'Invalid phone number'
      }

      // Min length
      if (rule.minLength && value && value.length < rule.minLength) {
        errors[field] = `Minimum ${rule.minLength} characters required`
      }

      // Max length
      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors[field] = `Maximum ${rule.maxLength} characters allowed`
      }

      // Pattern
      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors[field] = rule.patternMessage || 'Invalid format'
      }

      // Custom validator
      if (rule.validate && value && !rule.validate(value)) {
        errors[field] = rule.validateMessage || 'Invalid value'
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  /**
   * Get password strength color
   */
  getPasswordStrengthColor: (strength) => {
    switch (strength) {
      case 'weak': return '#ef4444'
      case 'fair': return '#f59e0b'
      case 'good': return '#3b82f6'
      case 'strong': return '#10b981'
      default: return '#ccc'
    }
  }
}

export default ValidationUtils
