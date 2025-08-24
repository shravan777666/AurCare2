import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import GoogleAuthButton from '../components/GoogleAuthButton'

// Hardcode backend URL to avoid proxy/env issues
const API_BASE = 'http://localhost:5000/api'

function Login() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
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

      // Store token and user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Sync context before navigation (so ProtectedRoute has correct role)
      updateUser(data.user)

      // Redirect after successful login
      if (data.user?.role === 'superadmin') navigate('/admin')
      else navigate('/profile')
    } catch (err) {
      setResult({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const [googleLoading, setGoogleLoading] = useState(false)
  const [role, setRole] = useState('customer')

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true)
      /* global google */
      const client = window.google?.accounts?.oauth2
      if (!client) throw new Error('Google SDK not loaded')

      const token = await client.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: (resp) => resp
      })

      // Using code that works with token client
      const promise = new Promise((resolve, reject) => {
        const tc = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: (response) => {
            if (response && response.access_token) {
              resolve(response)
            } else {
              reject(new Error('Google auth failed'))
            }
          }
        })
        tc.requestAccessToken()
      })

      const resp = await promise

      // Exchange access_token for ID token via userinfo (not ideal). Prefer One Tap or gsi client.
      // Simpler: use OAuth implicit with prompt=select_account and get ID token via g_id_signin. Here we'll fetch id_token via tokeninfo with access_token not supported.
      // Alternative approach: open Google One Tap credential API
      const credential = window.google?.accounts?.id?.get();

      // If using Google Identity Services "One Tap" flow, we'd receive a credential directly via callback.
      // To keep it simple and non-blocking, we read ID token from local session storage if injected by wrapper (skipped here).

      // Fallback: ask backend to accept access_token exchange (not supported currently). We'll show instruction.
      throw new Error('Please enable Google One Tap on the site to receive ID token, or I can switch to popup credential flow.')
    } catch (e) {
      setResult({ type: 'error', message: e.message })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Login</h2>
          <p className="text-sm text-gray-600">Access your account</p>
        </div>

        <div className="mb-4 flex items-center justify-center gap-3">
          <label className="text-sm">Sign in as</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-md border px-2 py-1 text-sm">
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="salonowner">Salon Owner</option>
          </select>
        </div>

        <GoogleAuthButton role={role} label="Sign in with Google" />

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







