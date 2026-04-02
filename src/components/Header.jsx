import { useState } from 'react'
import { Bell, Settings, LogOut, Moon, Sun, Menu, X, Search } from 'lucide-react'
import { LogoIcon } from './Logo'
import './Header.css'

export function Header({ user, theme, onThemeToggle, unreadCount = 0 }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Left: Logo & Brand */}
          <div className="header-brand">
            <div className="logo-wrapper">
              <LogoIcon />
              <div className="brand-text">
                <div className="logo-title">LoanHub</div>
                <div className="logo-tagline">Smart Lending</div>
              </div>
            </div>
          </div>

          {/* Center: Search - Hidden on mobile */}
          <div className="header-search-wrapper">
            <div className="header-search">
              <Search size={18} />
              <input 
                type="text"
                placeholder="Search loans, users..."
                className="search-input"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="header-actions">
            {/* Notifications */}
            <button className="action-button notification-btn" title="Notifications" aria-label="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Theme Toggle */}
            <button 
              className="action-button"
              onClick={onThemeToggle}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Settings */}
            <button className="action-button" title="Settings" aria-label="Settings">
              <Settings size={20} />
            </button>

            {/* User Avatar & Dropdown */}
            <div className="header-user" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.role || 'Guest'}</div>
              </div>
              
              {showUserMenu && (
                <div className="dropdown-menu">
                  <a href="/profile" className="dropdown-item">👤 Profile</a>
                  <a href="/settings" className="dropdown-item">⚙️ Settings</a>
                  <a href="/help" className="dropdown-item">❓ Help</a>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout-btn">
                    <LogOut size={16} style={{ marginRight: '8px' }} /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-search">
            <Search size={18} />
            <input 
              type="text"
              placeholder="Search..."
              className="search-input"
            />
          </div>
          <div className="mobile-menu-items">
            <a href="/profile" className="mobile-menu-item">👤 Profile</a>
            <a href="/settings" className="mobile-menu-item">⚙️ Settings</a>
            <a href="/help" className="mobile-menu-item">❓ Help</a>
            <button className="mobile-menu-item logout">
              <LogOut size={16} style={{ marginRight: '8px' }} /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  )
}
