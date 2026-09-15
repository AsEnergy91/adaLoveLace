import express from "express";
import cors from "cors";
import "dotenv/config";
import { initDB } from "./db/database.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 3001;
const helmet = require('helmet')

app.use(cors({ origin: 'http://localhost:5174' }));
app.use(express.json());
app.use(helmet())

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

async function start() {
  await initDB();
  console.log("Base de données prête");
  app.listen(PORT, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
  });
}

start();
