import express from "express";
import cors from "cors";
import "dotenv/config";
import { initDB } from "./db/database.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares globaux (s'exécutent avant les routes) ---
app.use(cors()); // autorise le frontend à appeler l'API
app.use(express.json()); // lit le JSON envoyé → remplit req.body

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// --- Démarrage : on prépare la base PUIS on lance le serveur ---
async function start() {
  await initDB();
  console.log("Base de données prête");
  app.listen(PORT, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
  });
}

start();
