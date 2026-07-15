import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [title, setTitle]       = useState('')

  // Au chargement de la page : on va chercher les projets
  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title) return
    const nouveau = await api.createProject({ title })
    setProjects([nouveau, ...projects])   // ajoute en haut de la liste
    setTitle('')                            // vide le champ
  }

  if (loading) return <p>Chargement…</p>

  return (
    <div>
      <h1>Mes projets</h1>

      <form onSubmit={handleCreate}>
        <input placeholder="Nom du projet"
          value={title} onChange={(e) => setTitle(e.target.value)} />
        <button>Créer</button>
      </form>

      {projects.length === 0
        ? <p>Aucun projet. Créez-en un !</p>
        : projects.map((p) => (
            <div key={p.id}>
              <h3>{p.title}</h3>
              <span>{p.status}</span>
            </div>
          ))
      }
    </div>
  )
}