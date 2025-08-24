import { Link } from 'react-router-dom'

const RoleSelect = () => {
  const roles = [
    {
      title: 'Salon Owner',
      description: 'Register your salon and manage your business',
      path: '/register/salon',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: 'Staff Member',
      description: 'Join as a professional service provider',
      path: '/register/staff',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      title: 'Customer',
      description: 'Create a customer account to book services',
      path: '/register/customer',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.866 0-7 2.239-7 5v2h14v-2c0-2.761-3.134-5-7-5z" />
        </svg>
      )
    }
  ]

  return (
    <main>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Choose Registration Type</h2>
          <p className="text-sm text-gray-600">Select how you want to join AuraCare</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <Link
              key={role.title}
              to={role.path}
              className="flex flex-col items-center rounded-xl border bg-white p-6 text-center shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 rounded-full bg-indigo-50 p-3 text-indigo-600">
                {role.icon}
              </div>
              <h3 className="mb-2 font-semibold">{role.title}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

export default RoleSelect