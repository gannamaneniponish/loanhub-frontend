import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Smartphone, Building2, CheckCircle, AlertCircle } from 'lucide-react'
import './Dashboard.css'

export default function Payment({ loans, transactions, addTransaction, updateLoan }) {
 const { id } = useParams()
 const navigate = useNavigate()
 const loan = loans.find(l => l.id === parseInt(id))

 const [step, setStep] = useState(1) // 1=details, 2=method, 3=confirm, 4=success
 const [paymentMethod, setPaymentMethod] = useState('upi')
 const [paymentType, setPaymentType] = useState('emi') // 'emi' | 'custom' | 'full'
 const [customAmount, setCustomAmount] = useState('')
 const [upiId, setUpiId] = useState('')
 const [cardNumber, setCardNumber] = useState('')
 const [cardExpiry, setCardExpiry] = useState('')
 const [cardCvv, setCardCvv] = useState('')
 const [cardName, setCardName] = useState('')
 const [accountNumber, setAccountNumber] = useState('')
 const [ifsc, setIfsc] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')

 if (!loan) {
 return (
 <div className="main-content">
 <div className="dashboard">
 <div style={{ textAlign: 'center', padding: '60px' }}>
 <h2>Loan not found</h2>
 <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate(-1)}>Go Back</button>
 </div>
 </div>
 </div>
 )
 }

 // Calculations
 const monthlyRate = loan.interestRate / 100 / 12
 const emiAmount = monthlyRate === 0
 ? loan.amount / loan.term
 : (loan.amount * (monthlyRate * Math.pow(1 + monthlyRate, loan.term))) / (Math.pow(1 + monthlyRate, loan.term) - 1)

 const totalPayable = emiAmount * loan.term
 const paidSoFar = transactions
 .filter(t => t.loanId === loan.id && t.type === 'payment')
 .reduce((s, t) => s + t.amount, 0)
 const outstandingBalance = Math.max(totalPayable - paidSoFar, 0)
 const paidMonths = Math.floor(paidSoFar / emiAmount)
 const remainingMonths = Math.max(loan.term - paidMonths, 0)

 const getPayAmount = () => {
 if (paymentType === 'emi') return emiAmount
 if (paymentType === 'full') return outstandingBalance
 return parseFloat(customAmount) || 0
 }
 const payAmount = getPayAmount()

 const validateStep2 = () => {
 setError('')
 if (paymentType === 'custom' && (!customAmount || parseFloat(customAmount) <= 0)) {
 setError('Please enter a valid amount.'); return false
 }
 if (paymentType === 'custom' && parseFloat(customAmount) > outstandingBalance) {
 setError(`Amount cannot exceed outstanding balance of ₹${outstandingBalance.toFixed(2)}.`); return false
 }
 return true
 }

 const validateStep3 = () => {
 setError('')
 if (paymentMethod === 'upi') {
 if (!upiId || !upiId.includes('@')) { setError('Please enter a valid UPI ID (e.g. name@upi)'); return false }
 }
 if (paymentMethod === 'card') {
 if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) { setError('Please enter a valid 16-digit card number'); return false }
 if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) { setError('Please enter expiry as MM/YY'); return false }
 if (!cardCvv || cardCvv.length < 3) { setError('Please enter a valid CVV'); return false }
 if (!cardName.trim()) { setError('Please enter the name on card'); return false }
 }
 if (paymentMethod === 'netbanking') {
 if (!accountNumber || accountNumber.length < 8) { setError('Please enter a valid account number'); return false }
 if (!ifsc || ifsc.length < 11) { setError('Please enter a valid 11-character IFSC code'); return false }
 }
 return true
 }

 const handleSubmit = () => {
 if (!validateStep3()) return
 setLoading(true)
 setTimeout(() => {
 addTransaction({
 loanId: loan.id,
 lenderId: loan.lenderId,
 borrowerId: loan.borrowerId,
 borrowerName: loan.borrowerName,
 type: 'payment',
 amount: payAmount,
 method: paymentMethod,
 description: `EMI payment for Loan #${loan.id} via ${paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Card' : 'Net Banking'}`
 })
 // Mark loan completed if fully paid
 const newPaid = paidSoFar + payAmount
 if (newPaid >= totalPayable - 0.01 && updateLoan) {
 updateLoan(loan.id, { status: 'completed' })
 }
 setLoading(false)
 setStep(4)
 }, 2000)
 }

 const methodLabel = paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Debit/Credit Card' : 'Net Banking'

 // Progress bar
 const progressPct = Math.min((paidSoFar / totalPayable) * 100, 100)

 return (
 <div className="main-content">
 <div className="dashboard">

 {/* Header */}
 <button className="btn btn-outline" onClick={() => step > 1 && step < 4 ? setStep(s => s - 1) : navigate(-1)}
 style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
 <ArrowLeft size={18} /> {step > 1 && step < 4 ? 'Back' : 'Back to Dashboard'}
 </button>

 <div className="dashboard-header" style={{ marginBottom: '28px' }}>
 <h1>Make Payment</h1>
 <p>Loan #{loan.id} — {loan.borrowerName}</p>
 </div>

 {/* Step indicator */}
 {step < 4 && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '32px', maxWidth: '500px' }}>
 {['Loan Details', 'Payment Method', 'Confirm'].map((label, i) => {
 const s = i + 1
 const active = step === s
 const done = step > s
 return (
 <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
 <div style={{
 width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
 alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px',
 background: done ? '#38a169' : active ? '#3182ce' : '#e2e8f0',
 color: done || active ? 'white' : '#a0aec0', transition: 'all 0.2s'
 }}>
 {done ? '' : s}
 </div>
 <span style={{ fontSize: '11px', fontWeight: '600', color: active ? '#3182ce' : done ? '#38a169' : '#a0aec0', whiteSpace: 'nowrap' }}>{label}</span>
 </div>
 {i < 2 && <div style={{ flex: 1, height: '2px', background: done ? '#38a169' : '#e2e8f0', margin: '0 4px', marginBottom: '20px', transition: 'all 0.2s' }} />}
 </div>
 )
 })}
 </div>
 )}

 <div style={{ maxWidth: '600px' }}>

 {/* ── STEP 1: Loan Overview ── */}
 {step === 1 && (
 <div>
 {/* Loan summary card */}
 <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
 <div>
 <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>₹{loan.amount?.toLocaleString('en-IN')}</h3>
 <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '13px' }}>Principal Amount</p>
 </div>
 <span className={`card-badge badge-${loan.status}`}>{loan.status}</span>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
 {[
 { label: 'Interest Rate', value: `${loan.interestRate}% p.a.` },
 { label: 'Loan Term', value: `${loan.term} months` },
 { label: 'Monthly EMI', value: `₹${emiAmount.toFixed(2)}` },
 { label: 'Total Payable', value: `₹${totalPayable.toFixed(2)}` },
 { label: 'Paid So Far', value: `₹${paidSoFar.toFixed(2)}`, color: '#276749' },
 { label: 'Outstanding', value: `₹${outstandingBalance.toFixed(2)}`, color: '#c53030' },
 ].map(({ label, value, color }) => (
 <div key={label}>
 <div style={{ fontSize: '12px', color: '#a0aec0', fontWeight: '600', marginBottom: '2px' }}>{label}</div>
 <div style={{ fontSize: '15px', fontWeight: '700', color: color || '#2d3748' }}>{value}</div>
 </div>
 ))}
 </div>

 {/* Progress */}
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#718096', marginBottom: '6px' }}>
 <span>{paidMonths} of {loan.term} payments made</span>
 <span>{progressPct.toFixed(1)}% complete</span>
 </div>
 <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
 <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #3182ce, #38a169)', borderRadius: '4px', transition: 'width 0.4s' }} />
 </div>
 </div>
 </div>

 {/* Payment type selector */}
 <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>Select Payment Amount</h3>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 {[
 { id: 'emi', label: 'Pay Monthly EMI', desc: `₹${emiAmount.toFixed(2)} — recommended`, color: '#3182ce' },
 { id: 'full', label: 'Pay Full Outstanding', desc: `₹${outstandingBalance.toFixed(2)} — close the loan`, color: '#38a169' },
 { id: 'custom', label: 'Custom Amount', desc: 'Enter any amount', color: '#805ad5' },
 ].map(opt => (
 <label key={opt.id} style={{
 display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
 borderRadius: '10px', border: `2px solid ${paymentType === opt.id ? opt.color : '#e2e8f0'}`,
 background: paymentType === opt.id ? opt.color + '10' : 'white', cursor: 'pointer', transition: 'all 0.15s'
 }}>
 <input type="radio" name="paymentType" value={opt.id}
 checked={paymentType === opt.id} onChange={() => setPaymentType(opt.id)}
 style={{ width: '18px', height: '18px', accentColor: opt.color }} />
 <div>
 <div style={{ fontWeight: '700', fontSize: '14px', color: '#2d3748' }}>{opt.label}</div>
 <div style={{ fontSize: '13px', color: opt.color, fontWeight: '600' }}>{opt.desc}</div>
 </div>
 </label>
 ))}
 </div>

 {paymentType === 'custom' && (
 <div style={{ marginTop: '16px' }}>
 <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '6px' }}>Enter Amount (₹)</label>
 <input type="number" value={customAmount}
 onChange={e => setCustomAmount(e.target.value)}
 placeholder={`Max: ₹${outstandingBalance.toFixed(2)}`}
 min="1" max={outstandingBalance} step="0.01"
 style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box' }} />
 </div>
 )}

 {error && (
 <div style={{ marginTop: '12px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', color: '#c53030', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <AlertCircle size={16} /> {error}
 </div>
 )}
 </div>

 <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }}
 onClick={() => { if (validateStep2()) { setError(''); setStep(2) } }}>
 Continue → Select Payment Method
 </button>
 </div>
 )}

 {/* ── STEP 2: Payment Method ── */}
 {step === 2 && (
 <div>
 <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>Choose Payment Method</h3>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
 {[
 { id: 'upi', icon: <Smartphone size={22} />, label: 'UPI', desc: 'Pay via any UPI app instantly', color: '#805ad5' },
 { id: 'card', icon: <CreditCard size={22} />, label: 'Debit / Credit Card', desc: 'Visa, Mastercard, RuPay', color: '#3182ce' },
 { id: 'netbanking', icon: <Building2 size={22} />, label: 'Net Banking', desc: 'Direct bank transfer via NEFT/IMPS', color: '#38a169' },
 ].map(m => (
 <label key={m.id} style={{
 display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
 borderRadius: '10px', border: `2px solid ${paymentMethod === m.id ? m.color : '#e2e8f0'}`,
 background: paymentMethod === m.id ? m.color + '10' : 'white', cursor: 'pointer', transition: 'all 0.15s'
 }}>
 <input type="radio" name="method" value={m.id}
 checked={paymentMethod === m.id} onChange={() => { setPaymentMethod(m.id); setError('') }}
 style={{ width: '18px', height: '18px', accentColor: m.color }} />
 <div style={{ color: paymentMethod === m.id ? m.color : '#718096' }}>{m.icon}</div>
 <div>
 <div style={{ fontWeight: '700', fontSize: '14px', color: '#2d3748' }}>{m.label}</div>
 <div style={{ fontSize: '12px', color: '#a0aec0' }}>{m.desc}</div>
 </div>
 </label>
 ))}
 </div>

 {/* UPI form */}
 {paymentMethod === 'upi' && (
 <div className="form-group">
 <label>UPI ID</label>
 <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
 placeholder="yourname@upi" />
 <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '6px' }}>e.g. mobilenumber@upi, name@okaxis</p>
 </div>
 )}

 {/* Card form */}
 {paymentMethod === 'card' && (
 <div>
 <div className="form-group">
 <label>Card Number</label>
 <input type="text" value={cardNumber}
 onChange={e => setCardNumber(e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
 placeholder="1234 5678 9012 3456" maxLength={19} />
 </div>
 <div className="form-row">
 <div className="form-group">
 <label>Expiry (MM/YY)</label>
 <input type="text" value={cardExpiry}
 onChange={e => {
 let v = e.target.value.replace(/[^\d]/g, '')
 if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2, 4)
 setCardExpiry(v)
 }}
 placeholder="MM/YY" maxLength={5} />
 </div>
 <div className="form-group">
 <label>CVV</label>
 <input type="password" value={cardCvv}
 onChange={e => setCardCvv(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
 placeholder="•••" maxLength={4} />
 </div>
 </div>
 <div className="form-group">
 <label>Name on Card</label>
 <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="As printed on card" />
 </div>
 </div>
 )}

 {/* Net Banking form */}
 {paymentMethod === 'netbanking' && (
 <div>
 <div className="form-group">
 <label>Account Number</label>
 <input type="text" value={accountNumber}
 onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
 placeholder="Enter account number" />
 </div>
 <div className="form-group">
 <label>IFSC Code</label>
 <input type="text" value={ifsc}
 onChange={e => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
 placeholder="e.g. SBIN0001234" maxLength={11} />
 </div>
 </div>
 )}

 {error && (
 <div style={{ marginTop: '12px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', color: '#c53030', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <AlertCircle size={16} /> {error}
 </div>
 )}
 </div>

 <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }}
 onClick={() => { if (validateStep3()) { setError(''); setStep(3) } }}>
 Review Payment →
 </button>
 </div>
 )}

 {/* ── STEP 3: Confirm ── */}
 {step === 3 && (
 <div>
 <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
 <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Confirm Payment</h3>

 <div style={{ background: '#f7fafc', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
 {[
 { label: 'Loan ID', value: `#${loan.id}` },
 { label: 'Borrower', value: loan.borrowerName },
 { label: 'Payment Type', value: paymentType === 'emi' ? 'Monthly EMI' : paymentType === 'full' ? 'Full Outstanding' : 'Custom Amount' },
 { label: 'Payment Method', value: methodLabel },
 { label: 'Amount', value: `₹${payAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, highlight: true },
 { label: 'Remaining After Payment', value: `₹${Math.max(outstandingBalance - payAmount, 0).toFixed(2)}` },
 ].map(({ label, value, highlight }) => (
 <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
 <span style={{ fontSize: '14px', color: '#718096' }}>{label}</span>
 <span style={{ fontSize: highlight ? '16px' : '14px', fontWeight: highlight ? '800' : '600', color: highlight ? '#3182ce' : '#2d3748' }}>{value}</span>
 </div>
 ))}
 </div>

 <div style={{ background: '#fffbeb', border: '1px solid #fbd38d', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#744210', marginBottom: '20px' }}>
 Please review the details above before confirming. This action cannot be undone.
 </div>

 <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}
 onClick={handleSubmit} disabled={loading}>
 {loading ? (
 <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
 <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
 Processing Payment...
 </span>
 ) : `Confirm & Pay ₹${payAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
 </button>
 </div>
 </div>
 )}

 {/* ── STEP 4: Success ── */}
 {step === 4 && (
 <div className="card" style={{ padding: '48px 32px', textAlign: 'center' }}>
 <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
 <CheckCircle size={40} color="#38a169" />
 </div>
 <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', color: '#2d3748' }}>Payment Successful!</h2>
 <p style={{ color: '#718096', marginBottom: '24px' }}>
 ₹{payAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been paid via {methodLabel}
 </p>
 <div style={{ background: '#f7fafc', borderRadius: '10px', padding: '16px', marginBottom: '28px', textAlign: 'left' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
 <span style={{ color: '#718096', fontSize: '13px' }}>Amount Paid</span>
 <span style={{ fontWeight: '700', color: '#38a169' }}>₹{payAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
 <span style={{ color: '#718096', fontSize: '13px' }}>Remaining Balance</span>
 <span style={{ fontWeight: '700', color: '#2d3748' }}>₹{Math.max(outstandingBalance - payAmount, 0).toFixed(2)}</span>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: '#718096', fontSize: '13px' }}>Transaction Date</span>
 <span style={{ fontWeight: '600', color: '#2d3748' }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
 <button className="btn btn-primary" onClick={() => navigate('/borrower')}>Back to Dashboard</button>
 <button className="btn btn-outline" onClick={() => navigate(`/loan/${loan.id}`)}>View Loan Details</button>
 </div>
 </div>
 )}
 </div>
 </div>

 <style>{`
 @keyframes spin { to { transform: rotate(360deg); } }
 `}</style>
 </div>
 )
}
