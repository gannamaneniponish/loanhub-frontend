/**
 * OverdueUtils.jsx
 * Overdue loan detection, late fee calculation, and badge components.
 *
 * Logic:
 * - An active loan is overdue when today is past its next unpaid EMI due date.
 * - Late fee = 2% per month on the overdue (unpaid) amount, prorated by days late.
 * - EMI due dates are computed from loan start date (createdAt for active) monthly.
 */

const LATE_FEE_RATE_PER_MONTH = 0.02 // 2% per month on overdue amount

/**
 * Calculate monthly EMI using standard formula.
 */
export function calcEMI(principal, annualRatePercent, months) {
 if (months <= 0) return 0
 const r = annualRatePercent / 100 / 12
 if (r === 0) return principal / months
 return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
}

/**
 * Build EMI schedule: array of { dueDate, amount, installmentNo }
 */
export function buildEMISchedule(loan) {
 const rawDate = loan.startDate || loan.createdAt
 const start = rawDate ? new Date(rawDate) : new Date()
 if (isNaN(start.getTime())) return []
 const emi = calcEMI(parseFloat(loan.amount), parseFloat(loan.interestRate), parseInt(loan.term))
 const schedule = []
 for (let i = 0; i < parseInt(loan.term); i++) {
 const due = new Date(start)
 due.setMonth(due.getMonth() + i + 1)
 schedule.push({ installmentNo: i + 1, dueDate: due, amount: emi })
 }
 return schedule
}

/**
 * Count how many EMIs have been paid for a loan from transactions.
 */
export function countPaidEMIs(loanId, transactions) {
 return transactions.filter(t => t.loanId === loanId && t.type === 'payment').length
}

/**
 * Determine overdue status for a loan.
 * Returns { isOverdue, daysLate, overdueAmount, lateFee, nextDueDate }
 */
export function getLoanOverdueInfo(loan, transactions = []) {
 if (!loan || loan.status !== 'active') return { isOverdue: false }
 if (!loan.amount || !loan.interestRate || !loan.term) return { isOverdue: false }

 const schedule = buildEMISchedule(loan)
 const paidCount = countPaidEMIs(loan.id, transactions)
 const today = new Date()
 today.setHours(0, 0, 0, 0)

 // Find the first unpaid installment
 const nextUnpaid = schedule[paidCount]
 if (!nextUnpaid) return { isOverdue: false } // all paid

 const due = new Date(nextUnpaid.dueDate)
 due.setHours(0, 0, 0, 0)

 if (today <= due) return { isOverdue: false, nextDueDate: due }

 const daysLate = Math.floor((today - due) / (1000 * 60 * 60 * 24))
 const overdueAmount = nextUnpaid.amount

 // Late fee: 2% per month, prorated by days late
 const lateFee = overdueAmount * LATE_FEE_RATE_PER_MONTH * (daysLate / 30)

 return {
 isOverdue: true,
 daysLate,
 overdueAmount: parseFloat(overdueAmount.toFixed(2)),
 lateFee: parseFloat(lateFee.toFixed(2)),
 nextDueDate: due,
 }
}

/** Format currency in Indian style */
function fmtINR(n) {
 return '₹' + parseFloat(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

/**
 * Small inline overdue badge — use on loan cards in tables.
 */
export function OverdueBadge({ daysLate }) {
 return (
 <span style={{
 display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
 fontSize: '11px', fontWeight: '700', marginLeft: '6px',
 background: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7',
 }}>
 {daysLate}d overdue
 </span>
 )
}

/**
 * Detailed overdue alert card — use in borrower / lender loan detail views.
 */
export function OverdueAlert({ overdueInfo }) {
 if (!overdueInfo?.isOverdue) return null
 const { daysLate, overdueAmount, lateFee, nextDueDate } = overdueInfo
 return (
 <div style={{
 background: '#fff5f5', border: '1.5px solid #fc8181', borderRadius: '12px',
 padding: '16px 20px', marginBottom: '20px',
 display: 'flex', gap: '14px', alignItems: 'flex-start',
 }}>
 <div style={{ fontSize: '28px', lineHeight: 1 }}></div>
 <div style={{ flex: 1 }}>
 <p style={{ margin: '0 0 6px', fontWeight: '700', fontSize: '15px', color: '#c53030' }}>
 Payment Overdue by {daysLate} day{daysLate !== 1 ? 's' : ''}
 </p>
 <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#742a2a' }}>
 EMI due date was <strong>{new Date(nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>. Please pay immediately to avoid further penalties.
 </p>
 <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
 <div style={{ background: '#fed7d7', borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#742a2a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue EMI</div>
 <div style={{ fontSize: '16px', fontWeight: '800', color: '#c53030' }}>{fmtINR(overdueAmount)}</div>
 </div>
 <div style={{ background: '#fed7d7', borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#742a2a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Late Fee (2%/mo)</div>
 <div style={{ fontSize: '16px', fontWeight: '800', color: '#c53030' }}>{fmtINR(lateFee)}</div>
 </div>
 <div style={{ background: '#fed7d7', borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#742a2a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Due Now</div>
 <div style={{ fontSize: '16px', fontWeight: '800', color: '#c53030' }}>{fmtINR(overdueAmount + lateFee)}</div>
 </div>
 </div>
 </div>
 </div>
 )
}

/**
 * Admin / Analyst overdue summary card — shows count + total overdue across all loans.
 */
export function OverdueSummaryCard({ loans = [], transactions = [] }) {
 const overdueLoans = loans.filter(l => {
 const info = getLoanOverdueInfo(l, transactions)
 return info.isOverdue
 })

 const totalLateFees = overdueLoans.reduce((sum, l) => {
 const info = getLoanOverdueInfo(l, transactions)
 return sum + (info.lateFee || 0)
 }, 0)

 if (overdueLoans.length === 0) {
 return (
 <div style={{
 background: '#f0fff4', border: '1.5px solid #9ae6b4', borderRadius: '12px',
 padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center',
 }}>
 <span style={{ fontSize: '24px' }}></span>
 <div>
 <p style={{ margin: 0, fontWeight: '700', color: '#276749' }}>No Overdue Loans</p>
 <p style={{ margin: 0, fontSize: '13px', color: '#48bb78' }}>All active loans are on schedule.</p>
 </div>
 </div>
 )
 }

 return (
 <div style={{
 background: '#fff5f5', border: '1.5px solid #fc8181', borderRadius: '12px',
 padding: '16px 20px', marginBottom: '20px',
 }}>
 <p style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '15px', color: '#c53030' }}>
 Overdue Loans Summary
 </p>
 <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
 <div style={{ background: '#fed7d7', borderRadius: '8px', padding: '10px 18px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#742a2a', fontWeight: '600', textTransform: 'uppercase' }}>Overdue Loans</div>
 <div style={{ fontSize: '22px', fontWeight: '800', color: '#c53030' }}>{overdueLoans.length}</div>
 </div>
 <div style={{ background: '#fed7d7', borderRadius: '8px', padding: '10px 18px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#742a2a', fontWeight: '600', textTransform: 'uppercase' }}>Total Late Fees</div>
 <div style={{ fontSize: '22px', fontWeight: '800', color: '#c53030' }}>{fmtINR(totalLateFees)}</div>
 </div>
 </div>
 <div style={{ marginTop: '12px' }}>
 {overdueLoans.slice(0, 5).map(l => {
 const info = getLoanOverdueInfo(l, transactions)
 return (
 <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid #feb2b2', fontSize: '13px', color: '#742a2a' }}>
 <span><strong>{l.borrowerName}</strong> — {fmtINR(l.amount)} loan</span>
 <span style={{ fontWeight: '600' }}>{info.daysLate}d late · Late fee: {fmtINR(info.lateFee)}</span>
 </div>
 )
 })}
 {overdueLoans.length > 5 && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#c53030' }}>…and {overdueLoans.length - 5} more overdue loans</p>}
 </div>
 </div>
 )
}
