# Document de référence technique
## Application de signalement et collecte des ordures ménagères — Partenariat HYSACAM
### Concours Semaine de l'Innovation Numérique (CDIC / MINPOSTEL)

> Ce document sert de contexte de référence pour toute nouvelle discussion de conception ou d'implémentation (frontend/backend) liée à ce projet. Il consolide les décisions déjà prises.

---

## 1. Stack technique finalisée

| Couche | Choix | Justification |
|---|---|---|
| Frontend | **React + Vite**, PWA (service worker, manifest) | Écosystème riche, bon support offline-first, cohérent avec le prototype déjà réalisé |
| Style | **Tailwind CSS** | Rapide à itérer, cohérent avec les maquettes déjà produites |
| Backend | **Node.js + Express** | Même langage que le frontend (JS/TS), équipe plus facile à constituer pour un projet étudiant/startup, bon support PostGIS via `pg`/`knex` |
| Base de données | **PostgreSQL + extension PostGIS** | Requêtes géospatiales natives (rapprochement de signalements, point le plus proche) |
| Authentification | **OTP par SMS** + JWT pour les sessions | Adapté au contexte camerounais (pas de mot de passe à retenir) |
| Stockage photos | **Cloud object storage compatible S3** (ex. AWS S3, ou alternative régionale) | Séparation du stockage de fichiers et de la base de données, scalable |
| Notifications | SMS (signalement validé/rejeté) + notifications in-app (cloche) | Redondance utile en cas de connexion instable |
| Hébergement | À définir selon budget — VPS (ex. OVH, DigitalOcean) suffisant pour un MVP | Pas besoin de sur-dimensionner pour la phase concours |

**Décisions déjà actées dans les échanges précédents, à ne pas remettre en question sans raison :**
- Offline-first obligatoire (sauvegarde locale + retry automatique)
- Points attribués uniquement après validation par un agent (jamais à la soumission)
- Seuls les points de collecte **officiels** sont visibles publiquement sur la carte citoyenne — les dépôts sauvages restent internes à HYSACAM
- Workflow de modération en deux temps (avertissement obligatoire avant toute suspension)
- Conformité à la loi camerounaise n°2024/017 sur la protection des données personnelles

---

## 2. Schéma de base de données

### `users`
| Champ | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| phone | VARCHAR, unique | format camerounais |
| name | VARCHAR | |
| city | VARCHAR | |
| role | ENUM(`citizen`, `agent`, `admin`) | |
| status | ENUM(`active`, `warned`, `suspended`) | |
| created_at | TIMESTAMP | |

### `otp_codes`
| Champ | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| code_hash | VARCHAR | jamais en clair |
| expires_at | TIMESTAMP | |
| attempts | INT | anti brute-force |

### `depots` (dépôts sauvages)
| Champ | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| geom | GEOGRAPHY(Point, 4326) | index GIST obligatoire |
| status | ENUM(`a_verifier`, `confirme`, `collecte`) | |
| first_reported_at | TIMESTAMP | |
| collected_at | TIMESTAMP, nullable | |

### `reports` (signalements citoyens)
| Champ | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| depot_id | UUID (FK → depots) | rattaché après rapprochement géospatial |
| photo_url | VARCHAR | pointeur vers le stockage cloud |
| volume_estime | ENUM(`petit`, `moyen`, `grand`) | |
| waste_type | VARCHAR, nullable | |
| status | ENUM(`en_attente`, `valide`, `rejete`) | |
| rejection_reason | VARCHAR, nullable | |
| submitted_at | TIMESTAMP | |
| processed_at | TIMESTAMP, nullable | |
| processed_by | UUID (FK → users), nullable | agent traitant |

### `collection_points` (points de collecte officiels)
| Champ | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | VARCHAR | |
| geom | GEOGRAPHY(Point, 4326) | index GIST |
| hours | VARCHAR | |
| location_source | ENUM(`manuel`, `gps`) | traçabilité de la saisie |
| created_by | UUID (FK → users) | |
| created_at | TIMESTAMP | |

### `points_transactions` (historique des points — jamais un compteur brut)
| Champ | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| report_id | UUID (FK → reports), nullable | |
| amount | INT | positif ou négatif |
| reason | VARCHAR | ex. `nouveau_depot_valide`, `depot_deja_connu`, `bonus_collecte` |
| created_at | TIMESTAMP | |

### `reputation`
| Champ | Type | Notes |
|---|---|---|
| user_id | UUID (PK, FK → users) | |
| validation_ratio | DECIMAL | calculé/mis à jour périodiquement |
| active_alerts | INT | ex. incohérence géographique détectée |

### `moderation_actions`
| Champ | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| target_user_id | UUID (FK → users) | |
| performed_by | UUID (FK → users) | admin/agent |
| action | ENUM(`avertissement`, `suspension`, `reactivation`) | |
| reason | VARCHAR | |
| created_at | TIMESTAMP | |

### `notifications`
| Champ | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| type | ENUM(`validation`, `rejet`, `collecte`, `nouveau_point`, `avertissement`) | |
| message | VARCHAR | |
| read | BOOLEAN, default false | |
| created_at | TIMESTAMP | |

**Requêtes géospatiales clés (rappel)**
```sql
-- Rapprochement signalement → dépôt existant (rayon 30-50m)
SELECT id FROM depots
WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(:lon,:lat),4326)::geography, 50)
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(:lon,:lat),4326) LIMIT 1;

-- Points de collecte les plus proches
SELECT id, name, hours FROM collection_points
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(:lon,:lat),4326) LIMIT 10;
```

---

## 3. Structure de dossiers proposée

Monorepo avec deux applications séparées (plus simple à faire évoluer indépendamment qu'un dossier unique) :

```
hysacam-app/
├── frontend/                     # PWA React
│   ├── public/
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   │   ├── screens/
│   │   │   ├── citizen/          # Écrans 1-9
│   │   │   │   ├── LoginScreen.jsx
│   │   │   │   ├── HomeScreen.jsx
│   │   │   │   ├── NotificationsScreen.jsx
│   │   │   │   ├── CaptureScreen.jsx
│   │   │   │   ├── ConfirmScreen.jsx
│   │   │   │   ├── SuccessScreen.jsx
│   │   │   │   ├── MapScreen.jsx
│   │   │   │   ├── HistoryScreen.jsx
│   │   │   │   └── ProfileScreen.jsx
│   │   │   └── agent/            # Écrans 10-14
│   │   │       ├── DashboardScreen.jsx
│   │   │       ├── TreatmentScreen.jsx
│   │   │       ├── PointsScreen.jsx
│   │   │       ├── CitizensScreen.jsx
│   │   │       └── CitizenDetailScreen.jsx
│   │   ├── components/           # Composants réutilisables (Badge, TopBar, TabBar...)
│   │   ├── hooks/                # useGeolocation, useOfflineQueue, etc.
│   │   ├── services/             # appels API (api.js par domaine : auth, reports, points...)
│   │   └── App.jsx
│   └── package.json
│
├── backend/                      # API Node.js/Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── reports.routes.js
│   │   │   ├── depots.routes.js
│   │   │   ├── collectionPoints.routes.js
│   │   │   ├── citizens.routes.js
│   │   │   └── notifications.routes.js
│   │   ├── controllers/
│   │   ├── models/                # requêtes SQL/knex par table
│   │   ├── middleware/            # auth JWT, rôles, rate-limiting
│   │   ├── services/              # geospatial.service.js, points.service.js, sms.service.js
│   │   └── app.js
│   ├── migrations/                # schéma SQL versionné
│   └── package.json
│
└── docs/
    ├── HYSACAM_App_Specification_Ecrans.pdf
    └── HYSACAM_Reference_Technique.md   (ce document)
```

---

## 4. Comment utiliser ce document

- **Dans une nouvelle discussion de conception** (claude.ai) : mentionnez simplement l'écran ou la couche à discuter — ce Projet garde en mémoire les décisions listées ici
- **Avec Claude Code** : placez ce fichier (et le PDF de spécification) à la racine du dépôt, ou copiez-collez son contenu en tout début de session, pour que l'implémentation reste cohérente avec les choix déjà faits
- **Mise à jour** : si une décision change (ex. changement de stack), modifiez ce document en premier — c'est la source de vérité du projet
