import { useState } from 'react'
import { LogIn, Clock, ShieldCheck, X, Phone, User, Mail, Lock, Eye, EyeOff, KeyRound, RefreshCw, Award, CheckCircle } from 'lucide-react'
import { LogoIcon } from '../components/Logo'
import './Login.css'

const DEFAULT_SAMPLE_USERS = [
 { id: 2, name: 'John Lender', email: 'lender@loanhub.com', password: 'lender123', role: 'lender', phone: '9000000002', status: 'active', dob: '1985-06-15', panCard: 'ABCDE1234F', aadhaarCard: '123456789012', annualIncome: '1200000' },
 { id: 3, name: 'Jane Borrower', email: 'borrower@loanhub.com', password: 'borrower123', role: 'borrower', phone: '9000000003', status: 'active', dob: '1992-03-22', panCard: 'PQRST5678G', aadhaarCard: '987654321098', annualIncome: '600000' },
 { id: 4, name: 'Analyst Pro', email: 'analyst@loanhub.com', password: 'analyst123', role: 'analyst', phone: '9000000004', status: 'active', dob: '1990-11-08', panCard: 'LMNOP9012H', aadhaarCard: '456789012345', education: 'MBA Finance' }
]

function getCustomAdmin() {
 try { const s = localStorage.getItem('customAdmin'); return s ? JSON.parse(s) : null } catch { return null }
}
function saveCustomAdmin(admin) { localStorage.setItem('customAdmin', JSON.stringify(admin)) }

function getDeletedUserIds() {
 try { const s = localStorage.getItem('deletedUserIds'); return s ? JSON.parse(s) : [] } catch { return [] }
}
function saveDeletedUserIds(ids) { localStorage.setItem('deletedUserIds', JSON.stringify(ids)) }

function getAllUsers() {
 try {
 const saved = localStorage.getItem('registeredUsers')
 const registered = saved ? JSON.parse(saved) : []
 const deletedIds = getDeletedUserIds()
 // Start with defaults, skip any that were deleted
 const merged = DEFAULT_SAMPLE_USERS.filter(u => !deletedIds.includes(u.id)).map(u => {
 // Check if status was overridden in registeredUsers (e.g. suspended)
 const override = registered.find(r => r.email === u.email)
 return override ? { ...u, ...override } : u
 })
 // Add any extra registered users (not in defaults), skip deleted
 for (const ru of registered) {
 if (!DEFAULT_SAMPLE_USERS.find(u => u.email === ru.email) && !deletedIds.includes(ru.id)) {
 merged.push(ru)
 }
 }
 const admin = getCustomAdmin()
 if (admin && !deletedIds.includes(admin.id) && !merged.find(u => u.email === admin.email)) merged.push(admin)
 return merged
 } catch { return DEFAULT_SAMPLE_USERS }
}

function saveRegisteredUser(newUser) {
 try {
 const saved = localStorage.getItem('registeredUsers')
 const registered = saved ? JSON.parse(saved) : []
 registered.push(newUser)
 localStorage.setItem('registeredUsers', JSON.stringify(registered))
 } catch (e) { console.error('Failed to save user', e) }
}

function savePendingAnalyst(user) {
 try {
 const saved = localStorage.getItem('pendingAnalysts')
 const pending = saved ? JSON.parse(saved) : []
 pending.push(user)
 localStorage.setItem('pendingAnalysts', JSON.stringify(pending))
 } catch (e) { console.error('Failed to save pending analyst', e) }
}

// ─── Admin Modal ──────────────────────────────────────────────────────────────
function AdminModal({ onClose, onLogin, setUsers }) {
 const existingAdmin = getCustomAdmin()
 const isFirstTime = !existingAdmin

 const [regName, setRegName] = useState('')
 const [regEmail, setRegEmail] = useState('')
 const [regPhone, setRegPhone] = useState('')
 const [regDob, setRegDob] = useState('')
 const [regPassword, setRegPassword] = useState('')
 const [showRegPwd, setShowRegPwd] = useState(false)
 const [loginName, setLoginName] = useState('')
 const [loginPassword, setLoginPassword] = useState('')
 const [showLoginPwd, setShowLoginPwd] = useState(false)
 const [error, setError] = useState('')

 const handleRegister = (e) => {
 e.preventDefault(); setError('')
 if (!regName || !regEmail || !regPhone || !regDob || !regPassword) { setError('Please fill in all fields.'); return }
 if (regPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
 if (!/^\d{10}$/.test(regPhone)) { setError('Phone number must be exactly 10 digits.'); return }
 if (getAllUsers().some(u => u.email === regEmail)) { setError('This email is already registered.'); return }
 const newAdmin = { id: Date.now(), name: regName, email: regEmail, phone: regPhone, dob: regDob, password: regPassword, role: 'admin', status: 'active' }
 saveCustomAdmin(newAdmin)
 setUsers(getAllUsers().map(({ password: _p, ...u }) => u))
 const { password: _p, ...withoutPwd } = newAdmin
 onLogin(withoutPwd); onClose()
 }

 const handleLoginSubmit = (e) => {
 e.preventDefault(); setError('')
 if (!loginName || !loginPassword) { setError('Please enter your name and password.'); return }
 const admin = getCustomAdmin()
 if (!admin) { setError('No admin account found. Please register first.'); return }
 if (admin.name.trim().toLowerCase() !== loginName.trim().toLowerCase()) { setError('Admin name does not match.'); return }
 if (admin.password !== loginPassword) { setError('Incorrect password.'); return }
 setUsers(getAllUsers().map(({ password: _p, ...u }) => u))
 const { password: _p, ...withoutPwd } = admin
 onLogin(withoutPwd); onClose()
 }

 const inp = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
 const lbl = { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }
 const grp = { marginBottom: '14px' }

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
 <div style={{ background: 'white', borderRadius: '18px', padding: '32px 28px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
 <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: '#f7fafc', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#718096' }}><X size={18} /></button>
 <div style={{ textAlign: 'center', marginBottom: '24px' }}>
 <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><ShieldCheck size={28} color="white" /></div>
 <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1a202c' }}>{isFirstTime ? 'Admin Registration' : 'Admin Login'}</h2>
 <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#718096' }}>{isFirstTime ? 'Set up the admin account for LoanHub' : 'Secure admin access — one account only'}</p>
 </div>
 {error && <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '14px', fontWeight: '500' }}>{error}</div>}

 {isFirstTime ? (
 <form onSubmit={handleRegister}>
 <div style={grp}><label style={lbl}><User size={13} style={{ marginRight: 4 }} />Full Name</label><input style={inp} type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Enter admin full name" /></div>
 <div style={grp}><label style={lbl}><Mail size={13} style={{ marginRight: 4 }} />Email Address</label><input style={inp} type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Enter admin email" /></div>
 <div style={grp}><label style={lbl}><Phone size={13} style={{ marginRight: 4 }} />Phone Number</label><input style={inp} type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="10-digit phone number" maxLength={10} /></div>
 <div style={grp}><label style={lbl}> Date of Birth</label><input style={inp} type="date" value={regDob} onChange={e => setRegDob(e.target.value)} max={new Date().toISOString().split('T')[0]} /></div>
 <div style={grp}>
 <label style={lbl}><Lock size={13} style={{ marginRight: 4 }} />Password</label>
 <div style={{ position: 'relative' }}>
 <input style={{ ...inp, paddingRight: '40px' }} type={showRegPwd ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min 6 characters" />
 <button type="button" onClick={() => setShowRegPwd(p => !p)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: 0 }}>{showRegPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
 </div>
 </div>
 <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><ShieldCheck size={16} /> Create Admin Account</button>
 </form>
 ) : (
 <form onSubmit={handleLoginSubmit}>
 <div style={grp}><label style={lbl}><User size={13} style={{ marginRight: 4 }} />Admin Name</label><input style={inp} type="text" value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Enter your admin name" /></div>
 <div style={grp}>
 <label style={lbl}><Lock size={13} style={{ marginRight: 4 }} />Password</label>
 <div style={{ position: 'relative' }}>
 <input style={{ ...inp, paddingRight: '40px' }} type={showLoginPwd ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter password" />
 <button type="button" onClick={() => setShowLoginPwd(p => !p)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: 0 }}>{showLoginPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
 </div>
 </div>
 <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><LogIn size={16} /> Login as Admin</button>
 </form>
 )}
 </div>
 </div>
 )
}

// ─── OTP helper (simulated — logs to console in dev) ──────────────────────────
function generateOTP() { return String(Math.floor(100000 + Math.random() * 900000)) }

function saveOTP(email, otp, type = 'reset') {
 const key = `otp_${type}_${email}`
 localStorage.setItem(key, JSON.stringify({ otp, expiresAt: Date.now() + 5 * 60 * 1000 }))
 console.info(`[LoanHub OTP] ${type.toUpperCase()} OTP for ${email}: ${otp} (valid 5 min)`)
}

function verifyOTP(email, enteredOtp, type = 'reset') {
 try {
 const key = `otp_${type}_${email}`
 const stored = JSON.parse(localStorage.getItem(key) || 'null')
 if (!stored) return 'No OTP found. Please request a new one.'
 if (Date.now() > stored.expiresAt) { localStorage.removeItem(key); return 'OTP has expired. Please request a new one.' }
 if (stored.otp !== enteredOtp.trim()) return 'Incorrect OTP. Please try again.'
 localStorage.removeItem(key)
 return null // success
 } catch { return 'Invalid OTP. Please try again.' }
}

// ─── Forgot Password Modal ────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
 const [step, setStep] = useState(1) // 1=enter email, 2=enter otp+new pwd
 const [fpEmail, setFpEmail] = useState('')
 const [fpOtp, setFpOtp] = useState('')
 const [newPwd, setNewPwd] = useState('')
 const [showPwd, setShowPwd] = useState(false)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')
 const [resendCooldown, setResendCooldown] = useState(0)

 const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }
 const card = { background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px', margin: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }
 const inp = { width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }

 const startCooldown = () => {
 setResendCooldown(30)
 const t = setInterval(() => setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
 }

 const handleSendOtp = () => {
 setError(''); setSuccess('')
 if (!fpEmail) { setError('Please enter your email address.'); return }
 const user = getAllUsers().find(u => u.email === fpEmail)
 if (!user) { setError('No account found with this email address.'); return }
 const otp = generateOTP()
 saveOTP(fpEmail, otp, 'reset')
 setSuccess(` OTP sent! Check the browser console (F12 → Console) for your 6-digit code.`)
 setStep(2)
 startCooldown()
 }

 const handleResend = () => {
 if (resendCooldown > 0) return
 const otp = generateOTP()
 saveOTP(fpEmail, otp, 'reset')
 setSuccess('New OTP sent! Check the browser console.')
 startCooldown()
 }

 const handleReset = () => {
 setError(''); setSuccess('')
 if (!fpOtp) { setError('Please enter the OTP.'); return }
 if (!newPwd || newPwd.length < 6) { setError('New password must be at least 6 characters.'); return }
 const err = verifyOTP(fpEmail, fpOtp, 'reset')
 if (err) { setError(err); return }

 // Update password in storage
 const allUsers = getAllUsers()
 const user = allUsers.find(u => u.email === fpEmail)
 if (!user) { setError('User not found.'); return }

 // Update in registeredUsers
 try {
 const saved = localStorage.getItem('registeredUsers')
 const reg = saved ? JSON.parse(saved) : []
 const updatedReg = reg.map(u => u.email === fpEmail ? { ...u, password: newPwd } : u)
 // If not in registeredUsers, add an override entry
 if (!updatedReg.find(u => u.email === fpEmail)) {
 updatedReg.push({ ...user, password: newPwd })
 }
 localStorage.setItem('registeredUsers', JSON.stringify(updatedReg))
 } catch { /* default user, can't persist */ }

 // If admin
 try {
 const admin = JSON.parse(localStorage.getItem('customAdmin') || 'null')
 if (admin && admin.email === fpEmail) {
 localStorage.setItem('customAdmin', JSON.stringify({ ...admin, password: newPwd }))
 }
 } catch { /* */ }

 setSuccess(' Password reset successfully! You can now log in with your new password.')
 setTimeout(() => onClose(), 2000)
 }

 return (
 <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
 <div style={card}>
 <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}><X size={20} /></button>
 <div style={{ textAlign: 'center', marginBottom: '24px' }}>
 <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
 <KeyRound size={24} color="white" />
 </div>
 <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1a202c' }}>Reset Password</h2>
 <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#718096' }}>
 {step === 1 ? 'Enter your email to receive an OTP' : `Enter the OTP sent to ${fpEmail}`}
 </p>
 </div>

 {error && <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c53030', marginBottom: '16px' }}>{error}</div>}
 {success && <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#276749', marginBottom: '16px' }}>{success}</div>}

 {step === 1 && (
 <>
 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#4a5568' }}>Email Address</label>
 <input style={inp} type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="Enter your registered email" />
 </div>
 <button onClick={handleSendOtp} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
 Send OTP
 </button>
 </>
 )}

 {step === 2 && (
 <>
 <div style={{ marginBottom: '14px' }}>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#4a5568' }}>6-Digit OTP</label>
 <input style={{ ...inp, letterSpacing: '6px', fontSize: '20px', textAlign: 'center', fontWeight: '700' }} type="text" value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} />
 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
 <button onClick={handleResend} disabled={resendCooldown > 0} style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontSize: '12px', color: resendCooldown > 0 ? '#a0aec0' : '#667eea', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
 <RefreshCw size={12} /> {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
 </button>
 </div>
 </div>
 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#4a5568' }}>New Password</label>
 <div style={{ position: 'relative' }}>
 <input style={{ ...inp, paddingRight: '42px' }} type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 6 characters" />
 <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: 0 }}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
 </div>
 </div>
 <button onClick={handleReset} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
 Reset Password
 </button>
 </>
 )}
 </div>
 </div>
 )
}

// ─── 2FA OTP Verification Modal ───────────────────────────────────────────────
function TwoFactorModal({ email, onVerify, onCancel }) {
 const [otp, setOtp] = useState('')
 const [error, setError] = useState('')
 const [resendCooldown, setResendCooldown] = useState(0)

 const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }
 const card = { background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', margin: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }
 const inp = { width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '24px', outline: 'none', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '8px', fontWeight: '700' }

 const startCooldown = () => {
 setResendCooldown(30)
 const t = setInterval(() => setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
 }

 const handleResend = () => {
 if (resendCooldown > 0) return
 const newOtp = generateOTP()
 saveOTP(email, newOtp, '2fa')
 startCooldown()
 }

 const handleVerify = () => {
 setError('')
 const err = verifyOTP(email, otp, '2fa')
 if (err) { setError(err); return }
 onVerify()
 }

 return (
 <div style={overlay}>
 <div style={card}>
 <button onClick={onCancel} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}><X size={20} /></button>
 <div style={{ textAlign: 'center', marginBottom: '24px' }}>
 <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #48bb78, #38a169)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
 <ShieldCheck size={24} color="white" />
 </div>
 <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1a202c' }}>Two-Factor Authentication</h2>
 <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#718096', lineHeight: '1.5' }}>
 A 6-digit OTP has been sent to your registered account.<br />
 <strong>Check the browser console (F12 → Console)</strong> for the code.
 </p>
 </div>

 {error && <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c53030', marginBottom: '16px' }}>{error}</div>}

 <input style={inp} type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} autoFocus />

 <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0 16px' }}>
 <button onClick={handleResend} disabled={resendCooldown > 0} style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontSize: '12px', color: resendCooldown > 0 ? '#a0aec0' : '#667eea', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
 <RefreshCw size={12} /> {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
 </button>
 </div>

 <button onClick={handleVerify} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #48bb78, #38a169)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginBottom: '10px' }}>
 Verify OTP
 </button>
 <button onClick={onCancel} style={{ width: '100%', padding: '10px', background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', color: '#718096' }}>
 Cancel Login
 </button>
 </div>
 </div>
 )
}

// ─── Helper: get 2FA preference for a user ───────────────────────────────────
function is2FAEnabled(userId) {
 try { return localStorage.getItem(`2fa_enabled_${userId}`) === 'true' } catch { return false }
}

// ─── Main Login component ─────────────────────────────────────────────────────
export default function Login({ onLogin, setUsers }) {
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')
 const [isSignUp, setIsSignUp] = useState(false)
 const [name, setName] = useState('')
 const [phone, setPhone] = useState('')
 const [dob, setDob] = useState('')
 const [role, setRole] = useState('borrower')
 const [panCard, setPanCard] = useState('')
 const [aadhaarCard, setAadhaarCard] = useState('')
 const [annualIncome, setAnnualIncome] = useState('')
 const [education, setEducation] = useState('')
 const [showAdminModal, setShowAdminModal] = useState(false)
 const [showForgotPassword, setShowForgotPassword] = useState(false)
 // 2FA state
 const [pending2FAUser, setPending2FAUser] = useState(null) // user object awaiting 2FA
 const [allUsersRef, setAllUsersRef] = useState([])

 const handleLogin = (e) => {
 e.preventDefault(); setError(''); setSuccess('')
 const allUsers = getAllUsers()
 const user = allUsers.find(u => u.email === email && u.password === password)
 if (!user) { setError('Invalid email or password. Please check your credentials.'); return }
 if (user.status === 'suspended') { setError('Your account has been suspended by the admin. Please contact support.'); return }
 if (user.status === 'pending') { setError('Your Financial Analyst account is pending admin approval. Please wait for approval before logging in.'); return }
 if (user.role === 'admin') { setError('Admin accounts must log in using the "Admin Login" button below.'); return }

 // Check if 2FA is enabled
 if (is2FAEnabled(user.id)) {
 const otp = generateOTP()
 saveOTP(user.email, otp, '2fa')
 setPending2FAUser(user)
 setAllUsersRef(allUsers)
 return
 }

 const { password: _pwd, ...userWithoutPassword } = user
 // Record last login
 try {
 const reg = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
 const updated = reg.map(u => u.email === user.email ? { ...u, lastLogin: new Date().toISOString() } : u)
 localStorage.setItem('registeredUsers', JSON.stringify(updated))
 } catch { /* */ }
 onLogin({ ...userWithoutPassword, lastLogin: new Date().toISOString() })
 setUsers(allUsers.map(({ password: _p, ...u }) => u))
 }

 const handleSignUp = (e) => {
 e.preventDefault(); setError(''); setSuccess('')
 if (!name || !email || !password || !phone || !dob) { setError('Please fill in all required fields'); return }
 if (password.length < 6) { setError('Password must be at least 6 characters'); return }
 if (!/^\d{10}$/.test(phone)) { setError('Phone number must be exactly 10 digits'); return }
 if (role === 'admin') { setError('Use the "Admin Login" button to register or access the admin account.'); return }

 // Role-specific validation
 if ((role === 'borrower' || role === 'lender')) {
 if (!panCard || !aadhaarCard || !annualIncome) { setError('Please fill in PAN Card, Aadhaar Card and Annual Income'); return }
 if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard.toUpperCase())) { setError('Invalid PAN card format (e.g. ABCDE1234F)'); return }
 if (!/^\d{12}$/.test(aadhaarCard)) { setError('Aadhaar card must be exactly 12 digits'); return }
 }
 if (role === 'analyst') {
 if (!panCard || !aadhaarCard || !education) { setError('Please fill in PAN Card, Aadhaar Card and Education'); return }
 if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard.toUpperCase())) { setError('Invalid PAN card format (e.g. ABCDE1234F)'); return }
 if (!/^\d{12}$/.test(aadhaarCard)) { setError('Aadhaar card must be exactly 12 digits'); return }
 }

 const allUsers = getAllUsers()
 if (allUsers.some(u => u.email === email)) { setError('Email already registered. Please login instead.'); return }

 if (role === 'analyst') {
 const savedPending = localStorage.getItem('pendingAnalysts')
 const pending = savedPending ? JSON.parse(savedPending) : []
 if (pending.some(u => u.email === email)) { setError('This email already has a pending analyst application.'); return }
 const pendingUser = { id: Date.now(), name, email, password, phone, dob, panCard: panCard.toUpperCase(), aadhaarCard, education, role: 'analyst', status: 'pending', requestedAt: new Date().toISOString() }
 savePendingAnalyst(pendingUser)
 setSuccess('Your Financial Analyst account request has been submitted! Please wait for admin approval before logging in.')
 setIsSignUp(false); setPassword(''); setName(''); setPhone(''); setDob(''); setRole('borrower'); setPanCard(''); setAadhaarCard(''); setAnnualIncome(''); setEducation('')
 return
 }

 const newUser = { id: Date.now(), name, email, password, phone, dob, role, status: 'active',
 ...(role === 'borrower' || role === 'lender' ? { panCard: panCard.toUpperCase(), aadhaarCard, annualIncome } : {})
 }
 saveRegisteredUser(newUser)
 setUsers([...allUsers, newUser].map(({ password: _p, ...u }) => u))
 setSuccess('Account created successfully! Please login with your credentials.')
 setIsSignUp(false); setPassword(''); setName(''); setPhone(''); setDob(''); setRole('borrower'); setPanCard(''); setAadhaarCard(''); setAnnualIncome(''); setEducation('')
 }

 const reset = () => { setError(''); setSuccess(''); setEmail(''); setPassword(''); setName(''); setPhone(''); setDob(''); setRole('borrower'); setPanCard(''); setAadhaarCard(''); setAnnualIncome(''); setEducation('') }

 const inp = { width: '100%', padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }

 // Password strength meter
 const getPasswordStrength = (pwd) => {
 if (!pwd) return { score: 0, label: '', color: '#e2e8f0' }
 let score = 0
 if (pwd.length >= 6) score++
 if (pwd.length >= 10) score++
 if (/[A-Z]/.test(pwd)) score++
 if (/[0-9]/.test(pwd)) score++
 if (/[^A-Za-z0-9]/.test(pwd)) score++
 if (score <= 1) return { score, label: 'Weak', color: '#e53e3e' }
 if (score <= 2) return { score, label: 'Fair', color: '#d69e2e' }
 if (score <= 3) return { score, label: 'Good', color: '#38a169' }
 return { score, label: 'Strong', color: '#1a73e8' }
 }
 const pwdStrength = isSignUp ? getPasswordStrength(password) : null

 // 2FA verified callback
 const handle2FAVerified = () => {
 if (!pending2FAUser) return
 const { password: _pwd, ...userWithoutPassword } = pending2FAUser
 const lastLogin = new Date().toISOString()
 onLogin({ ...userWithoutPassword, lastLogin })
 setUsers(allUsersRef.map(({ password: _p, ...u }) => u))
 setPending2FAUser(null)
 }

 return (
 <div className="login-container">
 {showAdminModal && <AdminModal onClose={() => setShowAdminModal(false)} onLogin={onLogin} setUsers={setUsers} />}
 {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
 {pending2FAUser && (
 <TwoFactorModal
 email={pending2FAUser.email}
 onVerify={handle2FAVerified}
 onCancel={() => setPending2FAUser(null)}
 />
 )}
 <div className="login-card">
 <div className="login-header">
 <LogoIcon size={52} />
 <h1>LoanHub</h1>
 <p>Financial Loan Management Platform</p>
 </div>

 <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="login-form">
 <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
 {error && <div className="alert alert-error">{error}</div>}
 {success && (
 <div className="alert alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
 {success.includes('pending') && <Clock size={18} style={{ marginTop: '2px', flexShrink: 0 }} />}
 <span>{success}</span>
 </div>
 )}

 {isSignUp && <>
 <div className="form-group"><label>Full Name *</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" /></div>
 </>}

 <div className="form-group"><label>Email Address *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" /></div>

 {isSignUp && <>
 <div className="form-group"><label>Phone Number *</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit phone number" maxLength={10} /></div>
 <div className="form-group"><label>Date of Birth *</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} /></div>
 </>}

 <div className="form-group">
 <label>Password *</label>
 <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
 {isSignUp && password && (
 <div style={{ marginTop: '8px' }}>
 <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
 {[1,2,3,4].map(i => (
 <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= pwdStrength.score ? pwdStrength.color : '#e2e8f0', transition: 'background 0.3s' }} />
 ))}
 </div>
 <div style={{ fontSize: '11px', color: pwdStrength.color, fontWeight: '600' }}>{pwdStrength.label} password{pwdStrength.score < 3 ? ' — add uppercase, numbers or symbols' : ''}</div>
 </div>
 )}
 {!isSignUp && (
 <button type="button" onClick={() => setShowForgotPassword(true)}
 style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667eea', fontSize: '12px', fontWeight: '600', padding: '4px 0 0', display: 'block', textAlign: 'right', width: '100%' }}>
 Forgot Password?
 </button>
 )}
 </div>

 {isSignUp && <>
 <div className="form-group">
 <label>Role *</label>
 <select value={role} onChange={e => { setRole(e.target.value); setPanCard(''); setAadhaarCard(''); setAnnualIncome(''); setEducation('') }}>
 <option value="borrower">Borrower</option>
 <option value="lender">Lender</option>
 <option value="analyst">Financial Analyst (Requires Admin Approval)</option>
 </select>
 {role === 'analyst' && <p style={{ fontSize: '12px', color: '#d69e2e', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> Financial Analyst accounts require admin approval before you can log in.</p>}
 </div>

 {/* Borrower / Lender extra fields */}
 {(role === 'borrower' || role === 'lender') && <>
 <div style={{ margin: '4px 0 12px', padding: '10px 14px', background: '#ebf4ff', borderRadius: '8px', fontSize: '12px', color: '#2b6cb0', fontWeight: '500' }}>
 KYC details required for {role === 'borrower' ? 'Borrowers' : 'Lenders'}
 </div>
 <div className="form-group"><label>PAN Card Number *</label><input type="text" value={panCard} onChange={e => setPanCard(e.target.value.toUpperCase())} placeholder="e.g. ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} /></div>
 <div className="form-group"><label>Aadhaar Card Number *</label><input type="text" value={aadhaarCard} onChange={e => setAadhaarCard(e.target.value.replace(/\D/g,''))} placeholder="12-digit Aadhaar number" maxLength={12} /></div>
 <div className="form-group"><label>Annual Income (₹) *</label><input type="number" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} placeholder="Enter annual income in ₹" min={0} /></div>
 </>}

 {/* Analyst extra fields */}
 {role === 'analyst' && <>
 <div style={{ margin: '4px 0 12px', padding: '10px 14px', background: '#fefcbf', borderRadius: '8px', fontSize: '12px', color: '#744210', fontWeight: '500' }}>
 Professional details required for Financial Analysts
 </div>
 <div className="form-group"><label>PAN Card Number *</label><input type="text" value={panCard} onChange={e => setPanCard(e.target.value.toUpperCase())} placeholder="e.g. ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} /></div>
 <div className="form-group"><label>Aadhaar Card Number *</label><input type="text" value={aadhaarCard} onChange={e => setAadhaarCard(e.target.value.replace(/\D/g,''))} placeholder="12-digit Aadhaar number" maxLength={12} /></div>
 <div className="form-group">
 <label>Highest Education *</label>
 <select value={education} onChange={e => setEducation(e.target.value)}>
 <option value="">Select education</option>
 <option value="B.Com">B.Com</option>
 <option value="BBA">BBA</option>
 <option value="MBA Finance">MBA Finance</option>
 <option value="CA (Chartered Accountant)">CA (Chartered Accountant)</option>
 <option value="CFA (CFA Institute)">CFA (CFA Institute)</option>
 <option value="M.Com">M.Com</option>
 <option value="B.Sc Economics">B.Sc Economics</option>
 <option value="Other">Other</option>
 </select>
 </div>
 </>}
 </>}

 <button type="submit" className="btn btn-primary btn-block"><LogIn size={20} />{isSignUp ? 'Create Account' : 'Login'}</button>
 </form>

 {isSignUp ? (
 <><div className="login-divider">Already have an account?</div><button onClick={() => { reset(); setIsSignUp(false) }} className="btn btn-outline btn-block">Sign In</button></>
 ) : (
 <><div className="login-divider" style={{ marginBottom: '10px' }} /><button onClick={() => { reset(); setIsSignUp(true) }} className="btn btn-outline btn-block">Create Account</button></>
 )}

 {!isSignUp && (
 <button onClick={() => setShowAdminModal(true)} style={{ marginTop: '10px', width: '100%', padding: '11px 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(102,126,234,0.35)' }}>
 <ShieldCheck size={16} />{getCustomAdmin() ? 'Admin Login' : 'Admin Login / Register'}
 </button>
 )}

 {/* Trust badges */}
 <div style={{ marginTop: '20px', padding: '14px', background: '#f7fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
 <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
 {[
 { icon: <Lock size={13} />, label: '256-bit SSL' },
 { icon: <ShieldCheck size={13} />, label: 'RBI Compliant' },
 { icon: <Award size={13} />, label: 'ISO 27001' },
 { icon: <CheckCircle size={13} />, label: 'KYC Verified' },
 ].map((b, i) => (
 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary, #4a5568)' }}>
 <span style={{ color: '#1a73e8' }}>{b.icon}</span>{b.label}
 </div>
 ))}
 </div>
 <p style={{ textAlign: 'center', fontSize: '10px', color: '#718096', margin: 0, lineHeight: '1.5' }}>
 LoanHub is registered under RBI NBFC guidelines (Reg. No. N-05.01234). Your data is encrypted and protected under IT Act 2000.
 </p>
 </div>
 </div>
 </div>
 )
}

// ─── Export 2FA toggle helper for Profile page ────────────────────────────────
export function toggle2FA(userId, enabled) {
 localStorage.setItem(`2fa_enabled_${userId}`, enabled ? 'true' : 'false')
}
export { is2FAEnabled }
