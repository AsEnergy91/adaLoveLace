import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Link } from 'react-router-dom'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [erreur, setErreur] = useState('')
  const [codeRejoindre, setCodeRejoindre] = useState('')

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title) return
    setErreur('')
    try {
      const nouveau = await api.createProject({ title })
      setProjects([nouveau, ...projects])
      setTitle('')
    } catch (err) {
      setErreur(err.message)
    }
  }

  const handleJoin = async (e) => {
  e.preventDefault()
  if (!codeRejoindre) return
  setErreur('')
  try {
    const res = await api.joinProject(codeRejoindre)
    setProjects([res.projet, ...projects])   // ajoute le projet rejoint à la liste
    setCodeRejoindre('')
  } catch (err) {
    setErreur(err.message)
  }
}

  if (loading) return <p className="vide">Chargement…</p>

  return (
    <div>
      <h1>Mes projets</h1>

      <form className="form" onSubmit={handleCreate}>
        <input placeholder="Nom du projet" value={title}
          onChange={(e) => setTitle(e.target.value)} />
        <button>Créer</button>
      </form>

      <form className="form" onSubmit={handleJoin}>
        <input placeholder="Code d'invitation" value={codeRejoindre}
          onChange={(e) => setCodeRejoindre(e.target.value)} />
        <button>Rejoindre</button>
      </form>

      {erreur && <p className="erreur">{erreur}</p>}

      {projects.length === 0 ? (
        <p className="vide">Aucun projet. Créez-en un !</p>
      ) : (
        <div className="grille">
          {projects.map((p) => (
            <Link to={`/projects/${p.id}`} className="carte carte-lien" key={p.id}>
              <h3>{p.title}</h3>
              <span className="badge">{p.role}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}