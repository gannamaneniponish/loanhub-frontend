import { useState, useEffect } from 'react'
import { Bell, Mail, Phone, CheckCircle, X } from 'lucide-react'

const PREF_KEY = 'loanhub_notif_prefs'
const LOG_KEY = 'loanhub_notif_log'

function loadPrefs(userId) {
 try {
 const raw = localStorage.getItem(PREF_KEY)
 const all = raw ? JSON.parse(raw) : {}
 return all[userId] || {
 email: true,
 sms: false,
 emiReminder: true,
 loanAccepted: true,
 paymentReceived: true,
 suspiciousActivity: false,
 }
 } catch { return { email: true, sms: false, emiReminder: true, loanAccepted: true, paymentReceived: true, suspiciousActivity: false } }
}

function savePrefs(userId, prefs) {
 try {
 const raw = localStorage.getItem(PREF_KEY)
 const all = raw ? JSON.parse(raw) : {}
 all[userId] = prefs
 localStorage.setItem(PREF_KEY, JSON.stringify(all))
 } catch {}
}

export function loadNotifLog() {
 try {
 const raw = localStorage.getItem(LOG_KEY)
 return raw ? JSON.parse(raw) : []
 } catch { return [] }
}

export function pushNotification(userId, userEmail, userPhone, prefs, type, message) {
 const channels = []
 if (prefs.email) channels.push('Email')
 if (prefs.sms) channels.push('SMS')
 if (channels.length === 0) return

 const entry = {
 id: Date.now(),
 userId,
 type,
 message,
 channels,
 sentTo: { email: prefs.email ? userEmail : null, phone: prefs.sms ? userPhone : null },
 timestamp: new Date().toISOString(),
 read: false,
 }
 try {
 const log = loadNotifLog()
 log.unshift(entry)
 localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 50))) // keep last 50
 } catch {}
 return entry
}

// ─── Notification Preferences Panel ──────────────────────────────────────────
export function NotificationPreferences({ user }) {
 const [prefs, setPrefs] = useState(() => loadPrefs(user?.id))
 const [saved, setSaved] = useState(false)
 const [testSent, setTestSent] = useState(false)

 const update = (key, val) => {
 const next = { ...prefs, [key]: val }
 setPrefs(next)
 savePrefs(user?.id, next)
 setSaved(true)
 setTimeout(() => setSaved(false), 2000)
 }

 const sendTest = () => {
 pushNotification(user?.id, user?.email, user?.phone, prefs, 'test',
 'This is a test notification from LoanHub.')
 setTestSent(true)
 setTimeout(() => setTestSent(false), 2500)
 }

 const Toggle = ({ value, onChange }) => (
 <button onClick={() => onChange(!value)} style={{
 width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
 background: value ? '#667eea' : '#e2e8f0', position: 'relative', transition: 'background 0.2s', flexShrink: 0
 }}>
 <div style={{
 width: '18px', height: '18px', borderRadius: '50%', background: 'white',
 position: 'absolute', top: '3px', left: value ? '23px' : '3px', transition: 'left 0.2s',
 boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
 }} />
 </button>
 )

 const Row = ({ icon, label, desc, prefKey }) => (
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f7fafc', borderRadius: '10px', gap: '12px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
 <span style={{ fontSize: '18px' }}>{icon}</span>
 <div>
 <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>{label}</div>
 {desc && <div style={{ fontSize: '11px', color: '#718096', marginTop: '1px' }}>{desc}</div>}
 </div>
 </div>
 <Toggle value={prefs[prefKey]} onChange={v => update(prefKey, v)} />
 </div>
 )

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
 <Bell size={20} color="#667eea" />
 <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a202c' }}>Notification Preferences</h2>
 {saved && <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#48bb78', fontWeight: '600' }}> Saved</span>}
 </div>

 {/* Delivery Channels */}
 <div style={{ marginBottom: '20px' }}>
 <p style={{ fontSize: '11px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Delivery Channels</p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: prefs.email ? '#f0f4ff' : '#f7fafc', borderRadius: '10px', border: `1px solid ${prefs.email ? '#c3cafc' : '#e2e8f0'}`, gap: '12px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <Mail size={18} color={prefs.email ? '#667eea' : '#a0aec0'} />
 <div>
 <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>Email Notifications</div>
 <div style={{ fontSize: '11px', color: '#718096' }}>{user?.email || 'No email set'}</div>
 </div>
 </div>
 <Toggle value={prefs.email} onChange={v => update('email', v)} />
 </div>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: prefs.sms ? '#f0fff4' : '#f7fafc', borderRadius: '10px', border: `1px solid ${prefs.sms ? '#9ae6b4' : '#e2e8f0'}`, gap: '12px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <Phone size={18} color={prefs.sms ? '#48bb78' : '#a0aec0'} />
 <div>
 <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>SMS Notifications</div>
 <div style={{ fontSize: '11px', color: '#718096' }}>{user?.phone ? `+91 ${user.phone}` : 'No phone set'}</div>
 </div>
 </div>
 <Toggle value={prefs.sms} onChange={v => update('sms', v)} />
 </div>
 </div>
 </div>

 {/* Alert types */}
 <div style={{ marginBottom: '20px' }}>
 <p style={{ fontSize: '11px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Alert Types</p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 <Row icon="" label="EMI Due Reminders" desc="3 and 7 days before EMI due date" prefKey="emiReminder" />
 <Row icon="" label="Loan Accepted" desc="When a lender accepts your application" prefKey="loanAccepted" />
 <Row icon="" label="Payment Received" desc="When a borrower makes a repayment" prefKey="paymentReceived" />
 <Row icon="" label="Security Alerts" desc="Suspicious account activity" prefKey="suspiciousActivity" />
 </div>
 </div>

 {/* Test button */}
 <button onClick={sendTest} style={{
 width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px dashed #e2e8f0',
 background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#718096',
 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
 }}>
 {testSent ? <><CheckCircle size={16} color="#48bb78" /> Notification logged!</> : <><Bell size={16} /> Send Test Notification</>}
 </button>
 </div>
 )
}

// ─── Notification Log (inbox) ─────────────────────────────────────────────────
export function NotificationLog({ userId }) {
 const [log, setLog] = useState([])

 useEffect(() => {
 const all = loadNotifLog()
 setLog(all.filter(n => n.userId === userId))
 }, [userId])

 const markRead = (id) => {
 const updated = log.map(n => n.id === id ? { ...n, read: true } : n)
 setLog(updated)
 // persist
 const all = loadNotifLog()
 const merged = all.map(n => n.id === id ? { ...n, read: true } : n)
 localStorage.setItem(LOG_KEY, JSON.stringify(merged))
 }

 const dismiss = (id) => {
 const updated = log.filter(n => n.id !== id)
 setLog(updated)
 const all = loadNotifLog().filter(n => n.id !== id)
 localStorage.setItem(LOG_KEY, JSON.stringify(all))
 }

 if (log.length === 0) return (
 <div style={{ textAlign: 'center', padding: '32px 16px' }}>
 <div style={{ fontSize: '36px', marginBottom: '8px' }}></div>
 <p style={{ margin: 0, fontSize: '13px', color: '#a0aec0' }}>No notifications sent yet. Configure your preferences above.</p>
 </div>
 )

 return (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {log.map(n => (
 <div key={n.id} style={{
 padding: '12px 14px', borderRadius: '10px', background: n.read ? '#f9fbfd' : '#f0f4ff',
 border: `1px solid ${n.read ? '#e2e8f0' : '#c3cafc'}`, display: 'flex', gap: '12px', alignItems: 'flex-start'
 }}>
 <div style={{ fontSize: '20px', flexShrink: 0 }}>
 {n.type === 'emi_reminder' ? '' : n.type === 'loan_accepted' ? '' : n.type === 'payment_received' ? '' : n.type === 'security' ? '' : ''}
 </div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: n.read ? '500' : '700', color: '#1a202c' }}>{n.message}</p>
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
 {n.channels.map(ch => (
 <span key={ch} style={{ fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '8px',
 background: ch === 'Email' ? '#ebf4ff' : '#f0fff4', color: ch === 'Email' ? '#2b6cb0' : '#276749' }}>
 {ch === 'Email' ? '' : ''} {ch} sent
 </span>
 ))}
 {n.sentTo?.email && <span style={{ fontSize: '10px', color: '#a0aec0' }}>→ {n.sentTo.email}</span>}
 </div>
 <span style={{ fontSize: '11px', color: '#a0aec0' }}>
 {new Date(n.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
 {!n.read && <button onClick={() => markRead(n.id)} title="Mark read"
 style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#667eea' }}></button>}
 <button onClick={() => dismiss(n.id)} title="Dismiss"
 style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}><X size={14} /></button>
 </div>
 </div>
 ))}
 </div>
 )
}

// ─── Hook: auto-send EMI reminder notifications ───────────────────────────────
export function useEMIReminders(user, loans, transactions) {
 useEffect(() => {
 if (!user || !loans.length) return
 const prefs = loadPrefs(user.id)
 if (!prefs.emiReminder || (!prefs.email && !prefs.sms)) return

 const today = new Date()
 const sentKey = `emi_sent_${user.id}`
 const sentSet = new Set(JSON.parse(localStorage.getItem(sentKey) || '[]'))

 const myLoans = loans.filter(l => (l.borrowerId === user.id || l.borrowerName === user.name) && l.status === 'active')
 myLoans.forEach(loan => {
 const startDate = new Date(loan.acceptedAt || loan.createdAt || Date.now())
 const monthlyRate = loan.interestRate / 100 / 12
 const emi = monthlyRate === 0
 ? loan.amount / loan.term
 : (loan.amount * (monthlyRate * Math.pow(1 + monthlyRate, loan.term))) / (Math.pow(1 + monthlyRate, loan.term) - 1)

 for (let i = 1; i <= loan.term; i++) {
 const dueDate = new Date(startDate)
 dueDate.setMonth(dueDate.getMonth() + i)
 const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
 const key = `${loan.id}-${i}`
 if ((diffDays === 7 || diffDays === 3) && !sentSet.has(`${key}-${diffDays}`)) {
 const msg = `Reminder: EMI #${i} of ₹${Math.round(emi).toLocaleString('en-IN')} for your loan is due in ${diffDays} day${diffDays > 1 ? 's' : ''} (${dueDate.toLocaleDateString('en-IN')}).`
 pushNotification(user.id, user.email, user.phone, prefs, 'emi_reminder', msg)
 sentSet.add(`${key}-${diffDays}`)
 }
 }
 })
 localStorage.setItem(sentKey, JSON.stringify([...sentSet]))
 }, [user?.id, loans.length])
}

// ─── Helper: fire a loan-accepted notification ────────────────────────────────
export function notifyLoanAccepted(borrowerId, borrowerEmail, borrowerPhone, loanAmount, lenderName) {
 try {
 const raw = localStorage.getItem(PREF_KEY)
 const all = raw ? JSON.parse(raw) : {}
 const prefs = all[borrowerId] || { email: true, sms: false, loanAccepted: true }
 if (!prefs.loanAccepted) return
 const msg = `Great news! ${lenderName} has accepted your loan application for ₹${loanAmount.toLocaleString('en-IN')}. Funds will be disbursed to your account shortly.`
 pushNotification(borrowerId, borrowerEmail, borrowerPhone, prefs, 'loan_accepted', msg)
 } catch {}
}

// ─── Helper: fire a payment-received notification ─────────────────────────────
export function notifyPaymentReceived(lenderId, lenderEmail, lenderPhone, borrowerName, amount) {
 try {
 const raw = localStorage.getItem(PREF_KEY)
 const all = raw ? JSON.parse(raw) : {}
 const prefs = all[lenderId] || { email: true, sms: false, paymentReceived: true }
 if (!prefs.paymentReceived) return
 const msg = `${borrowerName} made a repayment of ₹${amount.toLocaleString('en-IN')} on their loan.`
 pushNotification(lenderId, lenderEmail, lenderPhone, prefs, 'payment_received', msg)
 } catch {}
}
