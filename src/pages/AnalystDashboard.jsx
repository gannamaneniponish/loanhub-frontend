import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, PieChart, Download, List, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { AnalyticsPanel } from '../components/Charts'
import { AnalystExportButton } from '../components/ExportUtils'
import { OverdueSummaryCard } from '../components/OverdueUtils'
import StatCard from '../components/StatCard'
import './Dashboard.css'

export default function AnalystDashboard({ loans, transactions, users = [], user, activeTab: propActiveTab, onTabChange }) {
 const [reportType, setReportType] = useState('overview')
 // Sync sidebar tab to internal reportType
 useEffect(() => {
 if (!propActiveTab) return
 const map = { overview: 'overview', loans: 'all-transactions', risk: 'risk', transactions: 'all-transactions', users: 'overview', analytics: 'analytics' }
 if (map[propActiveTab]) setReportType(map[propActiveTab])
 }, [propActiveTab])
 const [reportFlash, setReportFlash] = useState('')

 const flashReport = (msg) => { setReportFlash(msg); setTimeout(() => setReportFlash(''), 3000) }
 const changeReport = (tab) => { setReportType(tab); onTabChange?.(tab) }

 const totalLoanAmount = loans.reduce((sum, l) => sum + l.amount, 0)
 const totalTransactions = transactions.reduce((sum, t) => sum + t.amount, 0)
 const averageLoanAmount = loans.length > 0 ? totalLoanAmount / loans.length : 0
 const defaultRiskLoans = loans.filter(l => l.status === 'pending').length

 // Separate borrower payments vs lender disbursements
 const borrowerTransactions = transactions.filter(t => t.type === 'payment')
 const lenderTransactions = transactions.filter(t => t.type === 'disbursement')
 const totalBorrowerAmount = borrowerTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
 const totalLenderAmount = lenderTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

 const stats = [
 { label: 'Total Portfolio', value: `₹${totalLoanAmount.toLocaleString('en-IN')}`, icon: null, iconBg: '#f3e8ff', iconColor: '#7c3aed', accent: '#7c3aed', trend: loans.length > 0 ? 12 : 0, trendLabel: 'growth' },
 { label: 'Average Loan Size', value: `₹${Math.round(averageLoanAmount).toLocaleString('en-IN')}`, icon: null, iconBg: '#dcfce7', iconColor: '#16a34a', accent: '#16a34a' },
 { label: 'Default Risk Loans', value: defaultRiskLoans, icon: null, iconBg: '#fef9c3', iconColor: '#d97706', accent: '#d97706', subtitle: defaultRiskLoans > 0 ? 'Needs attention' : 'All clear' },
 { label: 'Total Transactions', value: transactions.length, icon: null, iconBg: '#e8f0fe', iconColor: '#1a73e8', accent: '#1a73e8' },
 { label: 'Borrower Payments', value: borrowerTransactions.length, icon: null, iconBg: '#dcfce7', iconColor: '#16a34a', accent: '#16a34a' },
 { label: 'Lender Disbursements',value: lenderTransactions.length, icon: null, iconBg: '#e8f0fe', iconColor: '#1a73e8', accent: '#1a73e8' },
 ]

 const loansByStatus = {
 active: loans.filter(l => l.status === 'active').length,
 completed: loans.filter(l => l.status === 'completed').length,
 pending: loans.filter(l => l.status === 'pending').length
 }

 const loansByRate = {
 low: loans.filter(l => l.interestRate <= 5).length,
 medium: loans.filter(l => l.interestRate > 5 && l.interestRate <= 10).length,
 high: loans.filter(l => l.interestRate > 10).length
 }

 const generateReport = () => {
 const report = {
 generatedAt: new Date(),
 portfolioSummary: { totalLoans: loans.length, totalAmount: totalLoanAmount, averageAmount: averageLoanAmount, statusBreakdown: loansByStatus },
 riskAnalysis: { defaultRiskLoans, riskPercentage: ((defaultRiskLoans / loans.length) * 100).toFixed(2), highRateLoans: loansByRate.high },
 transactionSummary: {
 totalTransactions: transactions.length, totalAmount: totalTransactions,
 borrowerPayments: { count: borrowerTransactions.length, totalAmount: totalBorrowerAmount },
 lenderDisbursements: { count: lenderTransactions.length, totalAmount: totalLenderAmount }
 }
 }
 flashReport(' Report generated successfully!')
 }

 const getBorrowerName = (tx) => {
 if (tx.borrowerName) return tx.borrowerName
 const loan = loans.find(l => l.id === tx.loanId)
 return loan?.borrowerName || '—'
 }

 const getLenderName = (tx) => {
 if (tx.lenderName) return tx.lenderName
 const u = users.find(u => u.id === tx.lenderId)
 return u?.name || (tx.lenderId ? `Lender #${tx.lenderId}` : '—')
 }

 const tabStyle = (key) => ({
 display: 'flex', alignItems: 'center', gap: '6px',
 padding: '10px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer',
 fontWeight: '600', fontSize: '13px', transition: 'all 0.2s',
 background: reportType === key ? '#667eea' : 'transparent',
 color: reportType === key ? 'white' : '#4a5568',
 })

 const TransactionTable = ({ data, mode }) => {
 if (data.length === 0) {
 return (
 <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
 <div style={{ fontSize: '40px', marginBottom: '12px' }}>{mode === 'borrower' ? '' : ''}</div>
 <p style={{ color: '#718096', fontSize: '15px' }}>No {mode === 'borrower' ? 'borrower payment' : 'lender disbursement'} transactions recorded yet.
 </p>
 </div>
 )
 }

 const reversed = data.slice().reverse()
 const totalAmt = data.reduce((s, t) => s + (t.amount || 0), 0)
 const accentColor = mode === 'borrower' ? '#276749' : '#2b6cb0'
 const headerBg = mode === 'borrower' ? '#f0fff4' : '#ebf4ff'
 const badgeBg = mode === 'borrower' ? '#c6f6d5' : '#bee3f8'
 const badgeLabel = mode === 'borrower' ? ' Payment' : ' Disbursement'

 return (
 <div style={{ overflowX: 'auto' }}>
 <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
 <thead>
 <tr style={{ background: headerBg }}>
 {['#', 'Date', 'Type', mode === 'borrower' ? 'Borrower' : 'Lender', mode === 'borrower' ? 'Lender' : 'Borrower', 'Loan ID', 'Amount', 'Description'].map(h => (
 <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#4a5568', borderBottom: `2px solid ${badgeBg}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {reversed.map((tx, idx) => (
 <tr key={tx.id} style={{ borderBottom: '1px solid #f0f4f8' }}
 onMouseEnter={e => e.currentTarget.style.background = '#f9fbfd'}
 onMouseLeave={e => e.currentTarget.style.background = 'white'}
 >
 <td style={{ padding: '12px 16px', fontSize: '13px', color: '#a0aec0', fontWeight: '600' }}>{data.length - idx}</td>
 <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568' }}>
 {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
 </td>
 <td style={{ padding: '12px 16px' }}>
 <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: badgeBg, color: accentColor }}>
 {badgeLabel}
 </span>
 </td>
 <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#2d3748' }}>
 {mode === 'borrower' ? getBorrowerName(tx) : getLenderName(tx)}
 </td>
 <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568' }}>
 {mode === 'borrower' ? getLenderName(tx) : getBorrowerName(tx)}
 </td>
 <td style={{ padding: '12px 16px', fontSize: '12px', color: '#718096', fontFamily: 'monospace' }}>#{tx.loanId || '—'}</td>
 <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: accentColor }}>
 ₹{tx.amount?.toLocaleString('en-IN')}
 </td>
 <td style={{ padding: '12px 16px', fontSize: '13px', color: '#718096' }}>{tx.description || '—'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 <div style={{ marginTop: '14px', padding: '14px 20px', background: headerBg, borderRadius: '10px', display: 'flex', gap: '32px', flexWrap: 'wrap', border: `1px solid ${badgeBg}` }}>
 <span style={{ fontSize: '13px' }}><strong style={{ color: accentColor }}>{data.length}</strong> transactions</span>
 <span style={{ fontSize: '13px' }}>Total: <strong style={{ color: accentColor }}>₹{totalAmt.toLocaleString('en-IN')}</strong></span>
 <span style={{ fontSize: '13px' }}>Average: <strong style={{ color: accentColor }}>₹{data.length > 0 ? Math.round(totalAmt / data.length).toLocaleString('en-IN') : 0}</strong></span>
 <span style={{ fontSize: '13px' }}>Max: <strong style={{ color: accentColor }}>₹{Math.max(...data.map(t => t.amount || 0), 0).toLocaleString('en-IN')}</strong></span>
 </div>
 </div>
 )
 }

 return (
 <div className="main-content">
 <div className="dashboard">
 <div className="dashboard-header">
 <h1>Financial Analyst Dashboard</h1>
 <p>Analyze loan data, individual transactions and assess portfolio risks</p>
 </div>

 {/* Stats - Feature #4 enhanced */}
 <div className="stats-grid stagger-children" style={{ marginBottom: '28px' }}>
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
 subtitle={stat.subtitle}
 />
 ))}
 </div>

 {/* Tabs */}
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', background: '#f7fafc', padding: '8px', borderRadius: '12px' }}>
 <button style={tabStyle('overview')} onClick={() => setReportType('overview')}><BarChart3 size={16} /> Overview</button>
 <button style={tabStyle('all-transactions')} onClick={() => setReportType('all-transactions')}><List size={16} /> All Transactions</button>
 <button style={tabStyle('borrower-transactions')} onClick={() => setReportType('borrower-transactions')}><ArrowUpCircle size={16} /> Borrower Transactions</button>
 <button style={tabStyle('lender-transactions')} onClick={() => setReportType('lender-transactions')}><ArrowDownCircle size={16} /> Lender Transactions</button>
 <button style={tabStyle('risk')} onClick={() => setReportType('risk')}><TrendingUp size={16} /> Risk Analysis</button>
 <button style={tabStyle('portfolio')} onClick={() => setReportType('portfolio')}><PieChart size={16} /> Portfolio</button>
 <button style={tabStyle('analytics')} onClick={() => setReportType('analytics')}><PieChart size={16} /> Analytics Charts</button>
 <button style={tabStyle('reports')} onClick={() => setReportType('reports')}><Download size={16} /> Reports</button>
 <button style={tabStyle('profile')} onClick={() => setReportType('profile')}> My Profile</button>
 </div>

 {/* Overview */}
 {reportType === 'overview' && (
 <div className="dashboard-section">
 <h2 className="section-title">Portfolio Overview</h2>
 <div style={{ marginBottom: '20px' }}>
 <OverdueSummaryCard loans={loans} transactions={transactions} />
 </div>
 <div className="cards-grid">
 <div className="card">
 <div className="card-header"><h3 className="card-title">Loan Distribution by Status</h3></div>
 <div className="card-content">
 <p><strong>Active Loans:</strong> {loansByStatus.active}</p>
 <p><strong>Completed Loans:</strong> {loansByStatus.completed}</p>
 <p><strong>Pending Applications:</strong> {loansByStatus.pending}</p>
 <p><strong>Total Loans:</strong> {loans.length}</p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">Portfolio Value</h3></div>
 <div className="card-content">
 <p><strong>Total Outstanding:</strong> ₹{totalLoanAmount.toLocaleString('en-IN')}</p>
 <p><strong>Average Loan:</strong> ₹{Math.round(averageLoanAmount).toLocaleString('en-IN')}</p>
 <p><strong>Largest Loan:</strong> ₹{Math.max(...loans.map(l => l.amount), 0).toLocaleString('en-IN')}</p>
 <p><strong>Smallest Loan:</strong> ₹{loans.length > 0 ? Math.min(...loans.map(l => l.amount)).toLocaleString('en-IN') : 0}</p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">Transaction Summary</h3></div>
 <div className="card-content">
 <p><strong>Total Transactions:</strong> {transactions.length}</p>
 <p><strong>Borrower Payments:</strong> {borrowerTransactions.length} — ₹{totalBorrowerAmount.toLocaleString('en-IN')}</p>
 <p><strong>Lender Disbursements:</strong> {lenderTransactions.length} — ₹{totalLenderAmount.toLocaleString('en-IN')}</p>
 <p><strong>Total Value:</strong> ₹{totalTransactions.toLocaleString('en-IN')}</p>
 </div>
 </div>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
 <div style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)', borderRadius: '14px', padding: '24px', border: '1px solid #9ae6b4' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
 <ArrowUpCircle size={24} color="#276749" />
 <h3 style={{ margin: 0, color: '#276749', fontSize: '16px', fontWeight: '700' }}>Borrower Payments</h3>
 </div>
 <div style={{ fontSize: '28px', fontWeight: '800', color: '#276749' }}>₹{totalBorrowerAmount.toLocaleString('en-IN')}</div>
 <div style={{ fontSize: '13px', color: '#38a169', marginTop: '6px' }}>{borrowerTransactions.length} payment transactions</div>
 <button onClick={() => setReportType('borrower-transactions')} style={{ marginTop: '14px', padding: '8px 16px', background: '#276749', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>View All →</button>
 </div>
 <div style={{ background: 'linear-gradient(135deg, #ebf4ff 0%, #bee3f8 100%)', borderRadius: '14px', padding: '24px', border: '1px solid #90cdf4' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
 <ArrowDownCircle size={24} color="#2b6cb0" />
 <h3 style={{ margin: 0, color: '#2b6cb0', fontSize: '16px', fontWeight: '700' }}>Lender Disbursements</h3>
 </div>
 <div style={{ fontSize: '28px', fontWeight: '800', color: '#2b6cb0' }}>₹{totalLenderAmount.toLocaleString('en-IN')}</div>
 <div style={{ fontSize: '13px', color: '#3182ce', marginTop: '6px' }}>{lenderTransactions.length} disbursement transactions</div>
 <button onClick={() => setReportType('lender-transactions')} style={{ marginTop: '14px', padding: '8px 16px', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>View All →</button>
 </div>
 </div>
 </div>
 )}

 {/* All Transactions */}
 {reportType === 'all-transactions' && (
 <div className="dashboard-section">
 <h2 className="section-title">All Transactions</h2>
 {transactions.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '14px' }}>
 <p style={{ color: '#718096' }}>No transactions recorded yet.</p>
 </div>
 ) : (
 <div style={{ overflowX: 'auto' }}>
 <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
 <thead>
 <tr style={{ background: '#f7fafc' }}>
 {['#', 'Date', 'Type', 'Borrower', 'Lender', 'Loan ID', 'Amount', 'Description'].map(h => (
 <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#4a5568', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {transactions.slice().reverse().map((tx, idx) => (
 <tr key={tx.id} style={{ borderBottom: '1px solid #f0f4f8' }}
 onMouseEnter={e => e.currentTarget.style.background = '#f9fbfd'}
 onMouseLeave={e => e.currentTarget.style.background = 'white'}
 >
 <td style={{ padding: '12px 16px', fontSize: '13px', color: '#a0aec0', fontWeight: '600' }}>{transactions.length - idx}</td>
 <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568' }}>
 {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
 </td>
 <td style={{ padding: '12px 16px' }}>
 <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: tx.type === 'disbursement' ? '#bee3f8' : '#c6f6d5', color: tx.type === 'disbursement' ? '#2b6cb0' : '#276749' }}>
 {tx.type === 'disbursement' ? ' Disbursement' : ' Payment'}
 </span>
 </td>
 <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600' }}>{getBorrowerName(tx)}</td>
 <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568' }}>{getLenderName(tx)}</td>
 <td style={{ padding: '12px 16px', fontSize: '12px', color: '#718096', fontFamily: 'monospace' }}>#{tx.loanId || '—'}</td>
 <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: tx.type === 'disbursement' ? '#2b6cb0' : '#276749' }}>₹{tx.amount?.toLocaleString('en-IN')}</td>
 <td style={{ padding: '12px 16px', fontSize: '13px', color: '#718096' }}>{tx.description || '—'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 <div style={{ marginTop: '14px', padding: '14px 20px', background: '#f7fafc', borderRadius: '10px', display: 'flex', gap: '28px', flexWrap: 'wrap', border: '1px solid #e2e8f0' }}>
 <span style={{ fontSize: '13px' }}><strong>{transactions.length}</strong> total transactions</span>
 <span style={{ fontSize: '13px' }}>Total Value: <strong>₹{totalTransactions.toLocaleString('en-IN')}</strong></span>
 <span style={{ fontSize: '13px', color: '#276749' }}>Payments: <strong>{borrowerTransactions.length}</strong></span>
 <span style={{ fontSize: '13px', color: '#2b6cb0' }}>Disbursements: <strong>{lenderTransactions.length}</strong></span>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Borrower Transactions */}
 {reportType === 'borrower-transactions' && (
 <div className="dashboard-section">
 <div style={{ marginBottom: '16px' }}>
 <button onClick={() => setReportType('overview')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'white', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
 ← Back to Dashboard
 </button>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
 <div style={{ width: '44px', height: '44px', background: '#c6f6d5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <ArrowUpCircle size={22} color="#276749" />
 </div>
 <div>
 <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>Borrower Transactions</h2>
 <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>All repayment / EMI payments made by borrowers</p>
 </div>
 <div style={{ marginLeft: 'auto', padding: '10px 20px', background: '#c6f6d5', borderRadius: '10px', textAlign: 'center' }}>
 <div style={{ fontSize: '20px', fontWeight: '800', color: '#276749' }}>₹{totalBorrowerAmount.toLocaleString('en-IN')}</div>
 <div style={{ fontSize: '11px', color: '#38a169', fontWeight: '600' }}>TOTAL RECEIVED</div>
 </div>
 </div>
 <TransactionTable data={borrowerTransactions} mode="borrower" />
 </div>
 )}

 {/* Lender Transactions */}
 {reportType === 'lender-transactions' && (
 <div className="dashboard-section">
 <div style={{ marginBottom: '16px' }}>
 <button onClick={() => setReportType('overview')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'white', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
 ← Back to Dashboard
 </button>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
 <div style={{ width: '44px', height: '44px', background: '#bee3f8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <ArrowDownCircle size={22} color="#2b6cb0" />
 </div>
 <div>
 <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>Lender Transactions</h2>
 <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>All loan disbursements made by lenders to borrowers</p>
 </div>
 <div style={{ marginLeft: 'auto', padding: '10px 20px', background: '#bee3f8', borderRadius: '10px', textAlign: 'center' }}>
 <div style={{ fontSize: '20px', fontWeight: '800', color: '#2b6cb0' }}>₹{totalLenderAmount.toLocaleString('en-IN')}</div>
 <div style={{ fontSize: '11px', color: '#3182ce', fontWeight: '600' }}>TOTAL DISBURSED</div>
 </div>
 </div>
 <TransactionTable data={lenderTransactions} mode="lender" />
 </div>
 )}

 {/* Risk */}
 {reportType === 'risk' && (
 <div className="dashboard-section">
 <h2 className="section-title">Risk Assessment</h2>
 <div className="cards-grid">
 <div className="card">
 <div className="card-header"><h3 className="card-title">Default Risk Analysis</h3></div>
 <div className="card-content">
 <p><strong>High Risk Loans (Pending):</strong> {defaultRiskLoans}</p>
 <p><strong>Risk Percentage:</strong> {loans.length > 0 ? ((defaultRiskLoans / loans.length) * 100).toFixed(2) : 0}%</p>
 <p><strong>Portfolio Health:</strong> {defaultRiskLoans < loans.length * 0.2 ? 'Good' : 'Monitor Required'}</p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">Interest Rate Risk</h3></div>
 <div className="card-content">
 <p><strong>Low Rate Loans (≤5%):</strong> {loansByRate.low}</p>
 <p><strong>Medium Rate Loans (5-10%):</strong> {loansByRate.medium}</p>
 <p><strong>High Rate Loans (&gt;10%):</strong> {loansByRate.high}</p>
 <p><strong>Avg Rate:</strong> {loans.length > 0 ? (loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length).toFixed(2) : 0}%</p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">Exposure Analysis</h3></div>
 <div className="card-content">
 <p><strong>Market Exposure:</strong> Moderate</p>
 <p><strong>Concentration Risk:</strong> Low</p>
 <p><strong>Liquidity:</strong> Good</p>
 <p><strong>Recommendation:</strong> Continue monitoring</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Portfolio */}
 {reportType === 'portfolio' && (
 <div className="dashboard-section">
 <h2 className="section-title">Portfolio Composition</h2>
 <div className="cards-grid">
 <div className="card">
 <div className="card-header"><h3 className="card-title">Loans by Term</h3></div>
 <div className="card-content">
 <p><strong>Short Term (&lt;12 months):</strong> {loans.filter(l => l.term < 12).length}</p>
 <p><strong>Medium Term (12-36 months):</strong> {loans.filter(l => l.term >= 12 && l.term <= 36).length}</p>
 <p><strong>Long Term (&gt;36 months):</strong> {loans.filter(l => l.term > 36).length}</p>
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">Top 5 Loans by Amount</h3></div>
 <div className="card-content">
 {loans.sort((a, b) => b.amount - a.amount).slice(0, 5).map((loan, idx) => (
 <p key={idx}>{idx + 1}. {loan.borrowerName}: ₹{loan.amount?.toLocaleString('en-IN')}</p>
 ))}
 {loans.length === 0 && <p>No loans in portfolio</p>}
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">Performance Metrics</h3></div>
 <div className="card-content">
 <p><strong>Portfolio ROI:</strong> 8.5%</p>
 <p><strong>Expected Return:</strong> ₹{(totalLoanAmount * 0.085).toLocaleString('en-IN')}</p>
 <p><strong>Win Rate:</strong> 94%</p>
 <p><strong>Loss Rate:</strong> 6%</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Analytics Charts */}
 {reportType === 'analytics' && (
 <div className="dashboard-section">
 <AnalyticsPanel loans={loans} transactions={transactions} />
 </div>
 )}

 {/* Reports */}
 {reportType === 'reports' && (
 <div className="dashboard-section">
 <h2 className="section-title">Generate Financial Reports</h2>
 {reportFlash && (
 <div className="alert alert-success" style={{ marginBottom: '16px' }}>{reportFlash}</div>
 )}
 <div style={{ marginBottom: '20px' }}>
 <AnalystExportButton loans={loans} transactions={transactions} />
 </div>
 <div className="cards-grid">
 <div className="card">
 <div className="card-header"><h3 className="card-title">Available Reports</h3></div>
 <div className="card-content">
 {['Portfolio Summary', 'Risk Assessment Report', 'Borrower Transaction Report', 'Lender Transaction Report', 'Compliance Report'].map(r => (
 <button key={r} className="btn btn-primary btn-block" style={{ marginBottom: '10px' }} onClick={generateReport}>
 <Download size={18} /> {r}
 </button>
 ))}
 </div>
 </div>
 <div className="card">
 <div className="card-header"><h3 className="card-title">Report Summary</h3></div>
 <div className="card-content">
 <p><strong>Report Period:</strong> Current Month</p>
 <p><strong>Data Points:</strong> {loans.length + transactions.length}</p>
 <p><strong>Borrower Transactions:</strong> {borrowerTransactions.length}</p>
 <p><strong>Lender Transactions:</strong> {lenderTransactions.length}</p>
 <p><strong>Last Generated:</strong> {new Date().toLocaleDateString('en-IN')}</p>
 <p><strong>Status:</strong> All Systems Normal</p>
 </div>
 </div>
 </div>
 </div>
 )}
 {/* My Profile */}
 {reportType === 'profile' && (
 <div className="dashboard-section">
 <h2 className="section-title">My Profile</h2>
 <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
 {[
 { label: ' Full Name', value: user?.name },
 { label: ' Email', value: user?.email },
 { label: ' Phone', value: user?.phone },
 { label: ' Date of Birth', value: user?.dob ? new Date(user.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
 { label: '🪪 PAN Card', value: user?.panCard || '—' },
 { label: '🆔 Aadhaar Card', value: user?.aadhaarCard ? user.aadhaarCard.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—' },
 { label: ' Education', value: user?.education || '—' },
 { label: '️ Role', value: 'Financial Analyst' },
 ].map((item, i) => (
 <div key={i} style={{ padding: '12px 16px', background: '#fefcbf', borderRadius: '10px' }}>
 <div style={{ fontSize: '11px', color: '#744210', fontWeight: '600', marginBottom: '3px' }}>{item.label}</div>
 <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>{item.value || '—'}</div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 )
}
