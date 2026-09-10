
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    try {
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
        <h1>Connexion</h1>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Se connecter</button>
        </form>
        {erreur && <p className="erreur">{erreur}</p>}
        <p>Pas de compte ? <Link to="/register">S'inscrire</Link></p>
      </div>
    </div>
  )
}