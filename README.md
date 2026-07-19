# LoveLace

Outil de gestion de projet pour organiser des projets et leurs tâches. Application web full-stack développée comme premier projet personnel, dans un objectif d'apprentissage.

## Description

LoveLace permet de créer des projets, d'y ajouter des tâches et de suivre leur avancement par statut (à faire, en cours, terminé). Chaque utilisateur dispose d'un compte sécurisé et ne voit que ses propres données. L'application est pensée pour un usage personnel ou une petite équipe.

## Problème résolu

Suivre plusieurs projets et leurs tâches éparpillées (notes, tableurs, messages) devient vite confus. LoveLace centralise projets et tâches à un seul endroit, avec un tableau de bord qui donne une vue d'ensemble immédiate de ce qui est à faire, en cours et terminé.

## Fonctionnalités

### Faites

- Inscription et connexion sécurisées (mots de passe chiffrés, authentification par jeton JWT)
- Routes protégées : les pages privées sont inaccessibles sans être connecté
- Gestion des projets : créer, consulter, modifier, supprimer
- Gestion des tâches : créer, modifier, supprimer, avec statuts (à faire / en cours / terminé)
- Tableau de bord récapitulatif (compteurs projets et tâches)
- Navigation entre les pages et déconnexion

### Prévues

- Intégration du design (maquette existante) et version responsive mobile
- Page de détail d'un projet (projet cliquable affichant ses tâches)
- Calendrier et gestion d'événements
- Paramètres utilisateur

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express 5 |
| Base de données | SQLite |
| Sécurité | JWT (jsonwebtoken), bcrypt (bcryptjs) |

Architecture en trois couches : le frontend React communique avec une API Express, seule autorisée à accéder à la base SQLite.

## Structure du dépôt

```
adaLoveLace/
├── backend/
│   ├── db/database.js        # ouverture de la base + création des tables
│   ├── middleware/auth.js    # vérification du jeton JWT
│   ├── routes/               # auth.js, projects.js, tasks.js
│   └── server.js             # point d'entrée du serveur
├── frontend/
│   ├── pages/                # Login, Register, Projects, Tasks, Dashboard
│   ├── components/           # Sidebar, ProtectedRoute
│   ├── services/api.js       # appels centralisés vers l'API
│   └── main.jsx              # point d'entrée React
└── package.json              # scripts de lancement
```

## Installation

Prérequis : Node.js (version 18 ou supérieure) et npm.

```bash
# 1. Cloner le dépôt
git clone <url-du-depot>
cd adaLoveLace

# 2. Installer les dépendances (racine et backend)
npm install
cd backend && npm install && cd ..
```

Créer un fichier `backend/.env` contenant une clé secrète pour signer les jetons :

```
JWT_SECRET=une_longue_chaine_aleatoire_a_remplacer
PORT=3001
```

> Le fichier `.env` et la base de données locale (`*.db`) ne doivent pas être versionnés. Vérifie qu'ils figurent dans `.gitignore`.

## Utilisation

Lancer le frontend et le backend ensemble depuis la racine :

```bash
npm run dev:all
```

- Frontend : http://localhost:5173
- API backend : http://localhost:3001

À la première ouverture, créer un compte via la page d'inscription, puis se connecter. La base de données SQLite et ses tables sont créées automatiquement au premier démarrage du serveur.

## État d'avancement

Projet en cours de développement — soutenance intermédiaire.

Le socle fonctionnel est en place et fonctionne de bout en bout : authentification, gestion des projets et des tâches, tableau de bord. Le travail restant porte principalement sur l'interface (intégration du design, responsive) et sur des fonctionnalités complémentaires (page détail d'un projet, calendrier, paramètres). Voir la section [Fonctionnalités](#fonctionnalités) pour le détail de ce qui est fait et prévu.

## Contexte

Premier projet personnel réalisé dans un cadre d'apprentissage. Les décisions techniques importantes sont documentées séparément sous forme d'ADR (Architecture Decision Records) : choix de SQLite, choix de React Router.
