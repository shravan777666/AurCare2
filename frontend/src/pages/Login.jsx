import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Hardcode backend URL to avoid proxy/env issues
const API_BASE = 'http://localhost:5000/api'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Login failed')
      }

      // Store token for subsequent requests
      localStorage.setItem('token', data.token)
      // Optional: store user as well
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect after successful login
      navigate('/profile')
    } catch (err) {
      setResult({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Login</h2>
          <p className="text-sm text-gray-600">Access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Logging in…' : 'Login'}
          </button>
          {result && (
            <div className={result.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-emerald-600'}>{result.message}</div>
          )}
        </form>
      </div>
    </main>
  )}

export default Login

