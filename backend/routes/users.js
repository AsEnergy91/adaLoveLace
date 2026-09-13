import express from "express";
import auth from "../middleware/auth.js";
import { getDB } from "../db/database.js";
import bcrypt from 'bcryptjs';

const router = express.Router();
router.use(auth); // tout ici nécessite d'être connecté

// Voir mon profil
router.get("/me", async (req, res) => {
  try {
    const db = await getDB();
    const user = await db.get(
      "SELECT id, email, name FROM users WHERE id = ?",
      [req.user.id],
    );
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer mon compte (avec transfert auto de propriété)
router.delete("/me", async (req, res) => {
  try {
    const db = await getDB();
    const userId = req.user.id;

    const projetsOwner = await db.all(
      "SELECT project_id FROM project_members WHERE user_id = ? AND role = 'owner'",
      [userId],
    );

    for (const { project_id } of projetsOwner) {
      const suivant = await db.get(
        `SELECT user_id FROM project_members
         WHERE project_id = ? AND user_id != ?
         ORDER BY joined_at ASC
         LIMIT 1`,
        [project_id, userId],
      );
      if (suivant) {
        await db.run(
          "UPDATE project_members SET role = 'owner' WHERE project_id = ? AND user_id = ?",
          [project_id, suivant.user_id],
        );
        await db.run("UPDATE projects SET owner_id = ? WHERE id = ?", [
          suivant.user_id,
          project_id,
        ]);
      } else {
        await db.run("DELETE FROM tasks WHERE project_id = ?", [project_id]);
        await db.run("DELETE FROM invitations WHERE project_id = ?", [
          project_id,
        ]);
        await db.run("DELETE FROM projects WHERE id = ?", [project_id]);
      }
    }

    await db.run("DELETE FROM project_members WHERE user_id = ?", [userId]);
    await db.run("UPDATE tasks SET assigned_to = NULL WHERE assigned_to = ?", [
      userId,
    ]);
    await db.run("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "Compte supprimé" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modifier mon profil (nom)
router.put('/me', async (req, res) => {
  try {
    const db = await getDB()
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Nom requis' })

    await db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id])
    const user = await db.get('SELECT id, email, name FROM users WHERE id = ?', [req.user.id])
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Changer mon mot de passe
router.put('/me/password', async (req, res) => {
  try {
    const db = await getDB()
    const { ancien, nouveau } = req.body
    if (!ancien || !nouveau) {
      return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' })
    }

    // 1. Vérifier l'ancien mot de passe
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id])
    const ok = await bcrypt.compare(ancien, user.password)
    if (!ok) return res.status(401).json({ error: 'Ancien mot de passe incorrect' })

    // 2. Chiffrer et enregistrer le nouveau
    const hash = await bcrypt.hash(nouveau, 10)
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id])

    res.json({ message: 'Mot de passe modifié' })
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router;
