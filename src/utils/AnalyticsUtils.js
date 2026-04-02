/**
 * AnalyticsUtils - Advanced analytics and business intelligence utilities
 * Provides calculations, metrics, and analysis tools for loan data
 */

const AnalyticsUtils = {
  /**
   * Calculate EMI (Equated Monthly Installment)
   * Formula: EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]
   */
  calculateEMI: (principal, annualRate, months) => {
    const monthlyRate = annualRate / 100 / 12
    if (monthlyRate === 0) return principal / months

    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months)
    const denominator = Math.pow(1 + monthlyRate, months) - 1
    return numerator / denominator
  },

  /**
   * Calculate total interest payable
   */
  calculateTotalInterest: (principal, annualRate, months) => {
    const emi = AnalyticsUtils.calculateEMI(principal, annualRate, months)
    return emi * months - principal
  },

  /**
   * Generate EMI schedule
   */
  generateEMISchedule: (principal, annualRate, months, startDate = new Date()) => {
    const emi = AnalyticsUtils.calculateEMI(principal, annualRate, months)
    const monthlyRate = annualRate / 100 / 12
    const schedule = []

    let balance = principal
    let currentDate = new Date(startDate)

    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate
      const principalPayment = emi - interest
      balance -= principalPayment

      schedule.push({
        installment: i,
        date: new Date(currentDate),
        emi: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interest),
        balance: Math.max(0, Math.round(balance)),
        status: 'pending'
      })

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    return schedule
  },

  /**
   * Calculate loan eligibility based on annual income
   */
  calculateLoanEligibility: (annualIncome, debtToIncomeRatio = 0.4) => {
    const maxLoan = annualIncome * debtToIncomeRatio
    const minLoan = 10000
    const recommendedLoan = maxLoan * 0.8

    return {
      minLoan,
      maxLoan: Math.min(maxLoan, 10000000), // Cap at 1 Crore
      recommendedLoan: Math.round(recommendedLoan),
      debtToIncomeRatio
    }
  },

  /**
   * Calculate credit score (simplified CIBIL-like model)
   * Based on: payment history, credit utilization, length of credit history
   */
  calculateCreditScore: (loans = [], paymentHistory = []) => {
    let score = 300 // Base score

    // Payment history (35% weight)
    if (paymentHistory.length > 0) {
      const onTimePayments = paymentHistory.filter(p => !p.isLate).length
      const paymentRatio = onTimePayments / paymentHistory.length
      score += paymentRatio * 200
    } else {
      score += 50 // Benefit of doubt
    }

    // Credit history length (15% weight)
    const oldestLoan = loans.length > 0 ? Math.min(...loans.map(l => new Date(l.createdAt).getTime())) : Date.now()
    const monthsActive = (Date.now() - oldestLoan) / (30 * 24 * 60 * 60 * 1000)
    const historyScore = Math.min(monthsActive / 120 * 100, 100)
    score += historyScore * 0.15

    // Credit utilization (30% weight)
    if (loans.length > 0) {
      const activeLoanRatio = loans.filter(l => l.status === 'active').length / loans.length
      score += (1 - activeLoanRatio) * 150
    }

    // Diverse credit (20% weight)
    const uniqueLoanTypes = new Set(loans.map(l => l.purpose)).size
    score += Math.min(uniqueLoanTypes, 5) * 20

    return Math.min(900, Math.max(300, Math.round(score)))
  },

  /**
   * Calculate NPA (Non-Performing Assets) rate
   */
  calculateNPARate: (loans = []) => {
    if (loans.length === 0) return 0

    const npaLoans = loans.filter(l => l.status === 'overdue' || l.status === 'declined')
    return (npaLoans.length / loans.length) * 100
  },

  /**
   * Calculate portfolio statistics
   */
  calculatePortfolioStats: (loans = []) => {
    if (loans.length === 0) {
      return {
        totalLoans: 0,
        activeLoans: 0,
        completedLoans: 0,
        totalDisbursed: 0,
        totalCollected: 0,
        avgLoanSize: 0,
        avgInterestRate: 0,
        approvalRate: 0
      }
    }

    const activeLoans = loans.filter(l => l.status === 'active').length
    const completedLoans = loans.filter(l => l.status === 'completed').length
    const totalDisbursed = loans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)
    const approvedLoans = loans.filter(l => ['active', 'completed'].includes(l.status)).length

    return {
      totalLoans: loans.length,
      activeLoans,
      completedLoans,
      pendingLoans: loans.filter(l => l.status === 'pending').length,
      declinedLoans: loans.filter(l => l.status === 'declined').length,
      totalDisbursed,
      avgLoanSize: Math.round(totalDisbursed / loans.length),
      avgInterestRate: parseFloat(
        (loans.reduce((sum, l) => sum + (parseFloat(l.interestRate) || 0), 0) / loans.length).toFixed(2)
      ),
      approvalRate: parseFloat(((approvedLoans / loans.length) * 100).toFixed(2))
    }
  },

  /**
   * Calculate default probability (simplified model)
   */
  calculateDefaultProbability: (loan, borrowerProfile = {}) => {
    let probability = 0.05 // Base 5%

    // Loan amount factor
    if (loan.amount > 1000000) probability += 0.05
    if (loan.amount > 5000000) probability += 0.05

    // Interest rate factor (higher rate = riskier)
    const riskRate = (loan.interestRate - 10) / 10
    probability += Math.max(0, riskRate * 0.1)

    // Loan term factor
    if (loan.term > 240) probability += 0.05 // Long term loans are riskier

    // Borrower profile
    if (borrowerProfile.creditScore) {
      if (borrowerProfile.creditScore < 500) probability += 0.15
      else if (borrowerProfile.creditScore < 650) probability += 0.08
      else if (borrowerProfile.creditScore > 750) probability -= 0.05
    }

    if (borrowerProfile.income) {
      const dtiRatio = loan.amount / (borrowerProfile.income / 12)
      if (dtiRatio > 0.6) probability += 0.1
      else if (dtiRatio > 0.5) probability += 0.05
    }

    // Employment stability
    if (borrowerProfile.employmentType === 'self-employed') probability += 0.05
    if (borrowerProfile.employmentYears && borrowerProfile.employmentYears < 2) probability += 0.05

    return Math.min(0.99, Math.max(0.01, probability))
  },

  /**
   * Calculate foreclosure/prepayment amount
   */
  calculateForeclosureAmount: (principal, annualRate, months, paidMonths = 0, prepaymentPenalty = 0.02) => {
    const schedule = AnalyticsUtils.generateEMISchedule(principal, annualRate, months)

    if (paidMonths >= months) return 0

    // Outstanding principal
    const outstandingPrincipal = schedule[Math.min(paidMonths, months - 1)]?.balance || 0

    // Calculate outstanding interest (simple interest for remaining period)
    const remainingMonths = months - paidMonths
    const monthlyRate = annualRate / 100 / 12
    const outstandingInterest = outstandingPrincipal * monthlyRate * 0.5 // Half of remaining period

    // Prepayment penalty (usually 2% of outstanding principal)
    const penalty = outstandingPrincipal * prepaymentPenalty

    return {
      outstandingPrincipal: Math.round(outstandingPrincipal),
      outstandingInterest: Math.round(outstandingInterest),
      prepaymentPenalty: Math.round(penalty),
      totalClosureAmount: Math.round(outstandingPrincipal + outstandingInterest + penalty)
    }
  },

  /**
   * Calculate interest income
   */
  calculateInterestIncome: (loans = [], transactions = []) => {
    return loans.reduce((total, loan) => {
      const totalInterest = AnalyticsUtils.calculateTotalInterest(
        parseFloat(loan.amount) || 0,
        parseFloat(loan.interestRate) || 0,
        parseInt(loan.term) || 0
      )
      return total + totalInterest
    }, 0)
  },

  /**
   * Calculate collection rate
   */
  calculateCollectionRate: (loans = [], transactions = []) => {
    if (loans.length === 0) return 0

    const activeLoans = loans.filter(l => l.status === 'active')
    if (activeLoans.length === 0) return 0

    const collected = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)

    const expectedCollections = activeLoans.reduce((sum, loan) => {
      const schedule = AnalyticsUtils.generateEMISchedule(
        parseFloat(loan.amount),
        parseFloat(loan.interestRate),
        parseInt(loan.term)
      )
      const dueAmount = schedule.reduce((sum, s) => sum + s.emi, 0)
      return sum + dueAmount
    }, 0)

    return parseFloat(((collected / expectedCollections) * 100).toFixed(2))
  },

  /**
   * Calculate repayment health score (1-10)
   */
  calculateRepaymentHealth: (loan, transactions = []) => {
    let score = 10

    // Check for overdue payments
    const overdueDays = AnalyticsUtils.calculateOverdueDays(loan)
    if (overdueDays > 0) {
      score -= Math.min(9, (overdueDays / 30) * 2)
    }

    // Check for missed payments
    if (transactions.length === 0) {
      score -= 5
    } else {
      const missedSchedule = AnalyticsUtils.generateEMISchedule(
        parseFloat(loan.amount),
        parseFloat(loan.interestRate),
        parseInt(loan.term),
        new Date(loan.createdAt)
      )

      const missedPayments = missedSchedule.filter(s => s.status === 'pending').length
      score -= Math.min(5, missedPayments * 0.5)
    }

    return Math.max(1, Math.round(score * 10) / 10)
  },

  /**
   * Calculate overdue days
   */
  calculateOverdueDays: (loan, referenceDate = new Date()) => {
    const lastPaymentDate = loan.lastPaymentDate ? new Date(loan.lastPaymentDate) : new Date(loan.createdAt)
    const nextDueDate = new Date(lastPaymentDate)
    nextDueDate.setMonth(nextDueDate.getMonth() + 1)

    const dueDate = Math.max(new Date(loan.createdAt).getTime(), nextDueDate.getTime())
    const overdueDays = Math.floor((referenceDate - dueDate) / (1000 * 60 * 60 * 24))

    return Math.max(0, overdueDays)
  },

  /**
   * Generate profitability report
   */
  generateProfitabilityReport: (loans = [], transactions = []) => {
    const totalDisbursed = loans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)
    const totalInterestIncome = AnalyticsUtils.calculateInterestIncome(loans, transactions)
    const totalCollected = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)

    // Estimated operating costs (5-10% of disbursed amount)
    const operatingCosts = totalDisbursed * 0.07

    // Net profit
    const netProfit = totalInterestIncome - operatingCosts

    return {
      totalDisbursed,
      totalInterestIncome,
      totalCollected,
      operatingCosts,
      netProfit,
      profitMargin: parseFloat(((netProfit / totalDisbursed) * 100).toFixed(2)),
      collectionRate: parseFloat(((totalCollected / totalDisbursed) * 100).toFixed(2))
    }
  },

  /**
   * Get loan distribution by purpose
   */
  getLoanDistribution: (loans = []) => {
    const distribution = {}

    loans.forEach(loan => {
      const purpose = loan.purpose || 'Other'
      distribution[purpose] = (distribution[purpose] || 0) + 1
    })

    return Object.entries(distribution)
      .map(([purpose, count]) => ({
        purpose,
        count,
        percentage: parseFloat(((count / loans.length) * 100).toFixed(2))
      }))
      .sort((a, b) => b.count - a.count)
  },

  /**
   * Get loan distribution by status
   */
  getStatusDistribution: (loans = []) => {
    const distribution = {}

    loans.forEach(loan => {
      const status = loan.status || 'unknown'
      distribution[status] = (distribution[status] || 0) + 1
    })

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: parseFloat(((count / loans.length) * 100).toFixed(2))
    }))
  },

  /**
   * Get top borrowers
   */
  getTopBorrowers: (loans = [], limit = 10) => {
    const borrowerStats = {}

    loans.forEach(loan => {
      const borrowerId = loan.borrowerId || loan.borrowerName
      if (!borrowerStats[borrowerId]) {
        borrowerStats[borrowerId] = {
          borrowerId,
          borrowerName: loan.borrowerName,
          totalBorrowed: 0,
          loanCount: 0,
          totalInterestPaid: 0
        }
      }
      borrowerStats[borrowerId].totalBorrowed += parseFloat(loan.amount) || 0
      borrowerStats[borrowerId].loanCount += 1
      borrowerStats[borrowerId].totalInterestPaid += AnalyticsUtils.calculateTotalInterest(
        parseFloat(loan.amount),
        parseFloat(loan.interestRate),
        parseInt(loan.term)
      )
    })

    return Object.values(borrowerStats)
      .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
      .slice(0, limit)
  },

  /**
   * Forecast portfolio growth
   */
  forecastPortfolioGrowth: (loans = [], months = 12, growthRate = 0.05) => {
    const currentSize = loans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)
    const forecast = []

    for (let i = 1; i <= months; i++) {
      const projectedSize = currentSize * Math.pow(1 + growthRate, i)
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() + i)

      forecast.push({
        month: i,
        date: monthDate,
        projectedSize: Math.round(projectedSize),
        growth: Math.round(projectedSize - currentSize)
      })
    }

    return forecast
  }
}

export default AnalyticsUtils
