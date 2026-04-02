import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, CreditCard, Bell, User } from 'lucide-react'

const navByRole = {
  admin:    [
    { label: 'Dashboard', icon: LayoutDashboard, tab: 'overview' },
    { label: 'Users',     icon: User,             tab: 'users' },
    { label: 'Approvals', icon: FileText,          tab: 'approvals' },
    { label: 'Profile',   icon: User,              path: '/profile' },
  ],
  lender:   [
    { label: 'My Loans',      icon: LayoutDashboard, tab: 'loans' },
    { label: 'Applications',  icon: Bell,             tab: 'loan-applications' },
    { label: 'Analytics',     icon: FileText,          tab: 'analytics' },
    { label: 'Profile',       icon: User,              path: '/profile' },
  ],
  borrower: [
    { label: 'Loans',     icon: FileText,          tab: 'loans' },
    { label: 'Schedule',  icon: CreditCard,        tab: 'schedule' },
    { label: 'Alerts',    icon: Bell,              tab: 'notifications-settings' },
    { label: 'Profile',   icon: User,              path: '/profile' },
  ],
  analyst:  [
    { label: 'Overview',  icon: LayoutDashboard,  tab: 'overview' },
    { label: 'Loans',     icon: FileText,          tab: 'loans' },
    { label: 'Risk',      icon: CreditCard,        tab: 'risk' },
    { label: 'Profile',   icon: User,              path: '/profile' },
  ],
}

export default function MobileBottomNav({ user, activeTab, onTabChange }) {
  const navigate   = useNavigate()
  const location   = useLocation()
  const items = navByRole[user?.role] || []

  const isActive = (item) => {
    if (item.path) return location.pathname === item.path
    return activeTab === item.tab
  }

  const handleClick = (item) => {
    if (item.path) { navigate(item.path); return }
    onTabChange?.(item.tab)
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <div className="mobile-bottom-nav-inner">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <button
              key={item.label}
              className={`mobile-nav-item ${active ? 'active' : ''}`}
              onClick={() => handleClick(item)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="mobile-nav-icon">
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
