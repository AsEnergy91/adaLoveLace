# AdaLoveLace

Plateforme de gestion de projets — application web full-stack.
Chaque utilisateur crée un compte et gère ses propres projets,
invisibles pour les autres.

## Stack
React + Vite · Express · SQLite · bcrypt + JWT

## Installation

```bash
# Backend
cd backend
npm install
cp .env.example .env   # puis remplacez JWT_SECRET par votre propre clé
node server.js         # -> http://localhost:3001

# Frontend (dans un second terminal, à la racine)
npm install
npm run dev            # -> http://localhost:5173
```

## Variables d'environnement (backend/.env)
| Variable | Rôle |
|---|---|
| JWT_SECRET | Clé qui signe les jetons d'authentification |

## Endpoints
| Méthode | Route | Protégée | Rôle |
|---|---|---|---|
| GET | /health | Non | État du serveur |
| POST | /api/auth/register | Non | Créer un compte |
| POST | /api/auth/login | Non | Se connecter, reçoit un JWT |
| GET | /api/projects | Oui | Lister ses projets |
| POST | /api/projects | Oui | Créer un projet |
| PUT | /api/projects/:id | Oui | Modifier un projet |
| DELETE | /api/projects/:id | Oui | Supprimer un projet |

Routes protégées : en-tête `Authorization: Bearer <token>`.

## Tests
```bash
cd backend && npm test
```

## Limites connues
- Le jeton est stocké en mémoire : recharger la page déconnecte (arbitrage assumé).
- Les tâches dans les projets : table présente, interface à venir.
- SQLite convient à cette échelle ; une montée en charge demanderait PostgreSQL.