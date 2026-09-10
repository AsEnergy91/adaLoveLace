import express from "express";
import crypto from "crypto";
import auth from "../middleware/auth.js";
import { getDB } from "../db/database.js";
import { requireRole } from "../middleware/roles.js";


const router = express.Router();
router.use(auth);

// READ — GET /api/projects (mes projets, avec mon rôle)
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const projets = await db.all(
      `SELECT projects.*, project_members.role
       FROM projects
       JOIN project_members ON project_members.project_id = projects.id
       WHERE project_members.user_id = ?
       ORDER BY projects.created_at DESC`,
      [req.user.id],
    );
    res.json(projets); // chaque projet contient aussi mon "role"
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// CREATE — POST /api/projects
router.post("/", async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Titre requis" });
  try {
    const db = await getDB();
    const id = crypto.randomUUID();

    // 1. Créer le projet
    await db.run(
      "INSERT INTO projects (id, title, description, owner_id) VALUES (?, ?, ?, ?)",
      [id, title, description || null, req.user.id],
    );

    // 2. Inscrire le créateur comme membre "owner"
    await db.run(
      "INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'owner')",
      [id, req.user.id],
    );

    const projet = await db.get("SELECT * FROM projects WHERE id = ?", [id]);
    res.status(201).json(projet);
  } catch (e) {
    console.error(e);
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
router.put("/:id", requireRole("owner"), async (req, res) => {
  const { title, description, status, deadline } = req.body;
  try {
    const db = await getDB();
    const p = await db.get("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (!p) return res.status(404).json({ error: "Projet introuvable" });

    await db.run(
      "UPDATE projects SET title = ?, description = ?, status = ?, deadline = ? WHERE id = ?",
      [
        title ?? p.title,
        description ?? p.description,
        status ?? p.status,
        deadline ?? p.deadline,
        req.params.id,
      ],
    );
    const maj = await db.get("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    res.json(maj);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE — DELETE /api/projects/:id
router.delete("/:id", requireRole("owner"), async (req, res) => {
  try {
    const db = await getDB();
    // on nettoie aussi ce qui dépend du projet
    await db.run("DELETE FROM tasks WHERE project_id = ?", [req.params.id]);
    await db.run("DELETE FROM project_members WHERE project_id = ?", [
      req.params.id,
    ]);
    await db.run("DELETE FROM projects WHERE id = ?", [req.params.id]);
    res.json({ message: "Projet supprimé" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Générer un code d'invitation — owner uniquement
router.post('/:id/invitations', requireRole('owner'), async (req, res) => {
  try {
    const db = await getDB()
    const { role } = req.body            // rôle proposé à l'invité (par défaut 'member')

    // code court et lisible, ex: "A3F9C2"
    const code = crypto.randomUUID().slice(0, 6).toUpperCase()

    // expiration dans 7 jours
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)

    await db.run(
      'INSERT INTO invitations (code, project_id, role, expires_at) VALUES (?, ?, ?, ?)',
      [code, req.params.id, role === 'member' || !role ? 'member' : role, expires.toISOString()]
    )

    res.status(201).json({ code, expires_at: expires.toISOString() })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
});

// Rejoindre un projet via un code d'invitation
router.post('/join', async (req, res) => {
  try {
    const db = await getDB()
    const { code } = req.body
    if (!code) return res.status(400).json({ error: 'Code requis' })

    // 1. Le code existe-t-il ?
    const invit = await db.get('SELECT * FROM invitations WHERE code = ?', [code.toUpperCase()])
    if (!invit) return res.status(404).json({ error: 'Code invalide' })

    // 2. Déjà utilisé ?
    if (invit.used) return res.status(409).json({ error: 'Code déjà utilisé' })

    // 3. Expiré ?
    if (new Date(invit.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Code expiré' })
    }

    // 4. Déjà membre ?
    const dejaMembre = await db.get(
      'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
      [invit.project_id, req.user.id]
    )
    if (dejaMembre) return res.status(409).json({ error: 'Tu es déjà membre de ce projet' })

    // 5. Ajouter le membre + consommer le code (usage unique)
    await db.run(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [invit.project_id, req.user.id, invit.role]
    )
    await db.run('UPDATE invitations SET used = 1 WHERE code = ?', [invit.code])

    const projet = await db.get('SELECT * FROM projects WHERE id = ?', [invit.project_id])
    res.status(201).json({ message: 'Projet rejoint', projet })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
});

// Transférer la propriété — owner uniquement
router.put('/:id/transfer', requireRole('owner'), async (req, res) => {
  try {
    const db = await getDB()
    const { user_id } = req.body            // le membre à promouvoir
    if (!user_id) return res.status(400).json({ error: 'user_id requis' })

    if (user_id === req.user.id) {
      return res.status(400).json({ error: 'Tu es déjà owner' })
    }

    // la cible doit déjà être membre du projet
    const cible = await db.get(
      'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.id, user_id]
    )
    if (!cible) return res.status(404).json({ error: "Cet utilisateur n'est pas membre du projet" })

    // rétrograder l'ancien owner, promouvoir la cible
    await db.run("UPDATE project_members SET role = 'member' WHERE project_id = ? AND user_id = ?",
      [req.params.id, req.user.id])
    await db.run("UPDATE project_members SET role = 'owner' WHERE project_id = ? AND user_id = ?",
      [req.params.id, user_id])
    await db.run('UPDATE projects SET owner_id = ? WHERE id = ?', [user_id, req.params.id])

    res.json({ message: 'Propriété transférée', nouvel_owner: user_id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
});

// Supprimer son propre compte
router.delete('/me', async (req, res) => {
  try {
    const db = await getDB()
    const userId = req.user.id

    // 1. Pour chaque projet dont je suis owner : transférer ou supprimer
    const projetsOwner = await db.all(
      "SELECT project_id FROM project_members WHERE user_id = ? AND role = 'owner'",
      [userId]
    )

    for (const { project_id } of projetsOwner) {
      // le membre le plus ancien, hors moi
      const suivant = await db.get(
        `SELECT user_id FROM project_members
         WHERE project_id = ? AND user_id != ?
         ORDER BY joined_at ASC
         LIMIT 1`,
        [project_id, userId]
      )
      if (suivant) {
        // transférer au plus ancien
        await db.run("UPDATE project_members SET role = 'owner' WHERE project_id = ? AND user_id = ?",
          [project_id, suivant.user_id])
        await db.run('UPDATE projects SET owner_id = ? WHERE id = ?', [suivant.user_id, project_id])
      } else {
        // aucun autre membre : projet orphelin → suppression
        await db.run('DELETE FROM tasks WHERE project_id = ?', [project_id])
        await db.run('DELETE FROM invitations WHERE project_id = ?', [project_id])
        await db.run('DELETE FROM projects WHERE id = ?', [project_id])
      }
    }

    // 2. Retirer mes adhésions restantes (projets où j'étais simple membre)
    await db.run('DELETE FROM project_members WHERE user_id = ?', [userId])

    // 3. Détacher mes tâches assignées (on ne les supprime pas)
    await db.run('UPDATE tasks SET assigned_to = NULL WHERE assigned_to = ?', [userId])

    // 4. Supprimer le compte
    await db.run('DELETE FROM users WHERE id = ?', [userId])

    res.json({ message: 'Compte supprimé' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router;
