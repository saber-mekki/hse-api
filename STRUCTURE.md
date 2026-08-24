# Structure du projet — hse-api

## Racine

| Fichier | Rôle |
|---|---|
| `package.json` | Dépendances et scripts (`npm run dev`, `npm start`) |
| `.env` / `.env.example` | Variables d'environnement (base de données, JWT, Cloudinary) — `.env` n'est jamais commité |
| `.gitignore` | Fichiers exclus de Git (`node_modules`, `.env`) |

## `prisma/`

| Fichier | Rôle |
|---|---|
| `schema.prisma` | Modèle de données complet : User, Atelier, Evenement, ActionCorrective, HistoriqueStatut, Notification |
| `migrations/` | Historique des migrations SQL appliquées à la base (généré automatiquement) |

## `src/server.js`

Point d'entrée de l'API. Monte les routes, démarre Express et les jobs planifiés.

## `src/controllers/` — logique métier

| Fichier | Rôle |
|---|---|
| `auth.controller.js` | Inscription (`register`) et connexion (`login`), génère le token JWT |
| `evenements.controller.js` | Création/liste/détail des déclarations, gestion du workflow de statut |
| `actions.controller.js` | Création, clôture et détection de retard des actions correctives |
| `ateliers.controller.js` | Création/liste des ateliers, résolution par QR code |
| `users.controller.js` | Création/liste des utilisateurs (réservé Admin) |
| `kpi.controller.js` | Calcul de l'Indice de Proactivité HSE et des indicateurs mensuels |

## `src/routes/` — endpoints HTTP

| Fichier | Endpoints |
|---|---|
| `auth.routes.js` | `POST /api/auth/register`, `POST /api/auth/login` |
| `evenements.routes.js` | `GET/POST /api/evenements`, `PATCH /:id/statut` |
| `actions.routes.js` | `GET/POST /api/actions`, `PATCH /:id/cloturer` |
| `ateliers.routes.js` | `GET/POST /api/ateliers`, `GET /qr/:qrCode` |
| `users.routes.js` | `GET/POST /api/users`, `PATCH /:id/desactiver` |
| `kpi.routes.js` | `GET /api/kpi/mensuel` |
| `notifications.routes.js` | `GET /api/notifications`, `PATCH /:id/lu` |
| `upload.routes.js` | `POST /api/upload` (photo → Cloudinary) |

## `src/middleware/`

| Fichier | Rôle |
|---|---|
| `auth.middleware.js` | Vérifie le token JWT (`authRequired`) |
| `roles.middleware.js` | Restreint l'accès par rôle (`allowRoles('HSE', 'ADMIN')`) |

## `src/services/`

| Fichier | Rôle |
|---|---|
| `notifications.service.js` | Création de notifications (par rôle ou par utilisateur) |
| `jobs.service.js` | Tâches planifiées (cron) : relance quotidienne des actions en retard, rapport mensuel automatique à la Direction |

## `src/lib/`

| Fichier | Rôle |
|---|---|
| `prisma.js` | Instance partagée du client Prisma |
| `cloudinary.js` | Configuration Cloudinary pour l'upload de photos |
