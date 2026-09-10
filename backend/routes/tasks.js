import express from "express";
import crypto from "crypto";
import auth from "../middleware/auth.js";
import { getDB } from "../db/database.js";
import { requireRole } from "../middleware/roles.js";
import { getRole } from "../middleware/roles.js";

const router = express.Router();
router.use(auth);

// Lister les tâches — filtrable par projet via ?project_id=xxx
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const { project_id } = req.query;

    let taches;
    if (project_id) {
      taches = await db.all(
        "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC",
        [project_id],
      );
    } else {
      taches = await db.all(
        `SELECT tasks.* FROM tasks
         JOIN project_members ON project_members.project_id = tasks.project_id
         WHERE project_members.user_id = ?
         ORDER BY tasks.created_at DESC`,
        [req.user.id],
      );
    }
    res.json(taches);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Créer une tâche dans un projet
router.post("/", requireRole("member"), async (req, res) => {
  const { title, project_id, assigned_to, due_date } = req.body;
  if (!title || !project_id) {
    return res.status(400).json({ error: "title et project_id requis" });
  }
  try {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db.run(
      "INSERT INTO tasks (id, title, project_id, assigned_to, due_date) VALUES (?, ?, ?, ?, ?)",
      [id, title, project_id, assigned_to || null, due_date || null],
    );
    const tache = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
    res.status(201).json(tache);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modifier (souvent : changer le statut todo → in_progress → done)
router.put("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const t = await db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
    if (!t) return res.status(404).json({ error: "Tâche introuvable" });

    // droit : être membre (ou owner) du projet de cette tâche
    const role = await getRole(t.project_id, req.user.id);
    if (!role) return res.status(403).json({ error: "Accès refusé" });

    const { title, status, due_date } = req.body;
    await db.run(
      "UPDATE tasks SET title = ?, status = ?, due_date = ? WHERE id = ?",
      [
        title ?? t.title,
        status ?? t.status,
        due_date ?? t.due_date,
        req.params.id,
      ],
    );
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
    const t = await db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
    if (!t) return res.status(404).json({ error: "Tâche introuvable" });

    const role = await getRole(t.project_id, req.user.id);
    if (!role) return res.status(403).json({ error: "Accès refusé" });

    await db.run("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.json({ message: "Tâche supprimée" });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
