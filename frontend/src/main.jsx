import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Layout
import App from './App.jsx'

// Pages
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import ProfileEdit from './pages/ProfileEdit.jsx'

// Feature Detail Pages
import Bookings from './pages/features/Bookings.jsx'
import Staff from './pages/features/Staff.jsx'
import Customer from './pages/features/Customer.jsx'
import Insights from './pages/features/Insights.jsx'

// Auth Pages
import Register from './pages/Register.jsx'
import StaffRegister from './pages/auth/StaffRegister.jsx'
import CustomerRegister from './pages/auth/CustomerRegister.jsx'
import RoleSelect from './components/RoleSelect.jsx'

// Admin
import AdminDashboard from './pages/admin/Dashboard.jsx'

// Owner/staff pages
import StaffDirectory from './pages/owner/StaffDirectory.jsx'
import OwnerInvites from './pages/owner/Invites.jsx'
import StaffInvitations from './pages/staff/Invitations.jsx'

// Components
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      {
        path: 'register',
        children: [
          { index: true, element: <RoleSelect /> },
          { path: 'salon', element: <Register /> },
          { path: 'staff', element: <StaffRegister /> },
          { path: 'customer', element: <CustomerRegister /> }
        ]
      },
      { path: 'login', element: <Login /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile/edit',
        element: (
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={["superadmin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      // Owner dashboard sections
      {
        path: 'owner/staff-directory',
        element: (
          <ProtectedRoute roles={["salonowner","superadmin"]}>
            <StaffDirectory />
          </ProtectedRoute>
        )
      },
      {
        path: 'owner/invites',
        element: (
          <ProtectedRoute roles={["salonowner","superadmin"]}>
            <OwnerInvites />
          </ProtectedRoute>
        )
      },
      // Staff pages
      {
        path: 'staff/invitations',
        element: (
          <ProtectedRoute roles={["staff"]}>
            <StaffInvitations />
          </ProtectedRoute>
        )
      },

      // Feature Details
      { path: 'features/bookings', element: <Bookings /> },
      { path: 'features/staff', element: <Staff /> },
      { path: 'features/customer', element: <Customer /> },
      { path: 'features/insights', element: <Insights /> },

      // Static Pages
      { path: 'about', element: <div className="text-center py-8">About Page (Coming Soon)</div> },
      { path: 'privacy', element: <div className="text-center py-8">Privacy Policy (Coming Soon)</div> },
      { path: 'terms', element: <div className="text-center py-8">Terms of Service (Coming Soon)</div> },
      // Error Pages
      {
        path: 'unauthorized',
        element: (
          <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        )
      },
      {
        path: '*',
        element: (
          <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
            <p className="text-gray-600">The page you're looking for doesn't exist.</p>
          </div>
        )
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
