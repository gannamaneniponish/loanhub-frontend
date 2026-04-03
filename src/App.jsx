import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/AdminDashboard'
import LenderDashboard from './pages/LenderDashboard'
import BorrowerDashboard from './pages/BorrowerDashboard'
import AnalystDashboard from './pages/AnalystDashboard'
import LoanDetails from './pages/LoanDetails'
import Payment from './pages/Payment'
import Profile from './pages/Profile'
import Navigation from './components/Navigation'
import Sidebar from './components/Sidebar'
import MobileBottomNav from './components/MobileBottomNav'
import { LoanAPI, UserAPI, TransactionAPI, NotificationAPI } from './utils/api'

// Apply saved dark mode preference immediately on load
;(function initDarkMode() {
  const dark = localStorage.getItem('darkMode') === 'true'
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
})()

function App() {
  const [user, setUser] = useState(null)
  const [loans, setLoans] = useState([])
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('loans')
  const [showLanding, setShowLanding] = useState(false)

  // Load user from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    } else {
      setShowLanding(true)
    }
    setLoading(false)
  }, [])

  // Fetch all data from backend when user logs in
  const fetchAllData = useCallback(async () => {
    if (!localStorage.getItem('token')) return
    try {
      const [loansRes, usersRes, transactionsRes, notificationsRes] = await Promise.allSettled([
        LoanAPI.getAll(),
        UserAPI.getAll(),
        TransactionAPI.getAll(),
        NotificationAPI.getAll()
      ])
      if (loansRes.status === 'fulfilled') setLoans(loansRes.value.data || [])
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || [])
      if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.data || [])
      if (notificationsRes.status === 'fulfilled') setNotifications(notificationsRes.value.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }, [])

  useEffect(() => {
    if (user) fetchAllData()
  }, [user, fetchAllData])

  const handleLogin = (userData) => {
    setUser(userData)
    setShowLanding(false)
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setShowLanding(true)
    localStorage.removeItem('currentUser')
    localStorage.removeItem('token')
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
  }

  // ─── Loans ────────────────────────────────────────────────────────────────
  const addLoan = async (loanData) => {
    try {
      const res = await LoanAPI.create(loanData)
      const newLoan = res.data
      setLoans(prev => [...prev, newLoan])
      await fetchAllData()
      return newLoan
    } catch (err) {
      console.error('Error creating loan:', err)
      // Fallback to localStorage
      const newLoan = { id: Date.now(), ...loanData, createdAt: new Date(), status: 'pending' }
      setLoans(prev => [...prev, newLoan])
      return newLoan
    }
  }

  const updateLoan = async (loanId, updates) => {
    try {
      await LoanAPI.update(loanId, updates)
      setLoans(prev => prev.map(loan => loan.id === loanId ? { ...loan, ...updates } : loan))
      await fetchAllData()
    } catch (err) {
      console.error('Error updating loan:', err)
      setLoans(prev => prev.map(loan => loan.id === loanId ? { ...loan, ...updates } : loan))
    }
  }

  // ─── Transactions ─────────────────────────────────────────────────────────
  const addTransaction = async (transactionData) => {
    try {
      const res = await TransactionAPI.create(transactionData)
      const newTransaction = res.data
      setTransactions(prev => [...prev, newTransaction])
      await fetchAllData()
      return newTransaction
    } catch (err) {
      console.error('Error creating transaction:', err)
      const newTransaction = { id: Date.now(), ...transactionData, timestamp: new Date() }
      setTransactions(prev => [...prev, newTransaction])
      return newTransaction
    }
  }

  // ─── Notifications ────────────────────────────────────────────────────────
  const markNotificationRead = async (notificationId, lenderId) => {
    try {
      await NotificationAPI.markRead(notificationId)
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (err) {
      console.error('Error marking notification read:', err)
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ))
    }
  }

  const markNotificationAccepted = async (loanId) => {
    setNotifications(prev => prev.map(n =>
      n.loanId === loanId ? { ...n, read: true, accepted: true } : n
    ))
    await fetchAllData()
  }

  const markAllNotificationsRead = async (role) => {
    try {
      await NotificationAPI.markAllRead()
      setNotifications(prev => prev.map(n =>
        n.targetRole === role ? { ...n, read: true } : n
      ))
    } catch (err) {
      setNotifications(prev => prev.map(n =>
        n.targetRole === role ? { ...n, read: true } : n
      ))
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px' }}>
        Loading...
      </div>
    )
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />
  }

  if (!user) return <Login onLogin={handleLogin} setUsers={setUsers} />

  return (
    <Router>
      <div className="app-container" style={{ flexDirection: 'column' }}>
        <Navigation
          user={user}
          onLogout={handleLogout}
          notifications={notifications}
          markAllNotificationsRead={markAllNotificationsRead}
        />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
          <main id="main-content" className="main-content" style={{ flex: 1, overflowY: 'auto' }} role="main">
            <Routes>
              <Route path="/" element={<Navigate to={`/${user.role}`} />} />
              <Route path="/admin/*" element={user.role === 'admin' ? (
                <AdminDashboard
                  users={users} setUsers={setUsers}
                  loans={loans} transactions={transactions}
                  activeTab={activeTab} onTabChange={setActiveTab}
                  refreshData={fetchAllData}
                />
              ) : <Navigate to="/" />} />
              <Route path="/lender/*" element={user.role === 'lender' ? (
                <LenderDashboard
                  user={user} loans={loans} addLoan={addLoan} updateLoan={updateLoan}
                  addTransaction={addTransaction} transactions={transactions}
                  notifications={notifications.filter(n => n.targetRole === 'lender' && !n.accepted)}
                  markNotificationRead={markNotificationRead}
                  markNotificationAccepted={markNotificationAccepted}
                  markAllNotificationsRead={markAllNotificationsRead}
                  users={users}
                  activeTab={activeTab} onTabChange={setActiveTab}
                />
              ) : <Navigate to="/" />} />
              <Route path="/borrower/*" element={user.role === 'borrower' ? (
                <BorrowerDashboard
                  user={user} loans={loans} addLoan={addLoan}
                  addTransaction={addTransaction} transactions={transactions}
                  notifications={notifications} users={users}
                  activeTab={activeTab} onTabChange={setActiveTab}
                />
              ) : <Navigate to="/" />} />
              <Route path="/analyst/*" element={user.role === 'analyst' ? (
                <AnalystDashboard
                  loans={loans} transactions={transactions}
                  users={users} user={user}
                  activeTab={activeTab} onTabChange={setActiveTab}
                />
              ) : <Navigate to="/" />} />
              <Route path="/profile" element={
                <Profile user={user} onUpdateUser={handleUpdateUser} />
              } />
              <Route path="/loan/:id" element={
                <LoanDetails loans={loans} addTransaction={addTransaction} user={user} users={users} />
              } />
              <Route path="/payment/:id" element={
                <Payment loans={loans} transactions={transactions} addTransaction={addTransaction} updateLoan={updateLoan} />
              } />
            </Routes>
          </main>
        </div>
        <MobileBottomNav user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </Router>
  )
}

export default App
