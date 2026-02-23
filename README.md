# RedSheet - Frontend Interface

## 📋 Présentation

**RedSheet** est l'interface utilisateur (SPA) de la plateforme d'opérations de Red Teaming. Développée en React, elle offre une expérience fluide et réactive pour gérer les campagnes de tests d'intrusion, visualiser les données en temps réel et créer ses propres cibles.

Elle communique avec l'API Backend via des requêtes sécurisées (JWT) et implémente une gestion stricte des rôles côté client.

## 🛠️ Stack Technologique

- **Framework** : React (v18+)
- **Build Tool** : Vite
- **Routing** : React Router DOM v6
- **HTTP Client** : Axios (avec intercepteurs)
- **UI/UX** : CSS Modules, Lucide React (Icônes), Recharts (Graphiques)
- **Utilitaires** : React Markdown, Syntax Highlighter

## ⚙️ Installation & Configuration

### 1. Pré-requis
- [Node.js](https://nodejs.org/) (v16+)
- Le Backend (RedSheet API) doit être lancé localement ou accessible.

### 2. Installation des dépendances
```bash
npm install
```

### 3. Démarrage
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173` (par défaut).

## 🔐 Sécurité & Architecture (Conformité ISO A.8)

### A.8.2 - Contrôle d'accès (Frontend Enforcement)
- **Route Guards** : Le composant `ProtectedRoute` vérifie la présence du token et le rôle de l'utilisateur avant d'afficher une page.
- **Honeypots** : Le hook `useAccessControl` redirige silencieusement les tentatives d'accès non autorisées vers le tableau de bord, sans révéler l'existence de la ressource.
- **UI Adaptative** : Les boutons sensibles (Supprimer, Éditer, Admin) sont masqués dynamiquement selon le rôle (`GUEST`, `PENTESTER`, `ADMIN`).

### A.8.28 - Sécurité du développement
- **Sanitization** : React échappe par défaut les contenus pour prévenir les failles XSS (Cross-Site Scripting).
- **Gestion des Tokens** : Le JWT est stocké dans le `localStorage` et injecté automatiquement dans les headers `Authorization` via un intercepteur Axios centralisé.
- **Gestion des Erreurs** : Utilisation de `ErrorModal` et `ToastContext` pour une gestion uniforme des retours API sans exposer de stack traces techniques à l'utilisateur.

## 📦 Fonctionnalités Principales

| Module | Description |
|--------|-------------|
| **Search** | Recherche globale instantanée sur toute la plateforme. (Ctrl + K) |
| **Profile** | Gestion du compte opérateur (Avatar, Infos). |
| **Dashboard** | Vue d'ensemble des opérations et statistiques. |
| **Payloads** | Base de données de vecteurs d'attaque (XSS, SQLi, RCE...). |
| **Targets** | Gestion du scope (Cibles, IP, Ports, Statut). |
| **Boxes** | Suivi des machines compromises (Lien avec les cibles). |
| **Veille Cyber** | Fil d'actualités cybersécurité et veille technologique. |
| **Kill Chain** | Guides étape par étape et checklists de pentest. |
| **Wiki** | Base de connaissances méthodologiques (Markdown). |
| **CyberChef** | Suite d'outils pour l'analyse et la transformation de données (Encodage, Hash). |
| **RevShell Gen** | Générateur automatique de Reverse Shells. |
| **Admin Panel** | Gestion des utilisateurs et Audit Logs (Graphiques). |

## 💡 Choix Techniques

### Justification de l'authentification JWT
Nous avons opté pour une authentification basée sur les JSON Web Tokens (JWT) plutôt que sur les sessions serveur classiques pour plusieurs raisons :

- **Architecture Stateless (Sans état)** : Le serveur n'a pas besoin de stocker l'état de session de chaque utilisateur en mémoire ou en base de données. Cela rend l'application plus rapide et facilite la scalabilité.
- **Performance** : La vérification du token se fait par calcul cryptographique (signature) sans nécessiter une requête en base de données à chaque appel API.
- **Flexibilité Frontend** : Le token est stocké côté client (LocalStorage), ce qui permet au Frontend de gérer facilement l'état "connecté" et d'accéder aux informations utilisateur (ID, Rôle) directement depuis le payload.
- **Sécurité** : Les tokens sont signés numériquement côté serveur. Une expiration automatique est en place pour limiter les risques.

---

**RedSheet** - *Centralized Pentest Operations*
© 2026 - Tous droits réservés.
