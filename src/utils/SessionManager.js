/**
 * SessionManager - Handles user sessions, timeouts, and activity tracking
 */

const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const ACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const SESSION_STORAGE_KEY = 'session_data'

class SessionManager {
  static sessionTimeout = null
  static activityTimeout = null
  static lastActivity = Date.now()

  /**
   * Initialize session monitoring
   */
  static initSession(userId, role, onSessionExpire) {
    this.userId = userId
    this.role = role
    this.onSessionExpire = onSessionExpire
    this.lastActivity = Date.now()

    // Store session data
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        userId,
        role,
        startTime: Date.now(),
        lastActivity: Date.now()
      }))
    } catch (error) {
      console.error('Error initializing session:', error)
    }

    this.setupEventListeners()
    this.startSessionTimer()
  }

  /**
   * Setup activity event listeners
   */
  static setupEventListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, () => this.recordActivity(), true)
    })
  }

  /**
   * Record user activity
   */
  static recordActivity() {
    const now = Date.now()
    const timeSinceLastActivity = now - this.lastActivity

    // Only update if more than 1 second has passed
    if (timeSinceLastActivity > 1000) {
      this.lastActivity = now

      // Update session storage
      try {
        const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}')
        session.lastActivity = now
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      } catch (error) {
        console.error('Error recording activity:', error)
      }

      // Reset session timer
      this.resetSessionTimer()
    }
  }

  /**
   * Start session timeout timer
   */
  static startSessionTimer() {
    this.resetSessionTimer()
  }

  /**
   * Reset session timeout timer
   */
  static resetSessionTimer() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
    }

    this.sessionTimeout = setTimeout(() => {
      if (this.onSessionExpire) {
        this.onSessionExpire()
      }
      this.endSession()
    }, SESSION_TIMEOUT)
  }

  /**
   * Get remaining session time in milliseconds
   */
  static getRemainingTime() {
    return SESSION_TIMEOUT - (Date.now() - this.lastActivity)
  }

  /**
   * Get remaining session time in readable format
   */
  static getRemainingTimeFormatted() {
    const remaining = this.getRemainingTime()
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  /**
   * End current session
   */
  static endSession() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
    }
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout)
    }

    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      localStorage.removeItem('currentUser')
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  /**
   * Check if session is still active
   */
  static isSessionActive() {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY)
      return !!session
    } catch {
      return false
    }
  }

  /**
   * Get session info
   */
  static getSessionInfo() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  }

  /**
   * Extend session (for "Keep me logged in" actions)
   */
  static extendSession(duration = SESSION_TIMEOUT) {
    this.lastActivity = Date.now()
    this.resetSessionTimer()
  }
}

export default SessionManager
