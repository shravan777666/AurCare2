import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const navigate = useNavigate()

  // Read token and user from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const user = useMemo(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  if (!token) return null

  return (
    <main>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-sm text-gray-600">Your account details</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div>
            <div className="text-xs uppercase text-gray-500">Name</div>
            <div className="text-sm font-medium">{user?.name || '-'}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">Email</div>
            <div className="text-sm font-medium">{user?.email || '-'}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">Role</div>
            <div className="text-sm font-medium">{user?.role || '-'}</div>
          </div>
          {user?.isApproved !== undefined && (
            <div>
              <div className="text-xs uppercase text-gray-500">Approval Status</div>
              <div className="text-sm font-medium">{user.isApproved ? 'Approved' : 'Pending'}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Profile