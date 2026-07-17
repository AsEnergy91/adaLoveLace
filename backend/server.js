require('dotenv').config()
const express = require("express");
const cors = require("cors");
const { initDB } = require("./db/database");
const authRoutes = require('./routes/auth')


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes)

const projectRoutes = require('./routes/projects')
app.use('/api/projects', projectRoutes)

app.get("/api/ping", (req, res) => {
  res.json({ message: "ca marche ou pas" });
});

async function startServer() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();
