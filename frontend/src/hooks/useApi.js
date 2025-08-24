import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

const API_BASE = 'http://localhost:5000/api'

export default function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('token')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(!(options.body instanceof FormData) && {
            'Content-Type': 'application/json'
          })
        },
        ...(options.body &&
          !(options.body instanceof FormData) && {
            body: JSON.stringify(options.body)
          })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      return data
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(
    (endpoint) =>
      request(endpoint, {
        method: 'GET'
      }),
    [request]
  )

  const post = useCallback(
    (endpoint, data) =>
      request(endpoint, {
        method: 'POST',
        body: data
      }),
    [request]
  )

  const put = useCallback(
    (endpoint, data) =>
      request(endpoint, {
        method: 'PUT',
        body: data
      }),
    [request]
  )

  const del = useCallback(
    (endpoint) =>
      request(endpoint, {
        method: 'DELETE'
      }),
    [request]
  )

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    del
  }
}