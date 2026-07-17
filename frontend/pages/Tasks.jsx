import { useState, useEffect } from 'react'
import { api } from '../services/api'

const STATUTS = ['todo', 'in_progress', 'done']

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  // On charge les tâches ET les projets (besoin de la liste pour le menu déroulant)
  useEffect(() => {
    Promise.all([api.getTasks(), api.getProjects()])
      .then(([t, p]) => {
        setTasks(t)
        setProjects(p)
        if (p.length > 0) setProjectId(p[0].id)   // pré-sélectionne le premier
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title || !projectId) return
    setErreur('')
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      const nouvelle = await api.createTask({
        title,
        project_id: projectId,
        assigned_to: user?.id    // on se l'assigne pour la voir dans la liste
      })
      setTasks([nouvelle, ...tasks])
      setTitle('')
    } catch (err) {
      setErreur(err.message)
    }
  }

  const changerStatut = async (tache, statut) => {
    try {
      const maj = await api.updateTask(tache.id, { status: statut })
      setTasks(tasks.map((t) => (t.id === maj.id ? maj : t)))
    } catch (err) {
      setErreur(err.message)
    }
  }

  const supprimer = async (id) => {
    try {
      await api.deleteTask(id)
      setTasks(tasks.filter((t) => t.id !== id))
    } catch (err) {
      setErreur(err.message)
    }
  }

if (loading) return <p className="vide">Chargement…</p>

  return (
    <div>
      <h1>Mes tâches</h1>

      {projects.length === 0 ? (
        <p className="vide">Crée d'abord un projet pour pouvoir ajouter des tâches.</p>
      ) : (
        <form className="form" onSubmit={handleCreate}>
          <label htmlFor="titre-tache" className="sr-only">Nouvelle tâche</label>
          <input
            id="titre-tache"
            placeholder="Nouvelle tâche"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor="projet-tache" className="sr-only">Projet</label>
          <select
            id="projet-tache"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button>Ajouter</button>
        </form>
      )}

      {erreur && <p className="erreur">{erreur}</p>}

      {tasks.length === 0 ? (
        <p className="vide">Aucune tâche.</p>
      ) : (
        <div className="grille">
          {tasks.map((t) => (
            <div className="carte" key={t.id}>
              <h3>{t.title}</h3>
              <label htmlFor={`statut-${t.id}`} className="sr-only">Statut</label>
              <select
                id={`statut-${t.id}`}
                value={t.status}
                onChange={(e) => changerStatut(t, e.target.value)}
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button onClick={() => supprimer(t.id)}>Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}