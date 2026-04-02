import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Save, User, Mail, Phone, Shield, ArrowLeft, ShieldCheck, Clock } from 'lucide-react'
import './Dashboard.css'
import { toggle2FA, is2FAEnabled } from './Login'

function TwoFAToggle({ userId }) {
 const [enabled, setEnabled] = useState(() => is2FAEnabled(userId))

 const handleToggle = () => {
 const next = !enabled
 toggle2FA(userId, next)
 setEnabled(next)
 }

 return (
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: enabled ? '#f0fff4' : '#f7fafc', borderRadius: '10px', border: `1px solid ${enabled ? '#9ae6b4' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ width: '36px', height: '36px', background: enabled ? '#48bb78' : '#e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
 <ShieldCheck size={18} color={enabled ? 'white' : '#a0aec0'} />
 </div>
 <div>
 <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>Two-Factor Authentication (2FA)</div>
 <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
 {enabled ? ' Enabled — OTP required on every login' : 'Disabled — Enable for extra account security'}
 </div>
 </div>
 </div>
 <button
 onClick={handleToggle}
 style={{
 padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
 background: enabled ? '#fc8181' : 'linear-gradient(135deg, #667eea, #764ba2)',
 color: 'white', transition: 'background 0.2s', flexShrink: 0
 }}
 >
 {enabled ? 'Disable' : 'Enable'}
 </button>
 </div>
 )
}

export default function Profile({ user, onUpdateUser }) {
 const navigate = useNavigate()
 const getAllUsers = () => {
 try {
 const saved = localStorage.getItem('registeredUsers')
 return saved ? JSON.parse(saved) : []
 } catch { return [] }
 }

 const [formData, setFormData] = useState({
 name: user?.name || '',
 email: user?.email || '',
 phone: user?.phone || '',
 })
 const [photo, setPhoto] = useState(() => {
 return localStorage.getItem(`profile_photo_${user?.id}`) || null
 })
 const [success, setSuccess] = useState('')
 const [error, setError] = useState('')
 const fileRef = useRef()

 const roleLabel = {
 lender: 'Lender',
 borrower: 'Borrower',
 analyst: 'Financial Analyst',
 admin: 'Administrator'
 }

 const roleColor = {
 lender: '#3182ce',
 borrower: '#38a169',
 analyst: '#d69e2e',
 admin: '#e53e3e'
 }

 const handlePhotoChange = (e) => {
 const file = e.target.files[0]
 if (!file) return
 if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return }
 const reader = new FileReader()
 reader.onload = (ev) => {
 const dataUrl = ev.target.result
 setPhoto(dataUrl)
 localStorage.setItem(`profile_photo_${user?.id}`, dataUrl)
 }
 reader.readAsDataURL(file)
 }

 const handleSave = (e) => {
 e.preventDefault()
 setError(''); setSuccess('')
 if (!formData.name.trim()) { setError('Name cannot be empty'); return }
 if (!/^\S+@\S+\.\S+/.test(formData.email)) { setError('Invalid email'); return }
 if (formData.phone && !/^\d{10}$/.test(formData.phone)) { setError('Phone must be 10 digits'); return }

 // Update in registeredUsers
 const registered = getAllUsers()
 const idx = registered.findIndex(u => u.id === user?.id)
 if (idx !== -1) {
 registered[idx] = { ...registered[idx], ...formData }
 localStorage.setItem('registeredUsers', JSON.stringify(registered))
 }

 // Update currentUser in localStorage
 const updated = { ...user, ...formData }
 localStorage.setItem('currentUser', JSON.stringify(updated))
 if (onUpdateUser) onUpdateUser(updated)
 setSuccess('Profile updated successfully!')
 }

 return (
 <div className="main-content">
 <div className="dashboard">
 <div className="dashboard-header">
 <button
 onClick={() => navigate(`/${user?.role}`)}
 style={{
 display: 'inline-flex', alignItems: 'center', gap: '8px',
 background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '8px',
 padding: '8px 16px', cursor: 'pointer', fontSize: '14px',
 fontWeight: '600', color: '#4a5568', marginBottom: '16px',
 transition: 'all 0.15s ease'
 }}
 onMouseEnter={e => { e.currentTarget.style.background = '#f7fafc'; e.currentTarget.style.borderColor = '#cbd5e0' }}
 onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e2e8f0' }}
 >
 <ArrowLeft size={16} /> Back to Dashboard
 </button>
 <h1>My Profile</h1>
 <p>Manage your personal information</p>
 </div>

 <div style={{ maxWidth: '600px', margin: '0 auto' }}>
 {/* Photo Section */}
 <div className="card" style={{ marginBottom: '24px', textAlign: 'center', padding: '32px' }}>
 <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
 {photo ? (
 <img
 src={photo}
 alt="Profile"
 style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e2e8f0' }}
 />
 ) : (
 <div style={{
 width: '110px', height: '110px', borderRadius: '50%', background: '#e2e8f0',
 display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #e2e8f0'
 }}>
 <User size={48} color="#a0aec0" />
 </div>
 )}
 <button
 onClick={() => fileRef.current.click()}
 style={{
 position: 'absolute', bottom: 0, right: 0,
 background: roleColor[user?.role] || '#3182ce', color: 'white',
 border: 'none', borderRadius: '50%', width: '32px', height: '32px',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
 }}
 >
 <Camera size={16} />
 </button>
 <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
 </div>
 <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700' }}>{user?.name}</h2>
 <span style={{
 display: 'inline-block', padding: '4px 16px', borderRadius: '20px',
 background: roleColor[user?.role] + '20', color: roleColor[user?.role],
 fontSize: '13px', fontWeight: '600'
 }}>
 {roleLabel[user?.role] || user?.role}
 </span>
 </div>

 {/* Form Section */}
 <div className="card" style={{ padding: '28px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
 Personal Information
 </h3>
 {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
 {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}

 <form onSubmit={handleSave}>
 <div className="form-group">
 <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 <User size={15} /> Full Name
 </label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 placeholder="Your full name"
 />
 </div>

 <div className="form-group">
 <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 <Mail size={15} /> Email Address
 </label>
 <input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 placeholder="Your email address"
 />
 </div>

 <div className="form-group">
 <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 <Phone size={15} /> Phone Number
 </label>
 <input
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 placeholder="10-digit phone number"
 maxLength={10}
 />
 </div>

 <div className="form-group">
 <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 <Shield size={15} /> Role
 </label>
 <input type="text" value={roleLabel[user?.role] || user?.role} disabled style={{ background: '#f7fafc', color: '#718096' }} />
 </div>

 <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
 <Save size={18} /> Save Changes
 </button>
 </form>
 </div>

 {/* Security Section */}
 <div className="card" style={{ padding: '28px', marginTop: '24px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <ShieldCheck size={18} color="#667eea" /> Security Settings
 </h3>

 {/* Last Login */}
 {user?.lastLogin && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f7fafc', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
 <Clock size={16} color="#718096" />
 <div>
 <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500' }}>Last Login</div>
 <div style={{ fontSize: '13px', color: '#2d3748', fontWeight: '600' }}>
 {new Date(user.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
 </div>
 </div>
 </div>
 )}

 {/* 2FA Toggle */}
 <TwoFAToggle userId={user?.id} />
 </div>
 </div>
 </div>
 </div>
 )
}
