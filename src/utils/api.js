/**
 * API Service - Connects LoanHub frontend to Spring Boot backend
 */

const BASE_URL = 'https://loanhub-backend.onrender.com/api'

// ─── Helper ───────────────────────────────────────────────────────────────────
async function request(method, path, body = null) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Server error' }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  register: (userData) =>
    request('POST', '/auth/register', userData),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const UserAPI = {
  getAll: () => request('GET', '/users'),
  getById: (id) => request('GET', `/users/${id}`),
  update: (id, data) => request('PUT', `/users/${id}`, data),
  delete: (id) => request('DELETE', `/users/${id}`),
}

// ─── Loans ────────────────────────────────────────────────────────────────────
export const LoanAPI = {
  getAll: () => request('GET', '/loans'),
  getById: (id) => request('GET', `/loans/${id}`),
  create: (data) => request('POST', '/loans', data),
  update: (id, data) => request('PUT', `/loans/${id}`, data),
  delete: (id) => request('DELETE', `/loans/${id}`),
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export const TransactionAPI = {
  getAll: () => request('GET', '/transactions'),
  create: (data) => request('POST', '/transactions', data),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const NotificationAPI = {
  getAll: () => request('GET', '/notifications'),
  markRead: (id) => request('PUT', `/notifications/${id}/read`),
  markAllRead: () => request('PUT', '/notifications/read-all'),
}
