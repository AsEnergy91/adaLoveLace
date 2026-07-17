const express = require('express')
const crypto = require('crypto')
const { getDB } = require('../db/database')
const auth = require('../middleware/auth')

const router = express.Router()

router.use(auth)


router.get('/', async (req, res) => {
  try {
    const db = await getDB()
    const projects = await db.all(
      'SELECT * FROM projects WHERE user_id = ?', [req.user.id]
    )
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})


router.post('/', async (req, res) => {
  const { nom, description } = req.body

  if (!nom) {
    return res.status(400).json({ error: 'Le nom est requis' })
  }

  try {
    const db = await getDB()
    const id = crypto.randomUUID()
    await db.run(
      'INSERT INTO projects (id, nom, description, user_id) VALUES (?, ?, ?, ?)',
      [id, nom, description || '', req.user.id]
    )
    res.status(201).json({ id, nom, description, user_id: req.user.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.put('/:id', async (req, res) => {
  const { nom, description } = req.body

  try {
    const db = await getDB()
    const project = await db.get(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' })
    }

    await db.run(
      'UPDATE projects SET nom = ?, description = ? WHERE id = ?',
      [nom || project.nom, description || project.description, req.params.id]
    )
    res.json({ message: 'Projet modifié' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})


router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB()
    const result = await db.run(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Projet non trouvé' })
    }

    res.json({ message: 'Projet supprimé' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

module.exports = router