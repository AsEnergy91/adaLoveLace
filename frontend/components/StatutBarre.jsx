// Ordre des statuts, du premier au dernier
const ETAPES = [
  { cle: 'todo', label: 'À faire' },
  { cle: 'in_progress', label: 'En cours' },
  { cle: 'done', label: 'Terminé' },
]

export default function StatutBarre({ statut, onChange }) {
  // index de l'étape actuelle (0, 1 ou 2)
  const indexActuel = ETAPES.findIndex((e) => e.cle === statut)

  return (
    <div>
      <div className="progress">
        {ETAPES.map((etape, i) => {
          // un segment est "rempli" s'il est avant ou égal à l'étape actuelle
          const rempli = i <= indexActuel
          const couleur =
            etape.cle === 'todo' ? 'actif-todo'
            : etape.cle === 'in_progress' ? 'actif-progress'
            : 'actif-done'

          return (
            <button
              key={etape.cle}
              className={`segment ${rempli ? couleur : ''}`}
              onClick={() => onChange(etape.cle)}
              aria-label={`Marquer comme ${etape.label}`}
            />
          )
        })}
      </div>
      <div className="progress-label">{ETAPES[indexActuel]?.label ?? statut}</div>
    </div>
  )
}