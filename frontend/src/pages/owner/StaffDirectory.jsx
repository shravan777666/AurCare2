import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE = 'http://localhost:5000/api'

export default function StaffDirectory() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ items: [], loading: true, page: 1, pages: 1 })
  const [sending, setSending] = useState({})
  const [salons, setSalons] = useState([])
  const [salonId, setSalonId] = useState('')

  const token = useMemo(() => localStorage.getItem('token'), [])

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await fetch(`${API_BASE}/salons?owner=me`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        if (res.ok) {
          setSalons(json.data || [])
          if ((json.data || []).length && !salonId) setSalonId(json.data[0]._id)
        }
      } catch {}
    }
    if (user?.role === 'salonowner') fetchSalons()
  }, [user, token])

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setData((d) => ({ ...d, loading: true }))
      const res = await fetch(`${API_BASE}/staff/directory?q=${encodeURIComponent(query)}&page=${data.page}`, {
        headers: { Authorization: `Bearer ${token}` }, signal: controller.signal
      })
      const json = await res.json()
      if (res.ok) setData({ items: json.data, loading: false, page: json.pagination.page, pages: json.pagination.pages })
      else setData((d) => ({ ...d, loading: false }))
    }
    if (user?.role === 'salonowner') load()
    return () => controller.abort()
  }, [user, query, token])

  const sendInvite = async (staffId) => {
    if (!salonId) { alert('Select a salon'); return }
    setSending((s) => ({ ...s, [staffId]: true }))
    try {
      const res = await fetch(`${API_BASE}/staff/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ salonId, staffId })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Failed to send invite')
      alert('Invitation sent')
    } catch (e) {
      alert(e.message)
    } finally {
      setSending((s) => ({ ...s, [staffId]: false }))
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff Directory</h1>
          <p className="text-sm text-gray-600">Browse staff registered on AuraCare and invite them to your salon.</p>
        </div>
        <div className="flex gap-3">
          <select className="rounded-md border px-3 py-2 text-sm" value={salonId} onChange={(e) => setSalonId(e.target.value)}>
            <option value="">Select salon</option>
            {salons.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
          </select>
        </div>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.loading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border bg-white" />
        )) : data.items.map((u) => (
          <div key={u._id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm text-gray-500">{u.email}</div>
            <div className="text-base font-semibold">{u.name || 'Unnamed'}</div>
            <button onClick={() => sendInvite(u._id)} disabled={sending[u._id]} className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              {sending[u._id] ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        ))}
      </section>
    </main>
  )
}