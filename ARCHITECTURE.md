# Architecture — AdaLoveLace

App en 3 couches. Chaque couche parle seulement à sa voisine : navigateur → serveur → base. Jamais de raccourci.

## 1. Frontend (React 19 + Vite)

Tourne dans le navigateur, `localhost:5173`. Ne touche jamais la base directement.

- `src/pages/` = les écrans (login, dashboard, projets, tâches)
- `src/components/` = morceaux réutilisés (sidebar, boutons)
- `src/services/api.js` = tous les appels au serveur, centralisés

## 2. Backend (Express 5)

Le serveur, `localhost:3001`. Seul à parler à la base, gère les droits.

- `routes/` = adresses de l'API (auth, projects, tasks)
- `middleware/auth.js` = filtre qui vérifie le token avant de laisser passer
- `db/database.js` = ouvre la base, fournit les fonctions lire/écrire

## 3. Base de données (SQLite)

Un fichier `adalovelace.db`. 4 tables : users, projects, tasks, project_members.

## Choix technos (en bref)

- **React + Vite** : composants réutilisables, écran à jour sans recharger, rechargement instantané en dev
- **Express** : même langage que le front (JS), très répandu
- **SQLite** : zéro install, vrai SQL, suffisant pour un projet perso
- **JWT + bcrypt** : bcrypt chiffre les mots de passe, JWT prouve qu'on est connecté à chaque requête

## Flux : créer un projet

1. Clic sur "Enregistrer" dans le navigateur
2. `api.js` envoie `POST /api/projects` (titre + token JWT)
3. Le middleware vérifie le token → sinon "non autorisé", stop
4. Token ok → la route `projects` récupère l'identité de l'user
5. Requête SQL `INSERT INTO projects` avec `owner_id` = l'user
6. SQLite enregistre, renvoie le projet
7. Réponse JSON vers le front
8. React met la liste à jour, sans recharger

## Alternatives écartées

- **PostgreSQL/MySQL** : trop lourds (serveur à installer) pour ce projet
- **MongoDB** : nos données sont reliées → SQL plus adapté
- **Navigation à la main (useState)** : on perd bouton précédent + liens partageables → React Router
- **Tout dans un seul programme** : moins clair → on sépare front et back

## Tables (colonnes principales)

- `users` : id (PK), email (unique), password, name
- `projects` : id (PK), title, description, status, owner_id (FK→users), start_date, deadline, created_at
- `tasks` : id (PK), title, status, project_id (FK→projects), assigned_to (FK→users), created_at
- `project_members` : project_id (FK), user_id (FK)

## Relations

- 1 user → plusieurs projets
- 1 projet → plusieurs tâches
- 1 user → plusieurs tâches assignées
- `project_members` relie users et projets (plusieurs membres par projet)
