import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()   // pour savoir quelle page est active

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const estActif = (chemin) => location.pathname === chemin

  return (
    <nav>
      <h2>AdaLoveLace</h2>

      <ul>
        <li>
          <Link to="/projects" style={{ fontWeight: estActif('/projects') ? 'bold' : 'normal' }}>
            Projets
          </Link>
        </li>
        <li>
          <Link to="/tasks" style={{ fontWeight: estActif('/tasks') ? 'bold' : 'normal' }}>
            Tâches
          </Link>
        </li>
      </ul>

      <button onClick={handleLogout}>Déconnexion</button>
    </nav>
  )
}