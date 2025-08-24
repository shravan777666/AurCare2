import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import GoogleAuthButton from '../../components/GoogleAuthButton'

const API_BASE = 'http://localhost:5000/api'

export default function CustomerRegister() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/auth/register-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error || 'Registration failed')

      // Auto-login after registration
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      // Sync context so protected routes work immediately
      updateUser(data.user)
      navigate('/profile')
    } catch (err) {
      setResult({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true)
      // Expecting Google Identity Services script loaded globally
      const cred = await new Promise((resolve, reject) => {
        if (!window.google?.accounts?.id) return reject(new Error('Google SDK not loaded'))
        // Use prompt to show One Tap or use a custom button flow in production
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google sign-in was dismissed'))
          }
        })
        // Not receiving credential here without configured callback; provide guidance below.
        reject(new Error('Please enable Google One Tap and set callback to post id_token to backend.'))
      })
      return cred
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
          <h2 className="text-2xl font-bold tracking-tight">Register as Customer</h2>
          <p className="text-sm text-gray-600">Create your customer account</p>
        </div>

        <GoogleAuthButton role="customer" label="Sign up with Google" />

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Registering…' : 'Register'}
          </button>
          {result && (
            <div className={result.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-emerald-600'}>{result.message}</div>
          )}
        </form>
      </div>
    </main>
  )
}