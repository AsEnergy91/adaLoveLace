import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useProjetActif } from '../context/ProjetActifContext'
import MiniCalendrier from '../components/MiniCalendrier'

export default function Dashboard() {
  const { projetActif, setProjetActif } = useProjetActif()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [erreur, setErreur] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // Liste des projets (pour le sélecteur)
  useEffect(() => {
    api.getProjects().then(setProjects).catch((e) => setErreur(e.message))
  }, [])

  // Tâches du projet actif (rechargées quand il change)
  useEffect(() => {
    const params = projetActif === 'tous' ? '' : `?project_id=${projetActif}`
    api.getTasks(params).then(setTasks).catch((e) => setErreur(e.message))
  }, [projetActif])

  // --- Calculs dérivés des tâches ---
  const todo = tasks.filter((t) => t.status === 'todo').length
  const enCours = tasks.filter((t) => t.status === 'in_progress').length
  const faites = tasks.filter((t) => t.status === 'done').length
  const total = tasks.length
  const avancement = total === 0 ? 0 : Math.round((faites / total) * 100)

  // Tâches en retard : due_date passée ET pas encore terminée
  const aujourdhui = new Date().toISOString().slice(0, 10)
  const enRetard = tasks.filter(
    (t) => t.due_date && t.due_date < aujourdhui && t.status !== 'done'
  ).length

  // Le projet sélectionné (pour afficher sa deadline)
  const projet = projects.find((p) => p.id === projetActif)

  return (
    <div>
      <div className="dash-entete">
        <h1>Bonjour {user?.name ?? ''}</h1>
        <select value={projetActif} onChange={(e) => setProjetActif(e.target.value)}>
          <option value="tous">Tous les projets</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {erreur && <p className="erreur">{erreur}</p>}

      <div className="dash-grille">

        {/* Bloc STATS */}
        <section className="carte">
          <h2 className="carte-titre">Vue d'ensemble</h2>
          <div className="stats">
            <div className="stat"><div className="chiffre">{total}</div><div className="libelle">Tâches</div></div>
            <div className="stat"><div className="chiffre">{todo}</div><div className="libelle">À faire</div></div>
            <div className="stat"><div className="chiffre">{enCours}</div><div className="libelle">En cours</div></div>
            <div className="stat"><div className="chiffre">{faites}</div><div className="libelle">Terminées</div></div>
          </div>

          <div className="avancement">
            <div className="avancement-barre">
              <div className="avancement-rempli" style={{ width: `${avancement}%` }}></div>
            </div>
            <span className="avancement-txt">{avancement}% terminé</span>
          </div>

          <div className="dash-infos">
            {projet?.deadline && <span>Échéance : {projet.deadline}</span>}
            {enRetard > 0 && <span className="retard">{enRetard} tâche(s) en retard</span>}
          </div>
        </section>
                {/* Bloc LISTE DES TÂCHES */}
        <section className="carte">
          <h2 className="carte-titre">Tâches</h2>
          {tasks.length === 0 ? (
            <p className="vide">Aucune tâche pour cette sélection.</p>
          ) : (
            <ul className="liste">
              {tasks.slice(0, 8).map((t) => (
                <li key={t.id}>
                  <span>{t.title}</span>
                  <span className={`puce puce-${t.status}`}>
                    {t.status === 'todo' ? 'À faire'
                      : t.status === 'in_progress' ? 'En cours'
                      : 'Terminé'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
                {/* Bloc CALENDRIER */}
        <section className="carte">
          <h2 className="carte-titre">Calendrier</h2>
          <MiniCalendrier taches={tasks} />
        </section>
      </div>
    </div>
  )
}