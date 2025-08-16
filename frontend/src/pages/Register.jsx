import { useState } from 'react'

// Hardcode backend URL to avoid proxy/env issues
const API_BASE = 'http://localhost:5000/api'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    salonName: '',
    contactNumber: '',
    description: ''
  })
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: ''
  })
  const [logoFile, setLogoFile] = useState(null)
  const [licenseFile, setLicenseFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onAddressChange = (e) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!logoFile || !licenseFile) {
      setResult({ type: 'error', message: 'Logo and license files are required.' })
      return
    }
    setSubmitting(true)
    setResult(null)
    try {
      const body = new FormData()
      Object.entries(formData).forEach(([key, value]) => body.append(key, value))
      body.append('address', JSON.stringify(address))
      body.append('logo', logoFile)
      body.append('license', licenseFile)

      const response = await fetch(`${API_BASE}/auth/register-salon-owner`, {
        method: 'POST',
        body
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Registration failed')
      }
      setResult({ type: 'success', message: data?.message || 'Registered successfully' })
    } catch (err) {
      setResult({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Register as Salon Owner</h2>
          <p className="text-sm text-gray-600">Provide your details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="name" value={formData.name} onChange={onChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" type="email" name="email" value={formData.email} onChange={onChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" type="password" name="password" value={formData.password} onChange={onChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Salon Name</label>
              <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="salonName" value={formData.salonName} onChange={onChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Contact Number</label>
              <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="contactNumber" value={formData.contactNumber} onChange={onChange} placeholder="10 digits" required />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="description" value={formData.description} onChange={onChange} rows={3} />
            </div>
          </div>

          <fieldset className="rounded-lg border p-4">
            <legend className="px-1 text-sm font-semibold">Address</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">House Name</label>
                <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="houseName" value={address.houseName || ''} onChange={onAddressChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Street</label>
                <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="street" value={address.street} onChange={onAddressChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">City</label>
                <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="city" value={address.city} onChange={onAddressChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Postal Code</label>
                <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="postalCode" value={address.postalCode} onChange={onAddressChange} />
              </div>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Logo (PNG/JPG up to 2MB)</label>
              <input className="block w-full rounded-lg border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100" type="file" accept="image/png,image/jpeg" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">License (PDF up to 5MB)</label>
              <input className="block w-full rounded-lg border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100" type="file" accept="application/pdf" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} required />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>

          {result && (
            <div className={result.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-emerald-600'}>{result.message}</div>
          )}
        </form>
      </div>
    </main>
  )
}

export default Register



