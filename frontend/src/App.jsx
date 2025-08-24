import { Outlet, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function Navigation() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                AuraCare
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center border-b-2 ${isActive('/') ? 'border-indigo-500' : 'border-transparent'} px-1 pt-1 text-sm font-medium ${isActive('/')}`}
              >
                Home
              </Link>

              <Link
                to="/about"
                className={`inline-flex items-center border-b-2 ${isActive('/about') ? 'border-indigo-500' : 'border-transparent'} px-1 pt-1 text-sm font-medium ${isActive('/about')}`}
              >
                About
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/profile')}`}
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/login')}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center">
          <div className="px-5 py-2">
            <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
              About
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900">
              Privacy Policy
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/terms" className="text-base text-gray-500 hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
        </nav>
        <p className="mt-8 text-center text-base text-gray-400">
          © {new Date().getFullYear()} AuraCare. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  )
}

export default App
