import { useState } from 'react'

const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre']

export default function MiniCalendrier({ taches = [] }) {
  // mois affiché : on part du mois courant
  const [curseur, setCurseur] = useState(() => {
    const d = new Date()
    return { annee: d.getFullYear(), mois: d.getMonth() } // mois : 0-11
  })
  const [jourSelectionne, setJourSelectionne] = useState(null)

  const { annee, mois } = curseur

  // 1er jour du mois, et nombre de jours dans le mois
  const premierJour = new Date(annee, mois, 1)
  const nbJours = new Date(annee, mois + 1, 0).getDate()

  // décalage : quel jour de semaine est le 1er ? (on veut Lundi=0)
  let decalage = premierJour.getDay() - 1   // getDay: 0=Dimanche
  if (decalage < 0) decalage = 6            // dimanche repasse en fin

  // regrouper les tâches par date (AAAA-MM-JJ) -> nombre
  const parDate = {}
  for (const t of taches) {
    if (t.due_date) {
      const jour = t.due_date.slice(0, 10)
      parDate[jour] = (parDate[jour] || 0) + 1
    }
  }

  // construire les cases : d'abord les vides (décalage), puis les jours
  const cases = []
  for (let i = 0; i < decalage; i++) cases.push(null)
  for (let j = 1; j <= nbJours; j++) cases.push(j)

  const moisPrecedent = () =>
    setCurseur(({ annee, mois }) => mois === 0 ? { annee: annee - 1, mois: 11 } : { annee, mois: mois - 1 })
  const moisSuivant = () =>
    setCurseur(({ annee, mois }) => mois === 11 ? { annee: annee + 1, mois: 0 } : { annee, mois: mois + 1 })

  // format d'une date en AAAA-MM-JJ pour comparer avec parDate
  const cleJour = (j) => {
    const m = String(mois + 1).padStart(2, '0')
    const jj = String(j).padStart(2, '0')
    return `${annee}-${m}-${jj}`
  }

  // tâches du jour sélectionné
  const tachesDuJour = jourSelectionne
    ? taches.filter((t) => t.due_date?.slice(0, 10) === jourSelectionne)
    : []

  return (
    <div className="cal">
      <div className="cal-entete">
        <button onClick={moisPrecedent} aria-label="Mois précédent">‹</button>
        <span>{MOIS[mois]} {annee}</span>
        <button onClick={moisSuivant} aria-label="Mois suivant">›</button>
      </div>

      <div className="cal-grille">
        {JOURS.map((j, i) => <div key={`j${i}`} className="cal-jour-nom">{j}</div>)}
        {cases.map((j, i) => {
          if (j === null) return <div key={`v${i}`} className="cal-case vide"></div>
          const cle = cleJour(j)
          const nb = parDate[cle] || 0
          const estSelectionne = jourSelectionne === cle
          return (
            <button
              key={`d${j}`}
              className={`cal-case ${estSelectionne ? 'cal-selectionne' : ''}`}
              onClick={() => setJourSelectionne(estSelectionne ? null : cle)}
            >
              {j}
              {nb > 0 && <span className="cal-point" title={`${nb} tâche(s)`}></span>}
            </button>
          )
        })}
      </div>

      {jourSelectionne && (
        <div className="cal-detail">
          <div className="cal-detail-titre">Tâches du {jourSelectionne}</div>
          {tachesDuJour.length === 0 ? (
            <p className="vide">Aucune tâche ce jour.</p>
          ) : (
            <ul className="liste">
              {tachesDuJour.map((t) => (
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
        </div>
      )}
    </div>
  )
}