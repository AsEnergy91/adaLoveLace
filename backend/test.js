async function test() {
  // 1. Login
  const login = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ibrah2@test.com', password: 'test123' })
  })
  const loginData = await login.json()
  console.log('LOGIN:', loginData)

  // 2. Créer un projet avec le token
  const projet = await fetch('http://localhost:3001/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + loginData.token
    },
    body: JSON.stringify({ nom: 'Mon premier projet', description: 'Test' })
  })
  const projetData = await projet.json()
  console.log('PROJET:', projetData)
}

test()