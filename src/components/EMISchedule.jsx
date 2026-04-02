import { useState } from 'react'
import { Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import '../styles/EMISchedule.css'

export function EMISchedule({ loan, transactions = [] }) {
 const [expandedMonth, setExpandedMonth] = useState(null)

 const calculateEMISchedule = () => {
 if (!loan) return []

 const startDate = new Date(loan.acceptedAt || loan.createdAt || loan.applicationDate || Date.now())
 const monthlyRate = loan.interestRate / 100 / 12
 const monthlyPayment = monthlyRate === 0
 ? loan.amount / loan.term
 : (loan.amount * (monthlyRate * Math.pow(1 + monthlyRate, loan.term))) / 
 (Math.pow(1 + monthlyRate, loan.term) - 1)

 const schedule = []
 let remainingPrincipal = loan.amount

 for (let i = 1; i <= loan.term; i++) {
 const dueDate = new Date(startDate)
 dueDate.setMonth(dueDate.getMonth() + i)

 const interestPayment = remainingPrincipal * monthlyRate
 const principalPayment = monthlyPayment - interestPayment
 remainingPrincipal -= principalPayment

 // Check if this EMI is paid
 const relatedPayments = transactions.filter(
 t => t.type === 'payment' && t.loanId === loan.id
 )
 const totalPaid = relatedPayments.reduce((sum, t) => sum + t.amount, 0)
 const expectedTotalForMonth = monthlyPayment * i

 const isPaid = totalPaid >= expectedTotalForMonth
 const isOverdue = !isPaid && new Date() > dueDate
 const isUpcoming = !isPaid && !isOverdue

 schedule.push({
 installmentNo: i,
 dueDate,
 amount: monthlyPayment,
 principal: Math.max(0, principalPayment),
 interest: interestPayment,
 status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'upcoming',
 remainingBalance: Math.max(0, remainingPrincipal)
 })
 }

 return schedule
 }

 const schedule = calculateEMISchedule()
 if (!schedule.length) return <div className="emi-empty">No EMI schedule available</div>

 const paidCount = schedule.filter(e => e.status === 'paid').length
 const overdueCount = schedule.filter(e => e.status === 'overdue').length
 const upcomingCount = schedule.filter(e => e.status === 'upcoming').length
 const totalInterest = schedule.reduce((sum, e) => sum + e.interest, 0)
 const totalPrincipalPaid = schedule.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.principal, 0)

 return (
 <div className="emi-schedule-container">
 <div className="emi-header">
 <div className="emi-title">
 <Calendar size={22} />
 <div>
 <h3>EMI Repayment Schedule</h3>
 <p>Monthly installment breakdown and payment status</p>
 </div>
 </div>
 <div className="emi-badges">
 <span className="badge badge-paid"> Paid: {paidCount}</span>
 <span className="badge badge-upcoming">◉ Upcoming: {upcomingCount}</span>
 <span className="badge badge-overdue"> Overdue: {overdueCount}</span>
 <button
 onClick={() => {
 const next = schedule.find(e => e.status === 'upcoming' || e.status === 'overdue')
 const msg = next
 ? `LoanHub EMI Reminder \n\nLoan: ₹${loan.amount?.toLocaleString('en-IN')} @ ${loan.interestRate}%\nEMI #${next.installment}: ₹${next.emi?.toFixed(0)} due on ${next.dueDate.toLocaleDateString('en-IN')}\n\nPaid: ${paidCount}/${schedule.length} installments\n\n— LoanHub Financial Platform`
 : `LoanHub EMI Schedule \n\nLoan: ₹${loan.amount?.toLocaleString('en-IN')} @ ${loan.interestRate}%\nAll ${paidCount} EMIs paid! \n\n— LoanHub Financial Platform`
 window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
 }}
 style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
 Share
 </button>
 </div>
 </div>

 <div className="emi-summary">
 <div className="summary-item">
 <span className="summary-label">Total Loan Amount</span>
 <span className="summary-value">₹{loan.amount?.toLocaleString('en-IN')}</span>
 </div>
 <div className="summary-item">
 <span className="summary-label">Total Interest</span>
 <span className="summary-value">₹{totalInterest?.toFixed(2)}</span>
 </div>
 <div className="summary-item">
 <span className="summary-label">Total Repayment</span>
 <span className="summary-value">₹{(loan.amount + totalInterest)?.toFixed(2)}</span>
 </div>
 <div className="summary-item">
 <span className="summary-label">Principal Paid</span>
 <span className="summary-value">₹{totalPrincipalPaid?.toFixed(2)}</span>
 </div>
 </div>

 <div className="emi-progress-bar">
 <div className="progress-bar">
 <div 
 className="progress-fill" 
 style={{ width: `${(paidCount / schedule.length) * 100}%` }}
 />
 </div>
 <p className="progress-text">{paidCount} of {schedule.length} installments paid</p>
 </div>

 <div className="emi-table-wrapper">
 <table className="emi-table">
 <thead>
 <tr>
 <th>Month</th>
 <th>Due Date</th>
 <th>EMI Amount</th>
 <th>Principal</th>
 <th>Interest</th>
 <th>Status</th>
 <th>Balance</th>
 </tr>
 </thead>
 <tbody>
 {schedule.map((emi, idx) => (
 <tr key={idx} className={`emi-row emi-${emi.status}`}>
 <td className="month-cell">
 <button 
 className="month-button"
 onClick={() => setExpandedMonth(expandedMonth === idx ? null : idx)}
 >
 #{emi.installmentNo}
 </button>
 </td>
 <td>{emi.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
 <td className="amount-cell">₹{emi.amount?.toFixed(2)}</td>
 <td className="amount-cell">₹{emi.principal?.toFixed(2)}</td>
 <td className="amount-cell">₹{emi.interest?.toFixed(2)}</td>
 <td>
 <span className={`status-badge status-${emi.status}`}>
 {emi.status === 'paid' && <CheckCircle size={16} />}
 {emi.status === 'overdue' && <AlertCircle size={16} />}
 {emi.status === 'upcoming' && <Clock size={16} />}
 {emi.status.charAt(0).toUpperCase() + emi.status.slice(1)}
 </span>
 </td>
 <td className="balance-cell">₹{emi.remainingBalance?.toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="emi-legend">
 <div className="legend-item">
 <span className="legend-color legend-paid" />
 <span>Paid — Installment completed</span>
 </div>
 <div className="legend-item">
 <span className="legend-color legend-upcoming" />
 <span>Upcoming — Due on the scheduled date</span>
 </div>
 <div className="legend-item">
 <span className="legend-color legend-overdue" />
 <span>Overdue — Payment not made after due date</span>
 </div>
 </div>
 </div>
 )
}

export default EMISchedule
