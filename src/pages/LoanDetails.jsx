import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { EMISchedule } from '../components/EMISchedule'
import { LoanMessaging } from '../components/Messaging'
import './Dashboard.css'

export default function LoanDetails({ loans, addTransaction, user, users = [] }) {
 const { id } = useParams()
 const navigate = useNavigate()
 const loan = loans.find(l => l.id === parseInt(id))
 const [paymentAmount, setPaymentAmount] = useState('')
 const [showPaymentForm, setShowPaymentForm] = useState(false)
 const [paymentSuccess, setPaymentSuccess] = useState(false)

 if (!loan) {
 return (
 <div className="main-content">
 <div className="dashboard">
 <div style={{ textAlign: 'center', padding: '40px' }}>
 <h2>Loan not found</h2>
 <button className="btn btn-primary" onClick={() => navigate(-1)}>
 Go Back
 </button>
 </div>
 </div>
 </div>
 )
 }

 const calculateMonthlyPayment = () => {
 const monthlyRate = loan.interestRate / 100 / 12
 if (monthlyRate === 0) return loan.amount / loan.term
 return (loan.amount * (monthlyRate * Math.pow(1 + monthlyRate, loan.term))) / 
 (Math.pow(1 + monthlyRate, loan.term) - 1)
 }

 const monthlyPayment = calculateMonthlyPayment()
 const totalWithInterest = monthlyPayment * loan.term
 const interestAmount = totalWithInterest - loan.amount

 const handlePayment = (e) => {
 e.preventDefault()
 if (!paymentAmount || parseFloat(paymentAmount) <= 0) return

 addTransaction({
 loanId: loan.id,
 type: 'payment',
 amount: parseFloat(paymentAmount),
 description: `Payment for ${loan.borrowerName}'s loan`
 })

 setPaymentAmount('')
 setShowPaymentForm(false)
 setPaymentSuccess(true)
 setTimeout(() => setPaymentSuccess(false), 3000)
 }

 const amortizationSchedule = Array.from({ length: loan.term }, (_, i) => {
 const month = i + 1
 return {
 month,
 payment: monthlyPayment.toFixed(2),
 principal: (loan.amount / loan.term).toFixed(2),
 interest: (monthlyPayment - (loan.amount / loan.term)).toFixed(2),
 balance: (loan.amount - (loan.amount / loan.term) * month).toFixed(2)
 }
 })

 return (
 <div className="main-content">
 <div className="dashboard">
 <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
 <ArrowLeft size={18} /> Back
 </button>

 <div className="dashboard-header">
 <h1>Loan #ID{loan.id}</h1>
 <p>{loan.borrowerName}'s Loan Details</p>
 </div>

 <div className="loan-card-expanded">
 <div className="loan-info-row">
 <div className="info-item">
 <div className="info-label">Borrower</div>
 <div className="info-value">{loan.borrowerName}</div>
 </div>
 <div className="info-item">
 <div className="info-label">Loan Amount</div>
 <div className="info-value">₹{loan.amount?.toLocaleString('en-IN')}</div>
 </div>
 <div className="info-item">
 <div className="info-label">Interest Rate</div>
 <div className="info-value">{loan.interestRate}% p.a.</div>
 </div>
 <div className="info-item">
 <div className="info-label">Loan Status</div>
 <div className="info-value" style={{ color: 'var(--secondary)' }}>
 {loan.status.toUpperCase()}
 </div>
 </div>
 </div>

 <div className="loan-info-row">
 <div className="info-item">
 <div className="info-label">Term</div>
 <div className="info-value">{loan.term} months</div>
 </div>
 <div className="info-item">
 <div className="info-label">Monthly Payment</div>
 <div className="info-value">₹{monthlyPayment.toFixed(2)}</div>
 </div>
 <div className="info-item">
 <div className="info-label">Total Interest</div>
 <div className="info-value">₹{interestAmount.toFixed(2)}</div>
 </div>
 <div className="info-item">
 <div className="info-label">Total Amount</div>
 <div className="info-value">₹{totalWithInterest.toFixed(2)}</div>
 </div>
 </div>

 <div className="loan-info-row">
 <div className="info-item">
 <div className="info-label">Purpose</div>
 <div className="info-value">{loan.purpose || 'Not specified'}</div>
 </div>
 <div className="info-item">
 <div className="info-label">Created</div>
 <div className="info-value">
 {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'N/A'}
 </div>
 </div>
 </div>
 </div>

 {loan.status === 'active' && (
 <div style={{ marginBottom: '32px' }}>
 {paymentSuccess && (
 <div className="alert alert-success" style={{ marginBottom: '12px' }}> Payment recorded successfully!</div>
 )}
 {!showPaymentForm ? (
 <button className="btn btn-secondary" onClick={() => setShowPaymentForm(true)}>
 <Send size={18} /> Make Payment
 </button>
 ) : (
 <div className="form-section">
 <h3 className="form-section-title">Record Payment</h3>
 <form onSubmit={handlePayment}>
 <div className="form-row">
 <div className="form-group">
 <label>Payment Amount (₹)</label>
 <input
 type="number"
 value={paymentAmount}
 onChange={(e) => setPaymentAmount(e.target.value)}
 placeholder={`Suggested: ₹${monthlyPayment.toFixed(2)}`}
 step="0.01"
 min="0"
 />
 </div>
 </div>
 <div className="btn-group">
 <button type="submit" className="btn btn-primary">Record Payment</button>
 <button type="button" className="btn btn-outline" onClick={() => setShowPaymentForm(false)}>Cancel</button>
 </div>
 </form>
 </div>
 )}
 </div>
 )}

 <div className="dashboard-section">
 <h2 className="section-title">Amortization Schedule</h2>
 <div className="table-container">
 <table>
 <thead>
 <tr>
 <th>Month</th>
 <th>Payment</th>
 <th>Principal</th>
 <th>Interest</th>
 <th>Balance</th>
 </tr>
 </thead>
 <tbody>
 {amortizationSchedule.slice(0, 12).map((item, idx) => (
 <tr key={idx}>
 <td>#{item.month}</td>
 <td>₹{item.payment}</td>
 <td>₹{item.principal}</td>
 <td>₹{item.interest}</td>
 <td>₹{item.balance}</td>
 </tr>
 ))}
 {loan.term > 12 && (
 <tr>
 <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)', fontStyle: 'italic' }}>
 ... showing first 12 months of {loan.term} month term
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {loan.status === 'active' && (
 <div>
 <EMISchedule loan={loan} transactions={[]} />
 </div>
 )}

 {loan.status === 'active' && (
 <LoanMessaging 
 loanId={loan.id}
 currentUserId={user?.id}
 currentUserRole={user?.role || 'borrower'}
 lenderName={loan.lenderName || 'Lender'}
 borrowerName={loan.borrowerName}
 />
 )}

 <div className="dashboard-section">
 <h2 className="section-title">Loan Summary</h2>
 <div className="cards-grid">
 <div className="card">
 <div className="card-header">
 <h3 className="card-title">Financial Overview</h3>
 </div>
 <div className="card-content">
 <p><strong>Principal:</strong> ₹{loan.amount?.toLocaleString()}</p>
 <p><strong>Interest Accrued:</strong> ₹{interestAmount.toFixed(2)}</p>
 <p><strong>Total Payable:</strong> ₹{totalWithInterest.toFixed(2)}</p>
 <p><strong>Monthly EMI:</strong> ₹{monthlyPayment.toFixed(2)}</p>
 </div>
 </div>

 <div className="card">
 <div className="card-header">
 <h3 className="card-title">Payment Schedule</h3>
 </div>
 <div className="card-content">
 <p><strong>Total Payments:</strong> {loan.term}</p>
 <p><strong>Payment Frequency:</strong> Monthly</p>
 <p><strong>Maturity Date:</strong> {loan.term} months from start</p>
 <p><strong>Due Date:</strong> Last day of each month</p>
 </div>
 </div>

 <div className="card">
 <div className="card-header">
 <h3 className="card-title">Terms & Conditions</h3>
 </div>
 <div className="card-content">
 <p><strong>Type:</strong> Amortizing Loan</p>
 <p><strong>Interest Calculation:</strong> Compound Interest</p>
 <p><strong>Prepayment:</strong> Allowed</p>
 <p><strong>Late Fee:</strong> 2% of monthly payment</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
