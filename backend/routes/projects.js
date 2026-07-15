import express from 'express'
import crypto from 'crypto'
import auth from '../middleware/auth.js'
import { getDB } from '../db/database.js'

const router = express.Router()
router.use(auth) // tout ici nécessite d'être connecté

// READ — GET /api/projects (mes projets)
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const projets = await db.all(
      "SELECT * FROM projects WHERE owner_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );
    res.json(projets);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// CREATE — POST /api/projects
router.post("/", async (req, res) => {
  const { title, description, start_date, deadline } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Le titre est requis" });
  }
  try {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db.run(
      `INSERT INTO projects (id, title, description, owner_id, start_date, deadline)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title, description, req.user.id, start_date, deadline],
    );
    const projet = await db.get("SELECT * FROM projects WHERE id = ?", [id]);
    res.status(201).json(projet);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// READ ONE — GET /api/projects/:id (détail + tâches)
router.get("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const projet = await db.get(
      "SELECT * FROM projects WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
    );
    if (!projet) return res.status(404).json({ error: "Projet introuvable" });

    const taches = await db.all("SELECT * FROM tasks WHERE project_id = ?", [
      req.params.id,
    ]);
    res.json({ ...projet, tasks: taches });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// UPDATE — PUT /api/projects/:id
router.put("/:id", async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const db = await getDB();
    const projet = await db.get(
      "SELECT * FROM projects WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
    );
    if (!projet) return res.status(404).json({ error: "Introuvable" });

    await db.run(
      "UPDATE projects SET title = ?, description = ?, status = ? WHERE id = ?",
      [
        title ?? projet.title,
        description ?? projet.description,
        status ?? projet.status,
        req.params.id,
      ],
    );
    const maj = await db.get("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    res.json(maj);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE — DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const projet = await db.get(
      "SELECT id FROM projects WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
    );
    if (!projet) return res.status(404).json({ error: "Introuvable" });

    await db.run("DELETE FROM tasks WHERE project_id = ?", [req.params.id]);
    await db.run("DELETE FROM projects WHERE id = ?", [req.params.id]);
    res.json({ message: "Projet supprimé" });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
