import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import GoogleAuthButton from '../../components/GoogleAuthButton'

// Hardcode backend URL to avoid proxy/env issues
const API_BASE = 'http://localhost:5000/api'

const StaffRegister = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
  const [certifications, setCertifications] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const validatePassword = (password) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    )
  }

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

  const handleCertificationUpload = (e) => {
    const files = Array.from(e.target.files)
    setCertifications([...certifications, ...files])
  }

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          toast.error('Please fill in all required fields')
          return false
        }
        if (!validatePassword(formData.password)) {
          toast.error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        return true

      case 2:
        if (!formData.contactNumber || !formData.specialization || !formData.experience) {
          toast.error('Please fill in all required fields')
          return false
        }
        if (!/^\d{10}$/.test(formData.contactNumber)) {
          toast.error('Please enter a valid 10-digit contact number')
          return false
        }
        return true

      case 3:
        if (!profileImage) {
          toast.error('Please upload a profile image')
          return false
        }
        if (certifications.length === 0) {
          toast.error('Please upload at least one certification')
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(step)) return

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

      formDataToSend.append('profileImage', profileImage)
      certifications.forEach((cert) => {
        formDataToSend.append('certifications', cert)
      })

      const response = await fetch(`${API_BASE}/auth/register-staff`, {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Registration failed')
      }

      toast.success('Registration successful!')
      navigate('/profile')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Confirm Password *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Contact Number *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="10 digits"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Specialization *</label>
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
              <label className="text-sm font-medium">Years of Experience *</label>
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
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Profile Image *</label>
              <input
                className="block w-full rounded-lg border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files?.[0])}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Certifications *</label>
              <input
                className="block w-full rounded-lg border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleCertificationUpload}
                required
              />
              {certifications.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Selected files:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {certifications.map((cert, index) => (
                      <li key={index}>{cert.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Register as Staff</h2>
        <p className="text-sm text-gray-600">Join our team of professionals</p>
      </div>

      <div className="mb-6">
        <GoogleAuthButton role="staff" label="Sign up with Google" />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex-1 ${stepNumber < 3 ? 'border-t-2' : ''} ${step >= stepNumber ? 'border-indigo-600' : 'border-gray-200'}`}
            >
              <div
                className={`-mt-2 flex items-center justify-center ${step >= stepNumber ? 'text-indigo-600' : 'text-gray-400'}`}
              >
                <div
                  className={`rounded-full ${step >= stepNumber ? 'bg-indigo-600' : 'bg-gray-200'} h-4 w-4 flex items-center justify-center text-xs text-white`}
                >
                  {stepNumber}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        {renderStep()}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Complete Registration'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default StaffRegister