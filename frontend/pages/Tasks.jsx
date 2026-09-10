import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useProjetActif } from '../context/ProjetActifContext'

export default function Tasks() {
  const { projetActif, setProjetActif } = useProjetActif()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  // Charger la liste des projets une fois (pour le sélecteur)
  useEffect(() => {
    api.getProjects().then(setProjects).catch((err) => setErreur(err.message))
  }, [])

  // Charger les tâches à chaque changement de projet actif
  useEffect(() => {
    setLoading(true)
    const params = projetActif === 'tous' ? '' : `?project_id=${projetActif}`
    api.getTasks(params)
      .then(setTasks)
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false))
  }, [projetActif])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title || projetActif === 'tous') return
    setErreur('')
    try {
      const nouvelle = await api.createTask({ title, project_id: projetActif })
      setTasks([nouvelle, ...tasks])
      setTitle('')
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <div>
      <h1>Tâches</h1>

      <div className="form">
        <select value={projetActif} onChange={(e) => setProjetActif(e.target.value)}>
          <option value="tous">Tous les projets</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {projetActif !== 'tous' && (
        <form className="form" onSubmit={handleCreate}>
          <input placeholder="Nouvelle tâche" value={title}
            onChange={(e) => setTitle(e.target.value)} />
          <button>Ajouter</button>
        </form>
      )}

      {erreur && <p className="erreur">{erreur}</p>}

      {loading ? (
        <p className="vide">Chargement…</p>
      ) : tasks.length === 0 ? (
        <p className="vide">Aucune tâche.</p>
      ) : (
        <div className="grille">
          {tasks.map((t) => (
            <div className="carte" key={t.id}>
              <h3>{t.title}</h3>
              <span className="badge">{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}