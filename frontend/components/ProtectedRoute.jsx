import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

export default function ProtectedRoute() {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />

  return (
    <div className="layout">
      <a href="#principal" className="skip">Aller au contenu</a>
      <Sidebar />
      <main id="principal" className="contenu">
        <Outlet />
      </main>
    </div>
  )
}