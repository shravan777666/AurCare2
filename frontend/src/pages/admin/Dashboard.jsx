import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE = 'http://localhost:5000/api'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  const authFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(options.headers || {})
        }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      return data
    } catch (err) {
      // Surface network/CORS errors as friendly message
      throw new Error(err.message.includes('Failed to fetch') ? 'Network/CORS error. Check backend running and CORS.' : err.message)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsRes, pendingRes] = await Promise.all([
        authFetch(`${API_BASE}/admin/statistics`),
        authFetch(`${API_BASE}/admin/owners/pending`)
      ])
      setStats(statsRes.data)
      setPending(pendingRes.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApproval = async (ownerId, approve) => {
    // Optimistic UI: remove immediately on reject; on approve, refresh
    if (!approve) {
      setPending((prev) => prev.filter((o) => o._id !== ownerId))
    }
    try {
      const payload = approve ? { isApproved: true } : { isApproved: false, reason: 'Rejected by admin' }
      await authFetch(`${API_BASE}/admin/owners/${ownerId}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      await loadData()
    } catch (e) {
      // Rollback optimistic update if request failed
      if (!approve) {
        await loadData()
      }
      setError(e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>
  }

  if (!user || user.role !== 'superadmin') {
    return <div className="text-sm text-gray-600">Access denied.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm">Manage owners and view platform statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-lg bg-white shadow p-4">
          <div className="text-xs text-gray-500">Salons</div>
          <div className="text-2xl font-semibold">{stats?.totalSalons ?? '-'}</div>
        </div>
        <div className="rounded-lg bg-white shadow p-4">
          <div className="text-xs text-gray-500">Customers</div>
          <div className="text-2xl font-semibold">{stats?.totalCustomers ?? '-'}</div>
        </div>
        <div className="rounded-lg bg-white shadow p-4">
          <div className="text-xs text-gray-500">Appointments</div>
          <div className="text-2xl font-semibold">{stats?.totalAppointments ?? '-'}</div>
        </div>
        <div className="rounded-lg bg-white shadow p-4">
          <div className="text-xs text-gray-500">Pending Approvals</div>
          <div className="text-2xl font-semibold">{stats?.pendingApprovals ?? '-'}</div>
        </div>
      </div>

      {/* Pending Owners */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b p-4">
          <h2 className="font-semibold">Pending Salon Owners</h2>
        </div>
        <div className="divide-y">
          {pending.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No pending approvals</div>
          ) : (
            pending.map((o) => (
              <div key={o._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.name} • {o.salonName}</div>
                  <div className="text-xs text-gray-500">{o.email} • {o.contactNumber}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleApproval(o._id, true)} className="rounded bg-emerald-600 text-white px-3 py-1 text-sm hover:bg-emerald-700">Approve</button>
                  <button onClick={() => handleApproval(o._id, false)} className="rounded bg-red-600 text-white px-3 py-1 text-sm hover:bg-red-700">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}