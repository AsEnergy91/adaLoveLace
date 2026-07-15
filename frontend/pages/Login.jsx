import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()   // empêche le rechargement de la page
    setError('')
    try {
      const data = await api.login({ email, password })
      localStorage.setItem('token', data.token)   // on garde le bracelet
      navigate('/projects')                       // on entre dans l'app
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Connexion</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input type="email" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} />

      <input type="password" placeholder="Mot de passe"
        value={password} onChange={(e) => setPassword(e.target.value)} />

      <button type="submit">Se connecter</button>
      <p>Pas de compte ? <Link to="/register">S'inscrire</Link></p>
    </form>
  )
}