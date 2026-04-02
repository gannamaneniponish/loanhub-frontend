/**
 * Utilities Index - Central export point for all utility modules
 */

// Individual exports
export { default as StorageManager } from './StorageManager'
export { default as SessionManager } from './SessionManager'
export { default as ValidationUtils } from './ValidationUtils'
export { default as FormatterUtils } from './FormatterUtils'
export { default as AnalyticsUtils } from './AnalyticsUtils'
export { default as PaymentUtils } from './PaymentUtils'
export { default as NotificationUtils } from './NotificationUtils'

// Namespace exports
import StorageManager from './StorageManager'
import SessionManager from './SessionManager'
import ValidationUtils from './ValidationUtils'
import FormatterUtils from './FormatterUtils'
import AnalyticsUtils from './AnalyticsUtils'
import PaymentUtils from './PaymentUtils'
import NotificationUtils from './NotificationUtils'

export const Utils = {
  Storage: StorageManager,
  Session: SessionManager,
  Validation: ValidationUtils,
  Format: FormatterUtils,
  Analytics: AnalyticsUtils,
  Payment: PaymentUtils,
  Notification: NotificationUtils
}
