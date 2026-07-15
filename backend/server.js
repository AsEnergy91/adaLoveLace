import express from "express";
import cors from "cors";
import "dotenv/config";
import { initDB } from "./db/database.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

async function start() {
  await initDB();
  console.log("Base de données prête");
  app.listen(PORT, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
  });
}

start();
