import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const API_BASE = 'http://localhost:5000/api'

function ProfileEdit() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    specialization: '',
    experience: '',
    availability: {
      monday: { isAvailable: false, start: '09:00', end: '17:00' },
      tuesday: { isAvailable: false, start: '09:00', end: '17:00' },
      wednesday: { isAvailable: false, start: '09:00', end: '17:00' },
      thursday: { isAvailable: false, start: '09:00', end: '17:00' },
      friday: { isAvailable: false, start: '09:00', end: '17:00' },
      saturday: { isAvailable: false, start: '09:00', end: '17:00' },
      sunday: { isAvailable: false, start: '09:00', end: '17:00' }
    }
  })
  const [profileImage, setProfileImage] = useState(null)

  // Read token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setProfile(data.data)
        setFormData({
          name: data.data.name || '',
          contactNumber: data.data.contactNumber || '',
          specialization: data.data.specialization || '',
          experience: data.data.experience || '',
          availability: data.data.availability || {
            monday: { isAvailable: false, start: '09:00', end: '17:00' },
            tuesday: { isAvailable: false, start: '09:00', end: '17:00' },
            wednesday: { isAvailable: false, start: '09:00', end: '17:00' },
            thursday: { isAvailable: false, start: '09:00', end: '17:00' },
            friday: { isAvailable: false, start: '09:00', end: '17:00' },
            saturday: { isAvailable: false, start: '09:00', end: '17:00' },
            sunday: { isAvailable: false, start: '09:00', end: '17:00' }
          }
        })
      } catch (error) {
        toast.error('Error loading profile')
        console.error('Profile fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvailabilityChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'availability') {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          formDataToSend.append(key, value)
        }
      })

      if (profileImage) {
        formDataToSend.append('profileImage', profileImage)
      }

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast.success('Profile updated successfully')
      navigate('/profile')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) return null
  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
          <p className="text-sm text-gray-600">Update your personal information</p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Contact Number</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="10 digits"
              required
            />
          </div>

          {profile?.role === 'staff' && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">Specialization</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Hair Stylist, Makeup Artist"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Years of Experience</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                {Object.entries(formData.availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center gap-4 py-2 border-b last:border-0">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={schedule.isAvailable}
                        onChange={(e) => handleAvailabilityChange(day, 'isAvailable', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm capitalize">{day}</span>
                    </label>
                    {schedule.isAvailable && (
                      <div className="flex items-center gap-2 ml-4">
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                          className="rounded border-gray-300 text-sm"
                        />
                        <span className="text-sm">to</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                          className="rounded border-gray-300 text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Profile Image</label>
            <input
              className="block w-full rounded-lg border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileEdit