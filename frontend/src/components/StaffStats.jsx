import { useState, useEffect } from 'react'
import useApi from '../hooks/useApi'
import LoadingSpinner from './LoadingSpinner'

export default function StaffStats({ userId }) {
  const [stats, setStats] = useState(null)
  const { get, loading, error } = useApi()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await get(`/staff/stats/${userId}`)
        setStats(response.data)
      } catch (err) {
        console.error('Error fetching staff stats:', err)
      }
    }

    if (userId) {
      fetchStats()
    }
  }, [userId, get])

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <LoadingSpinner size="small" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
        Error loading staff statistics: {error}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: (
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
    },
    {
      title: 'Completed',
      value: stats.completedAppointments,
      icon: (
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    {
      title: 'Upcoming',
      value: stats.upcomingAppointments,
      icon: (
        <svg
          className="h-6 w-6 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    {
      title: 'Satisfaction Rate',
      value: `${stats.satisfactionRate}%`,
      icon: (
        <svg
          className="h-6 w-6 text-purple-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      )
    }
  ]

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="flex flex-col items-center space-y-2 rounded-lg border p-4 text-center"
          >
            <div className="rounded-full bg-gray-50 p-2">{stat.icon}</div>
            <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.title}</div>
          </div>
        ))}
      </div>

      {stats.recentReviews && stats.recentReviews.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-4 text-md font-medium text-gray-900">Recent Reviews</h4>
          <div className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div
                key={review._id}
                className="rounded-lg border bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}