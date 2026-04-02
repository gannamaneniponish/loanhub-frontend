import { useState, useCallback, useEffect, createContext, useContext, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastIdCounter
    setToasts(prev => [...prev, { id, type, title, message, duration, exiting: false }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280)
  }, [])

  const toast = {
    success: (title, message, opts) => addToast({ type: 'success', title, message, ...opts }),
    error:   (title, message, opts) => addToast({ type: 'error',   title, message, ...opts }),
    info:    (title, message, opts) => addToast({ type: 'info',    title, message, ...opts }),
    warning: (title, message, opts) => addToast({ type: 'warning', title, message, ...opts }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

const icons = {
  success: <CheckCircle size={16} color="#16a34a" />,
  error:   <AlertCircle size={16} color="#dc2626" />,
  info:    <Info        size={16} color="#1a73e8" />,
  warning: <AlertTriangle size={16} color="#d97706" />,
}
const iconBg = {
  success: 'rgba(22,163,74,0.12)',
  error:   'rgba(220,38,38,0.12)',
  info:    'rgba(26,115,232,0.12)',
  warning: 'rgba(217,119,6,0.12)',
}
const barColors = {
  success: '#16a34a',
  error:   '#dc2626',
  info:    '#1a73e8',
  warning: '#d97706',
}

function Toast({ toast, onRemove }) {
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), toast.duration)
    return () => clearTimeout(timerRef.current)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      className={`toast toast-${toast.type} ${toast.exiting ? 'exiting' : ''}`}
      role="alert"
      aria-live="polite"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div className="toast-icon" style={{ background: iconBg[toast.type] }}>
        {icons[toast.type]}
      </div>
      <div className="toast-body">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        {toast.message && <div className="toast-msg">{toast.message}</div>}
      </div>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
      <div
        className="toast-progress"
        style={{
          animationDuration: `${toast.duration}ms`,
          background: barColors[toast.type],
        }}
      />
    </div>
  )
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}
