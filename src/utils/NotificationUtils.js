/**
 * NotificationUtils - Notification, email, and communication utilities
 */

const NotificationUtils = {
  /**
   * Notification types
   */
  NOTIFICATION_TYPES: {
    LOAN_APPLICATION: 'loan_application',
    LOAN_APPROVED: 'loan_approved',
    LOAN_DECLINED: 'loan_declined',
    PAYMENT_REMINDER: 'payment_reminder',
    PAYMENT_RECEIVED: 'payment_received',
    PAYMENT_OVERDUE: 'payment_overdue',
    EMI_DUE: 'emi_due',
    LOAN_COMPLETED: 'loan_completed',
    USER_CREATED: 'user_created',
    ACCOUNT_SUSPENDED: 'account_suspended',
    DOCUMENT_REQUIRED: 'document_required'
  },

  /**
   * Notification priorities
   */
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  /**
   * Create notification object
   */
  createNotification: (type, recipient, data = {}) => {
    const notification = {
      id: Date.now(),
      type,
      recipient,
      recipientId: data.recipientId,
      recipientType: data.recipientRole || 'user',
      title: NotificationUtils.getNotificationTitle(type, data),
      message: NotificationUtils.getNotificationMessage(type, data),
      data,
      priority: NotificationUtils.getNotificationPriority(type),
      timestamp: new Date(),
      read: false,
      readAt: null,
      actionUrl: NotificationUtils.getActionUrl(type, data),
      actions: NotificationUtils.getNotificationActions(type, data)
    }
    return notification
  },

  /**
   * Get notification title based on type
   */
  getNotificationTitle: (type, data = {}) => {
    const titles = {
      loan_application: 'New Loan Application',
      loan_approved: 'Loan Application Approved',
      loan_declined: 'Loan Application Declined',
      payment_reminder: 'EMI Payment Reminder',
      payment_received: 'Payment Received',
      payment_overdue: 'Overdue Payment Alert',
      emi_due: 'EMI Due Soon',
      loan_completed: 'Loan Completed Successfully',
      user_created: 'Account Created',
      account_suspended: 'Account Suspended',
      document_required: 'Document Required'
    }
    return titles[type] || 'Notification'
  },

  /**
   * Get detailed notification message
   */
  getNotificationMessage: (type, data = {}) => {
    const messages = {
      loan_application: `New loan application from ${data.borrowerName} for ₹${parseFloat(data.amount).toLocaleString('en-IN')} at ${data.interestRate}% interest rate.`,
      loan_approved: `Your loan application has been approved by ${data.lenderName}. Amount: ₹${parseFloat(data.amount).toLocaleString('en-IN')}`,
      loan_declined: `Your loan application has been declined. Please contact us for more information.`,
      payment_reminder: `Your EMI of ₹${parseFloat(data.amount).toLocaleString('en-IN')} is due on ${data.dueDate}. Please make the payment on time.`,
      payment_received: `Payment of ₹${parseFloat(data.amount).toLocaleString('en-IN')} received from ${data.borrowerName}.`,
      payment_overdue: `Your EMI payment of ₹${parseFloat(data.amount).toLocaleString('en-IN')} is ${data.daysOverdue} days overdue. Please pay immediately.`,
      emi_due: `Your next EMI of ₹${parseFloat(data.amount).toLocaleString('en-IN')} is due in ${data.daysUntilDue} days.`,
      loan_completed: `Congratulations! Your loan has been fully repaid. Thank you for choosing us.`,
      user_created: `Welcome to LoanHub! Your account has been created successfully.`,
      account_suspended: `Your account has been suspended. Please contact support.`,
      document_required: `Required documents are missing. Please upload ${data.documentType} to proceed.`
    }
    return messages[type] || 'You have a new notification'
  },

  /**
   * Get notification priority
   */
  getNotificationPriority: (type) => {
    const priorities = {
      loan_application: 'high',
      loan_approved: 'high',
      loan_declined: 'high',
      payment_reminder: 'medium',
      payment_received: 'medium',
      payment_overdue: 'urgent',
      emi_due: 'medium',
      loan_completed: 'medium',
      user_created: 'low',
      account_suspended: 'urgent',
      document_required: 'high'
    }
    return priorities[type] || 'medium'
  },

  /**
   * Get action URL for notification
   */
  getActionUrl: (type, data = {}) => {
    const urls = {
      loan_application: `/lender/loans/${data.loanId}`,
      loan_approved: `/borrower/loans/${data.loanId}`,
      loan_declined: `/borrower/loans/${data.loanId}`,
      payment_reminder: `/borrower/payment/${data.loanId}`,
      payment_received: `/lender/loans/${data.loanId}`,
      payment_overdue: `/borrower/payment/${data.loanId}`,
      emi_due: `/borrower/payment/${data.loanId}`,
      loan_completed: `/borrower/loans/${data.loanId}`,
      user_created: '/profile',
      account_suspended: '/login',
      document_required: '/profile'
    }
    return urls[type] || '/'
  },

  /**
   * Get notification actions (buttons)
   */
  getNotificationActions: (type, data = {}) => {
    const actions = {
      loan_application: [
        { label: 'View Details', action: 'view_details', primary: true },
        { label: 'Accept', action: 'accept_loan', primary: true },
        { label: 'Decline', action: 'decline_loan', primary: false }
      ],
      loan_approved: [
        { label: 'View Loan', action: 'view_loan', primary: true },
        { label: 'Download Docs', action: 'download_docs', primary: true }
      ],
      payment_reminder: [
        { label: 'Pay Now', action: 'pay_now', primary: true },
        { label: 'View Details', action: 'view_details', primary: false }
      ],
      payment_overdue: [
        { label: 'Pay Now', action: 'pay_now', primary: true },
        { label: 'View Details', action: 'view_details', primary: false }
      ]
    }
    return actions[type] || []
  },

  /**
   * Get notification color/badge color
   */
  getNotificationColor: (type) => {
    const colors = {
      loan_application: '#667eea',
      loan_approved: '#10b981',
      loan_declined: '#ef4444',
      payment_reminder: '#f59e0b',
      payment_received: '#10b981',
      payment_overdue: '#dc2626',
      emi_due: '#f59e0b',
      loan_completed: '#8b5cf6',
      user_created: '#3b82f6',
      account_suspended: '#ef4444',
      document_required: '#f59e0b'
    }
    return colors[type] || '#6b7280'
  },

  /**
   * Get notification priority color
   */
  getPriorityColor: (priority) => {
    const colors = {
      low: '#6b7280',
      medium: '#f59e0b',
      high: '#f97316',
      urgent: '#dc2626'
    }
    return colors[priority] || '#6b7280'
  },

  /**
   * Format notification for email
   */
  formatNotificationForEmail: (notification) => {
    return {
      subject: notification.title,
      body: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        <p>
          <a href="${notification.actionUrl}" style="background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Details
          </a>
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          Sent at ${notification.timestamp.toLocaleString('en-IN')}
        </p>
      `,
      timestamp: notification.timestamp
    }
  },

  /**
   * Format notification for SMS
   */
  formatNotificationForSMS: (notification) => {
    const maxLength = 160
    const text = `${notification.title}: ${notification.message}`
    
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...'
    }
    return text
  },

  /**
   * Format notification for WhatsApp
   */
  formatNotificationForWhatsApp: (notification) => {
    return `
*${notification.title}*

${notification.message}

Click to view: ${notification.actionUrl}

Sent at ${notification.timestamp.toLocaleString('en-IN')}
    `.trim()
  },

  /**
   * Filter notifications by role
   */
  filterNotificationsByRole: (notifications = [], role) => {
    const roleNotifications = {
      admin: ['user_created', 'loan_application', 'account_suspended'],
      lender: ['loan_application', 'payment_received', 'loan_completed'],
      borrower: ['loan_approved', 'loan_declined', 'payment_reminder', 'payment_overdue', 'emi_due'],
      analyst: ['loan_application', 'payment_received', 'loan_completed']
    }

    const allowedTypes = roleNotifications[role] || []
    return notifications.filter(n => allowedTypes.includes(n.type))
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: (notifications = []) => {
    return notifications.filter(n => !n.read).length
  },

  /**
   * Get notifications by priority
   */
  getNotificationsByPriority: (notifications = [], priority) => {
    return notifications.filter(n => n.priority === priority)
  },

  /**
   * Mark notification as read
   */
  markAsRead: (notification) => {
    return {
      ...notification,
      read: true,
      readAt: new Date()
    }
  },

  /**
   * Generate notification summary
   */
  generateNotificationSummary: (notifications = []) => {
    const summary = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {},
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      }
    }

    notifications.forEach(n => {
      // Count by type
      summary.byType[n.type] = (summary.byType[n.type] || 0) + 1

      // Count by priority
      summary.byPriority[n.priority]++
    })

    return summary
  },

  /**
   * Create bulk notifications
   */
  createBulkNotifications: (recipients = [], type, data = {}) => {
    return recipients.map(recipient => {
      return NotificationUtils.createNotification(type, recipient, {
        ...data,
        recipientId: recipient.id,
        recipientRole: recipient.role
      })
    })
  },

  /**
   * Schedule notification
   */
  scheduleNotification: (notification, scheduleDate) => {
    return {
      ...notification,
      scheduled: true,
      scheduleDate: new Date(scheduleDate),
      sent: false
    }
  },

  /**
   * Generate notification audit log
   */
  generateAuditLog: (notification) => {
    return {
      timestamp: new Date(),
      action: 'notification_created',
      type: notification.type,
      recipient: notification.recipient,
      data: {
        notificationId: notification.id,
        priority: notification.priority,
        title: notification.title
      }
    }
  },

  /**
   * Create preference object for notification settings
   */
  createNotificationPreference: (userId, preferences = {}) => {
    return {
      userId,
      email: {
        loanApplication: preferences.emailLoanApplication ?? true,
        paymentReminder: preferences.emailPaymentReminder ?? true,
        loanApproval: preferences.emailLoanApproval ?? true,
        paymentConfirmation: preferences.emailPaymentConfirmation ?? true
      },
      sms: {
        paymentReminder: preferences.smsPaymentReminder ?? true,
        paymentOverdue: preferences.smsPaymentOverdue ?? true,
        loanApproval: preferences.smsLoanApproval ?? true
      },
      inApp: {
        all: preferences.inAppAll ?? true
      },
      frequency: preferences.frequency || 'realtime', // realtime, daily, weekly
      quietHours: {
        enabled: preferences.quietHoursEnabled ?? false,
        start: preferences.quietHoursStart || '22:00',
        end: preferences.quietHoursEnd || '08:00'
      }
    }
  }
}

export default NotificationUtils
