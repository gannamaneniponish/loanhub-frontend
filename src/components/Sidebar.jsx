import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, TrendingUp, CreditCard,
  Settings, ChevronLeft, ChevronRight, Bell, BarChart3,
  ClipboardList, ShieldCheck, Menu, X
} from 'lucide-react'
import './Sidebar.css'
import { LogoBrand, LogoIcon } from './Logo'

const menuByRole = {
  admin: [
    { label: 'Dashboard',    icon: LayoutDashboard, path: '/admin', tab: 'overview' },
    { label: 'Users',        icon: Users,           path: '/admin', tab: 'users' },
    { label: 'Approvals',    icon: ShieldCheck,     path: '/admin', tab: 'approvals' },
    { label: 'Analytics',    icon: BarChart3,       path: '/admin', tab: 'analytics' },
    { label: 'Security',     icon: ShieldCheck,     path: '/admin', tab: 'security' },
    { label: 'Reports',      icon: FileText,        path: '/admin', tab: 'reports' },
  ],
  lender: [
    { label: 'My Loans',          icon: LayoutDashboard, path: '/lender', tab: 'loans' },
    { label: 'Loan Applications', icon: ClipboardList,   path: '/lender', tab: 'loan-applications' },
    { label: 'Borrower Details',  icon: Users,           path: '/lender', tab: 'borrowers' },
    { label: 'Analytics',         icon: BarChart3,       path: '/lender', tab: 'analytics' },
    { label: 'Agreements',        icon: FileText,        path: '/lender', tab: 'agreements' },
    { label: 'Add Money',         icon: CreditCard,      path: '/lender', tab: 'wallet' },
  ],
  borrower: [
    { label: 'My Loans',            icon: FileText,      path: '/borrower', tab: 'loans' },
    { label: 'EMI Schedule',        icon: LayoutDashboard, path: '/borrower', tab: 'schedule' },
    { label: 'Analytics',           icon: BarChart3,     path: '/borrower', tab: 'analytics' },
    { label: 'Agreements',          icon: ClipboardList, path: '/borrower', tab: 'agreements' },
    { label: 'Notification Settings', icon: Bell,        path: '/borrower', tab: 'notifications-settings' },
  ],
  analyst: [
    { label: 'Overview', icon: LayoutDashboard, path: '/analyst', tab: 'overview' },
    { label: 'Loan Analysis', icon: TrendingUp, path: '/analyst', tab: 'loans' },
    { label: 'Risk Report', icon: BarChart3, path: '/analyst', tab: 'risk' },
    { label: 'Transactions', icon: CreditCard, path: '/analyst', tab: 'transactions' },
    { label: 'Users', icon: Users, path: '/analyst', tab: 'users' },
  ],
}

export default function Sidebar({ user, activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed)
  }, [collapsed])

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false) }, [location])

  const menu = menuByRole[user?.role] || []
  const roleColors = {
    admin: 'linear-gradient(135deg,#667eea,#764ba2)',
    lender: 'linear-gradient(135deg,#4299e1,#2b6cb0)',
    borrower: 'linear-gradient(135deg,#48bb78,#276749)',
    analyst: 'linear-gradient(135deg,#ecc94b,#b7791f)',
  }

  const handleItemClick = (item) => {
    if (item.tab && onTabChange) onTabChange(item.tab)
    setMobileOpen(false)
  }

  const sidebarContent = (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        {!collapsed && (
        <div style={{display:"flex",alignItems:"center"}}>
          <LogoBrand size={22} textSize={15} color="#1a73e8" />
        </div>
      )}
      {collapsed && <span style={{display:"flex",alignItems:"center",justifyContent:"center"}}><LogoIcon size={24} /></span>}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: roleColors[user?.role] }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">{collapsed ? '' : 'MENU'}</div>
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.tab
          return (
            <button
              key={item.label}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : ''}
            >
              <Icon size={19} className="sidebar-item-icon" />
              {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
              {!collapsed && isActive && <span className="sidebar-active-dot" />}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      {!collapsed && (
        <div className="sidebar-bottom">
          <button
            className="sidebar-item"
            onClick={() => navigate('/profile')}
            title="Profile"
          >
            <Settings size={19} className="sidebar-item-icon" />
            <span className="sidebar-item-label">Settings</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Desktop sidebar */}
      <div className="sidebar-wrapper desktop-only">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      <div className={`sidebar-wrapper mobile-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div>
          {sidebarContent}
        </div>
      </div>
    </>
  )
}
