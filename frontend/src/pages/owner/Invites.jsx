import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE = 'http://localhost:5000/api'

export default function Invites() {
  const { user } = useAuth()
  const token = useMemo(() => localStorage.getItem('token'), [])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/staff/invites`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        if (res.ok) setInvites(json.data)
      } finally { setLoading(false) }
    }
    if (user?.role === 'salonowner') load()
  }, [user, token])

  const approve = async (id) => {
    const res = await fetch(`${API_BASE}/staff/invites/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const j = await res.json()
    if (res.ok) setInvites((arr) => arr.map((i) => (i._id === id ? { ...i, status: 'approved' } : i)))
    else alert(j?.message || 'Failed')
  }

  const revoke = async (id) => {
    const res = await fetch(`${API_BASE}/staff/invites/${id}/revoke`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const j = await res.json()
    if (res.ok) setInvites((arr) => arr.map((i) => (i._id === id ? { ...i, status: 'revoked' } : i)))
    else alert(j?.message || 'Failed')
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Invitations</h1>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl border bg-white" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invites.map((inv) => (
            <div key={inv._id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-sm text-gray-500">{inv.salon?.name}</div>
              <div className="text-base font-semibold">{inv.staff?.name || inv.staff?.email}</div>
              <div className="text-xs text-gray-500">Status: {inv.status}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => approve(inv._id)} disabled={inv.status !== 'accepted'} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Approve</button>
                <button onClick={() => revoke(inv._id)} disabled={!['sent','accepted'].includes(inv.status)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800 disabled:opacity-50">Revoke</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}