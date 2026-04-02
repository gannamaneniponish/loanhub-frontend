/**
 * PaymentUtils - Payment processing and transaction management utilities
 */

const PaymentUtils = {
  /**
   * Payment methods supported
   */
  PAYMENT_METHODS: {
    BANK_TRANSFER: 'bank_transfer',
    UPI: 'upi',
    CARD: 'card',
    CHEQUE: 'cheque',
    NEFT: 'neft',
    RTGS: 'rtgs'
  },

  /**
   * Payment status
   */
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  /**
   * Validate payment amount
   */
  validatePaymentAmount: (amount, minAmount = 0, maxAmount = Infinity) => {
    const num = parseFloat(amount)
    if (isNaN(num)) {
      return { valid: false, error: 'Invalid amount' }
    }
    if (num < minAmount) {
      return { valid: false, error: `Minimum amount is ₹${minAmount}` }
    }
    if (num > maxAmount) {
      return { valid: false, error: `Maximum amount is ₹${maxAmount}` }
    }
    return { valid: true, amount: num }
  },

  /**
   * Calculate payment tax (GST - 18%)
   */
  calculateGST: (amount, gstRate = 18) => {
    const gst = (amount * gstRate) / 100
    return {
      amount,
      gstRate,
      gstAmount: Math.round(gst * 100) / 100,
      totalAmount: Math.round((amount + gst) * 100) / 100
    }
  },

  /**
   * Generate payment reference number
   */
  generatePaymentRef: (loanId, paymentType = 'EMI') => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    return `${paymentType}-${loanId}-${timestamp}-${random}`
  },

  /**
   * Validate UPI ID
   */
  isValidUPI: (upiId) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/
    return upiRegex.test(upiId)
  },

  /**
   * Validate bank account
   */
  isValidBankAccount: (accountNumber) => {
    // Indian bank accounts are 9-18 digits
    const accountRegex = /^[0-9]{9,18}$/
    return accountRegex.test(accountNumber.replace(/\s/g, ''))
  },

  /**
   * Format payment method for display
   */
  formatPaymentMethod: (method) => {
    const methods = {
      bank_transfer: 'Bank Transfer',
      upi: 'UPI',
      card: 'Debit/Credit Card',
      cheque: 'Cheque',
      neft: 'NEFT',
      rtgs: 'RTGS'
    }
    return methods[method?.toLowerCase()] || method
  },

  /**
   * Calculate payment due amount for loan
   */
  calculatePaymentDue: (loan, emiSchedule = []) => {
    if (!emiSchedule || emiSchedule.length === 0) {
      // Calculate EMI if no schedule provided
      const monthlyRate = (parseFloat(loan.interestRate) / 100) / 12
      const months = parseInt(loan.term) || 12
      const principal = parseFloat(loan.amount) || 0

      if (monthlyRate === 0) {
        return Math.round(principal / months)
      }

      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                  (Math.pow(1 + monthlyRate, months) - 1)
      return Math.round(emi)
    }

    // Find next due EMI
    const pendingEMI = emiSchedule.find(s => s.status === 'pending')
    return pendingEMI ? pendingEMI.emi : 0
  },

  /**
   * Calculate payment breakdown (principal + interest)
   */
  calculatePaymentBreakdown: (totalPayment, loanBalance, monthlyInterestRate) => {
    const interestAmount = Math.round(loanBalance * monthlyInterestRate)
    const principalAmount = Math.round(totalPayment - interestAmount)

    return {
      totalPayment,
      principalAmount: Math.max(0, principalAmount),
      interestAmount,
      remainingBalance: Math.max(0, loanBalance - principalAmount)
    }
  },

  /**
   * Create payment transaction object
   */
  createPaymentTransaction: (loanId, amount, method = 'bank_transfer', paymentDate = new Date()) => {
    return {
      id: Date.now(),
      loanId,
      amount: parseFloat(amount),
      method,
      status: 'completed',
      reference: PaymentUtils.generatePaymentRef(loanId),
      paymentDate: new Date(paymentDate),
      timestamp: new Date(),
      type: 'payment',
      notes: ''
    }
  },

  /**
   * Calculate payment schedule
   */
  calculatePaymentSchedule: (emiSchedule = []) => {
    const schedule = []
    let totalPaid = 0

    emiSchedule.forEach((emi, index) => {
      totalPaid += emi.emi
      schedule.push({
        installment: emi.installment,
        dueDate: emi.date,
        amount: emi.emi,
        principalComponent: emi.principal,
        interestComponent: emi.interest,
        balanceAfterPayment: emi.balance,
        totalPaidSoFar: Math.round(totalPaid),
        status: emi.status,
        daysOverdue: 0
      })
    })

    return schedule
  },

  /**
   * Calculate late payment charges
   */
  calculateLatePaymentCharges: (amount, daysLate, chargePercentage = 1) => {
    // Charge 1% per month or part thereof
    const monthsLate = Math.ceil(daysLate / 30)
    const charges = (amount * chargePercentage * monthsLate) / 100

    return {
      originalAmount: amount,
      daysLate,
      monthsLate,
      chargePercentage,
      charges: Math.round(charges),
      totalDue: Math.round(amount + charges)
    }
  },

  /**
   * Calculate settlement amount (for partial payment/settlement)
   */
  calculateSettlementAmount: (outstandingAmount, settlementPercentage = 85) => {
    const settlementAmount = (outstandingAmount * settlementPercentage) / 100

    return {
      outstandingAmount,
      settlementPercentage,
      settlementAmount: Math.round(settlementAmount),
      savings: Math.round(outstandingAmount - settlementAmount),
      savingsPercentage: 100 - settlementPercentage
    }
  },

  /**
   * Get payment status color
   */
  getPaymentStatusColor: (status) => {
    const colors = {
      pending: '#f59e0b',
      completed: '#10b981',
      failed: '#ef4444',
      cancelled: '#6b7280',
      refunded: '#3b82f6'
    }
    return colors[status?.toLowerCase()] || '#6b7280'
  },

  /**
   * Format transaction for display
   */
  formatTransaction: (transaction, loans = []) => {
    const loan = loans.find(l => l.id === transaction.loanId)

    return {
      id: transaction.id,
      type: transaction.type,
      loanId: transaction.loanId,
      loanDetails: loan ? `${loan.borrowerName} - ${loan.purpose}` : 'Unknown',
      amount: transaction.amount,
      method: PaymentUtils.formatPaymentMethod(transaction.method),
      status: transaction.status,
      date: new Date(transaction.timestamp || transaction.paymentDate),
      reference: transaction.reference,
      notes: transaction.notes
    }
  },

  /**
   * Generate payment receipt
   */
  generatePaymentReceipt: (transaction, loan) => {
    return {
      receiptNumber: `RCP-${transaction.id}`,
      transactionDate: new Date(transaction.timestamp),
      paymentMethod: PaymentUtils.formatPaymentMethod(transaction.method),
      borrowerName: loan?.borrowerName,
      loanId: loan?.id,
      loanPurpose: loan?.purpose,
      loanAmount: loan?.amount,
      paymentAmount: transaction.amount,
      reference: transaction.reference,
      status: transaction.status,
      remarks: `EMI Payment towards ${loan?.purpose} loan`
    }
  },

  /**
   * Validate transaction
   */
  validateTransaction: (transaction) => {
    const errors = []

    if (!transaction.loanId) errors.push('Loan ID is required')
    if (!transaction.amount || transaction.amount <= 0) errors.push('Valid amount is required')
    if (!transaction.method) errors.push('Payment method is required')
    if (!transaction.type) errors.push('Transaction type is required')

    const validMethods = Object.values(PaymentUtils.PAYMENT_METHODS)
    if (!validMethods.includes(transaction.method)) {
      errors.push('Invalid payment method')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  /**
   * Get payment analytics
   */
  getPaymentAnalytics: (transactions = []) => {
    const paymentTransactions = transactions.filter(t => t.type === 'payment')

    if (paymentTransactions.length === 0) {
      return {
        totalPayments: 0,
        totalAmount: 0,
        averageAmount: 0,
        paymentCount: 0,
        methodBreakdown: {}
      }
    }

    const totalAmount = paymentTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
    const methodBreakdown = {}

    paymentTransactions.forEach(t => {
      const method = t.method || 'unknown'
      methodBreakdown[method] = (methodBreakdown[method] || 0) + 1
    })

    return {
      totalPayments: paymentTransactions.length,
      totalAmount,
      averageAmount: Math.round(totalAmount / paymentTransactions.length),
      paymentCount: paymentTransactions.length,
      methodBreakdown
    }
  },

  /**
   * Generate payment summary report
   */
  generatePaymentSummary: (loans = [], transactions = []) => {
    const paymentTransactions = transactions.filter(t => t.type === 'payment')

    const summary = {
      totalLoans: loans.length,
      activeLoans: loans.filter(l => l.status === 'active').length,
      totalAmountDisbursed: loans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0),
      totalAmountCollected: paymentTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
      totalPaymentCount: paymentTransactions.length,
      uniqueBorrowers: new Set(loans.map(l => l.borrowerId)).size,
      collectionRate: 0,
      averagePaymentAmount: 0
    }

    if (summary.totalAmountDisbursed > 0) {
      summary.collectionRate = parseFloat(
        ((summary.totalAmountCollected / summary.totalAmountDisbursed) * 100).toFixed(2)
      )
    }

    if (paymentTransactions.length > 0) {
      summary.averagePaymentAmount = Math.round(summary.totalAmountCollected / paymentTransactions.length)
    }

    return summary
  }
}

export default PaymentUtils
