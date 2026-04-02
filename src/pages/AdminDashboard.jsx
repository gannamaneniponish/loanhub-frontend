import { useState, useEffect } from 'react'
import { Users, Lock, FileText, TrendingUp, Trash2, CheckCircle, XCircle, Shield, Bell, UserCheck, UserX, Clock } from 'lucide-react'
import { AdminAnalyticsPanel } from '../components/Charts'
import { AdminExportPanel } from '../components/ExportUtils'
import { OverdueSummaryCard } from '../components/OverdueUtils'
import StatCard from '../components/StatCard'
import './Dashboard.css'

function getPendingAnalysts() {
 try {
 const saved = localStorage.getItem('pendingAnalysts')
 return saved ? JSON.parse(saved) : []
 } catch { return [] }
}

function savePendingAnalysts(list) {
 localStorage.setItem('pendingAnalysts', JSON.stringify(list))
}

function getRegisteredUsers() {
 try {
 const saved = localStorage.getItem('registeredUsers')
 return saved ? JSON.parse(saved) : []
 } catch { return [] }
}

function saveRegisteredUsers(list) {
 localStorage.setItem('registeredUsers', JSON.stringify(list))
}

function ProfileModal({ profileModal, transactions, loans, users, setProfileModal }) {
 const u = profileModal
 const [modalTab, setModalTab] = useState(profileModal._tab || 'profile')
 const accentBg = u.role === 'lender' ? '#ebf4ff' : u.role === 'borrower' ? '#f0fff4' : '#fffff0'
 const accentBdr = u.role === 'lender' ? '#bee3f8' : u.role === 'borrower' ? '#9ae6b4' : '#f6e05e'
 const badgeBg = u.role === 'lender' ? '#bee3f8' : u.role === 'borrower' ? '#c6f6d5' : '#fefcbf'
 const badgeClr = u.role === 'lender' ? '#2b6cb0' : u.role === 'borrower' ? '#276749' : '#744210'
 const avatarBg = u.role === 'lender' ? 'linear-gradient(135deg,#bee3f8,#90cdf4)' : u.role === 'borrower' ? 'linear-gradient(135deg,#c6f6d5,#9ae6b4)' : 'linear-gradient(135deg,#fefcbf,#f6e05e)'
 const avatarIcon = u.role === 'lender' ? '' : u.role === 'borrower' ? '' : ''
 const roleLabel = u.role === 'lender' ? 'Lender' : u.role === 'borrower' ? 'Borrower' : 'Financial Analyst'

 const userTxns = transactions.filter(t => {
 if (u.role === 'lender') return t.lenderId === u.id || t.lenderName === u.name
 if (u.role === 'borrower') return t.borrowerId === u.id || t.borrowerName === u.name
 return false
 })

 const userLoans = loans.filter(l => {
 if (u.role === 'lender') return l.lenderId === u.id
 if (u.role === 'borrower') return l.borrowerId === u.id || l.borrowerName === u.name
 return false
 })

 const totalDisbursed = userTxns.filter(t => t.type === 'disbursement').reduce((s,t) => s+(t.amount||0), 0)
 const totalRepaid = userTxns.filter(t => t.type === 'payment').reduce((s,t) => s+(t.amount||0), 0)
 const totalDeposited = userTxns.filter(t => t.type === 'deposit').reduce((s,t) => s+(t.amount||0), 0)
 const outstanding = totalDisbursed - totalRepaid
 const totalBorrowed = userTxns.filter(t => t.type === 'disbursement').reduce((s,t) => s+(t.amount||0), 0)
 const totalPaidBack = userTxns.filter(t => t.type === 'payment').reduce((s,t) => s+(t.amount||0), 0)
 const stillOwed = Math.max(0, totalBorrowed - totalPaidBack)
 const activeLoans = userLoans.filter(l => l.status === 'active').length
 const completedLoans = userLoans.filter(l => l.status === 'completed').length
 const pendingLoans = userLoans.filter(l => l.status === 'pending').length

 const getCounterpart = (t) => {
 if (u.role === 'lender') return t.borrowerName || users.find(x => x.id === t.borrowerId)?.name || '—'
 if (u.role === 'borrower') return t.lenderName || users.find(x => x.id === t.lenderId)?.name || '—'
 return '—'
 }

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
 onClick={() => setProfileModal(null)}>
 <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '620px', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', position: 'relative', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
 onClick={e => e.stopPropagation()}>
 <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
 <button onClick={() => setProfileModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: '#f7fafc', border: 'none', borderRadius: '8px', padding: '7px 9px', cursor: 'pointer', color: '#718096', fontSize: '14px', fontWeight: '700' }}></button>
 <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
 <div style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', background: avatarBg, flexShrink: 0 }}>{avatarIcon}</div>
 <div>
 <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a202c' }}>{u.name}</h2>
 <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
 <span style={{ padding: '2px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: badgeBg, color: badgeClr }}>{roleLabel}</span>
 <span style={{ padding: '2px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: u.status === 'suspended' ? '#fff5f5' : '#f0fff4', color: u.status === 'suspended' ? '#c53030' : '#276749' }}>
 {u.status === 'suspended' ? ' Suspended' : ' Active'}
 </span>
 </div>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e2e8f0' }}>
 {[
 { key: 'profile', label: ' Profile' },
 { key: 'transactions', label: ` Transactions (${userTxns.length})` },
 ].map(tab => (
 <button key={tab.key} onClick={() => setModalTab(tab.key)} style={{
 padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
 fontWeight: '700', fontSize: '13px', borderBottom: modalTab === tab.key ? `3px solid ${badgeClr}` : '3px solid transparent',
 color: modalTab === tab.key ? badgeClr : '#718096', marginBottom: '-2px', borderRadius: '4px 4px 0 0'
 }}>{tab.label}</button>
 ))}
 </div>
 </div>

 <div style={{ overflowY: 'auto', padding: '20px 24px 24px', flex: 1 }}>
 {modalTab === 'profile' && (
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
 {[
 { label: ' Email', value: u.email },
 { label: ' Phone', value: u.phone || '—' },
 { label: ' Date of Birth', value: u.dob ? new Date(u.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
 { label: '🪪 PAN Card', value: u.panCard || '—' },
 { label: '🆔 Aadhaar', value: u.aadhaarCard ? u.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—' },
 ...(u.role === 'lender' || u.role === 'borrower' ? [{ label: ' Annual Income', value: u.annualIncome ? `₹${Number(u.annualIncome).toLocaleString('en-IN')}` : '—' }] : []),
 ...(u.role === 'analyst' ? [{ label: ' Education', value: u.education || '—' }] : []),
 ].map((item, i) => (
 <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', background: accentBg, border: `1px solid ${accentBdr}` }}>
 <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginBottom: '3px' }}>{item.label}</div>
 <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a202c', wordBreak: 'break-all' }}>{item.value}</div>
 </div>
 ))}
 </div>
 )}

 {modalTab === 'transactions' && (
 <div>
 {u.role === 'analyst' ? (
 <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a0aec0' }}>
 <div style={{ fontSize: '36px', marginBottom: '10px' }}></div>
 <p style={{ margin: 0, fontSize: '14px' }}>Financial Analysts do not have direct transactions.</p>
 </div>
 ) : (
 <>
 {u.role === 'lender' && (
 <>
 <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' }}> Financial Summary</h4>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '20px' }}>
 {[
 { icon: null, label: 'Total Lent Out', value: `₹${totalDisbursed.toLocaleString('en-IN')}`, bg: '#ebf4ff', clr: '#2b6cb0', bdr: '#bee3f8' },
 { icon: null, label: 'Total Repayments Received', value: `₹${totalRepaid.toLocaleString('en-IN')}`, bg: '#f0fff4', clr: '#276749', bdr: '#9ae6b4' },
 { icon: null, label: 'Outstanding (Not Yet Repaid)',value: `₹${Math.max(0,outstanding).toLocaleString('en-IN')}`, bg: '#fffbeb', clr: '#b7791f', bdr: '#f6e05e' },
 { icon: null, label: 'Total Deposited to Wallet', value: `₹${totalDeposited.toLocaleString('en-IN')}`, bg: '#f3e8ff', clr: '#553c9a', bdr: '#e9d8fd' },
 ].map((s,i) => (
 <div key={i} style={{ padding: '14px 16px', background: s.bg, borderRadius: '12px', border: `1px solid ${s.bdr}` }}>
 <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
 <div style={{ fontSize: '18px', fontWeight: '800', color: s.clr }}>{s.value}</div>
 <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginTop: '2px' }}>{s.label}</div>
 </div>
 ))}
 </div>
 <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
 {[
 { label: 'Active Loans', value: activeLoans, bg: '#f0fff4', clr: '#276749' },
 { label: 'Completed', value: completedLoans, bg: '#ebf4ff', clr: '#2b6cb0' },
 { label: 'Pending', value: pendingLoans, bg: '#fffbeb', clr: '#b7791f' },
 { label: 'Total Loans', value: userLoans.length, bg: '#f7fafc', clr: '#4a5568' },
 ].map((s,i) => (
 <div key={i} style={{ padding: '8px 14px', background: s.bg, borderRadius: '10px', textAlign: 'center', minWidth: '70px' }}>
 <div style={{ fontSize: '20px', fontWeight: '800', color: s.clr }}>{s.value}</div>
 <div style={{ fontSize: '10px', color: '#718096', fontWeight: '600' }}>{s.label.toUpperCase()}</div>
 </div>
 ))}
 </div>
 </>
 )}

 {u.role === 'borrower' && (
 <>
 <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' }}> Financial Summary</h4>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '20px' }}>
 {[
 { icon: null, label: 'Total Borrowed', value: `₹${totalBorrowed.toLocaleString('en-IN')}`, bg: '#ebf4ff', clr: '#2b6cb0', bdr: '#bee3f8' },
 { icon: null, label: 'Total Paid Back', value: `₹${totalPaidBack.toLocaleString('en-IN')}`, bg: '#f0fff4', clr: '#276749', bdr: '#9ae6b4' },
 { icon: null, label: 'Still Owed', value: `₹${stillOwed.toLocaleString('en-IN')}`, bg: stillOwed > 0 ? '#fff5f5' : '#f0fff4', clr: stillOwed > 0 ? '#c53030' : '#276749', bdr: stillOwed > 0 ? '#fed7d7' : '#9ae6b4' },
 { icon: null, label: 'Repayment Progress', value: totalBorrowed > 0 ? `${Math.min(100,Math.round((totalPaidBack/totalBorrowed)*100))}%` : '0%', bg: '#f3e8ff', clr: '#553c9a', bdr: '#e9d8fd' },
 ].map((s,i) => (
 <div key={i} style={{ padding: '14px 16px', background: s.bg, borderRadius: '12px', border: `1px solid ${s.bdr}` }}>
 <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
 <div style={{ fontSize: '18px', fontWeight: '800', color: s.clr }}>{s.value}</div>
 <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginTop: '2px' }}>{s.label}</div>
 </div>
 ))}
 </div>
 {totalBorrowed > 0 && (
 <div style={{ marginBottom: '20px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#718096', marginBottom: '6px' }}>
 <span>Repayment Progress</span>
 <span style={{ fontWeight: '700', color: '#276749' }}>{Math.min(100,Math.round((totalPaidBack/totalBorrowed)*100))}%</span>
 </div>
 <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
 <div style={{ height: '100%', borderRadius: '6px', background: 'linear-gradient(90deg,#48bb78,#276749)', width: `${Math.min(100,(totalPaidBack/totalBorrowed)*100)}%` }} />
 </div>
 </div>
 )}
 <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
 {[
 { label: 'Active Loans', value: activeLoans, bg: '#f0fff4', clr: '#276749' },
 { label: 'Completed', value: completedLoans, bg: '#ebf4ff', clr: '#2b6cb0' },
 { label: 'Pending', value: pendingLoans, bg: '#fffbeb', clr: '#b7791f' },
 { label: 'Total Loans', value: userLoans.length, bg: '#f7fafc', clr: '#4a5568' },
 ].map((s,i) => (
 <div key={i} style={{ padding: '8px 14px', background: s.bg, borderRadius: '10px', textAlign: 'center', minWidth: '70px' }}>
 <div style={{ fontSize: '20px', fontWeight: '800', color: s.clr }}>{s.value}</div>
 <div style={{ fontSize: '10px', color: '#718096', fontWeight: '600' }}>{s.label.toUpperCase()}</div>
 </div>
 ))}
 </div>
 </>
 )}

 {userTxns.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '30px 20px', color: '#a0aec0' }}>
 <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
 <p style={{ margin: 0, fontSize: '14px' }}>No transactions yet.</p>
 </div>
 ) : (
 <>
 <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' }}> Transaction History</h4>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {userTxns.map((t, idx) => {
 const isPayment = t.type === 'payment'
 const isDisbursement = t.type === 'disbursement'
 const isDeposit = t.type === 'deposit'
 const counterpart = getCounterpart(t)
 const typeLabel = isPayment ? 'Repayment Received' : isDisbursement ? (u.role === 'lender' ? 'Lent to Borrower' : 'Received from Lender') : isDeposit ? 'Wallet Deposit' : t.type || 'Transaction'
 const typeIcon = isPayment ? '' : isDisbursement ? '' : isDeposit ? '' : ''
 const typeBg = isPayment ? '#c6f6d5' : isDisbursement ? '#bee3f8' : isDeposit ? '#e9d8fd' : '#f0f4f8'
 const amountClr = isPayment ? '#276749' : isDisbursement ? '#2b6cb0' : '#553c9a'
 return (
 <div key={t.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: '#f9fbfd', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
 <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0, background: typeBg }}>{typeIcon}</div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: '700', fontSize: '13px', color: '#1a202c' }}>{typeLabel}</div>
 {(isPayment || isDisbursement) && counterpart !== '—' && (
 <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
 {u.role === 'lender' ? ` Borrower: ${counterpart}` : ` Lender: ${counterpart}`}
 </div>
 )}
 {t.loanId && <div style={{ fontSize: '11px', color: '#a0aec0', fontFamily: 'monospace', marginTop: '2px' }}>Loan ID: #{t.loanId}</div>}
 {t.description && <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>{t.description}</div>}
 </div>
 <div style={{ textAlign: 'right', flexShrink: 0 }}>
 <div style={{ fontWeight: '800', fontSize: '15px', color: amountClr }}>₹{(t.amount || 0).toLocaleString('en-IN')}</div>
 <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '2px' }}>
 {t.timestamp ? new Date(t.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
 </div>
 <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700', background: typeBg, color: amountClr }}>
 {isPayment ? 'PAYMENT' : isDisbursement ? 'DISBURSE' : isDeposit ? 'DEPOSIT' : 'TXN'}
 </span>
 </div>
 </div>
 )
 })}
 </div>
 </>
 )}
 </>
 )}
 </div>
 )}
 </div>

 <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #f0f4f8', flexShrink: 0 }}>
 <button onClick={() => setProfileModal(null)} style={{ width: '100%', padding: '10px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
 Close
 </button>
 </div>
 </div>
 </div>
 )

 }

export default function AdminDashboard({ users, setUsers, loans, transactions , activeTab: propActiveTab, onTabChange }) {
 const [localTab, setLocalTab] = useState('overview')
 const activeTab = propActiveTab || localTab
 const setActiveTab = (tab) => { setLocalTab(tab); onTabChange?.(tab) }
 const [pendingAnalysts, setPendingAnalysts] = useState([])
 const [profileModal, setProfileModal] = useState(null)
 const [approveConfirmModal, setApproveConfirmModal] = useState(null) // analyst to confirm
 const [actionMsg, setActionMsg] = useState('')
 const [actionType, setActionType] = useState('success')

 useEffect(() => {
 setPendingAnalysts(getPendingAnalysts())
 }, [])

 const pendingCount = pendingAnalysts.length

 const flash = (msg, type = 'success') => {
 setActionMsg(msg); setActionType(type)
 setTimeout(() => setActionMsg(''), 3500)
 }

 // ── Approve analyst ──────────────────────────────────────────────────────
 const approveAnalyst = (analyst) => {
 // Move from pending to registered
 const registered = getRegisteredUsers()
 const approvedUser = { ...analyst, status: 'active' }
 registered.push(approvedUser)
 saveRegisteredUsers(registered)

 const newPending = pendingAnalysts.filter(a => a.id !== analyst.id)
 savePendingAnalysts(newPending)
 setPendingAnalysts(newPending)

 // Refresh users list in App state
 const DEFAULT_SAMPLE_USERS = [
 { id: 2, name: 'John Lender', email: 'lender@loanhub.com', role: 'lender', phone: '9000000002', status: 'active' },
 { id: 3, name: 'Jane Borrower', email: 'borrower@loanhub.com', role: 'borrower', phone: '9000000003', status: 'active' },
 { id: 4, name: 'Analyst Pro', email: 'analyst@loanhub.com', role: 'analyst', phone: '9000000004', status: 'active' }
 ]
 const merged = [...DEFAULT_SAMPLE_USERS]
 for (const ru of registered) {
 if (!merged.find(u => u.email === ru.email)) {
 const { password: _p, ...withoutPwd } = ru
 merged.push(withoutPwd)
 }
 }
 setUsers(merged)
 flash(` ${analyst.name}'s Financial Analyst account has been approved.`, 'success')
 }

 // ── Reject analyst ───────────────────────────────────────────────────────
 const rejectAnalyst = (analyst) => {
 const newPending = pendingAnalysts.filter(a => a.id !== analyst.id)
 savePendingAnalysts(newPending)
 setPendingAnalysts(newPending)
 flash(` ${analyst.name}'s application has been rejected.`, 'error')
 }

 // ── Delete user ──────────────────────────────────────────────────────────
 const handleDeleteUser = (userId) => {
 const target = users.find(u => u.id === userId)
 if (target?.role === 'admin') { flash('The admin account cannot be deleted.', 'error'); return }

 // Remove from React state
 const updated = users.filter(u => u.id !== userId)
 setUsers(updated)

 // Remove from registeredUsers in localStorage
 const reg = getRegisteredUsers().filter(u => u.id !== userId)
 saveRegisteredUsers(reg)

 // Track deleted IDs so defaults don't re-appear on reload
 try {
 const saved = localStorage.getItem('deletedUserIds')
 const ids = saved ? JSON.parse(saved) : []
 if (!ids.includes(userId)) { ids.push(userId); localStorage.setItem('deletedUserIds', JSON.stringify(ids)) }
 } catch {}

 // Force-logout if this user is currently logged in
 try {
 const current = localStorage.getItem('currentUser')
 if (current) {
 const cu = JSON.parse(current)
 if (cu.id === userId) localStorage.removeItem('currentUser')
 }
 } catch {}

 flash(`User "${target?.name}" has been permanently deleted.`, 'success')
 }

 const toggleUserStatus = (userId) => {
 const target = users.find(u => u.id === userId)
 if (target?.role === 'admin') { flash('Admin account status cannot be changed.', 'error'); return }
 const newStatus = target?.status === 'suspended' ? 'active' : 'suspended'

 // Update React state
 const updated = users.map(u => u.id === userId ? { ...u, status: newStatus } : u)
 setUsers(updated)

 // Sync to registeredUsers — upsert (add if not present, update if present)
 const reg = getRegisteredUsers()
 const existsInReg = reg.find(u => u.id === userId || u.email === target?.email)
 let updatedReg
 if (existsInReg) {
 updatedReg = reg.map(u => (u.id === userId || u.email === target?.email) ? { ...u, status: newStatus } : u)
 } else {
 // Seed user not in registeredUsers yet — add with new status
 updatedReg = [...reg, { ...target, status: newStatus }]
 }
 saveRegisteredUsers(updatedReg)

 // If suspending: force-logout the user if they are currently logged in
 if (newStatus === 'suspended') {
 try {
 const current = localStorage.getItem('currentUser')
 if (current) {
 const cu = JSON.parse(current)
 if (cu.id === userId) localStorage.removeItem('currentUser')
 }
 } catch {}
 }

 flash(`${target?.name} has been ${newStatus === 'suspended' ? 'suspended and logged out' : 'reactivated'}.`, newStatus === 'suspended' ? 'error' : 'success')
 }

 const roleColor = (role) => {
 const map = { admin: '#e9d8fd', lender: '#bee3f8', borrower: '#c6f6d5', analyst: '#fefcbf' }
 return map[role] || '#e2e8f0'
 }
 const roleText = (role) => {
 const map = { admin: '#553c9a', lender: '#2b6cb0', borrower: '#276749', analyst: '#744210' }
 return map[role] || '#4a5568'
 }

 const tabStyle = (key) => ({
 display: 'flex', alignItems: 'center', gap: '6px',
 padding: '10px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer',
 fontWeight: '600', fontSize: '13px', transition: 'all 0.2s', position: 'relative',
 background: activeTab === key ? '#667eea' : 'transparent',
 color: activeTab === key ? 'white' : '#4a5568',
 })

 const totalLoans = loans.length
 const npaLoans = loans.filter(l => {
 if (l.status !== 'active') return false
 const start = new Date(l.acceptedAt || l.createdAt || Date.now())
 const monthlyRate = l.interestRate / 100 / 12
 const emi = monthlyRate === 0 ? l.amount / l.term : (l.amount * (monthlyRate * Math.pow(1 + monthlyRate, l.term))) / (Math.pow(1 + monthlyRate, l.term) - 1)
 const paid = transactions.filter(t => t.loanId === l.id && t.type === 'payment').reduce((s, t) => s + t.amount, 0)
 const monthsElapsed = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24 * 30))
 const expected = emi * Math.min(monthsElapsed, l.term)
 return paid < expected * 0.7 && monthsElapsed > 1
 }).length
 const npaRate = totalLoans > 0 ? ((npaLoans / Math.max(loans.filter(l => l.status === 'active').length, 1)) * 100).toFixed(1) : '0.0'
 const totalDisbursed = loans.filter(l => l.status !== 'pending').reduce((s, l) => s + l.amount, 0)

 const stats = [
 { label: 'Total Users', value: users.length, icon: null, iconBg: '#f3e8ff', iconColor: '#7c3aed', accent: '#7c3aed' },
 { label: 'Total Loans', value: loans.length, icon: null, iconBg: '#e8f0fe', iconColor: '#1a73e8', accent: '#1a73e8', trend: 10, trendLabel: 'this month' },
 { label: 'Transactions', value: transactions.length, icon: null, iconBg: '#dcfce7', iconColor: '#16a34a', accent: '#16a34a' },
 { label: 'Active Loans', value: loans.filter(l => l.status === 'active').length,icon: null, iconBg: '#fef9c3', iconColor: '#d97706', accent: '#d97706' },
 { label: 'Pending Approvals', value: pendingCount, icon: null, iconBg: pendingCount > 0 ? '#fee2e2' : '#f1f5f9', iconColor: pendingCount > 0 ? '#dc2626' : '#64748b', accent: pendingCount > 0 ? '#dc2626' : '#94a3b8' },
 { label: 'Suspended Users', value: users.filter(u => u.status === 'suspended').length, icon: null, iconBg: '#fee2e2', iconColor: '#dc2626', accent: '#dc2626' },
 ]

 return (
 <div className="main-content">
 <div className="dashboard">
 <div className="dashboard-header">
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <Shield size={26} color="white" />
 </div>
 <div>
 <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
 <p style={{ margin: 0 }}>Oversee platform operations, manage user accounts & ensure data security</p>
 </div>
 </div>
 {pendingCount > 0 && (
 <div style={{ marginTop: '14px', padding: '12px 18px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
 <Bell size={18} color="#e53e3e" />
 <span style={{ color: '#c53030', fontWeight: '600', fontSize: '14px' }}>
 {pendingCount} Financial Analyst registration{pendingCount > 1 ? 's' : ''} pending your approval
 </span>
 <button onClick={() => setActiveTab('approvals')} style={{ marginLeft: 'auto', padding: '6px 14px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
 Review Now →
 </button>
 </div>
 )}
 </div>

 {actionMsg && (
 <div style={{ margin: '0 0 16px 0', padding: '12px 18px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', background: actionType === 'success' ? '#f0fff4' : '#fff5f5', color: actionType === 'success' ? '#276749' : '#c53030', border: `1px solid ${actionType === 'success' ? '#9ae6b4' : '#fed7d7'}` }}>
 {actionMsg}
 </div>
 )}

 {/* Stats - Feature #4 enhanced */}
 <div className="stats-grid stagger-children" style={{ marginBottom: '26px' }}>
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
 />
 ))}
 </div>

 {/* Tabs */}
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', background: '#f7fafc', padding: '8px', borderRadius: '12px' }}>
 <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}><TrendingUp size={16} /> Overview</button>
 <button style={tabStyle('analytics')} onClick={() => setActiveTab('analytics')}> Analytics Charts</button>
 <button style={{ ...tabStyle('approvals'), ...(pendingCount > 0 && activeTab !== 'approvals' ? { background: '#fff5f5', color: '#c53030' } : {}) }} onClick={() => setActiveTab('approvals')}>
 <Clock size={16} /> Analyst Approvals
 {pendingCount > 0 && (
 <span style={{ marginLeft: '6px', background: '#e53e3e', color: 'white', borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: '800' }}>{pendingCount}</span>
 )}
 </button>
 <button style={tabStyle('users')} onClick={() => setActiveTab('users')}><Users size={16} /> User Management</button>
 <button style={tabStyle('security')} onClick={() => setActiveTab('security')}><Lock size={16} /> Security</button>
 <button style={tabStyle('reports')} onClick={() => setActiveTab('reports')}><FileText size={16} /> Reports</button>
 </div>

 {/* ── Overview ── */}
 {activeTab === 'overview' && (
 <div className="dashboard-section">
 <h2 className="section-title">Platform Overview</h2>

 {/* NPA & Health Widgets */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
 <div style={{ background: npaRate > 10 ? '#fff5f5' : '#f0fff4', border: `1px solid ${npaRate > 10 ? '#fed7d7' : '#9ae6b4'}`, borderRadius: '12px', padding: '16px' }}>
 <div style={{ fontSize: '11px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>NPA Rate</div>
 <div style={{ fontSize: '28px', fontWeight: '800', color: npaRate > 10 ? '#c53030' : '#276749' }}>{npaRate}%</div>
 <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>{npaLoans} non-performing of {loans.filter(l=>l.status==='active').length} active</div>
 <div style={{ marginTop: '8px', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
 <div style={{ height: '100%', width: `${Math.min(npaRate, 100)}%`, background: npaRate > 10 ? '#e53e3e' : '#38a169', borderRadius: '3px', transition: 'width 0.6s' }} />
 </div>
 </div>
 <div style={{ background: '#ebf8ff', border: '1px solid #90cdf4', borderRadius: '12px', padding: '16px' }}>
 <div style={{ fontSize: '11px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Disbursed</div>
 <div style={{ fontSize: '22px', fontWeight: '800', color: '#2b6cb0' }}>₹{totalDisbursed.toLocaleString('en-IN')}</div>
 <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>Across {loans.filter(l => l.status !== 'pending').length} approved loans</div>
 </div>
 <div style={{ background: '#faf5ff', border: '1px solid #d6bcfa', borderRadius: '12px', padding: '16px' }}>
 <div style={{ fontSize: '11px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Approval Rate</div>
 <div style={{ fontSize: '28px', fontWeight: '800', color: '#553c9a' }}>
 {loans.length > 0 ? Math.round((loans.filter(l => l.status === 'active' || l.status === 'completed').length / loans.length) * 100) : 0}%
 </div>
 <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>{loans.filter(l=>l.status==='declined').length} declined</div>
 </div>
 <div style={{ background: '#fffbeb', border: '1px solid #fbd38d', borderRadius: '12px', padding: '16px' }}>
 <div style={{ fontSize: '11px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Collections</div>
 <div style={{ fontSize: '22px', fontWeight: '800', color: '#744210' }}>₹{transactions.filter(t=>t.type==='payment').reduce((s,t)=>s+t.amount,0).toLocaleString('en-IN')}</div>
 <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>{transactions.filter(t=>t.type==='payment').length} payments received</div>
 </div>
 </div>

 {/* Activity Log */}
 <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>
 <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 Recent Activity Log
 </div>
 <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
 {[...loans.slice(-5).reverse().map(l => ({ time: new Date(l.applicationDate || l.createdAt || Date.now()), text: `Loan application of ₹${l.amount?.toLocaleString('en-IN')} by ${l.borrowerName}`, type: 'loan', status: l.status })),
 ...transactions.slice(-5).reverse().map(t => ({ time: new Date(t.date || Date.now()), text: `Payment of ₹${t.amount?.toLocaleString('en-IN')} received`, type: 'payment', status: 'success' }))
 ].sort((a,b) => b.time - a.time).slice(0, 8).map((item, i) => (
 <div key={i} style={{ padding: '10px 18px', borderBottom: '1px solid #f7fafc', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
 <span style={{ fontSize: '16px' }}>{item.type === 'payment' ? '' : item.status === 'active' ? '' : item.status === 'pending' ? '⏳' : item.status === 'declined' ? '' : ''}</span>
 <span style={{ flex: 1, color: '#4a5568' }}>{item.text}</span>
 <span style={{ fontSize: '11px', color: '#a0aec0' }}>{item.time.toLocaleDateString('en-IN')}</span>
 </div>
 ))}
 {loans.length === 0 && transactions.length === 0 && (
 <div style={{ padding: '24px', textAlign: 'center', color: '#a0aec0', fontSize: '13px' }}>No activity yet</div>
 )}
 </div>
 </div>

 <div style={{ marginBottom: '20px' }}>
 <OverdueSummaryCard loans={loans} transactions={transactions} />
 </div>
 <div className="cards-grid">
 <div className="card">
 <div className="card-header"><h3 className="card-title"> User Distribution</h3></div>
 <div className="card-content">
 <p>Borrowers: <strong>{users.filter(u => u.role === 'borrower').length}</strong></p>
 <p>Lenders: <strong>{users.filter(u => u.role === 'lender').length}</strong></p>
 <p>Financial Analysts: <strong>{users.filter(u => u.role === 'analyst').length}</strong></p>
 <p>Admins: <strong>{users.filter(u => u.role === 'admin').length}</strong> <span style={{ fontSize: '11px', color: '#718096' }}>(max 1)</span></p>
 <p>Pending Analysts: <strong style={{ color: pendingCount > 0 ? '#e53e3e' : '#a0aec0' }}>{pendingCount}</strong></p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title"> Loan Status</h3></div>
 <div className="card-content">
 <p>Active: <strong>{loans.filter(l => l.status === 'active').length}</strong></p>
 <p>Completed: <strong>{loans.filter(l => l.status === 'completed').length}</strong></p>
 <p>Pending: <strong>{loans.filter(l => l.status === 'pending').length}</strong></p>
 <p>Total Value: <strong>₹{loans.reduce((s, l) => s + l.amount, 0).toLocaleString('en-IN')}</strong></p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title"> Transaction Summary</h3></div>
 <div className="card-content">
 <p>Total: <strong>{transactions.length}</strong></p>
 <p>Payments: <strong>{transactions.filter(t => t.type === 'payment').length}</strong></p>
 <p>Disbursements: <strong>{transactions.filter(t => t.type === 'disbursement').length}</strong></p>
 <p>Total Value: <strong>₹{transactions.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString('en-IN')}</strong></p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ── Analytics Charts ── */}
 {activeTab === 'analytics' && (
 <div className="dashboard-section">
 <AdminAnalyticsPanel loans={loans} transactions={transactions} users={users} />
 <div style={{ marginTop: '24px' }}>
 <OverdueSummaryCard loans={loans} transactions={transactions} />
 </div>
 </div>
 )}

 {/* ── Analyst Approvals ── */}
 {activeTab === 'approvals' && (
 <div className="dashboard-section">
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
 <div style={{ width: '42px', height: '42px', background: pendingCount > 0 ? '#fff5f5' : '#f7fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${pendingCount > 0 ? '#fed7d7' : '#e2e8f0'}` }}>
 <UserCheck size={22} color={pendingCount > 0 ? '#e53e3e' : '#a0aec0'} />
 </div>
 <div>
 <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700' }}>Financial Analyst Approvals</h2>
 <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>Review and approve or reject new analyst account requests</p>
 </div>
 </div>

 {pendingAnalysts.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '56px 24px', background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
 <div style={{ fontSize: '48px', marginBottom: '12px' }}></div>
 <h3 style={{ color: '#4a5568', marginBottom: '6px' }}>No Pending Approvals</h3>
 <p style={{ color: '#718096', fontSize: '14px' }}>All analyst registration requests have been reviewed.</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 {pendingAnalysts.map((analyst) => (
 <div key={analyst.id} style={{ background: 'white', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #feebc8' }}>
 {/* Header row */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
 <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, #fefcbf, #f6e05e)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}></div>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: '700', fontSize: '16px', color: '#1a202c' }}>{analyst.name}</div>
 <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
 <span style={{ padding: '2px 10px', background: '#fefcbf', color: '#744210', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>FINANCIAL ANALYST</span>
 <span style={{ padding: '2px 10px', background: '#fff5f5', color: '#c53030', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>⏳ PENDING</span>
 </div>
 </div>
 <div style={{ fontSize: '12px', color: '#a0aec0' }}>
 Requested: {analyst.requestedAt ? new Date(analyst.requestedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
 </div>
 </div>

 {/* All registration details */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
 {[
 { label: ' Email', value: analyst.email },
 { label: ' Phone', value: analyst.phone },
 { label: ' Date of Birth', value: analyst.dob ? new Date(analyst.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
 { label: '🪪 PAN Card', value: analyst.panCard || '—' },
 { label: '🆔 Aadhaar Card', value: analyst.aadhaarCard ? analyst.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—' },
 { label: ' Education', value: analyst.education || '—' },
 ].map((item, i) => (
 <div key={i} style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '9px', border: '1px solid #feebc8' }}>
 <div style={{ fontSize: '11px', color: '#744210', fontWeight: '600', marginBottom: '2px' }}>{item.label}</div>
 <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>{item.value}</div>
 </div>
 ))}
 </div>

 {/* Action buttons */}
 <div style={{ display: 'flex', gap: '10px' }}>
 <button onClick={() => setApproveConfirmModal(analyst)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', background: '#276749', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
 <CheckCircle size={16} /> Approve
 </button>
 <button onClick={() => rejectAnalyst(analyst)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', background: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', borderRadius: '9px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
 <XCircle size={16} /> Reject
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Already-approved analysts for reference */}
 <div style={{ marginTop: '28px' }}>
 <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#4a5568', marginBottom: '12px' }}>Active Analysts on Platform</h3>
 {users.filter(u => u.role === 'analyst').length === 0 ? (
 <p style={{ color: '#a0aec0', fontSize: '13px' }}>No analysts approved yet.</p>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {users.filter(u => u.role === 'analyst').map(analyst => (
 <div key={analyst.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f0fff4', borderRadius: '10px', padding: '12px 16px', border: '1px solid #9ae6b4' }}>
 <span style={{ fontSize: '18px' }}></span>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: '600', fontSize: '14px' }}>{analyst.name}</div>
 <div style={{ fontSize: '12px', color: '#718096' }}>{analyst.email}</div>
 </div>
 <span style={{ padding: '3px 10px', background: '#c6f6d5', color: '#276749', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}> APPROVED</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* ── Approve Confirmation Modal ── */}
 {approveConfirmModal && (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
 onClick={() => setApproveConfirmModal(null)}>
 <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}
 onClick={e => e.stopPropagation()}>

 {/* Header */}
 <div style={{ background: 'linear-gradient(135deg,#f0fff4,#c6f6d5)', padding: '24px 28px 20px', borderBottom: '1px solid #9ae6b4' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
 <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#48bb78,#276749)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}></div>
 <div>
 <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a202c' }}>Confirm Approval</h2>
 <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#276749', fontWeight: '500' }}>Please review all details before approving this analyst account</p>
 </div>
 </div>
 </div>

 {/* Details */}
 <div style={{ padding: '20px 28px' }}>
 {/* Analyst name + badge */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', padding: '14px 16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #feebc8' }}>
 <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#fefcbf,#f6e05e)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}></div>
 <div>
 <div style={{ fontWeight: '800', fontSize: '16px', color: '#1a202c' }}>{approveConfirmModal.name}</div>
 <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
 <span style={{ padding: '2px 10px', background: '#fefcbf', color: '#744210', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>FINANCIAL ANALYST</span>
 <span style={{ padding: '2px 10px', background: '#fff5f5', color: '#c53030', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>⏳ PENDING</span>
 </div>
 </div>
 <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#a0aec0', textAlign: 'right' }}>
 Requested<br/>{approveConfirmModal.requestedAt ? new Date(approveConfirmModal.requestedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
 </div>
 </div>

 {/* All registration details */}
 <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' }}> Registration Details</h4>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
 {[
 { label: ' Email', value: approveConfirmModal.email },
 { label: ' Phone', value: approveConfirmModal.phone },
 { label: ' Date of Birth',value: approveConfirmModal.dob ? new Date(approveConfirmModal.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
 { label: '🪪 PAN Card', value: approveConfirmModal.panCard || '—' },
 { label: '🆔 Aadhaar Card', value: approveConfirmModal.aadhaarCard ? approveConfirmModal.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—' },
 { label: ' Education', value: approveConfirmModal.education || '—' },
 ].map((item, i) => (
 <div key={i} style={{ padding: '10px 12px', background: '#f7fafc', borderRadius: '9px', border: '1px solid #e2e8f0' }}>
 <div style={{ fontSize: '10px', color: '#718096', fontWeight: '600', marginBottom: '2px' }}>{item.label}</div>
 <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>{item.value}</div>
 </div>
 ))}
 </div>

 {/* Warning note */}
 <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #feebc8', marginBottom: '20px', fontSize: '13px', color: '#744210', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
 <span style={{ fontSize: '16px', flexShrink: 0 }}>️</span>
 <span>Once approved, <strong>{approveConfirmModal.name}</strong> will be able to log in and access the Financial Analyst dashboard. This action can be reversed by suspending the account.</span>
 </div>

 {/* Confirm / Cancel buttons */}
 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 onClick={() => { approveAnalyst(approveConfirmModal); setApproveConfirmModal(null) }}
 style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#48bb78,#276749)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(39,103,73,0.3)' }}>
 <CheckCircle size={16} /> Confirm Approval
 </button>
 <button
 onClick={() => setApproveConfirmModal(null)}
 style={{ flex: 1, padding: '12px', background: 'white', color: '#4a5568', border: '1.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
 Cancel
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ── Profile Modal ── */}
 {profileModal && <ProfileModal profileModal={profileModal} transactions={transactions} loans={loans} users={users} setProfileModal={setProfileModal} />}

 {/* ── User Management ── */}
 {activeTab === 'users' && (
 <div className="dashboard-section">
 <h2 className="section-title">User Management</h2>
 <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#ebf4ff', borderRadius: '10px', border: '1px solid #bee3f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <Shield size={16} color="#2b6cb0" />
 <span style={{ fontSize: '13px', color: '#2b6cb0', fontWeight: '500' }}>
 Only one Admin is allowed on the platform. Admin accounts are protected and cannot be deleted or suspended.
 </span>
 </div>

 {/* Helper to render a role table */}
 {[
 {
 role: 'lender',
 title: ' Lenders',
 headerBg: '#ebf4ff',
 headerBorder: '#bee3f8',
 badgeBg: '#bee3f8',
 badgeColor: '#2b6cb0',
 emptyMsg: 'No lenders registered yet.',
 extraCols: ['PAN Card', 'Aadhaar', 'Annual Income'],
 getExtra: u => [u.panCard || '—', u.aadhaarCard ? u.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—', u.annualIncome ? `₹${Number(u.annualIncome).toLocaleString('en-IN')}` : '—'],
 },
 {
 role: 'borrower',
 title: ' Borrowers',
 headerBg: '#f0fff4',
 headerBorder: '#9ae6b4',
 badgeBg: '#c6f6d5',
 badgeColor: '#276749',
 emptyMsg: 'No borrowers registered yet.',
 extraCols: ['PAN Card', 'Aadhaar', 'Annual Income'],
 getExtra: u => [u.panCard || '—', u.aadhaarCard ? u.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—', u.annualIncome ? `₹${Number(u.annualIncome).toLocaleString('en-IN')}` : '—'],
 },
 {
 role: 'analyst',
 title: ' Financial Analysts',
 headerBg: '#fffff0',
 headerBorder: '#f6e05e',
 badgeBg: '#fefcbf',
 badgeColor: '#744210',
 emptyMsg: 'No financial analysts registered yet.',
 extraCols: ['PAN Card', 'Aadhaar', 'Education'],
 getExtra: u => [u.panCard || '—', u.aadhaarCard ? u.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—', u.education || '—'],
 },
 ].map(({ role, title, headerBg, headerBorder, badgeBg, badgeColor, emptyMsg, extraCols, getExtra }) => {
 const roleUsers = users.filter(u => u.role === role)
 return (
 <div key={role} style={{ marginBottom: '32px' }}>
 {/* Section header */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
 <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a202c' }}>{title}</h3>
 <span style={{ padding: '2px 10px', background: badgeBg, color: badgeColor, borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>{roleUsers.length}</span>
 </div>

 {roleUsers.length === 0 ? (
 <div style={{ padding: '28px', textAlign: 'center', background: 'white', borderRadius: '12px', border: `1px dashed ${headerBorder}`, color: '#a0aec0', fontSize: '14px' }}>
 {emptyMsg}
 </div>
 ) : (
 <div style={{ overflowX: 'auto' }}>
 <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
 <thead>
 <tr style={{ background: headerBg }}>
 {['#', 'Name', 'Email', 'Phone', 'DOB', ...extraCols, 'Status', 'Actions'].map(h => (
 <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#4a5568', borderBottom: `2px solid ${headerBorder}`, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {roleUsers.map((u, idx) => (
 <tr key={u.id} style={{ borderBottom: '1px solid #f0f4f8', opacity: u.status === 'suspended' ? 0.6 : 1 }}
 onMouseEnter={e => e.currentTarget.style.background = '#f9fbfd'}
 onMouseLeave={e => e.currentTarget.style.background = 'white'}
 >
 <td style={{ padding: '11px 14px', fontSize: '13px', color: '#a0aec0', fontWeight: '600' }}>{idx + 1}</td>
 <td style={{ padding: '11px 14px', fontWeight: '600', fontSize: '13px', color: '#1a202c', whiteSpace: 'nowrap' }}>{u.name}</td>
 <td style={{ padding: '11px 14px', fontSize: '12px', color: '#4a5568' }}>{u.email}</td>
 <td style={{ padding: '11px 14px', fontSize: '12px', color: '#718096' }}>{u.phone || '—'}</td>
 <td style={{ padding: '11px 14px', fontSize: '12px', color: '#718096', whiteSpace: 'nowrap' }}>
 {u.dob ? new Date(u.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
 </td>
 {getExtra(u).map((val, i) => (
 <td key={i} style={{ padding: '11px 14px', fontSize: '12px', color: '#4a5568', whiteSpace: 'nowrap' }}>{val}</td>
 ))}
 <td style={{ padding: '11px 14px' }}>
 <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: u.status === 'suspended' ? '#fff5f5' : '#f0fff4', color: u.status === 'suspended' ? '#c53030' : '#276749', whiteSpace: 'nowrap' }}>
 {u.status === 'suspended' ? ' Suspended' : ' Active'}
 </span>
 </td>
 <td style={{ padding: '11px 14px' }}>
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
 <button onClick={() => setProfileModal(u)}
 style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: badgeBg, color: badgeColor, border: `1px solid ${headerBorder}`, borderRadius: '7px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
 Profile
 </button>
 <button onClick={() => toggleUserStatus(u.id)}
 style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', background: u.status === 'suspended' ? '#c6f6d5' : '#fff5f5', color: u.status === 'suspended' ? '#276749' : '#c53030' }}>
 {u.status === 'suspended' ? <><UserCheck size={13} /> Activate</> : <><UserX size={13} /> Suspend</>}
 </button>
 <button onClick={() => handleDeleteUser(u.id)}
 style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', borderRadius: '7px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
 <Trash2 size={13} /> Delete
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )
 })}
 </div>
 )}

 {/* ── Security ── */}
 {activeTab === 'security' && (
 <div className="dashboard-section">
 <h2 className="section-title">Security & Data Protection</h2>
 <div className="cards-grid">
 <div className="card">
 <div className="card-header"><h3 className="card-title"> Data Encryption</h3></div>
 <div className="card-content">
 <p> SSL/TLS encryption for data in transit</p>
 <p> AES-256 encryption for data at rest</p>
 <p> Passwords stored with secure hashing</p>
 <p> Sensitive fields masked in UI</p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">️ Access Control</h3></div>
 <div className="card-content">
 <p> Role-based access control (RBAC)</p>
 <p> Single admin account enforced</p>
 <p> Analyst accounts require admin approval</p>
 <p> Session management & timeout policies</p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title"> Audit & Logging</h3></div>
 <div className="card-content">
 <p> All transactions logged with timestamps</p>
 <p> User activity tracking enabled</p>
 <p> Analyst approval/rejection events logged</p>
 <p> Comprehensive audit trail maintained</p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">️ Platform Rules</h3></div>
 <div className="card-content">
 <p> Only <strong>1 Admin</strong> allowed platform-wide</p>
 <p> Financial Analysts must be <strong>admin-approved</strong></p>
 <p> Admin cannot be deleted or suspended</p>
 <p> Suspended users cannot log in</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ── Reports ── */}
 {activeTab === 'reports' && (
 <div className="dashboard-section">
 <h2 className="section-title">System Reports</h2>
 <AdminExportPanel loans={loans} transactions={transactions} users={users} />
 <div className="cards-grid">
 <div className="card">
 <div className="card-header"><h3 className="card-title">Generate Reports</h3></div>
 <div className="card-content">
 {[' Daily Summary Report', ' Monthly Analytics', ' Audit Trail Report', ' User Activity Report', ' Analyst Approval Log'].map(r => (
 <button key={r} className="btn btn-primary btn-block" style={{ marginBottom: '10px' }}
 onClick={() => flash(`${r} — feature coming soon!`, 'success')}>
 {r}
 </button>
 ))}
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">System Health</h3></div>
 <div className="card-content">
 <p>Uptime: <strong>99.9%</strong></p>
 <p>Server Status: <strong> Operational</strong></p>
 <p>Database: <strong> Healthy</strong></p>
 <p>API Response Time: <strong>&lt; 100ms</strong></p>
 <p>Pending Approvals: <strong style={{ color: pendingCount > 0 ? '#e53e3e' : 'inherit' }}>{pendingCount}</strong></p>
 <p>Last Report: <strong>{new Date().toLocaleDateString('en-IN')}</strong></p>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )
}
