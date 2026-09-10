import { useProjetActif } from '../context/ProjetActifContext'

export default function Dashboard() {
  const { projetActif } = useProjetActif()

  return (
    <div>
      <h1>Tableau de bord</h1>
      <p>Projet actif : {projetActif}</p>
    </div>
  )
}