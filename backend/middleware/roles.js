import { getDB } from "../db/database.js";

// Récupère le rôle d'un utilisateur sur un projet (ou null s'il n'est pas membre)
export async function getRole(projectId, userId) {
  const db = await getDB();
  const ligne = await db.get(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
    [projectId, userId],
  );
  return ligne ? ligne.role : null;
}

// FABRIQUE de middleware : exige au minimum le rôle donné
export function requireRole(minRole) {
  // hiérarchie : plus le chiffre est haut, plus on a de droits
  const niveaux = { member: 1, owner: 2 };

  // la fonction renvoyée est le vrai middleware
  return async (req, res, next) => {
    try {
      // l'id du projet peut venir de l'URL (/projects/:id) ou du corps
      const projectId =
        req.params.id || req.params.projectId || req.body.project_id;
      if (!projectId) {
        return res.status(400).json({ error: "Projet non précisé" });
      }

      const role = await getRole(projectId, req.user.id);
      if (!role) {
        return res
          .status(403)
          .json({ error: "Accès refusé : non membre du projet" });
      }

      // a-t-on un niveau suffisant ?
      if (niveaux[role] < niveaux[minRole]) {
        return res.status(403).json({ error: "Droits insuffisants" });
      }

      req.role = role; // on transmet le rôle à la route, au cas où
      next();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };
}
