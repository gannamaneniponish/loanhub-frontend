import { LogOut, User, ChevronDown, Moon, Sun, Bell, Search, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Navigation.css'
import { LogoBrand, LogoIcon } from './Logo'

export default function Navigation({ user, onLogout, notifications = [], markAllNotificationsRead }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [darkMode, setDarkMode]         = useState(() => localStorage.getItem('darkMode') === 'true')
  const dropdownRef = useRef(null)
  const notifRef    = useRef(null)
  const searchRef   = useRef(null)
  const navigate    = useNavigate()
  const location    = useLocation()

  const photo = localStorage.getItem(`profile_photo_${user?.id}`)
  const unreadCount = notifications.filter(n => !n.read && !n.accepted).length

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false)
      if (searchRef.current   && !searchRef.current.contains(e.target))   setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getRoleDisplay = (role) => {
    const map = { admin: 'Admin', lender: 'Lender', borrower: 'Borrower', analyst: 'Analyst' }
    return map[role] || role
  }
  const roleColors = {
    admin:    { bg: 'linear-gradient(135deg,#667eea,#764ba2)', badge: '#e9d8fd', badgeText: '#553c9a' },
    lender:   { bg: 'linear-gradient(135deg,#4299e1,#2b6cb0)', badge: '#bee3f8', badgeText: '#2b6cb0' },
    borrower: { bg: 'linear-gradient(135deg,#48bb78,#276749)', badge: '#c6f6d5', badgeText: '#276749' },
    analyst:  { bg: 'linear-gradient(135deg,#ecc94b,#b7791f)', badge: '#fefcbf', badgeText: '#744210' },
  }
  const colors = roleColors[user?.role] || roleColors.borrower

  // Breadcrumb
  const breadcrumb = (() => {
    const p = location.pathname
    if (p.includes('/admin'))    return [{ label: 'Admin' }, { label: 'Dashboard' }]
    if (p.includes('/lender'))   return [{ label: 'Lender' }, { label: 'Dashboard' }]
    if (p.includes('/borrower')) return [{ label: 'Borrower' }, { label: 'Dashboard' }]
    if (p.includes('/analyst'))  return [{ label: 'Analyst' }, { label: 'Dashboard' }]
    if (p.includes('/profile'))  return [{ label: 'Account' }, { label: 'Profile' }]
    if (p.includes('/loan'))     return [{ label: 'Loans' }, { label: 'Details' }]
    if (p.includes('/payment'))  return [{ label: 'Loans' }, { label: 'Payment' }]
    return []
  })()

  // Quick search items
  const searchLinks = [
    { label: 'Dashboard', path: `/${user?.role}` },
    { label: 'Profile', path: '/profile' },
    { label: 'Notifications', path: `/${user?.role}` },
  ].filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => navigate(`/${user?.role || ''}`)} style={{ cursor: 'pointer' }}>
          <LogoIcon size={26} />
          <h1>LoanHub</h1>
          {breadcrumb.length > 0 && (
            <div className="breadcrumb" aria-label="Breadcrumb">
              {breadcrumb.map((b, i) => (
                <span key={i}>
                  {i > 0 && <span className="breadcrumb-sep">›</span>}
                  <span className={`breadcrumb-item ${i === breadcrumb.length - 1 ? 'active' : ''}`}>{b.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Search (Feature #2) */}
          <div ref={searchRef} style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn"
              onClick={() => { setSearchOpen(o => !o); setDropdownOpen(false); setNotifOpen(false) }}
              aria-label="Search"
              title="Search"
            >
              <Search size={17} />
            </button>
            {searchOpen && (
              <div className="nav-search-dropdown animate-scale-in">
                <div className="nav-search-input-wrap">
                  <Search size={14} style={{ color: 'var(--text-secondary)' }} />
                  <input
                    autoFocus
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '14px', color: 'var(--text-primary)' }}
                  />
                  {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex' }}><X size={13} /></button>}
                </div>
                <div className="nav-search-results">
                  {searchLinks.length === 0 && <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>No results</div>}
                  {searchLinks.map((l, i) => (
                    <button key={i} className="nav-search-item" onClick={() => { navigate(l.path); setSearchOpen(false); setSearchQuery('') }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notification bell (Feature #15 + #2) */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn"
              onClick={() => { setNotifOpen(o => !o); setDropdownOpen(false); setSearchOpen(false) }}
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              title="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="notif-badge" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            {notifOpen && (
              <div className="nav-notif-dropdown animate-scale-in" role="dialog" aria-label="Notifications">
                <div className="notif-header">
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button className="notif-mark-all" onClick={() => { markAllNotificationsRead?.(user?.role); setNotifOpen(false) }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">All caught up!</div>
                  ) : notifications.slice(0, 8).map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                      <div className="notif-dot" />
                      <div className="notif-content">
                        <div className="notif-msg">{n.message || 'New notification'}</div>
                        <div className="notif-time">{n.timestamp ? new Date(n.timestamp).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'Just now'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark mode */}
          <button
            className="nav-icon-btn"
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} />}
          </button>

          {/* User profile dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setDropdownOpen(p => !p); setNotifOpen(false); setSearchOpen(false) }}
              className="nav-profile-btn"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <div className="nav-avatar" style={{ background: colors.bg }}>
                {photo
                  ? <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user?.name?.charAt(0).toUpperCase()
                }
              </div>
              <div className="nav-user-text">
                <div className="nav-user-name">{user?.name}</div>
                <div className="nav-user-role">{getRoleDisplay(user?.role)}</div>
              </div>
              <ChevronDown size={13} style={{ color: 'var(--text-secondary)', transform: dropdownOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {dropdownOpen && (
              <div className="nav-dropdown animate-scale-in" role="menu">
                {/* User info card */}
                <div className="nav-dropdown-user">
                  <div className="nav-dropdown-avatar" style={{ background: colors.bg }}>
                    {photo
                      ? <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : user?.name?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{user?.name}</div>
                    <span className="nav-role-badge" style={{ background: colors.badge, color: colors.badgeText }}>{getRoleDisplay(user?.role)}</span>
                  </div>
                </div>
                {user?.email && <div style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '0 14px 10px' }}>{user.email}</div>}
                <div className="nav-dropdown-divider" />
                <div className="nav-dropdown-items">
                  <button className="nav-dropdown-item" role="menuitem" onClick={() => { setDropdownOpen(false); navigate('/profile') }}>
                    <div className="nav-dropdown-item-icon blue"><User size={14} /></div>
                    My Profile
                  </button>
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item danger" role="menuitem" onClick={() => { setDropdownOpen(false); onLogout() }}>
                    <div className="nav-dropdown-item-icon red"><LogOut size={14} /></div>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
