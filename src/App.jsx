import { useState, useEffect } from 'react'
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
import { notifyLoanAccepted, notifyPaymentReceived } from './components/NotificationSystem'
import MobileBottomNav from './components/MobileBottomNav'

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

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      // Check if user was suspended or deleted since last login
      try {
        const deletedIds = (() => { try { const s = localStorage.getItem('deletedUserIds'); return s ? JSON.parse(s) : [] } catch { return [] } })()
        if (deletedIds.includes(parsedUser.id)) { localStorage.removeItem('currentUser') }
        else {
          const reg = (() => { try { const s = localStorage.getItem('registeredUsers'); return s ? JSON.parse(s) : [] } catch { return [] } })()
          const regEntry = reg.find(u => u.id === parsedUser.id || u.email === parsedUser.email)
          if (regEntry?.status === 'suspended') { localStorage.removeItem('currentUser') }
          else setUser(parsedUser)
        }
      } catch { setUser(parsedUser) }
    }
    const savedLoans = localStorage.getItem('loans')
    const savedTransactions = localStorage.getItem('transactions')
    const savedNotifications = localStorage.getItem('notifications')
    if (savedLoans) setLoans(JSON.parse(savedLoans))
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))

    // Build merged user list from defaults + registered + customAdmin
    const DEFAULT_SAMPLE_USERS = [
      { id: 2, name: 'John Lender',   email: 'lender@loanhub.com',   role: 'lender',   phone: '9000000002', status: 'active' },
      { id: 3, name: 'Jane Borrower', email: 'borrower@loanhub.com', role: 'borrower', phone: '9000000003', status: 'active' },
      { id: 4, name: 'Analyst Pro',   email: 'analyst@loanhub.com',  role: 'analyst',  phone: '9000000004', status: 'active' }
    ]
    try {
      const saved = localStorage.getItem('registeredUsers')
      const registered = saved ? JSON.parse(saved) : []
      const deletedIds = (() => { try { const s = localStorage.getItem('deletedUserIds'); return s ? JSON.parse(s) : [] } catch { return [] } })()

      // Start with defaults, skip deleted, apply any status overrides from registeredUsers
      const merged = DEFAULT_SAMPLE_USERS
        .filter(u => !deletedIds.includes(u.id))
        .map(u => {
          const override = registered.find(r => r.email === u.email)
          const { password: _p, ...clean } = override || {}
          return override ? { ...u, ...clean } : u
        })

      // Add extra registered users (not in defaults), skip deleted and pending
      for (const ru of registered) {
        if (!DEFAULT_SAMPLE_USERS.find(u => u.email === ru.email) && !deletedIds.includes(ru.id)) {
          const { password: _p, ...withoutPwd } = ru
          if (withoutPwd.status !== 'pending') merged.push(withoutPwd)
        }
      }

      // Load custom admin if registered and not deleted
      const savedAdmin = localStorage.getItem('customAdmin')
      if (savedAdmin) {
        const admin = JSON.parse(savedAdmin)
        if (!deletedIds.includes(admin.id) && !merged.find(u => u.email === admin.email)) {
          const { password: _p, ...withoutPwd } = admin
          merged.push(withoutPwd)
        }
      }
      setUsers(merged)
    } catch {
      setUsers(DEFAULT_SAMPLE_USERS)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const addLoan = (loanData, currentNotifs) => {
    const newLoan = {
      id: Date.now(),
      ...loanData,
      createdAt: new Date(),
      status: loanData.status || 'pending'
    }
    const updatedLoans = [...loans, newLoan]
    setLoans(updatedLoans)
    localStorage.setItem('loans', JSON.stringify(updatedLoans))

    if (loanData.borrowerId) {
      const notif = {
        id: Date.now() + 1,
        type: 'loan_application',
        loanId: newLoan.id,
        message: `New loan application from ${loanData.borrowerName} for Rs.${parseFloat(loanData.amount).toLocaleString('en-IN')} at ${loanData.interestRate}% interest rate.`,
        borrowerName: loanData.borrowerName,
        borrowerId: loanData.borrowerId,
        amount: loanData.amount,
        interestRate: loanData.interestRate,
        term: loanData.term,
        purpose: loanData.purpose,
        targetRole: 'lender',
        timestamp: new Date(),
        read: false,
        accepted: false
      }
      const prevNotifs = currentNotifs || notifications
      const updatedNotifs = [...prevNotifs, notif]
      setNotifications(updatedNotifs)
      localStorage.setItem('notifications', JSON.stringify(updatedNotifs))
    }
    return newLoan
  }

  const updateLoan = (loanId, updates) => {
    const updatedLoans = loans.map(loan => loan.id === loanId ? { ...loan, ...updates } : loan)
    setLoans(updatedLoans)
    localStorage.setItem('loans', JSON.stringify(updatedLoans))

    // Fire "loan accepted" notification when status changes to active
    if (updates.status === 'active') {
      const loan = loans.find(l => l.id === loanId)
      if (loan) {
        const borrower = users.find(u => u.id === loan.borrowerId || u.name === loan.borrowerName)
        const lender = users.find(u => u.id === updates.lenderId || u.id === loan.lenderId)
        if (borrower) {
          notifyLoanAccepted(borrower.id, borrower.email, borrower.phone, loan.amount, lender?.name || 'A lender')
        }
      }
    }
  }

  const addTransaction = (transactionData) => {
    const newTransaction = { id: Date.now(), ...transactionData, timestamp: new Date() }
    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions))

    // Fire "payment received" notification to lender when borrower makes a payment
    if (transactionData.type === 'payment' && transactionData.lenderId) {
      const lender = users.find(u => u.id === transactionData.lenderId)
      if (lender) {
        const borrowerName = transactionData.borrowerName || 'A borrower'
        notifyPaymentReceived(lender.id, lender.email, lender.phone, borrowerName, transactionData.amount)
      }
    }

    return newTransaction
  }

  const markNotificationRead = (notificationId, lenderId) => {
    const updated = notifications.map(n => {
      if (n.id !== notificationId) return n
      if (lenderId) {
        const declinedBy = n.declinedBy ? [...n.declinedBy, lenderId] : [lenderId]
        return { ...n, declinedBy }
      }
      return { ...n, read: true }
    })
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))

    // Check if ALL lenders have declined -> mark loan as declined
    if (lenderId) {
      const notif = notifications.find(n => n.id === notificationId)
      if (notif) {
        const allLenders = users.filter(u => u.role === 'lender')
        const newDeclinedBy = notif.declinedBy ? [...notif.declinedBy, lenderId] : [lenderId]
        const allDeclined = allLenders.length > 0 && allLenders.every(l => newDeclinedBy.includes(l.id))
        if (allDeclined) {
          const updatedLoans = loans.map(loan =>
            loan.id === notif.loanId ? { ...loan, status: 'declined' } : loan
          )
          setLoans(updatedLoans)
          localStorage.setItem('loans', JSON.stringify(updatedLoans))
        }
      }
    }
  }

  // When a lender accepts, mark that loanId notification as accepted across ALL lenders
  const markNotificationAccepted = (loanId) => {
    const updated = notifications.map(n =>
      n.loanId === loanId ? { ...n, read: true, accepted: true } : n
    )
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const markAllNotificationsRead = (role) => {
    const updated = notifications.map(n => n.targetRole === role ? { ...n, read: true } : n)
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('currentUser'))
  const [activeTab, setActiveTab] = useState('loans')

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
                <AdminDashboard users={users} setUsers={setUsers} loans={loans} transactions={transactions} activeTab={activeTab} onTabChange={setActiveTab} />
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
                <BorrowerDashboard user={user} loans={loans} addLoan={addLoan} addTransaction={addTransaction} transactions={transactions} notifications={notifications} users={users} activeTab={activeTab} onTabChange={setActiveTab} />
              ) : <Navigate to="/" />} />
              <Route path="/analyst/*" element={user.role === 'analyst' ? (
                <AnalystDashboard loans={loans} transactions={transactions} users={users} user={user} activeTab={activeTab} onTabChange={setActiveTab} />
              ) : <Navigate to="/" />} />
              <Route path="/profile" element={
                <Profile user={user} onUpdateUser={handleUpdateUser} />
              } />
              <Route path="/loan/:id" element={<LoanDetails loans={loans} addTransaction={addTransaction} user={user} users={users} />} />
              <Route path="/payment/:id" element={<Payment loans={loans} transactions={transactions} addTransaction={addTransaction} updateLoan={updateLoan} />} />
            </Routes>
          </main>
        </div>
        <MobileBottomNav user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </Router>
  )
}

export default App
