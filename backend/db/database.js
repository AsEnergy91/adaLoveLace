const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");

// Ouvre (ou crée) le fichier de base de données

async function getDB() {
  return open({
    filename: path.join(__dirname, "adalovelace.db"),
    driver: sqlite3.Database,
  });
}

// Crée toutes les tables si elles n'existent pas encore

async function initDB() {
  const db = await getDB();

  await db.exec(`
    CREATE TABLE IF NOT EXIST users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE, 
    password_hash TEXT NOT NULL, 
    name          TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXIST projects (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT DEFAULT 'planning',
    owner_id    TEXT NOT NULL,
    start_date  TEXT,
    deadline    TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );


    CREATE TABLE IF NOT EXIST tasks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULl,
    status      TEXT DEFAULT 'todo',
    project_id  TEXT NOT NULL,
    assigned_to TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_members (
    project_id TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    PRIMARY KEY (project_id, user_id)
    );
    `);
  console.log("Base de données prête");
}

module.exports = { getDB, initDB };
