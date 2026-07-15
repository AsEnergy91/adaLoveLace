import { Routes, Route, Navigate } from 'react-router-dom'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Projects  from './pages/Projects'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages protégées */}
      <Route element={<ProtectedRoute />}>
        <Route path="/projects" element={<Projects />} />
      </Route>

      {/* Tout le reste renvoie au login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}