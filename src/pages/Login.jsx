import { useState } from 'react'
import { LogIn, Clock, ShieldCheck, Lock, Eye, EyeOff, Award, CheckCircle } from 'lucide-react'
import { LogoIcon } from '../components/Logo'
import './Login.css'

const API = 'https://loanhub-backend.onrender.com/api'

// ─── 2FA helpers (kept for Profile.jsx compatibility) ─────────────────────────
export function is2FAEnabled(userId) {
  try { return localStorage.getItem(`2fa_enabled_${userId}`) === 'true' } catch { return false }
}

export function toggle2FA(userId, enabled) {
  localStorage.setItem(`2fa_enabled_${userId}`, enabled ? 'true' : 'false')
}

export default function Login({ onLogin, setUsers }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [role, setRole] = useState('borrower')
  const [panCard, setPanCard] = useState('')
  const [aadhaarCard, setAadhaarCard] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')
  const [education, setEducation] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid email or password')
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('currentUser', JSON.stringify(data.data.user))
      onLogin(data.data.user)
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, password, phone, dob, role,
          panCard: panCard.toUpperCase(),
          aadhaarCard, annualIncome, education
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      if (role === 'analyst') {
        setSuccess('Account submitted! Wait for admin approval.')
        setIsSignUp(false)
      } else {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('currentUser', JSON.stringify(data.data.user))
        onLogin(data.data.user)
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(''); setSuccess(''); setEmail(''); setPassword('')
    setName(''); setPhone(''); setDob(''); setRole('borrower')
    setPanCard(''); setAadhaarCard(''); setAnnualIncome(''); setEducation('')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogoIcon size={52} />
          <h1>LoanHub</h1>
          <p>Financial Loan Management Platform</p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="login-form">
          <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {isSignUp && (
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>

          {isSignUp && <>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} placeholder="10-digit phone number" maxLength={10} required />
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} required />
            </div>
          </>}

          <div className="form-group">
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ paddingRight: '40px' }}
                required
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isSignUp && <>
            <div className="form-group">
              <label>Role *</label>
              <select value={role} onChange={e => { setRole(e.target.value); setPanCard(''); setAadhaarCard(''); setAnnualIncome(''); setEducation('') }}>
                <option value="borrower">Borrower</option>
                <option value="lender">Lender</option>
                <option value="analyst">Financial Analyst (Requires Admin Approval)</option>
              </select>
            </div>

            {(role === 'borrower' || role === 'lender') && <>
              <div className="form-group"><label>PAN Card *</label><input type="text" value={panCard} onChange={e => setPanCard(e.target.value.toUpperCase())} placeholder="e.g. ABCDE1234F" maxLength={10} required /></div>
              <div className="form-group"><label>Aadhaar Card *</label><input type="text" value={aadhaarCard} onChange={e => setAadhaarCard(e.target.value.replace(/\D/g,''))} placeholder="12-digit number" maxLength={12} required /></div>
              <div className="form-group"><label>Annual Income (₹) *</label><input type="number" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} placeholder="Annual income" min={0} required /></div>
            </>}

            {role === 'analyst' && <>
              <div className="form-group"><label>PAN Card *</label><input type="text" value={panCard} onChange={e => setPanCard(e.target.value.toUpperCase())} placeholder="e.g. ABCDE1234F" maxLength={10} required /></div>
              <div className="form-group"><label>Aadhaar Card *</label><input type="text" value={aadhaarCard} onChange={e => setAadhaarCard(e.target.value.replace(/\D/g,''))} placeholder="12-digit number" maxLength={12} required /></div>
              <div className="form-group">
                <label>Education *</label>
                <select value={education} onChange={e => setEducation(e.target.value)} required>
                  <option value="">Select education</option>
                  <option value="B.Com">B.Com</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA Finance">MBA Finance</option>
                  <option value="CA (Chartered Accountant)">CA</option>
                  <option value="M.Com">M.Com</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>}
          </>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <LogIn size={20} />{loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Login')}
          </button>
        </form>

        {isSignUp ? (
          <><div className="login-divider">Already have an account?</div><button onClick={() => { reset(); setIsSignUp(false) }} className="btn btn-outline btn-block">Sign In</button></>
        ) : (
          <><div className="login-divider" style={{ marginBottom: '10px' }} /><button onClick={() => { reset(); setIsSignUp(true) }} className="btn btn-outline btn-block">Create Account</button></>
        )}

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
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#718096', margin: 0 }}>
            LoanHub is registered under RBI NBFC guidelines. Your data is encrypted and protected under IT Act 2000.
          </p>
        </div>
      </div>
    </div>
  )
}
