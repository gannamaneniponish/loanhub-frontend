/**
 * ExportUtils.jsx
 * CSV / Excel export helpers for LoanHub
 */
import { useState } from 'react'

/** Convert array of objects to CSV string */
function toCSV(rows, columns) {
 if (!rows || rows.length === 0) return ''
 const header = columns.map(c => `"${c.label}"`).join(',')
 const body = rows.map(row =>
 columns.map(c => {
 const val = c.accessor(row)
 return `"${String(val ?? '').replace(/"/g, '""')}"`
 }).join(',')
 ).join('\n')
 return header + '\n' + body
}

/** Trigger browser download of a CSV string */
function downloadCSV(csvString, filename) {
 if (!csvString) return
 const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = filename
 a.click()
 URL.revokeObjectURL(url)
}

/** Format date safely */
function fmtDate(val) {
 if (!val) return ''
 try { return new Date(val).toLocaleDateString('en-IN') } catch { return String(val) }
}

/* ── Column definitions ───────────────────────────────────────────── */

const LOAN_COLUMNS = [
 { label: 'Loan ID', accessor: r => r.id },
 { label: 'Borrower', accessor: r => r.borrowerName || '' },
 { label: 'Amount (Rs.)', accessor: r => r.amount },
 { label: 'Interest Rate', accessor: r => r.interestRate + '%' },
 { label: 'Term (months)', accessor: r => r.term },
 { label: 'Purpose', accessor: r => r.purpose || '' },
 { label: 'Status', accessor: r => r.status || '' },
 { label: 'Lender', accessor: r => r.lenderName || '' },
 { label: 'Applied On', accessor: r => fmtDate(r.createdAt) },
]

const TRANSACTION_COLUMNS = [
 { label: 'Txn ID', accessor: r => r.id },
 { label: 'Loan ID', accessor: r => r.loanId || '' },
 { label: 'Borrower', accessor: r => r.borrowerName || '' },
 { label: 'Lender', accessor: r => r.lenderName || '' },
 { label: 'Type', accessor: r => r.type || '' },
 { label: 'Amount (Rs.)', accessor: r => r.amount },
 { label: 'Date', accessor: r => fmtDate(r.timestamp) },
]

const USER_COLUMNS = [
 { label: 'User ID', accessor: r => r.id },
 { label: 'Name', accessor: r => r.name || '' },
 { label: 'Email', accessor: r => r.email || '' },
 { label: 'Role', accessor: r => r.role || '' },
 { label: 'Phone', accessor: r => r.phone || '' },
 { label: 'Status', accessor: r => r.status || '' },
]

/* ── Date-range filter ─────────────────────────────────────────────── */
function filterByDateRange(rows, dateAccessor, from, to) {
 if (!from && !to) return rows
 return rows.filter(r => {
 const d = new Date(dateAccessor(r))
 if (isNaN(d)) return true
 if (from && d < new Date(from)) return false
 if (to && d > new Date(to + 'T23:59:59')) return false
 return true
 })
}

/* ── Reusable export button ────────────────────────────────────────── */
export function ExportButton({ label = 'Export CSV', onClick, style = {} }) {
 return (
 <button
 onClick={onClick}
 style={{
 display: 'inline-flex', alignItems: 'center', gap: '6px',
 padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
 fontWeight: '600', cursor: 'pointer', border: 'none',
 background: 'linear-gradient(135deg,#48bb78,#276749)', color: 'white',
 boxShadow: '0 2px 6px rgba(39,103,73,0.25)', transition: 'opacity 0.2s',
 ...style,
 }}
 onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
 onMouseLeave={e => e.currentTarget.style.opacity = '1'}
 >
 {label}
 </button>
 )
}

/* ── Admin export panel (used in AdminDashboard Reports tab) ────────── */
export function AdminExportPanel({ loans = [], transactions = [], users = [] }) {
 const [from, setFrom] = useState('')
 const [to, setTo] = useState('')

 const inputStyle = {
 padding: '7px 10px', borderRadius: '8px', fontSize: '13px',
 border: '1.5px solid var(--border-color,#dadce0)',
 background: 'var(--bg-input,#fff)', color: 'var(--text-primary,#3c4043)',
 }

 const exportLoans = () => {
 const filtered = filterByDateRange(loans, r => r.createdAt, from, to)
 downloadCSV(toCSV(filtered, LOAN_COLUMNS), `loans_${Date.now()}.csv`)
 }
 const exportTransactions = () => {
 const filtered = filterByDateRange(transactions, r => r.timestamp, from, to)
 downloadCSV(toCSV(filtered, TRANSACTION_COLUMNS), `transactions_${Date.now()}.csv`)
 }
 const exportUsers = () => {
 downloadCSV(toCSV(users, USER_COLUMNS), `users_${Date.now()}.csv`)
 }

 return (
 <div style={{ background: 'var(--bg-card,white)', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '24px' }}>
 <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary,#1a202c)' }}>
 Export Data to CSV
 </h3>

 {/* Date range filter */}
 <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px', padding: '14px', background: 'var(--bg-page,#f7fafc)', borderRadius: '10px', border: '1px solid var(--border-color,#e2e8f0)' }}>
 <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary,#4a5568)' }}> Date range:</span>
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 <label style={{ fontSize: '12px', color: 'var(--text-secondary,#718096)' }}>From</label>
 <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 <label style={{ fontSize: '12px', color: 'var(--text-secondary,#718096)' }}>To</label>
 <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
 </div>
 {(from || to) && (
 <button onClick={() => { setFrom(''); setTo('') }} style={{ fontSize: '12px', color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}> Clear</button>
 )}
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
 <ExportButton label={`Export ${loans.length} Loans`} onClick={exportLoans} />
 <ExportButton label={`Export ${transactions.length} Transactions`} onClick={exportTransactions} />
 <ExportButton label={`Export ${users.length} Users`} onClick={exportUsers} />
 </div>
 <p style={{ margin: '12px 0 0', fontSize: '12px', color: 'var(--text-secondary,#718096)' }}>
 Files download as .csv — open with Excel, Google Sheets, or any spreadsheet app.
 </p>
 </div>
 )
}

/* ── Analyst export button ──────────────────────────────────────────── */
export function AnalystExportButton({ loans = [], transactions = [] }) {
 const [showPanel, setShowPanel] = useState(false)
 const [from, setFrom] = useState('')
 const [to, setTo] = useState('')
 const inputStyle = {
 padding: '7px 10px', borderRadius: '8px', fontSize: '13px',
 border: '1.5px solid var(--border-color,#dadce0)',
 background: 'var(--bg-input,#fff)', color: 'var(--text-primary,#3c4043)',
 }
 const exportLoans = () => {
 const filtered = filterByDateRange(loans, r => r.createdAt, from, to)
 downloadCSV(toCSV(filtered, LOAN_COLUMNS), `analyst_loans_${Date.now()}.csv`)
 }
 const exportTxns = () => {
 const filtered = filterByDateRange(transactions, r => r.timestamp, from, to)
 downloadCSV(toCSV(filtered, TRANSACTION_COLUMNS), `analyst_transactions_${Date.now()}.csv`)
 }
 return (
 <div>
 <ExportButton label="Export Data" onClick={() => setShowPanel(p => !p)} />
 {showPanel && (
 <div style={{ marginTop: '12px', background: 'var(--bg-card,white)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color,#e2e8f0)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
 <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary,#4a5568)' }}> Filter by date:</span>
 <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
 <label style={{ fontSize: '12px' }}>From</label>
 <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
 </div>
 <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
 <label style={{ fontSize: '12px' }}>To</label>
 <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
 </div>
 </div>
 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
 <ExportButton label="Export Loans CSV" onClick={exportLoans} />
 <ExportButton label="Export Transactions CSV" onClick={exportTxns} />
 </div>
 </div>
 )}
 </div>
 )
}


/**
 * Feature #14: Professional branded PDF export using browser print
 * Works without external dependencies — uses a styled HTML print window
 */
export function exportProfessionalPDF({ title, subtitle, columns, rows, filename = 'report', brandColor = '#1a73e8' }) {
 const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

 const tableRows = rows.map(row =>
 `<tr>${columns.map(c => `<td>${c.accessor ? c.accessor(row) : (row[c.key] ?? '')}</td>`).join('')}</tr>`
 ).join('')

 const html = `<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8"/>
 <title>${title}</title>
 <style>
 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
 * { box-sizing: border-box; margin: 0; padding: 0; }
 body { font-family: 'Inter', Arial, sans-serif; color: #1a202c; padding: 40px; }
 .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid ${brandColor}; }
 .brand { font-size: 26px; font-weight: 900; color: ${brandColor}; }
 .brand-sub { font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px; }
 .report-meta { text-align: right; }
 .report-title { font-size: 20px; font-weight: 800; color: #1a202c; }
 .report-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
 .report-date { font-size: 11px; color: #94a3b8; margin-top: 2px; }
 table { width: 100%; border-collapse: collapse; margin-top: 8px; }
 thead tr { background: ${brandColor}; color: white; }
 th { padding: 11px 14px; font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
 td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #f0f0f0; color: #374151; }
 tbody tr:nth-child(even) { background: #f8fafc; }
 tbody tr:hover { background: #e8f0fe; }
 .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
 .summary-row { display: flex; gap: 20px; margin-bottom: 24px; }
 .summary-card { flex: 1; background: #f8fafc; border-radius: 10px; padding: 14px 16px; border-left: 3px solid ${brandColor}; }
 .summary-card .val { font-size: 20px; font-weight: 800; color: ${brandColor}; }
 .summary-card .lbl { font-size: 11px; color: #64748b; margin-top: 2px; }
 @media print { body { padding: 20px; } }
 </style>
</head>
<body>
 <div class="header">
 <div>
 <div class="brand">LoanHub</div>
 <div class="brand-sub">Smart Lending Platform</div>
 </div>
 <div class="report-meta">
 <div class="report-title">${title}</div>
 ${subtitle ? `<div class="report-sub">${subtitle}</div>` : ''}
 <div class="report-date">Generated: ${now}</div>
 </div>
 </div>
 <table>
 <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
 <tbody>${tableRows}</tbody>
 </table>
 <div class="footer">
 <span>© ${new Date().getFullYear()} LoanHub — Confidential</span>
 <span>Generated on ${now}</span>
 </div>
 <script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); } }<\/script>
</body>
</html>`

 const win = window.open('', '_blank', 'width=900,height=700')
 if (win) {
 win.document.write(html)
 win.document.close()
 }
}

/** Quick branded PDF for a single loan */
export function exportLoanPDF(loan, transactions = []) {
 const payments = transactions.filter(t => t.loanId === loan.id && t.type === 'payment')
 const totalPaid = payments.reduce((s, t) => s + (t.amount || 0), 0)
 const pct = loan.amount > 0 ? Math.min(100, Math.round((totalPaid / loan.amount) * 100)) : 0

 exportProfessionalPDF({
 title: 'Loan Statement',
 subtitle: `Loan #${loan.id} — ${loan.borrowerName}`,
 columns: [
 { label: 'Date', accessor: r => new Date(r.timestamp).toLocaleDateString('en-IN') },
 { label: 'Type', accessor: r => r.type },
 { label: 'Amount', accessor: r => `₹${Number(r.amount).toLocaleString('en-IN')}` },
 { label: 'Note', accessor: r => r.note || '-' },
 ],
 rows: payments,
 filename: `loan-${loan.id}-statement`,
 })
}
