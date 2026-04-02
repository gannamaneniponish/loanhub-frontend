import { User } from 'lucide-react'
import '../styles/CreditScore.css'

export function BorrowerCreditScore({ borrower, loans = [], transactions = [] }) {
 if (!borrower) return <div className="credit-score-empty">No borrower data</div>

 const calculateCreditScore = () => {
 // Score factors (out of 100)
 let score = 50 // Base score

 // Get borrower's loans
 const borrowerLoans = loans.filter(l => 
 l.borrowerName === borrower.name || l.borrowerId === borrower.id
 )

 // Factor 1: On-time payment history (30 points)
 if (borrowerLoans.length > 0) {
 const completedLoans = borrowerLoans.filter(l => l.status === 'completed')
 const latePayments = borrowerLoans.filter(l => l.status === 'active').length // Simplified
 const paymentRate = completedLoans.length / borrowerLoans.length

 if (paymentRate === 1) score += 30
 else if (paymentRate >= 0.8) score += 24
 else if (paymentRate >= 0.6) score += 18
 else if (paymentRate >= 0.4) score += 12
 else if (paymentRate > 0) score += 6
 }

 // Factor 2: Loan completion rate (25 points)
 if (borrowerLoans.length > 0) {
 const completedCount = borrowerLoans.filter(l => l.status === 'completed').length
 const completionRate = completedCount / borrowerLoans.length

 if (completionRate === 1) score += 25
 else if (completionRate >= 0.75) score += 18
 else if (completionRate >= 0.5) score += 12
 else if (completionRate > 0) score += 6
 }

 // Factor 3: Active defaults (penalty)
 const defaultedLoans = borrowerLoans.filter(l => l.status === 'declined' || (l.status === 'active' && Date.now() - new Date(l.createdAt) > 365*24*60*60*1000))
 if (defaultedLoans.length > 0) {
 score -= defaultedLoans.length * 10
 }

 // Factor 4: Number of active loans (15 points)
 const activeLoans = borrowerLoans.filter(l => l.status === 'active')
 if (activeLoans.length === 0) score += 15
 else if (activeLoans.length === 1) score += 12
 else if (activeLoans.length === 2) score += 8
 else score += 3

 return Math.max(0, Math.min(100, score))
 }

 const score = calculateCreditScore()
 const borrowerLoans = loans.filter(l => l.borrowerName === borrower.name || l.borrowerId === borrower.id)
 const completedLoans = borrowerLoans.filter(l => l.status === 'completed')
 const activeLoans = borrowerLoans.filter(l => l.status === 'active')
 const declinedLoans = borrowerLoans.filter(l => l.status === 'declined')

 const getRiskLevel = () => {
 if (score >= 75) return { level: 'Low Risk', color: '#38a169', icon: '' }
 if (score >= 50) return { level: 'Medium Risk', color: '#b7791f', icon: '◉' }
 return { level: 'High Risk', color: '#c53030', icon: '' }
 }

 const getTotalBorrowed = () => borrowerLoans.reduce((sum, l) => sum + l.amount, 0)
 const getTotalRepaid = () => transactions.filter(t => t.type === 'payment' && t.borrowerId === borrower.id).reduce((sum, t) => sum + t.amount, 0)

 const risk = getRiskLevel()

 return (
 <div className="credit-score-container">
 <div className="score-header">
 <User size={22} />
 <h3>Credit Score Profile</h3>
 </div>

 <div className="score-card">
 <div className="score-circle">
 <div className="score-display" style={{ borderColor: risk.color }}>
 <div className="score-number" style={{ color: risk.color }}>
 {Math.round(score)}
 </div>
 <div className="score-label">/ 100</div>
 </div>
 </div>

 <div className="score-info">
 <div className="risk-badge" style={{ background: `${risk.color}20`, borderLeft: `4px solid ${risk.color}` }}>
 <span style={{ color: risk.color, fontWeight: '700' }}>
 {risk.icon} {risk.level}
 </span>
 </div>

 <p className="score-description">
 {score >= 75 && "Excellent borrower with strong repayment history. Low default risk."}
 {score >= 50 && score < 75 && "Good borrower with reasonable payment track record. Monitor activity."}
 {score < 50 && "Concerning repayment history. Review carefully before lending."}
 </p>
 </div>
 </div>

 <div className="score-metrics">
 <div className="metric-card">
 <span className="metric-label"> Total Loans</span>
 <span className="metric-value">{borrowerLoans.length}</span>
 </div>

 <div className="metric-card">
 <span className="metric-label"> Completed</span>
 <span className="metric-value" style={{ color: '#38a169' }}>{completedLoans.length}</span>
 </div>

 <div className="metric-card">
 <span className="metric-label">◉ Active</span>
 <span className="metric-value" style={{ color: '#3182ce' }}>{activeLoans.length}</span>
 </div>

 <div className="metric-card">
 <span className="metric-label"> Declined</span>
 <span className="metric-value" style={{ color: '#c53030' }}>{declinedLoans.length}</span>
 </div>

 <div className="metric-card">
 <span className="metric-label"> Total Borrowed</span>
 <span className="metric-value">₹{getTotalBorrowed()?.toLocaleString('en-IN')}</span>
 </div>

 <div className="metric-card">
 <span className="metric-label"> Repaid</span>
 <span className="metric-value">₹{getTotalRepaid()?.toLocaleString('en-IN')}</span>
 </div>
 </div>

 <div className="score-factors">
 <h4>Score Factors</h4>
 <ul>
 <li>
 <span className="factor-name">On-Time Payments (30%)</span>
 <span className="factor-desc">History of timely loan repayments</span>
 </li>
 <li>
 <span className="factor-name">Loan Completion Rate (25%)</span>
 <span className="factor-desc">Percentage of loans successfully completed</span>
 </li>
 <li>
 <span className="factor-name">Active Loan Count (15%)</span>
 <span className="factor-desc">Currently active loan obligations</span>
 </li>
 <li>
 <span className="factor-name">Default History (30%)</span>
 <span className="factor-desc">Any late payments or declined loans (negative)</span>
 </li>
 </ul>
 </div>
 </div>
 )
}

export default BorrowerCreditScore
