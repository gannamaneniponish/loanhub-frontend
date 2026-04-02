import './SkeletonLoader.css'

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-badge"></div>
      </div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-line short"></div>
      <div className="skeleton-footer">
        <div className="skeleton skeleton-btn"></div>
        <div className="skeleton skeleton-btn"></div>
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="skeleton-stat-card">
      <div className="skeleton skeleton-label"></div>
      <div className="skeleton skeleton-value"></div>
      <div className="skeleton skeleton-change"></div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton-th"></div>)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {[1,2,3,4,5].map(j => (
            <div key={j} className="skeleton skeleton-td"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-stats-row">
        {[1,2,3,4].map(i => <SkeletonStatCard key={i} />)}
      </div>
      <div className="skeleton-cards-row">
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}
