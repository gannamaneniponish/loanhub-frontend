import { useState } from 'react'
import { Users, Wallet, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LenderAnalyticsPanel } from '../components/Charts'
import { NotificationPreferences, NotificationLog } from '../components/NotificationSystem'
import { AgreementsList, DownloadAgreementButton } from '../components/LoanAgreement'
import { getLoanOverdueInfo, OverdueBadge } from '../components/OverdueUtils'
import StatCard from '../components/StatCard'
import './Dashboard.css'

export default function LenderDashboard({
 user, loans, updateLoan, addTransaction, transactions,
 notifications = [], markNotificationRead, markNotificationAccepted,
 markAllNotificationsRead, users = [],
 activeTab: propActiveTab, onTabChange
}) {
 const navigate = useNavigate()
 const [showNotifications, setShowNotifications] = useState(false)
 const [localTab, setLocalTab] = useState('loans')
 const activeTab = propActiveTab || localTab
 const setActiveTab = (tab) => { setLocalTab(tab); onTabChange?.(tab) }
 const [addMoneyStep, setAddMoneyStep] = useState(1) // 1=amount, 2=method details, 3=confirm, 4=success
 const [addMoneyAmount, setAddMoneyAmount] = useState('')
 const [addMoneyMethod, setAddMoneyMethod] = useState('upi')
 const [addMoneyLoading, setAddMoneyLoading] = useState(false)
 const [addMoneyError, setAddMoneyError] = useState('')
 // UPI
 const [upiId, setUpiId] = useState('')
 // Card
 const [cardNumber, setCardNumber] = useState('')
 const [cardExpiry, setCardExpiry] = useState('')
 const [cardCvv, setCardCvv] = useState('')
 const [cardName, setCardName] = useState('')
 // Net Banking
 const [bankAccount, setBankAccount] = useState('')
 const [bankIfsc, setBankIfsc] = useState('')
 const [insufficientModal, setInsufficientModal] = useState(null) // { required, available }
 const [borrowerProfileModal, setBorrowerProfileModal] = useState(null) // notif to preview before accepting
 const [flashMsg, setFlashMsg] = useState('')

 const flash = (msg) => { setFlashMsg(msg); setTimeout(() => setFlashMsg(''), 3500) }

 const myLoans = loans.filter(l => l.lenderId === user?.id)
 const totalLoaned = myLoans.reduce((sum, l) => sum + l.amount, 0)
 const totalReceived = transactions
 .filter(t => t.lenderId === user?.id && t.type === 'payment')
 .reduce((sum, t) => sum + t.amount, 0)

 // Lender's available wallet balance
 const totalDeposited = transactions.filter(t => t.lenderId === user?.id && t.type === 'deposit').reduce((s, t) => s + t.amount, 0)
 const totalDisbursed = transactions.filter(t => t.lenderId === user?.id && t.type === 'disbursement').reduce((s, t) => s + t.amount, 0)
 const availableBalance = totalDeposited - totalDisbursed + totalReceived

 // Borrowers who have loans (for details panel) — only borrowers this lender has lent to
 const borrowerLoans = myLoans.filter(l => l.borrowerId || l.borrowerName)
 const uniqueBorrowers = []
 const seen = new Set()
 for (const loan of borrowerLoans) {
 const key = loan.borrowerId || loan.borrowerName
 if (!seen.has(key)) {
 seen.add(key)
 const userRecord = users.find(u => u.id === loan.borrowerId || u.name === loan.borrowerName)
 uniqueBorrowers.push({ loan, userRecord })
 }
 }

 const stats = [
 { label: 'Available Balance', value: `₹${availableBalance.toLocaleString('en-IN')}`, icon: null, iconBg: '#e8f0fe', iconColor: '#1a73e8', accent: '#1a73e8', subtitle: 'Ready to deploy' },
 { label: 'Total Loaned', value: `₹${totalLoaned.toLocaleString('en-IN')}`, icon: null, iconBg: '#f3e8ff', iconColor: '#7c3aed', accent: '#7c3aed', trend: myLoans.filter(l=>l.status==='active').length > 0 ? 8 : 0, trendLabel: 'growth' },
 { label: 'Active Loans', value: myLoans.filter(l => l.status === 'active').length, icon: null, iconBg: '#dcfce7', iconColor: '#16a34a', accent: '#16a34a', subtitle: `${myLoans.filter(l=>l.status==='pending').length} pending` },
 { label: 'Payments Received', value: `₹${totalReceived.toLocaleString('en-IN')}`, icon: null, iconBg: '#fef9c3', iconColor: '#d97706', accent: '#d97706', trend: totalReceived > 0 ? 15 : 0, trendLabel: 'this month' },
 ]

 // Only show non-accepted notifications that this lender hasn't declined
 const activeNotifs = notifications.filter(n =>
 !n.accepted && !(n.declinedBy && n.declinedBy.includes(user?.id))
 )
 const unreadNotifs = activeNotifs.filter(n => !n.read)

 const handleAcceptBorrowerApplication = (notif) => {
 const required = parseFloat(notif.amount)
 if (availableBalance < required) {
 setInsufficientModal({ required, available: availableBalance })
 setShowNotifications(false)
 return
 }
 // Update the EXISTING pending loan — set lenderId and status to active
 updateLoan(notif.loanId, {
 lenderId: user?.id,
 status: 'active',
 acceptedAt: new Date()
 })
 // Record a disbursement transaction
 addTransaction({
 loanId: notif.loanId,
 lenderId: user?.id,
 borrowerName: notif.borrowerName,
 type: 'disbursement',
 amount: required,
 description: `Loan disbursement to ${notif.borrowerName}`
 })
 // Mark this loan's notifications as accepted for ALL lenders so no one else sees it
 if (markNotificationAccepted) markNotificationAccepted(notif.loanId)
 flash(` You have accepted ${notif.borrowerName}'s application at ${notif.interestRate}% interest!`)
 setShowNotifications(false)
 }

 const handleDeclineApplication = (notifId) => {
 if (markNotificationRead) markNotificationRead(notifId, user?.id)
 }

 const validateAddMoneyStep1 = () => {
 const amt = parseFloat(addMoneyAmount)
 if (!amt || amt < 100) { setAddMoneyError('Please enter a minimum amount of ₹100'); return false }
 setAddMoneyError(''); return true
 }

 const validateAddMoneyStep2 = () => {
 setAddMoneyError('')
 if (addMoneyMethod === 'upi') {
 if (!upiId || !upiId.includes('@')) { setAddMoneyError('Please enter a valid UPI ID (e.g. name@upi)'); return false }
 }
 if (addMoneyMethod === 'card') {
 if (!cardNumber || cardNumber.replace(/\s/g,'').length !== 16) { setAddMoneyError('Please enter a valid 16-digit card number'); return false }
 if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) { setAddMoneyError('Please enter expiry as MM/YY'); return false }
 if (!cardCvv || cardCvv.length < 3) { setAddMoneyError('Please enter a valid CVV'); return false }
 if (!cardName.trim()) { setAddMoneyError('Please enter name on card'); return false }
 }
 if (addMoneyMethod === 'netbanking') {
 if (!bankAccount || bankAccount.length < 8) { setAddMoneyError('Please enter a valid account number'); return false }
 if (!bankIfsc || bankIfsc.length < 11) { setAddMoneyError('Please enter a valid 11-character IFSC code'); return false }
 }
 return true
 }

 const handleAddMoneyConfirm = () => {
 setAddMoneyLoading(true)
 setTimeout(() => {
 addTransaction({
 lenderId: user?.id,
 type: 'deposit',
 amount: parseFloat(addMoneyAmount),
 method: addMoneyMethod,
 description: `Account top-up via ${addMoneyMethod === 'upi' ? 'UPI' : addMoneyMethod === 'card' ? 'Card' : 'Net Banking'}`
 })
 setAddMoneyLoading(false)
 setAddMoneyStep(4)
 }, 2000)
 }

 const resetAddMoney = () => {
 setAddMoneyStep(1); setAddMoneyAmount(''); setAddMoneyMethod('upi')
 setUpiId(''); setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardName('')
 setBankAccount(''); setBankIfsc(''); setAddMoneyError('')
 }

 const handleApproveLoan = (loanId) => {
 updateLoan(loanId, { status: 'active' })
 const loan = loans.find(l => l.id === loanId)
 addTransaction({
 loanId,
 lenderId: user?.id,
 type: 'disbursement',
 amount: loan.amount,
 description: `Loan disbursement to ${loan.borrowerName}`
 })
 }

 return (
 <div className="main-content">
 {/* Borrower Credit History Modal */}
 {borrowerProfileModal && (() => {
 const notif = borrowerProfileModal
 const borrowerUser = users.find(u => u.id === notif.borrowerId || u.name === notif.borrowerName)
 const borrowerAllLoans = loans.filter(l => l.borrowerId === notif.borrowerId || l.borrowerName === notif.borrowerName)
 const borrowerActive = borrowerAllLoans.filter(l => l.status === 'active')
 const borrowerCompleted = borrowerAllLoans.filter(l => l.status === 'completed')
 const borrowerPending = borrowerAllLoans.filter(l => l.status === 'pending')
 const borrowerPaid = transactions.filter(t => t.type === 'payment' && borrowerAllLoans.find(l => l.id === t.loanId))
 const totalBorrowed = borrowerActive.reduce((s, l) => s + l.amount, 0) + borrowerCompleted.reduce((s, l) => s + l.amount, 0)
 const totalPaidAmt = borrowerPaid.reduce((s, t) => s + t.amount, 0)
 // Simulate payment timeliness: check if any payments were made late (past due date)
 const latePayments = borrowerPaid.filter(t => {
 const loan = borrowerAllLoans.find(l => l.id === t.loanId)
 if (!loan || !loan.createdAt) return false
 const due = new Date(loan.createdAt)
 due.setMonth(due.getMonth() + 1)
 return new Date(t.timestamp) > due
 }).length
 const onTimePayments = borrowerPaid.length - latePayments
 const creditScore = Math.min(850, Math.max(300,
 600 + (borrowerCompleted.length * 30) + (onTimePayments * 10) - (latePayments * 25) - (borrowerActive.length * 10)
 ))
 const creditColor = creditScore >= 750 ? '#276749' : creditScore >= 650 ? '#d69e2e' : '#c53030'
 const creditLabel = creditScore >= 750 ? 'Excellent' : creditScore >= 650 ? 'Fair' : 'Poor'

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
 <div style={{ background: 'white', borderRadius: '20px', padding: '0', maxWidth: '540px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
 {/* Header */}
 <div style={{ background: 'linear-gradient(135deg, #2b6cb0, #3182ce)', borderRadius: '20px 20px 0 0', padding: '28px 28px 20px', color: 'white' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
 <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' }}>
 {notif.borrowerName?.charAt(0).toUpperCase()}
 </div>
 <div>
 <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{notif.borrowerName}</h2>
 <p style={{ margin: 0, opacity: 0.8, fontSize: '13px' }}>{borrowerUser?.email || 'Borrower'}</p>
 </div>
 </div>
 <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 18px' }}>
 <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Loan Request</p>
 <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
 <span style={{ fontWeight: '700', fontSize: '18px' }}>₹{parseFloat(notif.amount).toLocaleString('en-IN')}</span>
 <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '2px 10px', fontSize: '13px' }}>{notif.interestRate}% p.a.</span>
 <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '2px 10px', fontSize: '13px' }}>{notif.term} months</span>
 </div>
 {notif.purpose && <p style={{ margin: '8px 0 0', opacity: 0.85, fontSize: '13px' }}>Purpose: {notif.purpose}</p>}
 </div>
 </div>

 {/* Credit Score */}
 <div style={{ padding: '24px 28px 0' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7fafc', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
 <div>
 <p style={{ margin: 0, fontSize: '12px', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credit Score</p>
 <div style={{ fontSize: '38px', fontWeight: '900', color: creditColor, lineHeight: 1.1 }}>{creditScore}</div>
 <span style={{ fontSize: '13px', fontWeight: '700', color: creditColor }}>{creditLabel}</span>
 </div>
 <div style={{ textAlign: 'right' }}>
 <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `6px solid ${creditColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
 {creditScore >= 750 ? '' : creditScore >= 650 ? '' : '️'}
 </div>
 </div>
 </div>

 {/* Loan History Stats */}
 <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '14px' }}> Loan History</h3>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
 {[
 { label: 'Total Loans', value: borrowerAllLoans.length, icon: null, color: '#ebf4ff', tc: '#2b6cb0' },
 { label: 'Active Loans', value: borrowerActive.length, icon: null, color: '#f0fff4', tc: '#276749' },
 { label: 'Completed', value: borrowerCompleted.length, icon: null, color: '#f0fff4', tc: '#276749' },
 { label: 'Pending', value: borrowerPending.length, icon: '⏳', color: '#fffbeb', tc: '#b7791f' },
 ].map(({ label, value, icon, color, tc }) => (
 <div key={label} style={{ background: color, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
 <span style={{ fontSize: '22px' }}>{icon}</span>
 <div>
 <div style={{ fontWeight: '800', fontSize: '20px', color: tc }}>{value}</div>
 <div style={{ fontSize: '12px', color: '#718096' }}>{label}</div>
 </div>
 </div>
 ))}
 </div>

 {/* Payment Behaviour */}
 <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '14px' }}> Payment Behaviour</h3>
 <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
 {[
 { label: 'Total Borrowed', value: `₹${totalBorrowed.toLocaleString('en-IN')}` },
 { label: 'Total Repaid', value: `₹${totalPaidAmt.toLocaleString('en-IN')}` },
 { label: 'On-Time Payments', value: onTimePayments, color: '#276749' },
 { label: 'Late Payments', value: latePayments, color: latePayments > 0 ? '#c53030' : '#276749' },
 ].map(({ label, value, color }) => (
 <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
 <span style={{ fontSize: '13px', color: '#718096' }}>{label}</span>
 <span style={{ fontSize: '14px', fontWeight: '700', color: color || '#2d3748' }}>{value}</span>
 </div>
 ))}
 </div>

 {/* Risk Warning if poor score */}
 {creditScore < 650 && (
 <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
 <p style={{ margin: 0, color: '#c53030', fontSize: '13px', fontWeight: '600' }}>
 ️ Risk Alert: This borrower has a low credit score due to late or missed payments. Proceed with caution.
 </p>
 </div>
 )}
 {creditScore >= 750 && (
 <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
 <p style={{ margin: 0, color: '#276749', fontSize: '13px', fontWeight: '600' }}>Excellent borrower! This applicant has a strong repayment record and is low risk.
 </p>
 </div>
 )}

 {/* Action Buttons */}
 <div style={{ display: 'flex', gap: '12px', paddingBottom: '28px' }}>
 <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setBorrowerProfileModal(null)}>
 ← Go Back
 </button>
 <button className="btn btn-outline" style={{ flex: 1, borderColor: '#e53e3e', color: '#e53e3e' }}
 onClick={() => { handleDeclineApplication(notif.id); setBorrowerProfileModal(null) }}>Decline
 </button>
 <button className="btn btn-secondary" style={{ flex: 2 }}
 onClick={() => { handleAcceptBorrowerApplication(notif); setBorrowerProfileModal(null) }}>Confirm &amp; Lend
 </button>
 </div>
 </div>
 </div>
 </div>
 )
 })()}

 {/* Insufficient Balance Modal */}
 {insufficientModal && (
 <div style={{
 position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
 display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
 }}>
 <div style={{
 background: 'white', borderRadius: '16px', padding: '36px 32px', maxWidth: '420px',
 width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center'
 }}>
 <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
 <span style={{ fontSize: '32px' }}></span>
 </div>
 <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#2d3748' }}>Insufficient Balance</h2>
 <p style={{ color: '#718096', fontSize: '14px', marginBottom: '24px' }}>You don't have enough funds in your account to lend this amount.
 </p>
 <div style={{ background: '#f7fafc', borderRadius: '10px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
 <span style={{ color: '#718096', fontSize: '14px' }}>Required Amount</span>
 <span style={{ fontWeight: '700', color: '#c53030', fontSize: '15px' }}>₹{insufficientModal.required.toLocaleString('en-IN')}</span>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
 <span style={{ color: '#718096', fontSize: '14px' }}>Available Balance</span>
 <span style={{ fontWeight: '700', color: '#276749', fontSize: '15px' }}>₹{insufficientModal.available.toLocaleString('en-IN')}</span>
 </div>
 <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: '#718096', fontSize: '14px' }}>Shortfall</span>
 <span style={{ fontWeight: '800', color: '#e53e3e', fontSize: '15px' }}>₹{(insufficientModal.required - insufficientModal.available).toLocaleString('en-IN')}</span>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 className="btn btn-outline"
 style={{ flex: 1 }}
 onClick={() => setInsufficientModal(null)}>Cancel
 </button>
 <button
 className="btn btn-primary"
 style={{ flex: 1 }}
 onClick={() => { setInsufficientModal(null); setActiveTab('wallet') }}>Add Money
 </button>
 </div>
 </div>
 </div>
 )}

 <div className="dashboard">
 {flashMsg && (
 <div className="alert alert-success" style={{ marginBottom: '16px' }}>{flashMsg}</div>
 )}
 <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div>
 <h1>Lender Dashboard</h1>
 <p>Manage your loan portfolio and borrower interactions</p>
 </div>
 <div style={{ position: 'relative' }}>
 <button
 className="btn btn-outline"
 style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', borderColor: '#3182ce', color: '#3182ce', fontWeight: '700' }}
 onClick={() => setShowNotifications(!showNotifications)}
 >
 <span style={{ fontSize: '18px' }}></span>Notifications
 {unreadNotifs.length > 0 && (
 <span style={{
 background: '#e53e3e', color: 'white', borderRadius: '50%',
 width: '20px', height: '20px', fontSize: '11px', fontWeight: 'bold',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 position: 'absolute', top: '-8px', right: '-8px'
 }}>{unreadNotifs.length}</span>
 )}
 </button>

 {showNotifications && (
 <div style={{
 position: 'absolute', right: 0, top: '48px', width: '420px', zIndex: 1000,
 background: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
 border: '1px solid #e2e8f0', maxHeight: '560px', overflowY: 'auto'
 }}>
 <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a202c' }}>Notifications
 {unreadNotifs.length > 0 && (
 <span style={{ marginLeft: '8px', background: '#ebf4ff', color: '#3182ce', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
 {unreadNotifs.length} new
 </span>
 )}
 </h3>
 {unreadNotifs.length > 0 && (
 <button onClick={() => markAllNotificationsRead && markAllNotificationsRead('lender')}
 style={{ background: 'none', border: 'none', color: '#3182ce', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Mark all read
 </button>
 )}
 </div>

 {activeNotifs.length === 0 ? (
 <div style={{ padding: '32px 20px', textAlign: 'center', color: '#718096' }}>
 <div style={{ fontSize: '36px', marginBottom: '10px' }}></div>
 <p style={{ margin: 0, fontWeight: '600' }}>No pending applications</p>
 <p style={{ margin: '6px 0 0', fontSize: '13px' }}>You're all caught up!</p>
 </div>
 ) : (
 activeNotifs.slice().reverse().map(notif => (
 <div key={notif.id} style={{
 padding: '16px 20px', borderBottom: '1px solid #f0f4f8',
 background: notif.read ? 'white' : '#f0f7ff'
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
 <span style={{ fontWeight: '600', fontSize: '14px' }}>{notif.borrowerName}</span>
 <span style={{ fontSize: '11px', color: '#a0aec0' }}>
 {new Date(notif.timestamp).toLocaleDateString('en-IN')}
 </span>
 </div>
 <div style={{ fontSize: '13px', marginBottom: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
 <span style={{ background: '#ebf4ff', color: '#3182ce', borderRadius: '6px', padding: '2px 8px', fontWeight: '600' }}>
 ₹{parseFloat(notif.amount).toLocaleString('en-IN')}
 </span>
 <span style={{ background: '#f0fff4', color: '#276749', borderRadius: '6px', padding: '2px 8px' }}>
 {notif.interestRate}% p.a.
 </span>
 <span style={{ background: '#faf5ff', color: '#553c9a', borderRadius: '6px', padding: '2px 8px' }}>
 {notif.term} months
 </span>
 </div>
 {notif.purpose && (
 <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 10px 0' }}>Purpose: {notif.purpose}</p>
 )}
 {!notif.read ? (
 <div style={{ display: 'flex', gap: '8px' }}>
 <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}
 onClick={() => { setBorrowerProfileModal(notif); setShowNotifications(false) }}>Review &amp; Lend
 </button>
 <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px' }}
 onClick={() => handleDeclineApplication(notif.id)}>Decline
 </button>
 </div>
 ) : (
 <span style={{ fontSize: '11px', color: '#a0aec0' }}> Reviewed</span>
 )}
 </div>
 ))
 )}
 <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px' }}>
 <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#4a5568' }}> Notification Log</h4>
 <NotificationLog userId={user?.id} />
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="stats-grid stagger-children">
 {stats.map((stat, idx) => (
 <StatCard
 key={idx}
 label={stat.label}
 value={stat.value}
 icon={stat.icon}
 iconBg={stat.iconBg}
 iconColor={stat.iconColor}
 accent={stat.accent}
 trend={stat.trend}
 trendLabel={stat.trendLabel}
 subtitle={stat.subtitle}
 />
 ))}
 </div>

 {/* Portfolio Health & Diversification */}
 {myLoans.length > 0 && (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', margin: '16px 0' }}>
 {/* Repayment Health */}
 <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
 <div style={{ fontWeight: '700', fontSize: '13px', color: '#4a5568', marginBottom: '12px' }}> Repayment Health by Borrower</div>
 {uniqueBorrowers.slice(0, 4).map(({ loan, userRecord }, i) => {
 const borrowerPaid = transactions.filter(t => t.loanId === loan.id && t.type === 'payment').reduce((s,t) => s+t.amount, 0)
 const monthlyRate = loan.interestRate / 100 / 12
 const emi = monthlyRate === 0 ? loan.amount / loan.term : (loan.amount * (monthlyRate * Math.pow(1+monthlyRate, loan.term))) / (Math.pow(1+monthlyRate, loan.term) - 1)
 const start = new Date(loan.acceptedAt || loan.createdAt || Date.now())
 const monthsElapsed = Math.max(1, Math.floor((Date.now() - start) / (1000*60*60*24*30)))
 const expected = Math.min(emi * monthsElapsed, loan.amount)
 const health = expected > 0 ? Math.min(100, Math.round((borrowerPaid / expected) * 100)) : 100
 const color = health >= 80 ? '#38a169' : health >= 50 ? '#d69e2e' : '#e53e3e'
 return (
 <div key={i} style={{ marginBottom: '10px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
 <span style={{ color: '#4a5568', fontWeight: '600' }}>{loan.borrowerName}</span>
 <span style={{ color, fontWeight: '700' }}>{health}%</span>
 </div>
 <div style={{ height: '6px', background: '#edf2f7', borderRadius: '3px' }}>
 <div style={{ height: '100%', width: `${health}%`, background: color, borderRadius: '3px', transition: 'width 0.6s' }} />
 </div>
 </div>
 )
 })}
 </div>
 {/* Portfolio Diversification */}
 <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
 <div style={{ fontWeight: '700', fontSize: '13px', color: '#4a5568', marginBottom: '12px' }}> Portfolio by Status</div>
 {[
 { label: 'Active', color: '#38a169', count: myLoans.filter(l=>l.status==='active').length },
 { label: 'Completed', color: '#3182ce', count: myLoans.filter(l=>l.status==='completed').length },
 { label: 'Pending', color: '#d69e2e', count: myLoans.filter(l=>l.status==='pending').length },
 { label: 'Declined', color: '#e53e3e', count: myLoans.filter(l=>l.status==='declined').length },
 ].map((s, i) => (
 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
 <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
 <span style={{ flex: 1, fontSize: '13px', color: '#4a5568' }}>{s.label}</span>
 <div style={{ flex: 2, height: '8px', background: '#edf2f7', borderRadius: '4px' }}>
 <div style={{ height: '100%', width: `${myLoans.length > 0 ? (s.count / myLoans.length) * 100 : 0}%`, background: s.color, borderRadius: '4px' }} />
 </div>
 <span style={{ fontSize: '12px', fontWeight: '700', color: '#718096', minWidth: '20px', textAlign: 'right' }}>{s.count}</span>
 </div>
 ))}
 <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #edf2f7', fontSize: '12px', color: '#718096' }}>Total portfolio: ₹{totalLoaned.toLocaleString('en-IN')} across {myLoans.length} loans
 </div>
 </div>
 </div>
 )}

 {/* Tabs */}
 <div className="dashboard-tabs">
 <button className={`tab-button ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>My Loans
 </button>
 <button className={`tab-button ${activeTab === 'loan-applications' ? 'active' : ''}`} onClick={() => setActiveTab('loan-applications')} style={{ position: 'relative' }}>Loan Applications
 {unreadNotifs.length > 0 && (
 <span style={{
 background: '#e53e3e', color: 'white', borderRadius: '50%',
 width: '18px', height: '18px', fontSize: '10px', fontWeight: 'bold',
 display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
 marginLeft: '6px', verticalAlign: 'middle'
 }}>{unreadNotifs.length}</span>
 )}
 </button>
 <button className={`tab-button ${activeTab === 'agreements' ? 'active' : ''}`} onClick={() => setActiveTab('agreements')}>Agreements
 </button>
 <button className={`tab-button ${activeTab === 'borrowers' ? 'active' : ''}`} onClick={() => setActiveTab('borrowers')}>
 <Users size={18} /> Borrower Details
 </button>
 <button className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics
 </button>
 <button className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
 <Wallet size={18} /> Add Money to Account
 </button>
 <button className={`tab-button ${activeTab === 'notifications-settings' ? 'active' : ''}`} onClick={() => setActiveTab('notifications-settings')}>Notification Settings
 </button>
 <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>My Profile
 </button>
 </div>

 {/* Loan Applications Tab */}
 {activeTab === 'loan-applications' && (
 <div className="dashboard-section">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
 <div>
 <h2 className="section-title">Loan Applications</h2>
 <p style={{ color: '#718096', fontSize: '14px', margin: '4px 0 0' }}>Review and respond to borrower loan requests</p>
 </div>
 {unreadNotifs.length > 0 && (
 <button onClick={() => markAllNotificationsRead && markAllNotificationsRead('lender')}
 style={{ background: 'none', border: '1px solid #3182ce', borderRadius: '8px', color: '#3182ce', cursor: 'pointer', fontSize: '13px', padding: '6px 14px', fontWeight: '600' }}>Mark all read
 </button>
 )}
 </div>
 {activeNotifs.length === 0 ? (
 <div className="card" style={{ textAlign: 'center', padding: '48px 40px' }}>
 <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
 <p style={{ fontWeight: '700', fontSize: '16px', color: '#2d3748', margin: '0 0 8px' }}>No pending applications</p>
 <p style={{ color: '#a0aec0', fontSize: '14px', margin: 0 }}>New borrower loan requests will appear here for your review.</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 {activeNotifs.slice().reverse().map(notif => (
 <div key={notif.id} className="card" style={{
 padding: '0', overflow: 'hidden',
 border: notif.read ? '1px solid #e2e8f0' : '2px solid #bee3f8',
 background: notif.read ? 'white' : '#f0f7ff'
 }}>
 <div style={{ padding: '20px 24px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#bee3f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#2b6cb0', fontSize: '18px' }}>
 {notif.borrowerName?.charAt(0).toUpperCase()}
 </div>
 <div>
 <div style={{ fontWeight: '700', fontSize: '15px', color: '#2d3748' }}>{notif.borrowerName}</div>
 <div style={{ fontSize: '12px', color: '#a0aec0' }}>{new Date(notif.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
 </div>
 </div>
 {!notif.read && (
 <span style={{ background: '#ebf4ff', color: '#3182ce', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>NEW</span>
 )}
 </div>
 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
 <span style={{ background: '#ebf4ff', color: '#3182ce', borderRadius: '8px', padding: '4px 12px', fontWeight: '700', fontSize: '14px' }}>
 ₹{parseFloat(notif.amount).toLocaleString('en-IN')}
 </span>
 <span style={{ background: '#f0fff4', color: '#276749', borderRadius: '8px', padding: '4px 12px', fontWeight: '600', fontSize: '13px' }}>
 {notif.interestRate}% p.a.
 </span>
 <span style={{ background: '#faf5ff', color: '#553c9a', borderRadius: '8px', padding: '4px 12px', fontWeight: '600', fontSize: '13px' }}>
 {notif.term} months
 </span>
 </div>
 {notif.purpose && (
 <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 14px', lineHeight: '1.5' }}>
 <strong>Purpose:</strong> {notif.purpose}
 </p>
 )}
 {!notif.read ? (
 <div style={{ display: 'flex', gap: '10px' }}>
 <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}
 onClick={() => setBorrowerProfileModal(notif)}>Review &amp; Lend
 </button>
 <button className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '13px', borderColor: '#e53e3e', color: '#e53e3e' }}
 onClick={() => handleDeclineApplication(notif.id)}>Decline
 </button>
 </div>
 ) : (
 <span style={{ fontSize: '12px', color: '#a0aec0', fontStyle: 'italic' }}> Reviewed</span>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Analytics Tab */}
 {activeTab === 'analytics' && (
 <div className="dashboard-section">
 <LenderAnalyticsPanel loans={loans} transactions={transactions} userId={user?.id} />
 </div>
 )}

 {/* Agreements Tab */}
 {activeTab === 'agreements' && (
 <div className="dashboard-section">
 <h2 className="section-title">Loan Agreements</h2>
 <p style={{ color: '#718096', fontSize: '14px', margin: '-12px 0 20px' }}>Download formal loan agreement PDFs for all executed loans</p>
 <AgreementsList loans={loans} users={users} currentUserId={user?.id} role="lender" />
 </div>
 )}

 {/* Notification Settings Tab */}
 {activeTab === 'notifications-settings' && (
 <div className="dashboard-section">
 <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
 <NotificationPreferences user={user} />
 </div>
 </div>
 )}

 {/* My Profile Tab */}
 {activeTab === 'profile' && (
 <div className="dashboard-section">
 <h2 className="section-title">My Profile</h2>
 <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
 {[
 { label: ' Full Name', value: user?.name },
 { label: ' Email', value: user?.email },
 { label: ' Phone', value: user?.phone },
 { label: ' Date of Birth', value: user?.dob ? new Date(user.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
 { label: '🪪 PAN Card', value: user?.panCard || '—' },
 { label: '🆔 Aadhaar Card', value: user?.aadhaarCard ? user.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—' },
 { label: ' Annual Income', value: user?.annualIncome ? `₹${Number(user.annualIncome).toLocaleString('en-IN')}` : '—' },
 { label: '️ Role', value: 'Lender' },
 ].map((item, i) => (
 <div key={i} style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '10px' }}>
 <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginBottom: '3px' }}>{item.label}</div>
 <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>{item.value || '—'}</div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* My Loans Tab */}
 {activeTab === 'loans' && (
 <div className="dashboard-section">
 <div style={{ marginBottom: '20px' }}>
 <h2 className="section-title">My Loans</h2>
 <p style={{ color: '#718096', fontSize: '14px', margin: '4px 0 0' }}>Loans you have funded by accepting borrower applications</p>
 </div>

  {myLoans.length === 0 ? (
 <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
 <p style={{ color: 'var(--text-light)', marginBottom: '12px' }}>No active loans yet</p>
 <p style={{ color: '#a0aec0', fontSize: '13px' }}>Accept borrower applications from the Loan Applications tab to start lending.</p>
 </div>
 ) : (
 <div className="cards-grid">
 {myLoans.map(loan => {
 const overdueInfo = getLoanOverdueInfo(loan, transactions)
 return (
 <div key={loan.id} className="card">
 <div className="card-header">
 <h3 className="card-title">{loan.borrowerName}</h3>
 <span className={`card-badge badge-${loan.status}`}>{loan.status}</span>
 </div>
 <div className="card-content">
 <p><strong>Amount:</strong> <span>₹{loan.amount?.toLocaleString('en-IN')}</span></p>
 <p><strong>Interest Rate:</strong> <span>{loan.interestRate}% p.a.</span></p>
 <p><strong>Term:</strong> <span>{loan.term} months</span></p>
 {loan.purpose && <p><strong>Purpose:</strong> <span>{loan.purpose}</span></p>}
 {overdueInfo.isOverdue && (
 <p style={{ color: '#c53030', fontSize: '12px', marginTop: '8px', background: '#fff5f5', padding: '8px', borderRadius: '6px', border: '1px solid #fed7d7', fontWeight: '600', justifyContent: 'center' }}>
 ️ {overdueInfo.daysLate} day{overdueInfo.daysLate !== 1 ? 's' : ''} overdue
 </p>
 )}
 </div>
 <div className="card-footer">
 {loan.status === 'pending' && (
 <>
 <button className="btn btn-secondary" onClick={() => handleApproveLoan(loan.id)}>Approve</button>
 <button className="btn btn-outline">Reject</button>
 </>
 )}
 {loan.status !== 'pending' && (
 <>
 <button className="btn btn-primary" onClick={() => navigate(`/loan/${loan.id}`)}>View Details</button>
 {(loan.status === 'active' || loan.status === 'completed') && (
 <DownloadAgreementButton compact
 loan={loan}
 lender={user}
 borrower={users.find(u => u.id === loan.borrowerId || u.name === loan.borrowerName)}
 />
 )}
 </>
 )}
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 )}

 {/* Add Money to Account Tab */}
 {activeTab === 'wallet' && (
 <div className="dashboard-section">
 <h2 className="section-title">Add Money to Account</h2>
 <p style={{ color: '#718096', fontSize: '14px', marginBottom: '28px' }}>Top up your lending account to fund more loans</p>

 <div style={{ maxWidth: '580px', margin: '0 auto' }}>

 {/* Balance Card */}
 <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)', color: 'white', padding: '28px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
 <Wallet size={26} />
 <span style={{ fontSize: '15px', fontWeight: '600', opacity: 0.9 }}>Available Balance</span>
 </div>
 <div style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1px' }}>
 ₹{availableBalance.toLocaleString('en-IN')}
 </div>
 <div style={{ marginTop: '8px', fontSize: '13px', opacity: 0.75 }}>Total deposited: ₹{totalDeposited.toLocaleString('en-IN')} &nbsp;·&nbsp; Disbursed: ₹{totalDisbursed.toLocaleString('en-IN')}
 </div>
 </div>

 {/* Step indicator */}
 {addMoneyStep < 4 && (
 <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
 {['Amount', 'Payment Details', 'Confirm'].map((label, i) => {
 const s = i + 1
 const active = addMoneyStep === s
 const done = addMoneyStep > s
 return (
 <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
 <div style={{
 width: '30px', height: '30px', borderRadius: '50%', display: 'flex',
 alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px',
 background: done ? '#38a169' : active ? '#3182ce' : '#e2e8f0',
 color: done || active ? 'white' : '#a0aec0'
 }}>{done ? '' : s}</div>
 <span style={{ fontSize: '11px', fontWeight: '600', color: active ? '#3182ce' : done ? '#38a169' : '#a0aec0', whiteSpace: 'nowrap' }}>{label}</span>
 </div>
 {i < 2 && <div style={{ flex: 1, height: '2px', background: done ? '#38a169' : '#e2e8f0', margin: '0 4px', marginBottom: '20px' }} />}
 </div>
 )
 })}
 </div>
 )}

 {/* STEP 1 — Enter Amount */}
 {addMoneyStep === 1 && (
 <div className="card" style={{ padding: '28px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '15px', fontWeight: '700' }}>
 <PlusCircle size={17} style={{ marginRight: '8px', verticalAlign: 'middle' }} />How much do you want to add?
 </h3>

 <div className="form-group">
 <label>Amount (₹)</label>
 <input type="number" value={addMoneyAmount}
 onChange={e => { setAddMoneyAmount(e.target.value); setAddMoneyError('') }}
 placeholder="Enter amount (min ₹100)" min="100" step="100"
 style={{ fontSize: '18px', fontWeight: '700' }} />
 </div>

 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
 {[5000, 10000, 25000, 50000, 100000].map(amt => (
 <button key={amt} type="button"
 onClick={() => { setAddMoneyAmount(String(amt)); setAddMoneyError('') }}
 style={{
 padding: '7px 16px', borderRadius: '20px', border: '1.5px solid',
 borderColor: addMoneyAmount === String(amt) ? '#3182ce' : '#e2e8f0',
 background: addMoneyAmount === String(amt) ? '#3182ce' : '#f7fafc',
 color: addMoneyAmount === String(amt) ? 'white' : '#4a5568',
 fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s'
 }}>
 ₹{amt.toLocaleString('en-IN')}
 </button>
 ))}
 </div>

 <div className="form-group" style={{ marginBottom: '8px' }}>
 <label>Select Payment Method</label>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
 {[
 { id: 'upi', icon: null, label: 'UPI', desc: 'Pay via any UPI app instantly — GPay, PhonePe, Paytm' },
 { id: 'card', icon: null, label: 'Debit / Credit Card', desc: 'Visa, Mastercard, RuPay accepted' },
 { id: 'netbanking', icon: null, label: 'Net Banking', desc: 'Direct bank transfer via NEFT / IMPS' },
 ].map(m => (
 <label key={m.id} style={{
 display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
 borderRadius: '10px', border: `2px solid ${addMoneyMethod === m.id ? '#3182ce' : '#e2e8f0'}`,
 background: addMoneyMethod === m.id ? '#ebf8ff' : 'white', cursor: 'pointer', transition: 'all 0.15s'
 }}>
 <input type="radio" name="addMethod" value={m.id}
 checked={addMoneyMethod === m.id}
 onChange={() => { setAddMoneyMethod(m.id); setAddMoneyError('') }}
 style={{ width: '17px', height: '17px', accentColor: '#3182ce' }} />
 <span style={{ fontSize: '22px' }}>{m.icon}</span>
 <div>
 <div style={{ fontWeight: '700', fontSize: '14px', color: '#2d3748' }}>{m.label}</div>
 <div style={{ fontSize: '12px', color: '#a0aec0' }}>{m.desc}</div>
 </div>
 </label>
 ))}
 </div>
 </div>

 {addMoneyError && (
 <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', color: '#c53030', fontSize: '13px', margin: '12px 0' }}>
 ️ {addMoneyError}
 </div>
 )}

 <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '13px' }}
 onClick={() => { if (validateAddMoneyStep1()) setAddMoneyStep(2) }}>Continue → Enter Payment Details
 </button>
 </div>
 )}

 {/* STEP 2 — Payment Details */}
 {addMoneyStep === 2 && (
 <div className="card" style={{ padding: '28px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '6px', fontSize: '15px', fontWeight: '700' }}>
 {addMoneyMethod === 'upi' ? ' UPI Payment' : addMoneyMethod === 'card' ? ' Card Payment' : ' Net Banking'}
 </h3>
 <p style={{ color: '#718096', fontSize: '13px', marginBottom: '20px' }}>Adding ₹{parseFloat(addMoneyAmount).toLocaleString('en-IN')} to your account
 </p>

 {/* UPI Fields */}
 {addMoneyMethod === 'upi' && (
 <div>
 <div className="form-group">
 <label>UPI ID</label>
 <input type="text" value={upiId}
 onChange={e => { setUpiId(e.target.value); setAddMoneyError('') }}
 placeholder="yourname@upi" />
 <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '6px' }}>Examples: mobilenumber@jio, name@okaxis, number@paytm
 </p>
 </div>
 <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: '#276749' }}>Instant transfer · No extra charges · Works 24/7
 </div>
 </div>
 )}

 {/* Card Fields */}
 {addMoneyMethod === 'card' && (
 <div>
 <div className="form-group">
 <label>Card Number</label>
 <input type="text" value={cardNumber}
 onChange={e => {
 const v = e.target.value.replace(/[^\d]/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19)
 setCardNumber(v); setAddMoneyError('')
 }}
 placeholder="1234 5678 9012 3456" maxLength={19} />
 </div>
 <div className="form-row">
 <div className="form-group">
 <label>Expiry Date</label>
 <input type="text" value={cardExpiry}
 onChange={e => {
 let v = e.target.value.replace(/[^\d]/g,'')
 if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2,4)
 setCardExpiry(v); setAddMoneyError('')
 }}
 placeholder="MM/YY" maxLength={5} />
 </div>
 <div className="form-group">
 <label>CVV</label>
 <input type="password" value={cardCvv}
 onChange={e => { setCardCvv(e.target.value.replace(/[^\d]/g,'').slice(0,4)); setAddMoneyError('') }}
 placeholder="•••" maxLength={4} />
 </div>
 </div>
 <div className="form-group">
 <label>Name on Card</label>
 <input type="text" value={cardName}
 onChange={e => { setCardName(e.target.value); setAddMoneyError('') }}
 placeholder="As printed on your card" />
 </div>
 <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#2b6cb0' }}>Your card details are encrypted and secure. We do not store card information.
 </div>
 </div>
 )}

 {/* Net Banking Fields */}
 {addMoneyMethod === 'netbanking' && (
 <div>
 <div className="form-group">
 <label>Account Number</label>
 <input type="text" value={bankAccount}
 onChange={e => { setBankAccount(e.target.value.replace(/\D/g,'')); setAddMoneyError('') }}
 placeholder="Enter your bank account number" />
 </div>
 <div className="form-group">
 <label>IFSC Code</label>
 <input type="text" value={bankIfsc}
 onChange={e => { setBankIfsc(e.target.value.toUpperCase().slice(0,11)); setAddMoneyError('') }}
 placeholder="e.g. SBIN0001234" maxLength={11} />
 <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '6px' }}>Find IFSC on your cheque book or bank passbook
 </p>
 </div>
 <div style={{ background: '#faf5ff', border: '1px solid #d6bcfa', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#553c9a' }}>Transfer will be processed via NEFT/IMPS within minutes during banking hours.
 </div>
 </div>
 )}

 {addMoneyError && (
 <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', color: '#c53030', fontSize: '13px', margin: '12px 0' }}>
 ️ {addMoneyError}
 </div>
 )}

 <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
 <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setAddMoneyStep(1); setAddMoneyError('') }}>
 ← Back
 </button>
 <button className="btn btn-primary" style={{ flex: 2, padding: '13px' }}
 onClick={() => { if (validateAddMoneyStep2()) setAddMoneyStep(3) }}>Review →
 </button>
 </div>
 </div>
 )}

 {/* STEP 3 — Confirm */}
 {addMoneyStep === 3 && (
 <div className="card" style={{ padding: '28px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '15px', fontWeight: '700' }}>Confirm Deposit</h3>

 <div style={{ background: '#f7fafc', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
 {[
 { label: 'Amount to Add', value: `₹${parseFloat(addMoneyAmount).toLocaleString('en-IN')}`, highlight: true },
 { label: 'Payment Method', value: addMoneyMethod === 'upi' ? `UPI — ${upiId}` : addMoneyMethod === 'card' ? `Card ending ****${cardNumber.replace(/\s/g,'').slice(-4)}` : `Net Banking — ${bankIfsc}` },
 { label: 'Current Balance', value: `₹${availableBalance.toLocaleString('en-IN')}` },
 { label: 'Balance After Deposit', value: `₹${(availableBalance + parseFloat(addMoneyAmount)).toLocaleString('en-IN')}`, highlight: true },
 ].map(({ label, value, highlight }) => (
 <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
 <span style={{ fontSize: '13px', color: '#718096' }}>{label}</span>
 <span style={{ fontSize: highlight ? '15px' : '14px', fontWeight: highlight ? '800' : '600', color: highlight ? '#3182ce' : '#2d3748' }}>{value}</span>
 </div>
 ))}
 </div>

 <div style={{ background: '#fffbeb', border: '1px solid #fbd38d', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#744210', marginBottom: '20px' }}>
 ️ Please confirm the details above before proceeding. This will add funds to your lending account.
 </div>

 <div style={{ display: 'flex', gap: '10px' }}>
 <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setAddMoneyStep(2)}>← Back</button>
 <button className="btn btn-primary" style={{ flex: 2, padding: '13px' }}
 onClick={handleAddMoneyConfirm} disabled={addMoneyLoading}>
 {addMoneyLoading ? (
 <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
 <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '3px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Processing...
 </span>
 ) : `Confirm & Add ₹${parseFloat(addMoneyAmount).toLocaleString('en-IN')}`}
 </button>
 </div>
 </div>
 )}

 {/* STEP 4 — Success */}
 {addMoneyStep === 4 && (
 <div className="card" style={{ padding: '48px 32px', textAlign: 'center' }}>
 <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
 <span style={{ fontSize: '36px' }}></span>
 </div>
 <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '800', color: '#2d3748' }}>Money Added!</h2>
 <p style={{ color: '#718096', marginBottom: '24px' }}>
 ₹{parseFloat(addMoneyAmount).toLocaleString('en-IN')} has been added to your account via {addMoneyMethod === 'upi' ? 'UPI' : addMoneyMethod === 'card' ? 'Card' : 'Net Banking'}
 </p>
 <div style={{ background: '#f7fafc', borderRadius: '10px', padding: '16px', marginBottom: '28px', textAlign: 'left' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
 <span style={{ color: '#718096', fontSize: '13px' }}>Amount Added</span>
 <span style={{ fontWeight: '700', color: '#38a169' }}>+₹{parseFloat(addMoneyAmount).toLocaleString('en-IN')}</span>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: '#718096', fontSize: '13px' }}>New Balance</span>
 <span style={{ fontWeight: '700', color: '#2d3748' }}>₹{(availableBalance + parseFloat(addMoneyAmount)).toLocaleString('en-IN')}</span>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
 <button className="btn btn-primary" onClick={() => { resetAddMoney(); setActiveTab('loans') }}>Go to My Loans</button>
 <button className="btn btn-outline" onClick={resetAddMoney}>Add More Money</button>
 </div>
 </div>
 )}

 {/* Deposit History */}
 {addMoneyStep === 1 && transactions.filter(t => t.lenderId === user?.id && t.type === 'deposit').length > 0 && (
 <div className="card" style={{ padding: '24px', marginTop: '20px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>Recent Deposits</h3>
 {transactions.filter(t => t.lenderId === user?.id && t.type === 'deposit').slice().reverse().slice(0, 5).map((t, i) => (
 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f4f8' }}>
 <div>
 <div style={{ fontWeight: '600', fontSize: '14px' }}>{t.description}</div>
 <div style={{ fontSize: '12px', color: '#a0aec0' }}>{new Date(t.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
 </div>
 <span style={{ fontWeight: '700', color: '#276749', fontSize: '15px' }}>+₹{t.amount?.toLocaleString('en-IN')}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* Borrower Details Tab */}
 {activeTab === 'borrowers' && (
 <div className="dashboard-section">
 <h2 className="section-title">Borrower Credit History</h2>
 <p style={{ color: '#718096', fontSize: '14px', margin: '-12px 0 20px' }}>Credit profile and repayment track record of your borrowers</p>
 {uniqueBorrowers.length === 0 ? (
 <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
 <p style={{ color: 'var(--text-light)' }}>No borrower data available yet. Accept loan applications to see borrower profiles here.</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
 {uniqueBorrowers.map(({ loan, userRecord }, idx) => {
 const borrowerAllLoans = loans.filter(l => l.borrowerId === loan.borrowerId || l.borrowerName === loan.borrowerName)
 const bActive = borrowerAllLoans.filter(l => l.status === 'active').length
 const bCompleted = borrowerAllLoans.filter(l => l.status === 'completed').length
 const bPending = borrowerAllLoans.filter(l => l.status === 'pending').length
 const borrowerPaid = transactions.filter(t => t.type === 'payment' && borrowerAllLoans.find(l => l.id === t.loanId))
 const totalBorrowed = borrowerAllLoans.filter(l => l.status !== 'pending').reduce((s, l) => s + l.amount, 0)
 const totalRepaid = borrowerPaid.reduce((s, t) => s + t.amount, 0)
 const latePayments = borrowerPaid.filter(t => {
 const bl = borrowerAllLoans.find(l => l.id === t.loanId)
 if (!bl || !bl.createdAt) return false
 const due = new Date(bl.createdAt); due.setMonth(due.getMonth() + 1)
 return new Date(t.timestamp) > due
 }).length
 const onTimePayments = borrowerPaid.length - latePayments
 const creditScore = Math.min(850, Math.max(300, 600 + (bCompleted * 30) + (onTimePayments * 10) - (latePayments * 25) - (bActive * 10)))
 const creditColor = creditScore >= 750 ? '#276749' : creditScore >= 650 ? '#d69e2e' : '#c53030'
 const creditBg = creditScore >= 750 ? '#f0fff4' : creditScore >= 650 ? '#fffbeb' : '#fff5f5'
 const creditLabel = creditScore >= 750 ? 'Excellent' : creditScore >= 650 ? 'Fair' : 'Poor'

 return (
 <div key={idx} className="card" style={{ padding: '0', overflow: 'hidden' }}>
 {/* Card header */}
 <div style={{ background: 'linear-gradient(135deg, #f7fafc, #edf2f7)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
 {(() => {
 const photo = userRecord ? localStorage.getItem(`profile_photo_${userRecord.id}`) : null
 return photo
 ? <img src={photo} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
 : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#bee3f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#2b6cb0', fontSize: '18px', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
 {loan.borrowerName?.charAt(0).toUpperCase()}
 </div>
 })()}
 <div>
 <div style={{ fontWeight: '700', fontSize: '16px', color: '#2d3748' }}>{loan.borrowerName}</div>
 <div style={{ fontSize: '13px', color: '#718096' }}>{userRecord?.email || 'No email on record'}</div>
 {userRecord?.phone && <div style={{ fontSize: '12px', color: '#a0aec0' }}> {userRecord.phone}</div>}
 </div>
 </div>
 {/* Credit Score Badge */}
 <div style={{ textAlign: 'center', background: creditBg, border: `2px solid ${creditColor}`, borderRadius: '14px', padding: '10px 18px', minWidth: '110px' }}>
 <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credit Score</div>
 <div style={{ fontSize: '28px', fontWeight: '900', color: creditColor, lineHeight: 1.1 }}>{creditScore}</div>
 <div style={{ fontSize: '12px', fontWeight: '700', color: creditColor }}>{creditLabel}</div>
 </div>
 </div>

 {/* Stats row */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
 {[
 { label: 'Total Loans', value: borrowerAllLoans.length, color: '#2b6cb0', bg: '#ebf4ff' },
 { label: 'Active', value: bActive, color: '#276749', bg: '#f0fff4' },
 { label: 'Completed', value: bCompleted, color: '#276749', bg: '#f0fff4' },
 { label: 'On-Time Payments', value: onTimePayments, color: latePayments > 0 ? '#d69e2e' : '#276749', bg: latePayments > 0 ? '#fffbeb' : '#f0fff4' },
 ].map(({ label, value, color, bg }) => (
 <div key={label} style={{ padding: '14px 18px', borderRight: '1px solid #e2e8f0', background: bg, textAlign: 'center' }}>
 <div style={{ fontSize: '22px', fontWeight: '800', color }}>{value}</div>
 <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginTop: '2px' }}>{label}</div>
 </div>
 ))}
 </div>

 {/* Repayment detail */}
 <div style={{ padding: '16px 24px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
 <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
 <div>
 <div style={{ fontSize: '12px', color: '#a0aec0', fontWeight: '600' }}>Total Borrowed</div>
 <div style={{ fontWeight: '700', color: '#2d3748', fontSize: '15px' }}>₹{totalBorrowed.toLocaleString('en-IN')}</div>
 </div>
 <div>
 <div style={{ fontSize: '12px', color: '#a0aec0', fontWeight: '600' }}>Total Repaid</div>
 <div style={{ fontWeight: '700', color: '#276749', fontSize: '15px' }}>₹{totalRepaid.toLocaleString('en-IN')}</div>
 </div>
 <div>
 <div style={{ fontSize: '12px', color: '#a0aec0', fontWeight: '600' }}>Late Payments</div>
 <div style={{ fontWeight: '700', color: latePayments > 0 ? '#c53030' : '#276749', fontSize: '15px' }}>{latePayments}</div>
 </div>
 </div>
 {latePayments > 0 && (
 <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#c53030', fontWeight: '600' }}>
 ️ This borrower has {latePayments} late payment{latePayments > 1 ? 's' : ''} on record
 </div>
 )}
 {latePayments === 0 && onTimePayments > 0 && (
 <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#276749', fontWeight: '600' }}>All {onTimePayments} payments made on time
 </div>
 )}
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 )
}
