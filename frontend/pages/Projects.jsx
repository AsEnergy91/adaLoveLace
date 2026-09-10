import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [erreur, setErreur] = useState('')

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

  if (loading) return <p className="vide">Chargement…</p>

  return (
    <div>
      <h1>Mes projets</h1>

      <form className="form" onSubmit={handleCreate}>
        <input placeholder="Nom du projet" value={title}
          onChange={(e) => setTitle(e.target.value)} />
        <button>Créer</button>
      </form>

      {erreur && <p className="erreur">{erreur}</p>}

      {projects.length === 0 ? (
        <p className="vide">Aucun projet. Créez-en un !</p>
      ) : (
        <div className="grille">
          {projects.map((p) => (
            <div className="carte" key={p.id}>
              <h3>{p.title}</h3>
              <span className="badge">{p.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}