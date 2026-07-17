import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [title, setTitle]       = useState('')
  const [erreur, setErreur]     = useState('')

  // Au chargement de la page : on va chercher les projets
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
      setProjects([nouveau, ...projects])   // ajoute en haut de la liste
      setTitle('')                          // vide le champ
    } catch (err) {
      setErreur(err.message)
    }
  }

  if (loading) return <p>Chargement…</p>

  return (
    <div>
      <h1>Mes projets</h1>

      <form className="form" onSubmit={handleCreate}>
        <label htmlFor="titre-projet" className="sr-only">Nom du projet</label>
        <input
          id="titre-projet"
          placeholder="Nom du projet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
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
              <span className="badge">{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}