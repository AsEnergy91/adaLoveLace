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
      <div className="sidebar-marque">LoveLace</div>

      <Link to="/" className={estActif('/') ? 'actif' : ''}>Accueil</Link>
      <Link to="/projects" className={estActif('/projects') ? 'actif' : ''}>Projets</Link>
      <Link to="/tasks" className={estActif('/tasks') ? 'actif' : ''}>Tâches</Link>
      <Link to="/calendrier" className={estActif('/calendrier') ? 'actif' : ''}>Calendrier</Link>

      <Link
        to="/parametres"
        className={`sidebar-parametres ${estActif('/parametres') ? 'actif' : ''}`}
      >
        Paramètres
      </Link>
      <button className="logout" onClick={handleLogout}>Sortir</button>
    </nav>
  )
}