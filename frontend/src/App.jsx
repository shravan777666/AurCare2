import { Link, Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">AuraCare</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/register" className="hover:text-indigo-600">Register</Link>
            <Link to="/login" className="hover:text-indigo-600">Login</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t bg-white mt-10">
        <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-gray-500">
          © {new Date().getFullYear()} AuraCare
        </div>
      </footer>
    </div>
  )
}

export default App
