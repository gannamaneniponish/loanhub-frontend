/**
 * StorageManager - Enhanced localStorage management with validation and caching
 * Provides safe access to localStorage with error handling and data validation
 */

const CACHE_PREFIX = 'app_cache_'
const CACHE_EXPIRY = 'app_cache_expiry_'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

class StorageManager {
  /**
   * Get item from storage with validation
   */
  static getItem(key, defaultValue = null, validator = null) {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue

      const parsed = JSON.parse(item)
      if (validator && !validator(parsed)) {
        console.warn(`Invalid data for key: ${key}`)
        return defaultValue
      }
      return parsed
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error)
      return defaultValue
    }
  }

  /**
   * Set item to storage with error handling
   */
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error)
      return false
    }
  }

  /**
   * Remove item from storage
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from storage (${key}):`, error)
      return false
    }
  }

  /**
   * Clear all app data
   */
  static clearAll() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('app_') || key.startsWith('loan') || key.startsWith('current')) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Error clearing storage:', error)
      return false
    }
  }

  /**
   * Get cached item if not expired
   */
  static getCached(key) {
    try {
      const expiry = localStorage.getItem(CACHE_EXPIRY + key)
      if (!expiry || new Date().getTime() > parseInt(expiry)) {
        this.removeItem(CACHE_PREFIX + key)
        this.removeItem(CACHE_EXPIRY + key)
        return null
      }
      return this.getItem(CACHE_PREFIX + key)
    } catch (error) {
      console.error(`Error reading cached item (${key}):`, error)
      return null
    }
  }

  /**
   * Set cached item with expiry
   */
  static setCached(key, value, duration = CACHE_DURATION) {
    try {
      const expiry = new Date().getTime() + duration
      this.setItem(CACHE_PREFIX + key, value)
      localStorage.setItem(CACHE_EXPIRY + key, expiry.toString())
      return true
    } catch (error) {
      console.error(`Error setting cached item (${key}):`, error)
      return false
    }
  }

  /**
   * Get storage size (for debugging)
   */
  static getStorageSize() {
    let size = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length
      }
    }
    return (size / 1024).toFixed(2) + ' KB'
  }
}

export default StorageManager
