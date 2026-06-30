import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db/database.js";

const router = express.Router();

// --- INSCRIPTION : POST /api/auth/register ---
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. Vérifier que rien ne manque
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const db = await getDB();

    // 2. Vérifier que l'email n'est pas déjà pris
    const existant = await db.get(
      "SELECT id FROM users WHERE email = ?",
      email,
    );
    if (existant) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    // 3. Chiffrer le mot de passe (jamais en clair !)
    const hash = await bcrypt.hash(password, 10);

    // 4. Créer un identifiant unique et enregistrer l'utilisateur
    const id = crypto.randomUUID();
    await db.run(
      "INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)",
      id,
      email,
      hash,
      name,
    );

    // 5. Répondre (sans jamais renvoyer le mot de passe)
    res.status(201).json({ id, email, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --- CONNEXION : POST /api/auth/login ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const db = await getDB();

    // 1. Retrouver l'utilisateur par son email
    const user = await db.get("SELECT * FROM users WHERE email = ?", email);

    // 2. Comparer le mot de passe fourni avec le hash stocké
    //    (même message si l'email OU le mot de passe est faux : on n'aide pas un attaquant)
    const motDePasseOk =
      user && (await bcrypt.compare(password, user.password));
    if (!motDePasseOk) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // 3. Fabriquer le token JWT (le "bracelet d'entrée")
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 4. Renvoyer le token et les infos publiques de l'utilisateur
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
