import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function ProjetDetail() {
  const { id } = useParams()
  const [projet, setProjet] = useState(null)
  const [membres, setMembres] = useState([])
  const [code, setCode] = useState('')          // code généré à afficher
  const [erreur, setErreur] = useState('')

  const moi = JSON.parse(localStorage.getItem('user') || 'null')

  // Charger le projet + ses membres
  useEffect(() => {
    api.getProjects()
      .then((projets) => {
        const p = projets.find((pr) => pr.id === id)
        if (!p) { setErreur('Projet introuvable'); return }
        setProjet(p)
      })
      .catch((e) => setErreur(e.message))

    chargerMembres()
  }, [id])

  const chargerMembres = () => {
    api.getMembers(id).then(setMembres).catch((e) => setErreur(e.message))
  }

  const genererCode = async () => {
    setErreur('')
    try {
      const res = await api.createInvitation(id, {})
      setCode(res.code)
    } catch (e) {
      setErreur(e.message)
    }
  }

  if (erreur) return <p className="erreur">{erreur}</p>
  if (!projet) return <p className="vide">Chargement…</p>

  const suisOwner = projet.role === 'owner'

  const transferer = async (userId, nom) => {
  if (!confirm(`Transférer la propriété à ${nom} ? Tu deviendras simple membre.`)) return
  setErreur('')
  try {
    await api.transferProject(id, userId)
    // recharger projet + membres pour refléter les nouveaux rôles
    const projets = await api.getProjects()
    setProjet(projets.find((pr) => pr.id === id))
    chargerMembres()
  } catch (e) {
    setErreur(e.message)
  }
}

  return (
    <div>
      <Link to="/projects" className="retour">← Retour aux projets</Link>
      <h1>{projet.title}</h1>
      {projet.description && <p>{projet.description}</p>}

      {/* --- Membres --- */}
      <section className="carte" style={{ marginBottom: 20 }}>
        <h2 className="carte-titre">Membres</h2>
        <ul className="liste">
          {membres.map((m) => (
             <li key={m.id}>
              <span>{m.name} {m.id === moi?.id && '(toi)'}</span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${m.role === 'owner' ? 'badge-owner' : ''}`}>
                  {m.role}
                </span>
                {suisOwner && m.id !== moi?.id && (
                  <button className="btn-mini" onClick={() => transferer(m.id, m.name)}>
                    Passer owner
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Inviter (owner seulement) --- */}
      {suisOwner && (
        <section className="carte" style={{ marginBottom: 20 }}>
          <h2 className="carte-titre">Inviter un membre</h2>
          <button onClick={genererCode}>Générer un code d'invitation</button>
          {code && (
            <div className="code-invitation">
              <p>Partage ce code (valable 7 jours, à usage unique) :</p>
              <div className="code-box">{code}</div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}