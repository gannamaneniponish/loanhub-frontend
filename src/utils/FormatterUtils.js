/**
 * FormatterUtils - Utilities for formatting data for display
 */

const FormatterUtils = {
  /**
   * Format currency in Indian format (Rs.)
   */
  formatCurrency: (amount) => {
    if (typeof amount !== 'number') amount = parseFloat(amount)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  },

  /**
   * Format number in Indian format
   */
  formatNumber: (number, decimals = 2) => {
    if (typeof number !== 'number') number = parseFloat(number)
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  },

  /**
   * Format date to readable string
   */
  formatDate: (date, format = 'short') => {
    if (typeof date === 'string') date = new Date(date)
    if (!(date instanceof Date) || isNaN(date)) return 'Invalid date'

    const options = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
    }

    return new Intl.DateTimeFormat('en-IN', options[format] || options.short).format(date)
  },

  /**
   * Format time HH:MM:SS
   */
  formatTime: (date) => {
    if (typeof date === 'string') date = new Date(date)
    if (!(date instanceof Date) || isNaN(date)) return 'Invalid time'

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  },

  /**
   * Format date and time
   */
  formatDateTime: (date) => {
    return `${FormatterUtils.formatDate(date, 'short')} ${FormatterUtils.formatTime(date)}`
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime: (date) => {
    if (typeof date === 'string') date = new Date(date)
    if (!(date instanceof Date) || isNaN(date)) return 'Invalid date'

    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    }

    for (const [key, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value)
      if (interval >= 1) {
        return `${interval} ${key}${interval > 1 ? 's' : ''} ago`
      }
    }

    return 'Just now'
  },

  /**
   * Format percentage
   */
  formatPercentage: (value, decimals = 2) => {
    if (typeof value !== 'number') value = parseFloat(value)
    return `${value.toFixed(decimals)}%`
  },

  /**
   * Format phone number
   */
  formatPhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) return phone
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  },

  /**
   * Format email (mask part of it)
   */
  formatEmail: (email, masked = false) => {
    if (!masked) return email
    const [name, domain] = email.split('@')
    const maskedName = name.slice(0, 2) + '*'.repeat(Math.max(0, name.length - 4)) + name.slice(-2)
    return `${maskedName}@${domain}`
  },

  /**
   * Format bytes to readable size
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  },

  /**
   * Format loan status with badge color
   */
  getStatusColor: (status) => {
    const statusColors = {
      active: '#10b981',
      pending: '#f59e0b',
      approved: '#3b82f6',
      rejected: '#ef4444',
      completed: '#8b5cf6',
      closed: '#6b7280',
      overdue: '#dc2626',
      declined: '#ef4444',
      suspended: '#f97316'
    }
    return statusColors[status?.toLowerCase()] || '#6b7280'
  },

  /**
   * Format status badge text
   */
  formatStatusText: (status) => {
    return status
      ?.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || 'Unknown'
  },

  /**
   * Truncate text
   */
  truncateText: (text, length = 50) => {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
  },

  /**
   * Format address (truncate or full)
   */
  formatAddress: (address, truncate = true) => {
    if (!address) return 'N/A'
    return truncate ? FormatterUtils.truncateText(address, 40) : address
  },

  /**
   * Convert camelCase to Title Case
   */
  toTitleCase: (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, char => char.toUpperCase())
      .trim()
  },

  /**
   * Format rate with % sign
   */
  formatRate: (rate) => {
    return `${parseFloat(rate).toFixed(2)}%`
  },

  /**
   * Format duration in months to readable string
   */
  formatDuration: (months) => {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years === 0) return `${months} months`
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
  }
}

export default FormatterUtils
