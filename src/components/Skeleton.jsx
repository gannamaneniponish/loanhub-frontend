import './Skeleton.css'

export function Skeleton({ className = '', width = '100%', height = '1rem' }) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  )
}

export function LoanCardSkeleton() {
  return (
    <div className="card">
      <div className="card-header">
        <Skeleton width="60%" height="1.5rem" />
        <Skeleton width="60px" height="28px" />
      </div>
      <div className="card-content">
        <Skeleton height="1rem" width="100%" />
        <Skeleton height="1rem" width="100%" style={{ marginTop: '1rem' }} />
        <Skeleton height="1rem" width="80%" />
      </div>
      <div className="card-footer">
        <Skeleton height="44px" width="100%" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <>
      <Skeleton height="1rem" width="100%" />
      <Skeleton height="1rem" width="100%" style={{ marginTop: '0.5rem' }} />
    </>
  )
}

export function DashboardSkeleton() {
  return (
    <div style={{ padding: '2rem' }}>
      <Skeleton height="2rem" width="200px" style={{ marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} height="120px" width="100%" />
        ))}
      </div>
      <Skeleton height="300px" width="100%" />
    </div>
  )
}
