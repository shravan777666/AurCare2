import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ActivityHistory from '../components/ActivityHistory'
import StaffStats from '../components/StaffStats'
import Button from '../components/Button'

export default function Profile() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Profile
          </h1>
          <p className="text-sm text-gray-500">Manage your account settings</p>
        </div>
        <Link to="/profile/edit">
          <Button variant="secondary">Edit Profile</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center space-x-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-medium text-gray-600">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="pt-4">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 capitalize text-gray-900">{user.role}</dd>
                </div>

                <div>
                  <dt className="font-medium text-gray-500">Contact Number</dt>
                  <dd className="mt-1 text-gray-900">
                    {user.contactNumber || 'Not provided'}
                  </dd>
                </div>

                {user.role === 'staff' && (
                  <>
                    <div>
                      <dt className="font-medium text-gray-500">Specialization</dt>
                      <dd className="mt-1 text-gray-900">
                        {user.specialization || 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-medium text-gray-500">
                        Years of Experience
                      </dt>
                      <dd className="mt-1 text-gray-900">
                        {user.experience ? `${user.experience} years` : 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-medium text-gray-500">Availability</dt>
                      <dd className="mt-2 space-y-2">
                        {user.availability ? (
                          Object.entries(user.availability).map(
                            ([day, schedule]) =>
                              schedule.isAvailable && (
                                <div
                                  key={day}
                                  className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                                >
                                  <span className="capitalize">{day}</span>
                                  <span className="text-gray-600">
                                    {schedule.start} - {schedule.end}
                                  </span>
                                </div>
                              )
                          )
                        ) : (
                          <p className="text-gray-500">No availability set</p>
                        )}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Activity History and Stats */}
        <div className="space-y-6 lg:col-span-2">
          {user.role === 'staff' && <StaffStats userId={user._id} />}
          <ActivityHistory userId={user._id} />
        </div>
      </div>
    </div>
  )
}