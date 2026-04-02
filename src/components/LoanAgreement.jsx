import React from 'react'
import { FileText, Download, CheckCircle } from 'lucide-react'

// ─── Generate & print the agreement ──────────────────────────────────────────
export function generateLoanAgreementHTML(loan, lender, borrower) {
 const acceptedDate = loan.acceptedAt ? new Date(loan.acceptedAt) : new Date(loan.createdAt || Date.now())
 const monthlyRate = loan.interestRate / 100 / 12
 const emi = monthlyRate === 0
 ? loan.amount / loan.term
 : (loan.amount * (monthlyRate * Math.pow(1 + monthlyRate, loan.term))) / (Math.pow(1 + monthlyRate, loan.term) - 1)
 const totalRepayable = emi * loan.term
 const totalInterest = totalRepayable - loan.amount

 const schedule = Array.from({ length: Math.min(loan.term, 24) }, (_, i) => {
 const dueDate = new Date(acceptedDate)
 dueDate.setMonth(dueDate.getMonth() + i + 1)
 const interest = (loan.amount - (emi - (loan.amount * monthlyRate)) * i) * monthlyRate
 const principal = emi - (monthlyRate === 0 ? 0 : interest)
 return {
 no: i + 1,
 due: dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
 emi: Math.round(emi),
 principal: Math.round(monthlyRate === 0 ? loan.amount / loan.term : principal),
 interest: Math.round(monthlyRate === 0 ? 0 : Math.max(0, interest)),
 }
 })

 return `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8"/>
 <title>Loan Agreement — LoanHub #${loan.id}</title>
 <style>
 * { box-sizing: border-box; margin: 0; padding: 0; }
 body { font-family: 'Times New Roman', serif; color: #1a1a1a; background: white; padding: 40px; max-width: 800px; margin: 0 auto; }
 .header { text-align: center; border-bottom: 3px double #1a1a1a; padding-bottom: 20px; margin-bottom: 28px; }
 .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #1a202c; font-family: sans-serif; }
 .logo span { color: #667eea; }
 .doc-title { font-size: 20px; font-weight: bold; margin-top: 10px; text-transform: uppercase; letter-spacing: 2px; }
 .doc-sub { font-size: 13px; color: #555; margin-top: 4px; }
 .ref-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 13px; }
 .ref-box strong { font-family: monospace; }
 h2 { font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 12px; color: #2d3748; }
 .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
 .party-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
 .party-label { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #667eea; margin-bottom: 8px; }
 .party-name { font-size: 16px; font-weight: bold; color: #1a202c; margin-bottom: 4px; }
 .party-detail { font-size: 12px; color: #555; line-height: 1.6; }
 .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
 .term-item { background: #f7fafc; border-radius: 6px; padding: 12px 14px; }
 .term-label { font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
 .term-value { font-size: 15px; font-weight: bold; color: #1a202c; }
 table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
 thead tr { background: #667eea; color: white; }
 th { padding: 9px 10px; text-align: left; font-weight: 600; }
 td { padding: 8px 10px; border-bottom: 1px solid #f0f4f8; }
 tr:nth-child(even) td { background: #fafbff; }
 .clause { margin-bottom: 12px; font-size: 13px; line-height: 1.7; color: #2d3748; }
 .clause-num { font-weight: bold; margin-right: 6px; }
 .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 16px; }
 .sign-box { border-top: 2px solid #1a1a1a; padding-top: 8px; }
 .sign-label { font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
 .sign-name { font-size: 14px; font-weight: bold; margin-top: 4px; }
 .sign-date { font-size: 12px; color: #718096; margin-top: 2px; }
 .stamp { text-align: center; margin-top: 16px; border: 2px solid #667eea; display: inline-block; padding: 8px 20px; border-radius: 4px; color: #667eea; font-weight: bold; font-size: 13px; letter-spacing: 1px; }
 .footer { text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #a0aec0; }
 @media print {
 body { padding: 20px; }
 button { display: none; }
 }
 </style>
</head>
<body>

 <div class="header">
 <div class="logo">Loan<span>Hub</span></div>
 <div class="doc-title">Loan Agreement</div>
 <div class="doc-sub">This is a legally binding document. Please read carefully.</div>
 </div>

 <div class="ref-box">
 <div>Agreement Ref: <strong>LH-AGR-${loan.id}</strong></div>
 <div>Loan ID: <strong>#${loan.id}</strong></div>
 <div>Date: <strong>${acceptedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></div>
 <div>Status: <strong style="color:#276749"> EXECUTED</strong></div>
 </div>

 <h2>1. Parties to the Agreement</h2>
 <div class="parties">
 <div class="party-box">
 <div class="party-label"> Lender (Party A)</div>
 <div class="party-name">${lender?.name || 'Unknown Lender'}</div>
 <div class="party-detail">
 Email: ${lender?.email || '—'}<br/>
 Phone: ${lender?.phone || '—'}<br/>
 PAN: ${lender?.panCard || '—'}
 </div>
 </div>
 <div class="party-box">
 <div class="party-label"> Borrower (Party B)</div>
 <div class="party-name">${borrower?.name || loan.borrowerName || 'Unknown Borrower'}</div>
 <div class="party-detail">
 Email: ${borrower?.email || '—'}<br/>
 Phone: ${borrower?.phone || '—'}<br/>
 PAN: ${borrower?.panCard || '—'}
 </div>
 </div>
 </div>

 <h2>2. Loan Terms</h2>
 <div class="terms-grid">
 <div class="term-item"><div class="term-label">Principal Amount</div><div class="term-value">₹${loan.amount?.toLocaleString('en-IN')}</div></div>
 <div class="term-item"><div class="term-label">Annual Interest Rate</div><div class="term-value">${loan.interestRate}% p.a.</div></div>
 <div class="term-item"><div class="term-label">Loan Tenure</div><div class="term-value">${loan.term} months</div></div>
 <div class="term-item"><div class="term-label">Monthly EMI</div><div class="term-value">₹${Math.round(emi).toLocaleString('en-IN')}</div></div>
 <div class="term-item"><div class="term-label">Total Interest Payable</div><div class="term-value">₹${Math.round(totalInterest).toLocaleString('en-IN')}</div></div>
 <div class="term-item"><div class="term-label">Total Amount Repayable</div><div class="term-value">₹${Math.round(totalRepayable).toLocaleString('en-IN')}</div></div>
 <div class="term-item"><div class="term-label">Loan Purpose</div><div class="term-value">${loan.purpose || 'General'}</div></div>
 <div class="term-item"><div class="term-label">First EMI Due</div><div class="term-value">${schedule[0]?.due || '—'}</div></div>
 </div>

 <h2>3. Repayment Schedule (First ${schedule.length} Instalments)</h2>
 <table>
 <thead>
 <tr>
 <th>#</th>
 <th>Due Date</th>
 <th>EMI (₹)</th>
 <th>Principal (₹)</th>
 <th>Interest (₹)</th>
 </tr>
 </thead>
 <tbody>
 ${schedule.map(row => `
 <tr>
 <td>${row.no}</td>
 <td>${row.due}</td>
 <td>${row.emi.toLocaleString('en-IN')}</td>
 <td>${row.principal.toLocaleString('en-IN')}</td>
 <td>${row.interest.toLocaleString('en-IN')}</td>
 </tr>
 `).join('')}
 ${loan.term > 24 ? `<tr><td colspan="5" style="text-align:center;color:#718096;font-style:italic">... and ${loan.term - 24} more instalments</td></tr>` : ''}
 </tbody>
 </table>

 <h2>4. Terms & Conditions</h2>
 <div class="clause"><span class="clause-num">4.1</span>The Borrower agrees to repay the loan in equal monthly instalments (EMI) as per the schedule above, on or before the due date each month.</div>
 <div class="clause"><span class="clause-num">4.2</span>A late payment fee of 2% per month shall be applied on any overdue EMI amount.</div>
 <div class="clause"><span class="clause-num">4.3</span>The Lender agrees to disburse the principal amount within 2 business days of agreement execution.</div>
 <div class="clause"><span class="clause-num">4.4</span>The Borrower may prepay the loan in full or in part without any prepayment penalty, subject to 7 days' prior notice.</div>
 <div class="clause"><span class="clause-num">4.5</span>In the event of three consecutive missed EMI payments, the full outstanding amount shall become immediately due and payable.</div>
 <div class="clause"><span class="clause-num">4.6</span>Both parties agree to submit to the jurisdiction of courts in Hyderabad for resolution of any disputes.</div>
 <div class="clause"><span class="clause-num">4.7</span>This agreement is governed by and constructed in accordance with applicable Indian financial regulations.</div>

 <h2>5. Signatures</h2>
 <div class="sign-grid">
 <div>
 <div class="sign-box">
 <div class="sign-name">${lender?.name || 'Lender'}</div>
 <div class="sign-label">Lender (Party A)</div>
 <div class="sign-date">Date: ${acceptedDate.toLocaleDateString('en-IN')}</div>
 </div>
 </div>
 <div>
 <div class="sign-box">
 <div class="sign-name">${borrower?.name || loan.borrowerName || 'Borrower'}</div>
 <div class="sign-label">Borrower (Party B)</div>
 <div class="sign-date">Date: ${acceptedDate.toLocaleDateString('en-IN')}</div>
 </div>
 </div>
 </div>
 <div style="text-align:center;margin-top:20px">
 <div class="stamp"> DIGITALLY EXECUTED via LoanHub</div>
 </div>

 <div class="footer">
 Generated by LoanHub Platform · Agreement Ref LH-AGR-${loan.id} · ${new Date().toLocaleString('en-IN')}<br/>
 This document serves as a legally binding loan agreement between the parties named above.
 </div>
</body>
</html>`
}

// ─── Download Agreement Button ────────────────────────────────────────────────
export function DownloadAgreementButton({ loan, lender, borrower, compact = false }) {
 const [showEsign, setShowEsign] = React.useState(false)
 const [esignOtp, setEsignOtp] = React.useState('')
 const [otpSent, setOtpSent] = React.useState(false)
 const [esignDone, setEsignDone] = React.useState(() => {
 try { return localStorage.getItem(`esigned_${loan?.id}`) === 'true' } catch { return false }
 })
 const [otpError, setOtpError] = React.useState('')
 const [showForeclosure, setShowForeclosure] = React.useState(false)

 const sendOtp = () => {
 const otp = String(Math.floor(100000 + Math.random() * 900000))
 localStorage.setItem(`esign_otp_${loan?.id}`, otp)
 setOtpSent(true)
 setOtpError('')
 // In real app this would send SMS/email; here we show it in console + alert
 console.log(`E-Sign OTP for loan ${loan?.id}: ${otp}`)
 alert(`Demo: Your e-sign OTP is ${otp} (In production this would be sent via SMS/email)`)
 }

 const verifyOtp = () => {
 const stored = localStorage.getItem(`esign_otp_${loan?.id}`)
 if (esignOtp.trim() === stored) {
 localStorage.setItem(`esigned_${loan?.id}`, 'true')
 setEsignDone(true)
 setShowEsign(false)
 setOtpError('')
 } else {
 setOtpError('Incorrect OTP. Please try again.')
 }
 }

 // Foreclosure calculation
 const getForeclosureAmount = () => {
 if (!loan) return null
 const monthlyRate = loan.interestRate / 100 / 12
 const emi = monthlyRate === 0 ? loan.amount / loan.term
 : (loan.amount * (monthlyRate * Math.pow(1 + monthlyRate, loan.term))) / (Math.pow(1 + monthlyRate, loan.term) - 1)
 const start = new Date(loan.acceptedAt || loan.createdAt || Date.now())
 const monthsElapsed = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24 * 30))
 const remaining = Math.max(0, loan.term - monthsElapsed)
 let principal = loan.amount
 for (let i = 0; i < monthsElapsed; i++) {
 const interest = principal * monthlyRate
 const principalPaid = emi - interest
 principal = Math.max(0, principal - principalPaid)
 }
 const foreclosurePenalty = principal * 0.02
 return { outstanding: Math.round(principal), penalty: Math.round(foreclosurePenalty), total: Math.round(principal + foreclosurePenalty), remaining }
 }

 const foreclosure = getForeclosureAmount()

 const handlePreview = () => {
 const html = generateLoanAgreementHTML(loan, lender, borrower)
 const win = window.open('', '_blank', 'width=900,height=700')
 if (win) {
 win.document.write(html)
 win.document.close()
 win.focus()
 setTimeout(() => { win.print() }, 500)
 }
 }

 const handleDownload = () => {
 const html = generateLoanAgreementHTML(loan, lender, borrower)
 const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `loan-agreement-${loan?.id || 'document'}.html`
 a.click()
 URL.revokeObjectURL(url)
 }

 return (
 <div>
 {/* E-sign Modal */}
 {showEsign && (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
 <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
 <div style={{ textAlign: 'center', marginBottom: '20px' }}>
 <div style={{ fontSize: '40px', marginBottom: '8px' }}></div>
 <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800' }}>E-Sign Agreement</h3>
 <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>Verify your identity with an OTP to digitally sign this agreement</p>
 </div>
 {!otpSent ? (
 <div>
 <div style={{ background: '#f7fafc', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '13px', color: '#4a5568' }}>
 OTP will be sent to: <strong>{borrower?.phone || 'your registered phone'}</strong>
 </div>
 <button onClick={sendOtp} style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
 Send OTP
 </button>
 </div>
 ) : (
 <div>
 <div style={{ marginBottom: '12px' }}>
 <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '6px' }}>Enter 6-digit OTP</label>
 <input value={esignOtp} onChange={e => setEsignOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
 placeholder="••••••" maxLength={6}
 style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '20px', letterSpacing: '0.3em', textAlign: 'center', boxSizing: 'border-box' }} />
 {otpError && <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '6px' }}>{otpError}</div>}
 </div>
 <button onClick={verifyOtp} disabled={esignOtp.length < 6}
 style={{ width: '100%', padding: '12px', background: esignOtp.length < 6 ? '#e2e8f0' : '#38a169', color: esignOtp.length < 6 ? '#a0aec0' : 'white', border: 'none', borderRadius: '10px', cursor: esignOtp.length < 6 ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
 Verify & Sign
 </button>
 <button onClick={sendOtp} style={{ width: '100%', padding: '8px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#667eea', fontWeight: '600' }}>
 Resend OTP
 </button>
 </div>
 )}
 <button onClick={() => setShowEsign(false)} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', fontSize: '13px', marginTop: '10px' }}>Cancel</button>
 </div>
 </div>
 )}

 {/* Foreclosure Modal */}
 {showForeclosure && foreclosure && (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
 <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
 <div style={{ textAlign: 'center', marginBottom: '20px' }}>
 <div style={{ fontSize: '40px', marginBottom: '8px' }}></div>
 <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800' }}>Foreclosure Calculator</h3>
 <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>Estimated cost to close this loan early</p>
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
 {[
 { label: 'Outstanding Principal', value: `₹${foreclosure.outstanding.toLocaleString('en-IN')}`, color: '#2d3748' },
 { label: 'Foreclosure Penalty (2%)', value: `₹${foreclosure.penalty.toLocaleString('en-IN')}`, color: '#d69e2e' },
 { label: 'EMIs Remaining', value: `${foreclosure.remaining} months`, color: '#718096' },
 ].map((row, i) => (
 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f7fafc', borderRadius: '8px' }}>
 <span style={{ fontSize: '13px', color: '#718096' }}>{row.label}</span>
 <span style={{ fontWeight: '700', color: row.color }}>{row.value}</span>
 </div>
 ))}
 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#fff5f5', borderRadius: '8px', border: '1px solid #fed7d7' }}>
 <span style={{ fontSize: '14px', fontWeight: '700', color: '#c53030' }}>Total Foreclosure Amount</span>
 <span style={{ fontSize: '16px', fontWeight: '800', color: '#c53030' }}>₹{foreclosure.total.toLocaleString('en-IN')}</span>
 </div>
 </div>
 <div style={{ fontSize: '11px', color: '#a0aec0', textAlign: 'center', marginBottom: '16px' }}>* Actual amount may vary. Contact support to initiate foreclosure.</div>
 <button onClick={() => setShowForeclosure(false)} style={{ width: '100%', padding: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Close</button>
 </div>
 </div>
 )}

 <div style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8edff 100%)', border: '1px solid #c3cafc', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ width: '40px', height: '40px', background: '#667eea', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
 <FileText size={20} color="white" />
 </div>
 <div>
 <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#1a202c' }}>Loan Agreement</p>
 <p style={{ margin: 0, fontSize: '12px', color: '#718096' }}>Ref: LH-AGR-{loan.id} · ₹{loan.amount?.toLocaleString('en-IN')} at {loan.interestRate}% for {loan.term} months</p>
 {esignDone && <div style={{ fontSize: '11px', color: '#38a169', fontWeight: '700', marginTop: '3px' }}> Digitally signed</div>}
 </div>
 <CheckCircle size={18} color="#48bb78" style={{ flexShrink: 0 }} />
 </div>
 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
 {!esignDone && (
 <button onClick={() => setShowEsign(true)} style={{
 display: 'inline-flex', alignItems: 'center', gap: '6px',
 padding: '8px 14px', background: '#38a169', color: 'white',
 border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
 }}>
 E-Sign
 </button>
 )}
 <button onClick={() => setShowForeclosure(true)} style={{
 display: 'inline-flex', alignItems: 'center', gap: '6px',
 padding: '8px 14px', background: '#fffbeb', color: '#744210',
 border: '1px solid #fbd38d', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
 }}>
 Foreclose
 </button>
 <button onClick={handlePreview} style={{
 display: 'inline-flex', alignItems: 'center', gap: '6px',
 padding: '8px 16px', background: '#667eea', color: 'white',
 border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
 }}>
 <FileText size={15} /> Preview & Print
 </button>
 <button onClick={handleDownload} style={{
 display: 'inline-flex', alignItems: 'center', gap: '6px',
 padding: '8px 14px', background: 'white', color: '#667eea',
 border: '1px solid #c3cafc', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
 }}>
 <Download size={15} /> Download
 </button>
 </div>
 </div>
 </div>
 )
}

// ─── Agreement list (for a dashboard) ────────────────────────────────────────
export function AgreementsList({ loans, users, currentUserId, role }) {
 const eligibleLoans = loans.filter(l =>
 l.status === 'active' || l.status === 'completed'
 ).filter(l =>
 role === 'lender' ? l.lenderId === currentUserId :
 role === 'borrower' ? (l.borrowerId === currentUserId || l.borrowerName) :
 true
 )

 if (eligibleLoans.length === 0) {
 return (
 <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
 <div style={{ fontSize: '40px', marginBottom: '10px' }}></div>
 <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>
 No loan agreements yet. Agreements are generated when a lender accepts a loan application.
 </p>
 </div>
 )
 }

 return (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 {eligibleLoans.map(loan => {
 const lender = users.find(u => u.id === loan.lenderId)
 const borrower = users.find(u => u.id === loan.borrowerId || u.name === loan.borrowerName)
 return (
 <DownloadAgreementButton key={loan.id} loan={loan} lender={lender} borrower={borrower} />
 )
 })}
 </div>
 )
}
