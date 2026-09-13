import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Parametres() {
  const navigate = useNavigate()

  // profil
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msgProfil, setMsgProfil] = useState('')

  // mot de passe
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [msgMdp, setMsgMdp] = useState('')

  // suppression
  const [confirmSuppr, setConfirmSuppr] = useState(false)
  const [erreur, setErreur] = useState('')

  // Charger le profil au montage
  useEffect(() => {
    api.getMe()
      .then((u) => { setName(u.name); setEmail(u.email) })
      .catch((e) => setErreur(e.message))
  }, [])

  const enregistrerProfil = async (e) => {
    e.preventDefault()
    setMsgProfil('')
    try {
      const u = await api.updateMe({ name })
      localStorage.setItem('user', JSON.stringify(u))  // garder le nom à jour partout
      setMsgProfil('Profil enregistré ✓')
    } catch (err) {
      setMsgProfil(err.message)
    }
  }

  const changerMdp = async (e) => {
    e.preventDefault()
    setMsgMdp('')
    try {
      await api.changePassword({ ancien, nouveau })
      setAncien(''); setNouveau('')
      setMsgMdp('Mot de passe modifié ✓')
    } catch (err) {
      setMsgMdp(err.message)
    }
  }

  const supprimerCompte = async () => {
    try {
      await api.deleteMe()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/register')
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <div>
      <h1>Paramètres</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      {/* --- Profil --- */}
      <section className="carte" style={{ marginBottom: 20 }}>
        <h2 className="carte-titre">Profil</h2>
        <form onSubmit={enregistrerProfil}>
          <label htmlFor="p-nom">Nom</label>
          <input id="p-nom" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="p-email">Email</label>
          <input id="p-email" value={email} disabled />
          <p className="vide" style={{ fontSize: '0.8rem' }}>L'email ne peut pas être modifié.</p>
          <button>Enregistrer</button>
        </form>
        {msgProfil && <p className="info-msg">{msgProfil}</p>}
      </section>

      {/* --- Mot de passe --- */}
      <section className="carte" style={{ marginBottom: 20 }}>
        <h2 className="carte-titre">Mot de passe</h2>
        <form onSubmit={changerMdp}>
          <label htmlFor="p-ancien">Ancien mot de passe</label>
          <input id="p-ancien" type="password" value={ancien}
            onChange={(e) => setAncien(e.target.value)} />
          <label htmlFor="p-nouveau">Nouveau mot de passe</label>
          <input id="p-nouveau" type="password" value={nouveau}
            onChange={(e) => setNouveau(e.target.value)} />
          <button>Changer le mot de passe</button>
        </form>
        {msgMdp && <p className="info-msg">{msgMdp}</p>}
      </section>

      {/* --- Zone dangereuse --- */}
      <section className="carte carte-danger">
        <h2 className="carte-titre">Supprimer mon compte</h2>
        <p className="vide">
          Action définitive. Tes projets seront transférés à un autre membre, ou supprimés
          s'il n'y en a aucun.
        </p>
        {!confirmSuppr ? (
          <button className="btn-danger" onClick={() => setConfirmSuppr(true)}>
            Supprimer mon compte
          </button>
        ) : (
          <div>
            <p style={{ fontWeight: 600, margin: '10px 0' }}>Es-tu sûr ? C'est irréversible.</p>
            <button className="btn-danger" onClick={supprimerCompte}>Oui, supprimer</button>
            <button onClick={() => setConfirmSuppr(false)} style={{ marginLeft: 10 }}>
              Annuler
            </button>
          </div>
        )}
      </section>
    </div>
  )
}