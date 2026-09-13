import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useProjetActif } from '../context/ProjetActifContext'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre']

export default function Calendrier() {
  const { projetActif, setProjetActif } = useProjetActif()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [curseur, setCurseur] = useState(() => {
    const d = new Date()
    return { annee: d.getFullYear(), mois: d.getMonth() }
  })

  const { annee, mois } = curseur

  useEffect(() => {
    api.getProjects().then(setProjects).catch(() => {})
  }, [])

  useEffect(() => {
    const params = projetActif === 'tous' ? '' : `?project_id=${projetActif}`
    api.getTasks(params).then(setTasks).catch(() => {})
  }, [projetActif])

  // --- logique de dates (identique au MiniCalendrier) ---
  const premierJour = new Date(annee, mois, 1)
  const nbJours = new Date(annee, mois + 1, 0).getDate()
  let decalage = premierJour.getDay() - 1
  if (decalage < 0) decalage = 6

  // regrouper les tâches par jour (liste, pas juste le compte)
  const parJour = {}
  for (const t of tasks) {
    if (t.due_date) {
      const j = t.due_date.slice(0, 10)
      if (!parJour[j]) parJour[j] = []
      parJour[j].push(t)
    }
  }

  const cases = []
  for (let i = 0; i < decalage; i++) cases.push(null)
  for (let j = 1; j <= nbJours; j++) cases.push(j)

  const cleJour = (j) => `${annee}-${String(mois + 1).padStart(2, '0')}-${String(j).padStart(2, '0')}`

  const moisPrecedent = () =>
    setCurseur(({ annee, mois }) => mois === 0 ? { annee: annee - 1, mois: 11 } : { annee, mois: mois - 1 })
  const moisSuivant = () =>
    setCurseur(({ annee, mois }) => mois === 11 ? { annee: annee + 1, mois: 0 } : { annee, mois: mois + 1 })

  return (
    <div>
      <div className="dash-entete">
        <h1>Calendrier</h1>
        <select value={projetActif} onChange={(e) => setProjetActif(e.target.value)}>
          <option value="tous">Tous les projets</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="cal-entete-grande">
        <button onClick={moisPrecedent} aria-label="Mois précédent">‹</button>
        <h2>{MOIS[mois]} {annee}</h2>
        <button onClick={moisSuivant} aria-label="Mois suivant">›</button>
      </div>

      <div className="cal-grande">
        {JOURS.map((j) => <div key={j} className="cal-grande-jour-nom">{j}</div>)}
        {cases.map((j, i) => {
          if (j === null) return <div key={`v${i}`} className="cal-grande-case vide"></div>
          const taches = parJour[cleJour(j)] || []
          return (
            <div key={`d${j}`} className="cal-grande-case">
              <div className="cal-grande-num">{j}</div>
              {taches.map((t) => (
                <div key={t.id} className={`cal-tache cal-tache-${t.status}`} title={t.title}>
                  {t.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}