import { useEffect, useRef, useCallback } from 'react'
import useActivityHistory from '../hooks/useActivityHistory.jsx'
import LoadingSpinner from './LoadingSpinner'

export default function ActivityHistory({ userId }) {
  const {
    activities,
    loading,
    error,
    hasMore,
    loadMore,
    formatActivityTime,
    getActivityIcon
  } = useActivityHistory(userId)

  const observer = useRef()
  const lastActivityRef = useCallback(
    (node) => {
      if (loading) return

      if (observer.current) {
        observer.current.disconnect()
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })

      if (node) {
        observer.current.observe(node)
      }
    },
    [loading, hasMore, loadMore]
  )

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
        Error loading activity history: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>

      <div className="divide-y">
        {activities.map((activity, index) => (
          <div
            key={activity._id}
            ref={index === activities.length - 1 ? lastActivityRef : null}
            className="flex items-start space-x-3 py-4"
          >
            <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>

            <div className="flex-1 space-y-1">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {formatActivityTime(activity.timestamp)}
              </p>
            </div>

            {activity.metadata && (
              <div className="flex-shrink-0 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-500">
                {activity.metadata.status || activity.metadata.type}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="py-4">
            <LoadingSpinner size="small" />
          </div>
        )}

        {!loading && activities.length === 0 && (
          <div className="py-4 text-center text-sm text-gray-500">
            No activity history found
          </div>
        )}
      </div>
    </div>
  )
}