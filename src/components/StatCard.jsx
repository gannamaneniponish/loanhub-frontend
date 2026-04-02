import './StatCard.css'

/**
 * Feature #4: Enhanced stat cards with trends, icons, sparklines
 */
export default function StatCard({
  label,
  value,
  icon,
  iconBg = '#e8f0fe',
  iconColor = '#1a73e8',
  trend,      // number: positive = up, negative = down, 0 = flat
  trendLabel, // e.g. "vs last month"
  subtitle,
  accent = '#1a73e8',
  onClick,
}) {
  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat'
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→'
  const trendColor = { up: '#16a34a', down: '#dc2626', flat: '#64748b' }

  return (
    <div
      className={`enhanced-stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ '--accent': accent }}
    >
      {/* Icon */}
      {icon && (
        <div className="stat-icon-wrap" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        {trend !== undefined && (
          <div className="stat-trend" style={{ color: trendColor[trendDir] }}>
            <span className="trend-arrow">{trendIcon}</span>
            <span className="trend-pct">{Math.abs(trend)}%</span>
            {trendLabel && <span className="trend-label">{trendLabel}</span>}
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className="stat-accent-bar" style={{ background: accent }} />
    </div>
  )
}
