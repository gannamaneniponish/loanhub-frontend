import { useState } from 'react'
import { LogIn, Clock, ShieldCheck, X, Phone, User, Mail, Lock, Eye, EyeOff, KeyRound, RefreshCw, Award, CheckCircle } from 'lucide-react'
import { LogoIcon } from '../components/Logo'
import { AuthAPI } from '../utils/api'
import './Login.css'

// ─── Main Login component ─────────────────────────────────────────────────────
export default function Login({ onLogin, setUsers }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [role, setRole] = useState('borrower')
  const [panCard, setPanCard] = useState('')
  const [aadhaarCard, setAadhaarCard] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')
  const [education, setEducation] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await AuthAPI.login(email, password)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('currentUser', JSON.stringify(user))
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!name || !email || !password || !phone || !dob) {
      setError('Please fill in all required fields')
      return
    }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (!/^\d{10}$/.test(phone)) { setError('Phone number must be exactly 10 digits'); return }

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

    setLoading(true)
    try {
      const userData = {
        name, email, password, phone, dob, role,
        panCard: panCard.toUpperCase(),
        aadhaarCard, annualIncome, education
      }
      const response = await AuthAPI.register(userData)
      const { token, user } = response.data
      if (role === 'analyst') {
        setSuccess('Your Financial Analyst account request has been submitted! Please wait for admin approval.')
        setIsSignUp(false)
      } else {
        localStorage.setItem('token', token)
        localStorage.setItem('currentUser', JSON.stringify(user))
        onLogin(user)
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
          {success && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              {success.includes('pending') && <Clock size={18} style={{ marginTop: '2px', flexShrink: 0 }} />}
              <span>{success}</span>
            </div>
          )}

          {isSignUp && (
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>

          {isSignUp && <>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit phone number" maxLength={10} />
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} />
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
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isSignUp && password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= pwdStrength.score ? pwdStrength.color : '#e2e8f0', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: pwdStrength.color, fontWeight: '600' }}>{pwdStrength.label} password</div>
              </div>
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
              {role === 'analyst' && <p style={{ fontSize: '12px', color: '#d69e2e', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> Financial Analyst accounts require admin approval.</p>}
            </div>

            {(role === 'borrower' || role === 'lender') && <>
              <div style={{ margin: '4px 0 12px', padding: '10px 14px', background: '#ebf4ff', borderRadius: '8px', fontSize: '12px', color: '#2b6cb0', fontWeight: '500' }}>
                KYC details required for {role === 'borrower' ? 'Borrowers' : 'Lenders'}
              </div>
              <div className="form-group"><label>PAN Card Number *</label><input type="text" value={panCard} onChange={e => setPanCard(e.target.value.toUpperCase())} placeholder="e.g. ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} /></div>
              <div className="form-group"><label>Aadhaar Card Number *</label><input type="text" value={aadhaarCard} onChange={e => setAadhaarCard(e.target.value.replace(/\D/,''))} placeholder="12-digit Aadhaar number" maxLength={12} /></div>
              <div className="form-group"><label>Annual Income (₹) *</label><input type="number" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} placeholder="Enter annual income in ₹" min={0} /></div>
            </>}

            {role === 'analyst' && <>
              <div className="form-group"><label>PAN Card Number *</label><input type="text" value={panCard} onChange={e => setPanCard(e.target.value.toUpperCase())} placeholder="e.g. ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} /></div>
              <div className="form-group"><label>Aadhaar Card Number *</label><input type="text" value={aadhaarCard} onChange={e => setAadhaarCard(e.target.value.replace(/\D/,''))} placeholder="12-digit Aadhaar number" maxLength={12} /></div>
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

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <LogIn size={20} />{loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Login')}
          </button>
        </form>

        {isSignUp ? (
          <><div className="login-divider">Already have an account?</div><button onClick={() => { reset(); setIsSignUp(false) }} className="btn btn-outline btn-block">Sign In</button></>
        ) : (
          <><div className="login-divider" style={{ marginBottom: '10px' }} /><button onClick={() => { reset(); setIsSignUp(true) }} className="btn btn-outline btn-block">Create Account</button></>
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
            LoanHub is registered under RBI NBFC guidelines. Your data is encrypted and protected under IT Act 2000.
          </p>
        </div>
      </div>
    </div>
  )
}
