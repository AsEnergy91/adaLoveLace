import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db = null;

// Ouvre la base (et la garde en mémoire pour ne pas la rouvrir à chaque fois)
export async function getDB() {
  if (!db) {
    db = await open({
      filename: "./db/adalovelace.db",
      driver: sqlite3.Database,
    });
  }
  return db;
}

// Crée les tables si elles n'existent pas encore
export async function initDB() {
  const db = await getDB();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      owner_id TEXT NOT NULL,
      start_date TEXT,
      deadline TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'todo',
      project_id TEXT NOT NULL,
      assigned_to TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS project_members (
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
