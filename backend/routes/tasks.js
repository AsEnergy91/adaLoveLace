import express from 'express'
import crypto from 'crypto'
import auth from '../middleware/auth.js'
import { getDB } from '../db/database.js'

const router = express.Router()
router.use(auth)

// Mes tâches (toutes celles qui me sont assignées)
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const taches = await db.all("SELECT * FROM tasks WHERE assigned_to = ?", [
      req.user.id,
    ]);
    res.json(taches);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Créer une tâche dans un projet
router.post("/", async (req, res) => {
  const { title, project_id, assigned_to } = req.body;
  if (!title || !project_id) {
    return res.status(400).json({ error: "title et project_id requis" });
  }
  try {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db.run(
      "INSERT INTO tasks (id, title, project_id, assigned_to) VALUES (?, ?, ?, ?)",
      [id, title, project_id, assigned_to || null],
    );
    const tache = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
    res.status(201).json(tache);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modifier (souvent : changer le statut todo → in_progress → done)
router.put("/:id", async (req, res) => {
  const { title, status } = req.body;
  try {
    const db = await getDB();
    const t = await db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
    if (!t) return res.status(404).json({ error: "Tâche introuvable" });

    await db.run("UPDATE tasks SET title = ?, status = ? WHERE id = ?", [
      title ?? t.title,
      status ?? t.status,
      req.params.id,
    ]);
    const maj = await db.get("SELECT * FROM tasks WHERE id = ?", [
      req.params.id,
    ]);
    res.json(maj);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDB();
    await db.run("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.json({ message: "Tâche supprimée" });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
