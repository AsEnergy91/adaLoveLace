import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const estActif = (chemin) => location.pathname === chemin

  return (
    <nav className="sidebar">
      <Link to="/projects" className={estActif('/projects') ? 'actif' : ''}>
        Projets
      </Link>
      <Link to="/tasks" className={estActif('/tasks') ? 'actif' : ''}>
        Tâches
      </Link>
      <button className="logout" onClick={handleLogout}>Sortir</button>
    </nav>
  )
}