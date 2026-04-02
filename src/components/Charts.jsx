import { useState } from 'react'

// ─── Mini SVG Bar Chart ───────────────────────────────────────────────────────
export function BarChart({ data, title, color = '#667eea', height = 160 }) {
  const [tooltip, setTooltip] = useState(null)
  if (!data || data.length === 0) return <EmptyChart title={title} />
  const max = Math.max(...data.map(d => d.value), 1)
  const barW = Math.floor(280 / data.length) - 6

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      {title && <p style={{ margin: '0 0 14px', fontWeight: '700', fontSize: '14px', color: '#1a202c' }}>{title}</p>}
      <div style={{ position: 'relative' }}>
        <svg width="100%" viewBox={`0 0 300 ${height + 30}`} style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1="0" y1={height - f * height} x2="300" y2={height - f * height}
              stroke="#f0f4f8" strokeWidth="1" />
          ))}
          {/* Bars */}
          {data.map((d, i) => {
            const barH = Math.max((d.value / max) * height, 2)
            const x = i * (300 / data.length) + 3
            const y = height - barH
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH}
                  fill={color} rx="4" opacity="0.85"
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={() => setTooltip({ x: x + barW / 2, y, label: d.label, value: d.value })}
                  onMouseLeave={() => setTooltip(null)}
                />
                <text x={x + barW / 2} y={height + 16} textAnchor="middle"
                  fontSize="10" fill="#718096" fontWeight="500">
                  {d.label.length > 5 ? d.label.slice(0, 5) + '…' : d.label}
                </text>
              </g>
            )
          })}
          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect x={tooltip.x - 36} y={tooltip.y - 34} width="72" height="28"
                fill="#1a202c" rx="6" opacity="0.9" />
              <text x={tooltip.x} y={tooltip.y - 16} textAnchor="middle"
                fontSize="11" fill="white" fontWeight="700">
                {typeof tooltip.value === 'number' && tooltip.value > 999
                  ? `₹${(tooltip.value / 1000).toFixed(1)}k`
                  : tooltip.value}
              </text>
              <text x={tooltip.x} y={tooltip.y - 4} textAnchor="middle"
                fontSize="9" fill="#a0aec0">{tooltip.label}</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

// ─── Pie / Donut Chart ────────────────────────────────────────────────────────
export function DonutChart({ data, title }) {
  const [hovered, setHovered] = useState(null)
  if (!data || data.length === 0) return <EmptyChart title={title} />
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <EmptyChart title={title} />

  const cx = 80, cy = 80, r = 60, innerR = 36
  let angle = -Math.PI / 2
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    angle += sweep
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const ix1 = cx + innerR * Math.cos(angle - sweep)
    const iy1 = cy + innerR * Math.sin(angle - sweep)
    const ix2 = cx + innerR * Math.cos(angle)
    const iy2 = cy + innerR * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`
    return { ...d, path, index: i }
  })

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      {title && <p style={{ margin: '0 0 14px', fontWeight: '700', fontSize: '14px', color: '#1a202c' }}>{title}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color}
              opacity={hovered === null || hovered === i ? 1 : 0.5}
              style={{ cursor: 'pointer', transition: 'opacity 0.15s', transform: hovered === i ? `scale(1.04)` : 'scale(1)', transformOrigin: `${cx}px ${cy}px` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1a202c">{total}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#718096">Total</text>
        </svg>
        <div style={{ flex: 1, minWidth: '100px' }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
              opacity: hovered === null || hovered === i ? 1 : 0.5, transition: 'opacity 0.15s',
              cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#4a5568', flex: 1 }}>{d.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a202c' }}>{d.value}</span>
              <span style={{ fontSize: '11px', color: '#a0aec0' }}>({total > 0 ? Math.round(d.value / total * 100) : 0}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
export function LineChart({ data, title, color = '#667eea', label = 'Value' }) {
  const [tooltip, setTooltip] = useState(null)
  if (!data || data.length < 2) return <EmptyChart title={title} message="Not enough data for a trend chart yet" />
  const max = Math.max(...data.map(d => d.value), 1)
  const W = 280, H = 120
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.value / max) * H,
    label: d.label,
    value: d.value
  }))
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const fill = `${pts.map(p => `${p.x},${p.y}`).join(' ')} ${W},${H} 0,${H}`

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      {title && <p style={{ margin: '0 0 14px', fontWeight: '700', fontSize: '14px', color: '#1a202c' }}>{title}</p>}
      <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} style={{ overflow: 'visible' }}>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1="0" y1={H - f * H} x2={W} y2={H - f * H} stroke="#f0f4f8" strokeWidth="1" />
        ))}
        <polygon points={fill} fill={color} opacity="0.12" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip(p)} onMouseLeave={() => setTooltip(null)} />
            {data.length <= 8 && (
              <text x={p.x} y={H + 16} textAnchor="middle" fontSize="9" fill="#718096">{p.label}</text>
            )}
          </g>
        ))}
        {tooltip && (
          <g>
            <rect x={tooltip.x - 38} y={tooltip.y - 34} width="76" height="28" fill="#1a202c" rx="6" opacity="0.9" />
            <text x={tooltip.x} y={tooltip.y - 17} textAnchor="middle" fontSize="10" fill="white" fontWeight="700">
              {typeof tooltip.value === 'number' && tooltip.value > 9999
                ? `₹${(tooltip.value / 1000).toFixed(1)}k`
                : `₹${tooltip.value?.toLocaleString('en-IN')}`}
            </text>
            <text x={tooltip.x} y={tooltip.y - 5} textAnchor="middle" fontSize="9" fill="#a0aec0">{tooltip.label}</text>
          </g>
        )}
      </svg>
    </div>
  )
}

// ─── Horizontal Bar / Progress Chart ─────────────────────────────────────────
export function HorizBar({ items, title }) {
  if (!items || items.length === 0) return <EmptyChart title={title} />
  const max = Math.max(...items.map(d => d.value), 1)
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      {title && <p style={{ margin: '0 0 14px', fontWeight: '700', fontSize: '14px', color: '#1a202c' }}>{title}</p>}
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>{item.label}</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: item.color || '#667eea' }}>
              {typeof item.value === 'number' && item.value > 9999
                ? `₹${(item.value / 1000).toFixed(1)}k`
                : item.value}
            </span>
          </div>
          <div style={{ height: '8px', background: '#f0f4f8', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              background: item.color || '#667eea',
              width: `${(item.value / max) * 100}%`,
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyChart({ title, message = 'No data available yet' }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center' }}>
      {title && <p style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '14px', color: '#1a202c' }}>{title}</p>}
      
      <p style={{ margin: 0, fontSize: '13px', color: '#a0aec0' }}>{message}</p>
    </div>
  )
}

// ─── Analytics Panel — used by Analyst Dashboard ─────────────────────────────
export function AnalyticsPanel({ loans, transactions }) {
  // Loan status distribution
  const statusData = [
    { label: 'Active', value: loans.filter(l => l.status === 'active').length, color: '#48bb78' },
    { label: 'Pending', value: loans.filter(l => l.status === 'pending').length, color: '#ed8936' },
    { label: 'Completed', value: loans.filter(l => l.status === 'completed').length, color: '#667eea' },
    { label: 'Declined', value: loans.filter(l => l.status === 'declined').length, color: '#fc8181' },
  ]

  // Monthly transaction volume (last 6 months)
  const now = new Date()
  const monthlyVol = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const label = d.toLocaleString('en-IN', { month: 'short' })
    const value = transactions.filter(t => {
      const td = new Date(t.timestamp)
      return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
    }).reduce((s, t) => s + (t.amount || 0), 0)
    return { label, value }
  })

  // Interest rate distribution
  const rateData = [
    { label: '≤5%', value: loans.filter(l => l.interestRate <= 5).length, color: '#48bb78' },
    { label: '6–10%', value: loans.filter(l => l.interestRate > 5 && l.interestRate <= 10).length, color: '#ed8936' },
    { label: '>10%', value: loans.filter(l => l.interestRate > 10).length, color: '#fc8181' },
  ]

  // Loan amount ranges
  const amountBuckets = [
    { label: '<₹10k', value: loans.filter(l => l.amount < 10000).length, color: '#667eea' },
    { label: '₹10–50k', value: loans.filter(l => l.amount >= 10000 && l.amount < 50000).length, color: '#48bb78' },
    { label: '₹50k–2L', value: loans.filter(l => l.amount >= 50000 && l.amount < 200000).length, color: '#ed8936' },
    { label: '>₹2L', value: loans.filter(l => l.amount >= 200000).length, color: '#fc8181' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1a202c', margin: '0 0 20px' }}> Visual Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <DonutChart data={statusData} title="Loan Status Distribution" />
        <LineChart data={monthlyVol} title="Monthly Transaction Volume (₹)" color="#667eea" />
        <DonutChart data={rateData} title="Interest Rate Distribution" />
        <BarChart data={amountBuckets} title="Loan Amount Ranges" color="#48bb78" />
      </div>
    </div>
  )
}

// ─── Admin Analytics Panel ────────────────────────────────────────────────────
export function AdminAnalyticsPanel({ loans, transactions, users }) {
  const statusData = [
    { label: 'Active', value: loans.filter(l => l.status === 'active').length, color: '#48bb78' },
    { label: 'Pending', value: loans.filter(l => l.status === 'pending').length, color: '#ed8936' },
    { label: 'Completed', value: loans.filter(l => l.status === 'completed').length, color: '#667eea' },
    { label: 'Declined', value: loans.filter(l => l.status === 'declined').length, color: '#fc8181' },
  ]

  const userRoles = [
    { label: 'Borrowers', value: users.filter(u => u.role === 'borrower').length, color: '#48bb78' },
    { label: 'Lenders', value: users.filter(u => u.role === 'lender').length, color: '#667eea' },
    { label: 'Analysts', value: users.filter(u => u.role === 'analyst').length, color: '#ed8936' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#fc8181' },
  ]

  const now = new Date()
  const monthlyTxn = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const label = d.toLocaleString('en-IN', { month: 'short' })
    const value = transactions.filter(t => {
      const td = new Date(t.timestamp)
      return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
    }).reduce((s, t) => s + (t.amount || 0), 0)
    return { label, value }
  })

  const loanAmounts = loans.sort((a, b) => b.amount - a.amount).slice(0, 5).map(l => ({
    label: l.borrowerName?.split(' ')[0] || 'User',
    value: l.amount,
    color: '#667eea'
  }))

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1a202c', margin: '0 0 20px' }}>Platform Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <DonutChart data={statusData} title="Loan Status Breakdown" />
        <DonutChart data={userRoles} title="User Role Distribution" />
        <LineChart data={monthlyTxn} title="Monthly Transaction Volume (₹)" color="#667eea" />
        <HorizBar items={loanAmounts} title="Top 5 Loans by Amount" />
      </div>
    </div>
  )
}

// ─── Borrower Analytics Panel ─────────────────────────────────────────────────
export function BorrowerAnalyticsPanel({ loans, transactions, userId, userName }) {
  const myLoans = loans.filter(l => l.borrowerId === userId || l.borrowerName === userName)
  const myTxns = transactions.filter(t => {
    const loanIds = myLoans.map(l => l.id)
    return loanIds.includes(t.loanId)
  })

  const loanStatus = [
    { label: 'Active', value: myLoans.filter(l => l.status === 'active').length, color: '#48bb78' },
    { label: 'Completed', value: myLoans.filter(l => l.status === 'completed').length, color: '#667eea' },
    { label: 'Pending', value: myLoans.filter(l => l.status === 'pending').length, color: '#ed8936' },
    { label: 'Declined', value: myLoans.filter(l => l.status === 'declined').length, color: '#fc8181' },
  ].filter(d => d.value > 0)

  const now = new Date()
  const monthlyPayments = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const label = d.toLocaleString('en-IN', { month: 'short' })
    const value = myTxns.filter(t => {
      const td = new Date(t.timestamp)
      return t.type === 'payment' && td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
    }).reduce((s, t) => s + (t.amount || 0), 0)
    return { label, value }
  })

  const totalBorrowed = myLoans.filter(l => l.status === 'active').reduce((s, l) => s + (l.amount || 0), 0)
  const totalPaid = myTxns.filter(t => t.type === 'payment').reduce((s, t) => s + (t.amount || 0), 0)
  const progressData = [
    { label: 'Paid', value: totalPaid, color: '#48bb78' },
    { label: 'Remaining', value: Math.max(0, totalBorrowed - totalPaid), color: '#e2e8f0' },
  ].filter(d => d.value > 0)

  const loanAmounts = myLoans.slice(0, 5).map((l, i) => ({
    label: `Loan ${i + 1}`,
    value: l.amount || 0,
    color: '#667eea'
  }))

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1a202c', margin: '0 0 20px' }}>My Loan Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {loanStatus.length > 0 && <DonutChart data={loanStatus} title="My Loan Status" />}
        <LineChart data={monthlyPayments} title="Monthly Repayments Made (₹)" color="#48bb78" />
        {progressData.length > 0 && <DonutChart data={progressData} title="Repayment Progress" />}
        {loanAmounts.length > 0 && <HorizBar items={loanAmounts} title="My Loan Amounts" />}
      </div>
    </div>
  )
}

// ─── Lender Analytics Panel ───────────────────────────────────────────────────
export function LenderAnalyticsPanel({ loans, transactions, userId }) {
  const myLoans = loans.filter(l => l.lenderId === userId)
  const myTxns = transactions.filter(t => t.lenderId === userId)

  const loanStatus = [
    { label: 'Active', value: myLoans.filter(l => l.status === 'active').length, color: '#48bb78' },
    { label: 'Completed', value: myLoans.filter(l => l.status === 'completed').length, color: '#667eea' },
    { label: 'Pending', value: myLoans.filter(l => l.status === 'pending').length, color: '#ed8936' },
  ]

  const now = new Date()
  const earnings = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const label = d.toLocaleString('en-IN', { month: 'short' })
    const value = myTxns.filter(t => {
      const td = new Date(t.timestamp)
      return t.type === 'payment' && td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
    }).reduce((s, t) => s + (t.amount || 0), 0)
    return { label, value }
  })

  const borrowerBreakdown = myLoans.slice(0, 5).map(l => ({
    label: l.borrowerName?.split(' ')[0] || 'Borrower',
    value: l.amount,
    color: '#667eea'
  }))

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1a202c', margin: '0 0 20px' }}>My Portfolio Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <DonutChart data={loanStatus} title="My Loan Status" />
        <LineChart data={earnings} title="Monthly Repayments Received (₹)" color="#48bb78" />
        {borrowerBreakdown.length > 0 && <HorizBar items={borrowerBreakdown} title="Loan Amounts by Borrower" />}
      </div>
    </div>
  )
}
