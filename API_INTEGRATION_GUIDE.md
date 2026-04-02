# LoanHub v7 - API Integration Guide

## 📡 Overview

This guide explains how to integrate LoanHub with backend APIs and external services.

---

## 🏗️ Backend Architecture Recommendations

### Tech Stack for Backend
- **Framework**: Node.js + Express.js
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Deployment**: Docker + Kubernetes or AWS Lambda

---

## 🔐 Authentication Integration

### JWT Implementation

```javascript
// Frontend - Store JWT token
import StorageManager from './utils/StorageManager'

const handleLogin = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await response.json()
  
  // Store JWT token securely
  StorageManager.setItem('authToken', data.token)
  
  // Set default header for all requests
  setupAPIInterceptor(data.token)
}

// Setup API interceptor
const setupAPIInterceptor = (token) => {
  const originalFetch = window.fetch
  
  window.fetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
    
    return originalFetch(url, { ...options, headers })
  }
}
```

### Backend Endpoint Structure

```
POST   /api/auth/register        - User registration
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
POST   /api/auth/refresh-token   - Refresh JWT token
POST   /api/auth/verify-email    - Email verification

GET    /api/users/:id            - Get user details
PUT    /api/users/:id            - Update user profile
DELETE /api/users/:id            - Delete user account
GET    /api/users                - List users (admin only)
```

---

## 💰 Loan APIs

### Core Loan Endpoints

```javascript
// Create loan application
POST /api/loans
{
  "borrowerId": "123",
  "amount": 500000,
  "interestRate": 10,
  "term": 60,
  "purpose": "Home renovation",
  "documents": []
}

// Get loan details
GET /api/loans/:id

// Update loan
PUT /api/loans/:id
{
  "status": "active",
  "approvedBy": "lender123"
}

// List loans (with filters)
GET /api/loans?status=active&borrowerId=123&limit=10

// Delete loan
DELETE /api/loans/:id

// Get EMI schedule
GET /api/loans/:id/emi-schedule

// Get loan analytics
GET /api/loans/analytics/summary
```

### Loan Analytics Integration

```javascript
import { AnalyticsUtils } from './utils'

// Fetch loans from API
const loans = await fetch('/api/loans').then(r => r.json())

// Calculate analytics locally or fetch from API
const portfolio = AnalyticsUtils.calculatePortfolioStats(loans)
const npaRate = AnalyticsUtils.calculateNPARate(loans)
const forecast = AnalyticsUtils.forecastPortfolioGrowth(loans)
```

---

## 💳 Payment Integration

### Payment Processing Flow

```javascript
import { PaymentUtils } from './utils'

// 1. Validate payment
const validation = PaymentUtils.validatePaymentAmount(amount, 1000, 10000000)

if (!validation.valid) {
  console.error(validation.error)
  return
}

// 2. Create transaction
const transaction = PaymentUtils.createPaymentTransaction(
  loanId,
  amount,
  'upi'
)

// 3. Send to backend
const response = await fetch('/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(transaction)
})

// 4. Process payment
const result = await response.json()

// 5. Update local state
if (result.success) {
  StorageManager.setItem(`payment_${result.id}`, result)
}
```

### Payment Gateway Integration

#### Razorpay Integration

```javascript
const handleRazorpayPayment = async (amount, loanId) => {
  // Load Razorpay script
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  document.body.appendChild(script)

  // Create order on backend
  const orderResponse = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, loanId })
  })

  const { orderId } = await orderResponse.json()

  // Open Razorpay checkout
  const options = {
    key: 'your_razorpay_key_id',
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    name: 'LoanHub',
    description: `Loan Payment - ${loanId}`,
    order_id: orderId,
    handler: (response) => {
      // Verify payment on backend
      verifyPayment(response)
    }
  }

  const rzp = new Razorpay(options)
  rzp.open()
}

const verifyPayment = async (response) => {
  const result = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response)
  })

  const data = await result.json()
  
  if (data.success) {
    // Update loan status
    updateLoanPaymentStatus(data.loanId, data.amount)
  }
}
```

#### PayU Integration

```javascript
const handlePayUPayment = async (amount, loanId) => {
  // Get payment hash from backend
  const response = await fetch('/api/payments/payu-hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      loanId,
      email: currentUser.email,
      phone: currentUser.phone
    })
  })

  const { hash, txnId } = await response.json()

  // Create form and submit
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = 'https://secure.payu.in/_payment'

  const fields = {
    key: 'your_payu_merchant_key',
    txnid: txnId,
    amount: amount,
    productinfo: `Loan Payment - ${loanId}`,
    firstname: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    surl: `${window.location.origin}/payment-success`,
    furl: `${window.location.origin}/payment-failed`,
    hash: hash
  }

  Object.keys(fields).forEach(key => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = fields[key]
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}
```

---

## 📧 Email & SMS Integration

### Email Service Integration

```javascript
import { NotificationUtils } from './utils'

const sendNotificationEmail = async (notification, recipientEmail) => {
  const emailContent = NotificationUtils.formatNotificationForEmail(notification)

  const response = await fetch('/api/notifications/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.body
    })
  })

  return response.json()
}

// Using SendGrid
const sendGridEmail = async (to, subject, html) => {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_API_KEY}`
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@loanhub.com' },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  })

  return response.json()
}
```

### SMS Integration

```javascript
import { NotificationUtils } from './utils'

const sendNotificationSMS = async (notification, phoneNumber) => {
  const smsContent = NotificationUtils.formatNotificationForSMS(notification)

  const response = await fetch('/api/notifications/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: phoneNumber,
      message: smsContent
    })
  })

  return response.json()
}

// Using Twilio
const sendTwilioSMS = async (to, message) => {
  const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa('ACCOUNT_SID:AUTH_TOKEN')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: '+1234567890',
      To: to,
      Body: message
    })
  })

  return response.json()
}
```

### WhatsApp Integration

```javascript
const sendWhatsAppMessage = async (notification, phoneNumber) => {
  const whatsappMessage = NotificationUtils.formatNotificationForWhatsApp(notification)

  // Using WhatsApp Business API
  const response = await fetch('https://graph.instagram.com/v12.0/{PHONE_NUMBER_ID}/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: { body: whatsappMessage }
    })
  })

  return response.json()
}
```

---

## 📊 CIBIL/Credit Score Integration

```javascript
const fetchCIBILScore = async (userId) => {
  try {
    const response = await fetch(`/api/credit/cibil-score/${userId}`)
    const data = await response.json()

    return {
      score: data.score,
      grade: data.grade,
      lastUpdated: new Date(data.lastUpdated),
      factors: data.factors
    }
  } catch (error) {
    console.error('Error fetching CIBIL score:', error)
    return null
  }
}

// Alternative: Calculate locally using AnalyticsUtils
import { AnalyticsUtils } from './utils'

const calculateLocalCreditScore = (userLoans, paymentHistory) => {
  return AnalyticsUtils.calculateCreditScore(userLoans, paymentHistory)
}
```

---

## 🏦 Bank API Integration

### Account Verification

```javascript
const verifyBankAccount = async (accountNumber, ifscCode) => {
  const response = await fetch('/api/verification/verify-bank-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountNumber,
      ifscCode
    })
  })

  const data = await response.json()

  return {
    valid: data.valid,
    accountHolderName: data.accountHolderName,
    bankName: data.bankName,
    accountType: data.accountType
  }
}
```

### KYC Verification

```javascript
const verifyKYC = async (userId, documents) => {
  const formData = new FormData()
  formData.append('userId', userId)

  Object.keys(documents).forEach(key => {
    formData.append(key, documents[key])
  })

  const response = await fetch('/api/kyc/verify', {
    method: 'POST',
    body: formData
  })

  return response.json()
}

// Upload PAN
const uploadPAN = async (userId, panDocument) => {
  const formData = new FormData()
  formData.append('userId', userId)
  formData.append('panDocument', panDocument)

  const response = await fetch('/api/kyc/upload-pan', {
    method: 'POST',
    body: formData
  })

  return response.json()
}

// Upload Aadhaar
const uploadAadhaar = async (userId, aadhaarDocument) => {
  const formData = new FormData()
  formData.append('userId', userId)
  formData.append('aadhaarDocument', aadhaarDocument)

  const response = await fetch('/api/kyc/upload-aadhaar', {
    method: 'POST',
    body: formData
  })

  return response.json()
}
```

---

## 📱 Real-Time Updates with WebSocket

```javascript
const setupWebSocket = (userId) => {
  const ws = new WebSocket(`wss://api.loanhub.com/notifications/${userId}`)

  ws.onopen = () => {
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data)

    // Handle notification
    handleRealtimeNotification(notification)

    // Update UI
    updateNotificationBadge()
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  ws.onclose = () => {
    console.log('WebSocket closed')
    // Reconnect after delay
    setTimeout(() => setupWebSocket(userId), 3000)
  }

  return ws
}

const handleRealtimeNotification = (notification) => {
  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png'
    })
  }

  // Update state
  setNotifications(prev => [notification, ...prev])
}
```

---

## 📈 Analytics API Integration

```javascript
const fetchAnalytics = async (startDate, endDate) => {
  const response = await fetch(`/api/analytics/summary?start=${startDate}&end=${endDate}`)
  return response.json()
}

const fetchLoanAnalytics = async (loanId) => {
  const response = await fetch(`/api/analytics/loans/${loanId}`)
  return response.json()
}

const exportAnalyticsReport = async (format = 'csv') => {
  const response = await fetch(`/api/analytics/export?format=${format}`)
  
  // Download file
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${Date.now()}.${format}`
  a.click()
}
```

---

## 🔄 API Error Handling

```javascript
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    // Handle HTTP errors
    if (!response.ok) {
      const error = await response.json()

      // Handle specific error codes
      if (response.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login'
      } else if (response.status === 403) {
        // Forbidden - insufficient permissions
        console.error('Insufficient permissions')
      } else if (response.status === 404) {
        // Not found
        console.error('Resource not found')
      } else if (response.status === 500) {
        // Server error
        console.error('Server error')
      }

      throw new Error(error.message || 'API Error')
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}
```

---

## 🧪 Testing API Integration

```javascript
// Mock API responses for testing
const mockFetch = (response) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response)
    })
  )
}

describe('Loan API', () => {
  test('should fetch loans successfully', async () => {
    const mockLoans = [
      { id: 1, amount: 500000, status: 'active' }
    ]

    mockFetch(mockLoans)

    const loans = await fetch('/api/loans').then(r => r.json())

    expect(loans).toEqual(mockLoans)
    expect(fetch).toHaveBeenCalledWith('/api/loans')
  })
})
```

---

## 📚 API Documentation Template

```markdown
# LoanHub API Documentation

## Base URL
https://api.loanhub.com/v1

## Authentication
- Use Bearer tokens in Authorization header
- Token format: `Authorization: Bearer <token>`

## Response Format
All responses return JSON in the format:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## Rate Limiting
- 1000 requests per hour per API key
- Rate limit headers returned with each response

## Versioning
- Current version: v1
- Endpoints prefixed with /v1/
```

---

## 🚀 Deployment Checklist

- [ ] Backend server deployed
- [ ] Database configured
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Security headers added
- [ ] CORS configured
- [ ] Rate limiting implemented
- [ ] Monitoring set up
- [ ] CI/CD pipeline configured
- [ ] Backups configured

---

**Last Updated**: April 1, 2024
**Version**: 7.0.0
