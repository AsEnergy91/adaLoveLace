
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    try {
      await api.register({ email, password, name })
      const data = await api.login({ email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <div className="auth">
      <div className="auth-carte">
        <h1>Inscription</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nom" value={name}
            onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">S'inscrire</button>
        </form>
        {erreur && <p className="erreur">{erreur}</p>}
        <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  )
}