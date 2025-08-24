import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = 'http://localhost:5000/api'

export default function GoogleAuthButton({ role = 'customer', label = 'Continue with Google' }) {
  const buttonRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { updateUser } = useAuth()

  useEffect(() => {
    let initialized = false
    const init = () => {
      if (initialized) return
      if (!window.google?.accounts?.id) return
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          // response.credential is the ID token
          try {
            setLoading(true)
            const res = await fetch(`${API_BASE}/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: response.credential, role })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || data?.error || 'Google sign-in failed')
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            updateUser(data.user)
            if (data.user?.role === 'superadmin') navigate('/admin')
            else navigate('/profile')
          } catch (e) {
            console.error(e)
            alert(e.message)
          } finally {
            setLoading(false)
          }
        }
      })
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: 320
        })
      }
      setReady(true)
      initialized = true
    }

    // Try initialize now and also attach a loader listener
    init()
    const t = setInterval(init, 300)
    return () => clearInterval(t)
  }, [role, navigate, updateUser])

  return (
    <div className="w-full">
      <div ref={buttonRef} className="flex w-full justify-center" />
      {!ready && (
        <button type="button" disabled className="mt-2 w-full cursor-not-allowed rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-500">
          Loading Google…
        </button>
      )}
      {loading && (
        <div className="mt-2 text-center text-sm text-gray-500">Connecting…</div>
      )}
    </div>
  )
}