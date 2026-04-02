import { useState } from 'react'
import { TrendingDown, CheckCircle2, BarChart2, FileText as FileTextIcon, Plus, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { NotificationPreferences, NotificationLog, useEMIReminders } from '../components/NotificationSystem'
import { AgreementsList, DownloadAgreementButton } from '../components/LoanAgreement'
import { BorrowerAnalyticsPanel } from '../components/Charts'
import { EMISchedule } from '../components/EMISchedule'
import { getLoanOverdueInfo, OverdueBadge, OverdueAlert } from '../components/OverdueUtils'
import StatCard from '../components/StatCard'
import './Dashboard.css'

export default function BorrowerDashboard({ user, loans, addLoan, addTransaction, transactions, notifications = [], users = [], activeTab: propActiveTab, onTabChange }) {
 const navigate = useNavigate()
 const [showApplyLoan, setShowApplyLoan] = useState(false)
 const [formData, setFormData] = useState({ amount: '', interestRate: 5, term: 12, purpose: '' })
 const [showLegalWarning, setShowLegalWarning] = useState(false)
 const [legalAgreed, setLegalAgreed] = useState(false)
 const [showNotifications, setShowNotifications] = useState(false)
 const [localTab, setLocalTab] = useState('loans')
 const activeTab = propActiveTab || localTab
 const setActiveTab = (tab) => { setLocalTab(tab); onTabChange?.(tab) }

 // Auto-send EMI reminder notifications
 useEMIReminders(user, loans, transactions)

 const myLoans = loans.filter(l => l.borrowerName === user?.name || l.borrowerId === user?.id)
 const activeLoans = myLoans.filter(l => l.status === 'active')
 const completedLoans = myLoans.filter(l => l.status === 'completed')
 const pendingLoans = myLoans.filter(l => l.status === 'pending')
 const declinedLoans = myLoans.filter(l => l.status === 'declined')

 const totalBorrowed = activeLoans.reduce((sum, l) => sum + l.amount, 0)
 const totalPaid = transactions
 .filter(t => t.type === 'payment' && t.loanId && myLoans.find(l => l.id === t.loanId))
 .reduce((sum, t) => sum + t.amount, 0)
 const outstandingBalance = totalBorrowed - totalPaid

 // Generate payment reminder notifications (7 days before due)
 const today = new Date()
 const paymentReminders = []
 activeLoans.forEach(loan => {
 const startDate = new Date(loan.acceptedAt || loan.createdAt || loan.applicationDate || Date.now())
 const monthlyRate = loan.interestRate / 100 / 12
 const monthlyPayment = monthlyRate === 0
 ? loan.amount / loan.term
 : (loan.amount * (monthlyRate * Math.pow(1 + monthlyRate, loan.term))) / (Math.pow(1 + monthlyRate, loan.term) - 1)

 for (let i = 1; i <= loan.term; i++) {
 const dueDate = new Date(startDate)
 dueDate.setMonth(dueDate.getMonth() + i)
 const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
 if (diffDays >= 0 && diffDays <= 7) {
 paymentReminders.push({
 id: `reminder-${loan.id}-${i}`,
 loanId: loan.id,
 installment: i,
 dueDate,
 diffDays,
 amount: monthlyPayment,
 loanAmount: loan.amount,
 })
 }
 }
 })

 const stats = [
 { label: 'Total Borrowed', value: `₹${totalBorrowed.toLocaleString('en-IN')}`, icon: null, iconBg: '#e8f0fe', iconColor: '#1a73e8', accent: '#1a73e8', trend: activeLoans.length > 0 ? 5 : 0, trendLabel: 'vs last month' },
 { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: null, iconBg: '#dcfce7', iconColor: '#16a34a', accent: '#16a34a', trend: totalPaid > 0 ? 12 : 0, trendLabel: 'on track' },
 { label: 'Outstanding', value: `₹${outstandingBalance.toLocaleString('en-IN')}`, icon: null, iconBg: '#fef9c3', iconColor: '#d97706', accent: '#d97706' },
 { label: 'Active Loans', value: activeLoans.length, icon: null, iconBg: '#f3e8ff', iconColor: '#7c3aed', accent: '#7c3aed', subtitle: `${pendingLoans.length} pending approval` },
 ]

 const calculateMonthlyPayment = (principal, rate, months) => {
 const monthlyRate = rate / 100 / 12
 if (monthlyRate === 0) return principal / months
 return (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
 (Math.pow(1 + monthlyRate, months) - 1)
 }

 const handleApplyClick = () => {
 setLegalAgreed(false)
 setShowLegalWarning(true)
 }

 const handleLegalAccept = () => {
 setShowLegalWarning(false)
 setShowApplyLoan(true)
 }

 const handleApplyLoan = (e) => {
 e.preventDefault()
 if (!formData.amount || !formData.term) return
 addLoan({
 borrowerId: user?.id,
 borrowerName: user?.name,
 amount: parseFloat(formData.amount),
 interestRate: parseFloat(formData.interestRate),
 term: parseInt(formData.term),
 purpose: formData.purpose,
 status: 'pending',
 applicationDate: new Date()
 })
 setFormData({ amount: '', interestRate: 5, term: 12, purpose: '' })
 setShowApplyLoan(false)
 }

 const displayLoans = [...activeLoans, ...completedLoans, ...pendingLoans, ...declinedLoans]

 return (
 <div className="main-content">

 {/* Legal Warning Popup */}
 {showLegalWarning && (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
 <div style={{ background: 'white', borderRadius: '20px', maxWidth: '520px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
 <div style={{ background: 'linear-gradient(135deg, #c53030, #e53e3e)', padding: '28px', color: 'white', textAlign: 'center' }}>
 <div style={{ fontSize: '52px', marginBottom: '12px' }}>️</div>
 <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>Legal Loan Agreement Notice</h2>
 <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '13px' }}>Please read carefully before proceeding</p>
 </div>
 <div style={{ padding: '24px 28px' }}>
 <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
 <p style={{ margin: '0 0 10px', fontWeight: '700', color: '#c53030', fontSize: '15px' }}> Important Legal Obligations</p>
 <ul style={{ margin: 0, paddingLeft: '18px', color: '#4a5568', fontSize: '13px', lineHeight: '1.9' }}>
 <li>You are legally obligated to repay the full loan amount with agreed interest within the specified tenure.</li>
 <li>Failure to repay on time may result in <strong>legal proceedings</strong> under the Indian Contract Act, 1872 and the Recovery of Debts and Bankruptcy Act, 1993.</li>
 <li>Non-payment can lead to <strong>civil suits, asset seizure</strong>, and credit score damage affecting all future financial activities.</li>
 <li>Repeated defaults will be reported to credit bureaus (CIBIL, Experian, CRIF Highmark), permanently impacting your creditworthiness.</li>
 <li>Wilful default may attract <strong>criminal proceedings</strong> under Section 420 (Cheating) of the Indian Penal Code.</li>
 <li>The lender reserves the right to recover outstanding dues through a court-appointed recovery officer.</li>
 <li>Interest will continue to accrue on overdue amounts until full repayment is made.</li>
 </ul>
 </div>
 <div style={{ background: '#fffbeb', border: '1px solid #fbd38d', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
 <p style={{ margin: 0, color: '#744210', fontSize: '13px', lineHeight: '1.6' }}>
 <strong>Our advice:</strong> Only borrow what you can comfortably repay. Timely repayments protect your financial health and legal standing. If you face difficulties, communicate with your lender immediately.
 </p>
 </div>
 <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px', cursor: 'pointer' }}>
 <input type="checkbox" checked={legalAgreed} onChange={e => setLegalAgreed(e.target.checked)}
 style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#3182ce', flexShrink: 0 }} />
 <span style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.6' }}>I have read and fully understood the above legal terms. I agree to repay the loan on time and voluntarily accept all legal consequences in case of default.
 </span>
 </label>
 <div style={{ display: 'flex', gap: '12px' }}>
 <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowLegalWarning(false)}>Cancel</button>
 <button className="btn btn-primary" style={{ flex: 2, opacity: legalAgreed ? 1 : 0.45, cursor: legalAgreed ? 'pointer' : 'not-allowed' }}
 disabled={!legalAgreed} onClick={handleLegalAccept}>I Agree — Proceed to Apply
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 <div className="dashboard">
 <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div>
 <h1>Borrower Dashboard</h1>
 <p>Track your loans and manage payment schedules</p>
 </div>

 {/* Payment Reminder Bell */}
 <div style={{ position: 'relative' }}>
 <button className="btn btn-outline"
 style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
 onClick={() => setShowNotifications(!showNotifications)}>
 <Bell size={18} />Notifications
 {paymentReminders.length > 0 && (
 <span style={{
 background: '#e53e3e', color: 'white', borderRadius: '50%',
 width: '20px', height: '20px', fontSize: '11px', fontWeight: 'bold',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 position: 'absolute', top: '-8px', right: '-8px'
 }}>{paymentReminders.length}</span>
 )}
 </button>

 {showNotifications && (
 <div style={{
 position: 'absolute', right: 0, top: '48px', width: '380px', zIndex: 1000,
 background: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
 border: '1px solid #e2e8f0', maxHeight: '560px', overflowY: 'auto'
 }}>
 <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
 <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Notifications
 {paymentReminders.length > 0 && (
 <span style={{ marginLeft: '8px', background: '#fff5f5', color: '#e53e3e', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
 {paymentReminders.length} due soon
 </span>
 )}
 </h3>
 </div>
 {paymentReminders.length === 0 ? (
 <div style={{ padding: '32px 20px', textAlign: 'center', color: '#718096' }}>
 <div style={{ fontSize: '36px', marginBottom: '10px' }}></div>
 <p style={{ margin: 0, fontWeight: '600' }}>No upcoming payments in next 7 days</p>
 <p style={{ margin: '6px 0 0', fontSize: '13px' }}>You're all caught up!</p>
 </div>
 ) : paymentReminders.map(rem => (
 <div key={rem.id} style={{
 padding: '16px 20px', borderBottom: '1px solid #f0f4f8',
 background: rem.diffDays <= 2 ? '#fff5f5' : '#fffbeb'
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
 <span style={{ fontWeight: '700', fontSize: '14px', color: rem.diffDays <= 2 ? '#c53030' : '#b7791f' }}>
 {rem.diffDays === 0 ? ' Due TODAY!' : rem.diffDays === 1 ? '️ Due TOMORROW!' : `⏰ Due in ${rem.diffDays} days`}
 </span>
 <span style={{ fontSize: '12px', color: '#a0aec0' }}>
 {rem.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
 </span>
 </div>
 <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#4a5568' }}>Installment #{rem.installment} — Loan of ₹{rem.loanAmount?.toLocaleString('en-IN')}
 </p>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <span style={{ fontWeight: '800', fontSize: '16px', color: '#2d3748' }}>₹{rem.amount?.toFixed(2)}</span>
 <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}
 onClick={() => { navigate(`/payment/${rem.loanId}`); setShowNotifications(false) }}>Pay Now
 </button>
 </div>
 </div>
 ))}
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

 {/* KYC Status Banner */}
 {(() => {
 const kycDocs = (() => { try { return JSON.parse(localStorage.getItem(`kyc_docs_${user?.id}`) || '{}') } catch { return {} } })()
 const hasPan = user?.panCard || kycDocs.pan
 const hasAadhaar = user?.aadhaarCard || kycDocs.aadhaar
 const isVerified = hasPan && hasAadhaar
 return (
 <div style={{ margin: '16px 0', padding: '14px 20px', borderRadius: '12px', background: isVerified ? '#f0fff4' : '#fffbeb', border: `1px solid ${isVerified ? '#9ae6b4' : '#fbd38d'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <span style={{ fontSize: '22px' }}>{isVerified ? '' : '️'}</span>
 <div>
 <div style={{ fontWeight: '700', fontSize: '14px', color: isVerified ? '#276749' : '#744210' }}>KYC Status: {isVerified ? 'Verified' : 'Incomplete'}
 </div>
 <div style={{ fontSize: '12px', color: isVerified ? '#38a169' : '#d69e2e', marginTop: '2px' }}>
 {isVerified ? `PAN ${hasPan} · Aadhaar verified · Account fully activated` : 'Complete your KYC to unlock higher loan limits and faster approvals'}
 </div>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
 {[
 { label: 'PAN Card', done: !!hasPan },
 { label: 'Aadhaar', done: !!hasAadhaar },
 { label: 'Income Proof', done: !!(user?.annualIncome || kycDocs.income) },
 ].map((doc, i) => (
 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: doc.done ? '#276749' : '#a0aec0', fontWeight: '600' }}>
 <span>{doc.done ? '' : '○'}</span>{doc.label}
 </div>
 ))}
 {!isVerified && (
 <button onClick={() => setActiveTab('profile')} style={{ padding: '6px 14px', background: '#d69e2e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Complete KYC →
 </button>
 )}
 </div>
 </div>
 )
 })()}

 {/* EMI Upcoming Reminder Banner */}
 {paymentReminders.length > 0 && (
 <div style={{ margin: '0 0 16px', padding: '14px 20px', borderRadius: '12px', background: '#ebf8ff', border: '1px solid #90cdf4', display: 'flex', alignItems: 'center', gap: '14px' }}>
 <span style={{ fontSize: '22px' }}></span>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: '700', fontSize: '14px', color: '#2b6cb0' }}>EMI Due Soon</div>
 <div style={{ fontSize: '12px', color: '#3182ce', marginTop: '2px' }}>
 {paymentReminders[0].diffDays === 0
 ? `EMI of ₹${Math.round(paymentReminders[0].amount).toLocaleString('en-IN')} is due TODAY`
 : `EMI of ₹${Math.round(paymentReminders[0].amount).toLocaleString('en-IN')} due in ${paymentReminders[0].diffDays} day${paymentReminders[0].diffDays > 1 ? 's' : ''}`}
 {paymentReminders.length > 1 ? ` (+${paymentReminders.length - 1} more)` : ''}
 </div>
 </div>
 <button onClick={() => setActiveTab('schedule')} style={{ padding: '6px 14px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>View Schedule
 </button>
 </div>
 )}

 {/* Tab Navigation */}
 <div className="dashboard-tabs" style={{ marginTop: '8px' }}>
 <button className={`tab-button ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>My Loans
 </button>
 <button className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>EMI Schedule
 </button>
 <button className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics
 </button>
 <button className={`tab-button ${activeTab === 'agreements' ? 'active' : ''}`} onClick={() => setActiveTab('agreements')}>Agreements
 </button>
 <button className={`tab-button ${activeTab === 'notifications-settings' ? 'active' : ''}`} onClick={() => setActiveTab('notifications-settings')}>Notification Settings
 </button>
 <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>My Profile
 </button>
 </div>

 {/* Analytics Tab */}
 {activeTab === 'analytics' && (
 <div className="dashboard-section">
 <BorrowerAnalyticsPanel loans={loans} transactions={transactions} userId={user?.id} userName={user?.name} />
 </div>
 )}

 {/* EMI Schedule Tab */}
 {activeTab === 'schedule' && (
 <div className="dashboard-section">
 <h2 className="section-title">EMI Repayment Schedule</h2>
 <p style={{ color: '#718096', fontSize: '14px', margin: '-12px 0 20px' }}>View detailed monthly payment schedules for all your loans</p>
 {activeLoans.length === 0 ? (
 <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
 <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>No active loans yet</p>
 </div>
 ) : (
 activeLoans.map(loan => (
 <div key={loan.id}>
 <EMISchedule loan={loan} transactions={transactions} />
 </div>
 ))
 )}
 </div>
 )}

 {activeTab === 'profile' && (
 <div className="dashboard-section" style={{ marginBottom: '0' }}>
 <h2 className="section-title">My Profile</h2>
 <div style={{ background: 'white', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
 {[
 { label: ' Full Name', value: user?.name },
 { label: ' Email', value: user?.email },
 { label: ' Phone', value: user?.phone },
 { label: ' Date of Birth', value: user?.dob ? new Date(user.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
 { label: '🪪 PAN Card', value: user?.panCard || '—' },
 { label: '🆔 Aadhaar Card', value: user?.aadhaarCard ? user.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—' },
 { label: ' Annual Income', value: user?.annualIncome ? `₹${Number(user.annualIncome).toLocaleString('en-IN')}` : '—' },
 { label: '️ Role', value: 'Borrower' },
 ].map((item, i) => (
 <div key={i} style={{ padding: '10px 14px', background: '#f7fafc', borderRadius: '10px' }}>
 <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginBottom: '3px' }}>{item.label}</div>
 <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>{item.value || '—'}</div>
 </div>
 ))}
 </div>

 {/* KYC Document Upload Section */}
 <div style={{ background: 'white', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
 <div style={{ fontWeight: '700', fontSize: '15px', color: '#2d3748', marginBottom: '4px' }}>🪪 KYC Documents</div>
 <div style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>Upload supporting documents to verify your identity and unlock higher loan limits.</div>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
 {[
 { key: 'pan', label: 'PAN Card', icon: '🪪', hint: 'Upload PAN card image', prefilled: user?.panCard },
 { key: 'aadhaar', label: 'Aadhaar Card', icon: '🆔', hint: 'Upload Aadhaar front & back', prefilled: user?.aadhaarCard },
 { key: 'income', label: 'Income Proof', icon: '', hint: 'Salary slip or ITR', prefilled: user?.annualIncome },
 { key: 'bank', label: 'Bank Statement', icon: '', hint: 'Last 3 months statement', prefilled: null },
 ].map(doc => {
 const kycDocs = (() => { try { return JSON.parse(localStorage.getItem(`kyc_docs_${user?.id}`) || '{}') } catch { return {} } })()
 const isUploaded = doc.prefilled || kycDocs[doc.key]
 return (
 <div key={doc.key} style={{ border: `2px dashed ${isUploaded ? '#9ae6b4' : '#e2e8f0'}`, borderRadius: '10px', padding: '16px', textAlign: 'center', background: isUploaded ? '#f0fff4' : '#fafafa', cursor: 'pointer', transition: 'all 0.2s' }}
 onClick={() => {
 if (!isUploaded) {
 const updated = { ...kycDocs, [doc.key]: 'uploaded_' + Date.now() }
 localStorage.setItem(`kyc_docs_${user?.id}`, JSON.stringify(updated))
 window.location.reload()
 }
 }}>
 <div style={{ fontSize: '24px', marginBottom: '8px' }}>{isUploaded ? '' : doc.icon}</div>
 <div style={{ fontWeight: '700', fontSize: '13px', color: isUploaded ? '#276749' : '#4a5568' }}>{doc.label}</div>
 <div style={{ fontSize: '11px', color: isUploaded ? '#38a169' : '#a0aec0', marginTop: '4px' }}>{isUploaded ? 'Verified' : doc.hint}</div>
 {!isUploaded && (
 <div style={{ marginTop: '10px', padding: '5px 12px', background: '#667eea', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' }}>Upload</div>
 )}
 </div>
 )
 })}
 </div>
 </div>
 </div>
 )}

 {/* Agreements Tab */}
 {activeTab === 'agreements' && (
 <div className="dashboard-section">
 <h2 className="section-title">Loan Agreements</h2>
 <p style={{ color: '#718096', fontSize: '14px', margin: '-12px 0 20px' }}>Download formal loan agreement PDFs for your active and completed loans</p>
 <AgreementsList loans={loans} users={users} currentUserId={user?.id} role="borrower" />
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

 {/* Loans Tab */}
 {activeTab === 'loans' && (
 <div className="dashboard-section">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
 <h2 className="section-title">My Loans</h2>
 <button className="btn btn-primary" onClick={handleApplyClick}>
 <Plus size={18} /> Apply for Loan
 </button>
 </div>

 {showApplyLoan && (
 <div className="form-section">
 <h3 className="form-section-title">Loan Application</h3>

 {/* Eligibility Calculator */}
 {user?.annualIncome && (
 <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px' }}>
 <div style={{ fontWeight: '700', fontSize: '13px', color: '#276749', marginBottom: '8px' }}> Loan Eligibility Estimate</div>
 <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
 {[
 { label: 'Max Eligible Amount', value: `₹${Math.round(parseFloat(user.annualIncome) * 5).toLocaleString('en-IN')}` },
 { label: 'Monthly EMI (est.)', value: formData.amount && formData.term ? `₹${Math.round(calculateMonthlyPayment(parseFloat(formData.amount), parseFloat(formData.interestRate), parseInt(formData.term))).toLocaleString('en-IN')}` : '—' },
 { label: 'Annual Income', value: `₹${parseFloat(user.annualIncome).toLocaleString('en-IN')}` },
 ].map((item, i) => (
 <div key={i}>
 <div style={{ fontSize: '11px', color: '#38a169', fontWeight: '600' }}>{item.label}</div>
 <div style={{ fontSize: '15px', fontWeight: '700', color: '#276749' }}>{item.value}</div>
 </div>
 ))}
 </div>
 </div>
 )}

 <form onSubmit={handleApplyLoan}>
 <div className="form-row">
 <div className="form-group">
 <label>Loan Amount (₹)</label>
 <input type="number" value={formData.amount}
 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
 placeholder="Enter desired amount" min="100" step="100" />
 </div>
 <div className="form-group">
 <label>Loan Term (Months)</label>
 <input type="number" value={formData.term}
 onChange={(e) => setFormData({ ...formData, term: e.target.value })}
 min="1" max="360" step="1" />
 </div>
 </div>
 <div className="form-group">
 <label>Desired Interest Rate (%)</label>
 <input type="number" value={formData.interestRate}
 onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
 placeholder="Your preferred interest rate" min="1" max="30" step="0.5" />
 </div>
 <div className="form-group">
 <label>Purpose of Loan</label>
 <textarea value={formData.purpose}
 onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
 placeholder="Describe why you need this loan" />
 </div>
 <div className="btn-group">
 <button type="submit" className="btn btn-primary">Submit Application</button>
 <button type="button" className="btn btn-outline" onClick={() => setShowApplyLoan(false)}>Cancel</button>
 </div>
 </form>
 </div>
 )}

  {displayLoans.length === 0 ? (
 <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
 <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>No loans yet</p>
 <button className="btn btn-primary" onClick={handleApplyClick}>
 <Plus size={18} /> Apply for Your First Loan
 </button>
 </div>
 ) : (
 <div className="cards-grid">
 {displayLoans.map(loan => {
 const monthlyPayment = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.term)
 const totalWithInterest = monthlyPayment * loan.term
 const interestAmount = totalWithInterest - loan.amount
 const overdueInfo = getLoanOverdueInfo(loan, transactions)
 return (
 <div key={loan.id} className="card">
 <div className="card-header">
 <h3 className="card-title">₹{loan.amount?.toLocaleString('en-IN')} Loan</h3>
 <span className={`card-badge badge-${loan.status}`}>{loan.status}</span>
 </div>
 <div className="card-content">
 {overdueInfo.isOverdue && <OverdueAlert overdueInfo={overdueInfo} />}
 {loan.status === 'active' && (
 <p><strong>Monthly Payment:</strong> <span>₹{monthlyPayment.toFixed(2)}</span></p>
 )}
 <p><strong>Interest Rate:</strong> <span>{loan.interestRate}% p.a.</span></p>
 <p><strong>Term:</strong> <span>{loan.term} months</span></p>
 {loan.status === 'active' && (
 <p><strong>Total Interest:</strong> <span>₹{interestAmount.toFixed(2)}</span></p>
 )}
 {loan.purpose && <p><strong>Purpose:</strong> <span>{loan.purpose}</span></p>}
 {loan.status === 'pending' && (
 <p style={{ color: '#d69e2e', fontSize: '12px', marginTop: '8px', background: '#fffbeb', padding: '8px', borderRadius: '6px', justifyContent: 'center' }}>
 ⏳ Awaiting lender approval
 </p>
 )}
 {loan.status === 'declined' && (
 <p style={{ color: '#c53030', fontSize: '12px', marginTop: '8px', background: '#fff5f5', padding: '8px', borderRadius: '6px', border: '1px solid #fed7d7', justifyContent: 'center' }}>Application declined. You may apply again.
 </p>
 )}
 {loan.status === 'active' && (() => {
 const loanPaid = transactions.filter(t => t.type === 'payment' && t.loanId === loan.id).reduce((s, t) => s + t.amount, 0)
 return (
 <div className="progress-bar" style={{ marginTop: '12px' }}>
 <div className="progress-fill" style={{ width: `${Math.min((loanPaid / (monthlyPayment * loan.term)) * 100, 100)}%` }} />
 </div>
 )
 })()}
 </div>
 <div className="card-footer">
 <button className="btn btn-primary" onClick={() => navigate(`/loan/${loan.id}`)}>View Details</button>
 {loan.status === 'active' && (
 <button className="btn btn-secondary" onClick={() => navigate(`/payment/${loan.id}`)}>Make Payment</button>
 )}
 {(loan.status === 'active' || loan.status === 'completed') && (
 <DownloadAgreementButton compact
 loan={loan}
 lender={users.find(u => u.id === loan.lenderId)}
 borrower={user}
 />
 )}
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 )} {/* end loans tab */}
 </div>
 </div>
 )
}
