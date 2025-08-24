import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE = 'http://localhost:5000/api'

export default function Invitations() {
  const { user } = useAuth()
  const token = useMemo(() => localStorage.getItem('token'), [])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/staff/my/invites`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        if (res.ok) setInvites(json.data)
      } finally { setLoading(false) }
    }
    if (user?.role === 'staff') load()
  }, [user, token])

  const respond = async (id, action) => {
    const res = await fetch(`${API_BASE}/staff/invites/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action })
    })
    const j = await res.json()
    if (res.ok) setInvites((arr) => arr.map((i) => (i._id === id ? { ...i, status: action === 'accept' ? 'accepted' : 'declined' } : i)))
    else alert(j?.message || 'Failed')
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">My Invitations</h1>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl border bg-white" />)}
        </div>
      ) : invites.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center text-gray-600">No invitations yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {invites.map((inv) => (
            <div key={inv._id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-sm text-gray-500">Salon</div>
              <div className="text-base font-semibold">{inv.salon?.name}</div>
              <div className="text-sm text-gray-500">From</div>
              <div className="text-sm">{inv.owner?.name || inv.owner?.email}</div>
              <div className="mt-2 text-xs text-gray-500">Status: {inv.status}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => respond(inv._id, 'accept')} disabled={inv.status !== 'sent'} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Accept</button>
                <button onClick={() => respond(inv._id, 'decline')} disabled={inv.status !== 'sent'} className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800 disabled:opacity-50">Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}