# Spécification d'Implémentation — ChantierCompagnon

**Version** : 1.0  
**Date** : 10 avril 2026  
**Statut** : Draft  
**Base** : `docs/specs.md` (Spécification Fonctionnelle v1.0)

---

## 1. Objectif de ce document

Ce document traduit la spécification fonctionnelle (`docs/specs.md`) en un plan d'implémentation concret, adapté aux choix techniques suivants :

| Décision | Choix | Justification |
|----------|-------|---------------|
| Plateforme | Web app (pas Desktop WPF) | Portabilité, déploiement simplifié, compatible PC + tablette |
| Frontend | React + Vite (TypeScript) | Légèreté, DX rapide, PWA possible |
| Backend | Fastify (TypeScript) | Performant, schéma de validation natif, monorepo TS |
| Base de données | SQLite + Knex | Zéro config, suffisant pour MVP mono-utilisateur |
| Reconnaissance vocale | `webkitSpeechRecognition` (browser) | Pas de dépendance Azure, fonctionne en ligne via Chrome/Edge |
| OCR | Différé | Pas d'Azure AI Document Intelligence pour le MVP |
| LLM / NLP | Aucun | Transcription brute, pas d'extraction structurée |
| Monorepo | pnpm workspaces | Types partagés front/back |
| Authentification | Différée | MVP mono-utilisateur |
| Mode offline / PWA | Différé | Phase ultérieure |
| Intégration Teams | Différée | Phase ultérieure |
| Export ERP | Différé | Phase ultérieure (rapport local uniquement) |

---

## 2. Périmètre MVP (aligné sur specs.md § Annexe C)

### Inclus dans le MVP

| Priorité | Module (réf. specs.md) | Adaptation |
|----------|----------------------|------------|
| P0 | 4.1 — Sélection de chantier | Pas d'auth SSO, sélection simple |
| P0 | 4.9 — Timeline des événements | Vue centrale, implémentation complète |
| P0 | 4.2 — Pointage des ouvriers | Saisie manuelle + vocale (transcription brute) |
| P0 | 4.3 — Météo du chantier | Saisie manuelle + pré-remplissage API météo |
| P1 | 4.5 — Presqu'accidents & Sécurité | Déclaration complète, détection par mots-clés |
| P1 | 4.6 — Photos & Anomalies | Capture, géolocalisation, catégorisation (sans annotation) |
| P1 | 4.10 — Génération de rapport | Rapport local structuré (pas d'envoi ERP) |
| P2 | 4.8 — Commande vocale | Mode dictée uniquement via `webkitSpeechRecognition`, pas de routage NLP |

### Différé (post-MVP)

| Module | Raison |
|--------|--------|
| 4.4 — Suivi matériel & engins | Complexité catalogue, dépendance ERP |
| 4.7 — Bons de livraison (OCR) | Requiert Azure AI Document Intelligence |
| Auth SSO (Azure AD / Entra ID) | MVP mono-utilisateur |
| Export ERP (SAP, Sage…) | Nécessite connecteurs spécifiques |
| Mode offline complet | Nécessite service worker + sync queue |
| Annotations photos | Complexité UI (canvas drawing) |
| Signature électronique rapport | Dépendance auth |

---

## 3. Architecture technique

### 3.1 Vue d'ensemble

```
ChantierCompagnon/
├── packages/
│   └── shared/                    # Types TS partagés + constantes
│       ├── src/
│       │   ├── types/
│       │   │   ├── site.ts        # Site, SiteCreate
│       │   │   ├── event.ts       # TimelineEvent, EventType, EventCreate
│       │   │   ├── pointage.ts    # Pointage, Ouvrier, PointageCreate
│       │   │   ├── meteo.ts       # Meteo, MeteoCreate, Condition, Impact
│       │   │   ├── securite.ts    # PresquAccident, Gravite, Categorie
│       │   │   ├── photo.ts       # Photo, PhotoCreate, CategoriePhoto
│       │   │   └── rapport.ts     # DailyReport, ReportSection
│       │   ├── constants/
│       │   │   ├── safety-keywords.ts  # Mots-clés sécurité FR
│       │   │   └── event-types.ts      # Enum types d'événements
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   ├── web/                       # Frontend React + Vite
│   │   ├── src/
│   │   │   ├── hooks/
│   │   │   │   ├── useWebkitSpeechRecognition.ts   # webkitSpeechRecognition wrapper
│   │   │   │   ├── useGeolocation.ts
│   │   │   │   └── useCamera.ts
│   │   │   ├── components/
│   │   │   │   ├── VoiceRecorder.tsx       # Overlay dictée vocale
│   │   │   │   ├── PhotoCapture.tsx        # Capture + géoloc
│   │   │   │   ├── EventCard.tsx           # Carte événement timeline
│   │   │   │   ├── PointageForm.tsx        # Formulaire pointage
│   │   │   │   ├── MeteoCard.tsx           # Carte météo matin/après-midi
│   │   │   │   ├── PresquAccidentForm.tsx  # Formulaire déclaration sécurité
│   │   │   │   └── SafetyAlert.tsx         # Bandeau alerte sécurité
│   │   │   ├── pages/
│   │   │   │   ├── SiteSelector.tsx        # E-AUTH-02
│   │   │   │   ├── Timeline.tsx            # E-TML-01
│   │   │   │   ├── Pointage.tsx            # E-PTG-01 / E-PTG-02
│   │   │   │   ├── Meteo.tsx               # E-MTO-01 / E-MTO-02
│   │   │   │   ├── Securite.tsx            # E-SEC-01 / E-SEC-02 / E-SEC-03
│   │   │   │   ├── Photos.tsx              # E-PHO-01 / E-PHO-02
│   │   │   │   └── Rapport.tsx             # E-RPT-01
│   │   │   ├── services/
│   │   │   │   └── api.ts                  # Typed fetch client
│   │   │   ├── stores/
│   │   │   │   └── appStore.ts             # Zustand (site actif, date, filtres)
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   │
│   └── api/                       # Backend Fastify
│       ├── src/
│       │   ├── server.ts          # Entry point: CORS, multipart, routes
│       │   ├── routes/
│       │   │   ├── sites.ts       # GET /api/sites, GET /api/sites/:id
│       │   │   ├── events.ts      # GET/POST events (timeline)
│       │   │   ├── pointage.ts    # CRUD pointage ouvriers
│       │   │   ├── meteo.ts       # CRUD météo
│       │   │   ├── securite.ts    # CRUD presqu'accidents
│       │   │   ├── photos.ts      # Upload + serve photos
│       │   │   └── reports.ts     # Generate + get rapport
│       │   ├── services/
│       │   │   ├── safety-detector.ts    # Détection mots-clés sécurité
│       │   │   ├── report-generator.ts   # Génération rapport structuré
│       │   │   └── meteo-api.ts          # Client API météo externe
│       │   ├── db/
│       │   │   ├── knexfile.ts
│       │   │   ├── migrations/
│       │   │   │   ├── 001_create_sites.ts
│       │   │   │   ├── 002_create_ouvriers.ts
│       │   │   │   ├── 003_create_journal_chantier.ts
│       │   │   │   ├── 004_create_pointages.ts
│       │   │   │   ├── 005_create_meteo.ts
│       │   │   │   ├── 006_create_presqu_accidents.ts
│       │   │   │   ├── 007_create_photos.ts
│       │   │   │   └── 008_create_daily_reports.ts
│       │   │   └── seeds/
│       │   │       └── 001_sample_site.ts
│       │   └── plugins/
│       │       └── db.ts          # Fastify plugin: Knex instance
│       ├── uploads/               # Stockage local photos
│       ├── package.json
│       └── tsconfig.json
│
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── package.json
└── README.md
```

### 3.2 Stack technique (remplacement de specs.md § 3.1)

| Couche (réf. specs.md) | Technologie originale | Technologie MVP |
|------------------------|----------------------|-----------------|
| Desktop UI | WPF (.NET 8) / WinUI 3 | **React 19 + Vite 6 + Tailwind CSS 4** |
| Base locale | SQLite (via EF Core) | **SQLite (via Knex + better-sqlite3)** |
| Reconnaissance vocale | Azure Speech SDK | **`webkitSpeechRecognition` (Chrome/Edge)** |
| OCR bons de livraison | Azure AI Doc Intelligence | **Différé** |
| Météo | API OpenWeatherMap | **API OpenWeatherMap** (conservé) |
| Backend / Sync | ASP.NET Core Web API | **Fastify (TypeScript)** |
| ERP Integration | REST / OData | **Différé** |
| Stockage photos | Azure Blob Storage | **Système de fichiers local** |

---

## 4. Modèle de données

Reprise fidèle du modèle `specs.md § 7.2`, adaptée pour SQLite + Knex.

### 4.1 Tables

#### `sites` (= Chantier dans specs.md)

| Colonne | Type SQLite | Nullable | Description |
|---------|-------------|----------|-------------|
| id | TEXT (UUID) | NOT NULL PK | Identifiant unique |
| code_chantier | TEXT(20) | NOT NULL | Code ERP |
| nom | TEXT(200) | NOT NULL | Nom du chantier |
| adresse | TEXT(500) | NOT NULL | Adresse complète |
| latitude | REAL | NULL | GPS |
| longitude | REAL | NULL | GPS |
| client | TEXT(200) | NOT NULL | Maître d'ouvrage |
| date_debut | TEXT (ISO date) | NOT NULL | Date début |
| date_fin_prevue | TEXT (ISO date) | NULL | Date fin prévisionnelle |
| statut | TEXT | NOT NULL | `en_cours` \| `termine` \| `suspendu` |
| created_at | TEXT (ISO datetime) | NOT NULL | Horodatage création |

#### `journal_chantier` (= JournalChantier dans specs.md)

| Colonne | Type SQLite | Nullable | Description |
|---------|-------------|----------|-------------|
| id | TEXT (UUID) | NOT NULL PK | |
| site_id | TEXT (FK → sites) | NOT NULL | |
| date | TEXT (ISO date) | NOT NULL | Date du journal |
| statut_rapport | TEXT | NOT NULL | `brouillon` \| `valide` \| `envoye` \| `erreur` |
| observations_generales | TEXT | NULL | Commentaires |
| created_at | TEXT (ISO datetime) | NOT NULL | |

**Contrainte unique** : `(site_id, date)` — un seul journal par chantier par jour.

#### `ouvriers` (= Ouvrier dans specs.md)

| Colonne | Type SQLite | Nullable | Description |
|---------|-------------|----------|-------------|
| id | TEXT (UUID) | NOT NULL PK | |
| nom | TEXT(100) | NOT NULL | |
| prenom | TEXT(100) | NOT NULL | |
| entreprise | TEXT(200) | NOT NULL | Interne ou sous-traitant |
| matricule | TEXT(20) | NULL | Matricule ERP |
| qualification_principale | TEXT(100) | NULL | Métier principal |
| created_at | TEXT (ISO datetime) | NOT NULL | |

#### `pointages` (= Pointage dans specs.md)

| Colonne | Type SQLite | Nullable | Description |
|---------|-------------|----------|-------------|
| id | TEXT (UUID) | NOT NULL PK | |
| journal_id | TEXT (FK → journal_chantier) | NOT NULL | |
| ouvrier_id | TEXT (FK → ouvriers) | NOT NULL | |
| heure_arrivee | TEXT (HH:MM) | NULL | |
| heure_depart | TEXT (HH:MM) | NULL | |
| statut | TEXT | NOT NULL | `present` \| `absent` \| `retard` \| `depart_anticipe` |
| qualification | TEXT(100) | NULL | Tâche/poste du jour |
| commentaire | TEXT | NULL | |
| source_saisie | TEXT | NOT NULL | `manuel` \| `vocal` |
| created_at | TEXT (ISO datetime) | NOT NULL | |

#### `meteo` (= Meteo dans specs.md)

| Colonne | Type SQLite | Nullable | Description |
|---------|-------------|----------|-------------|
| id | TEXT (UUID) | NOT NULL PK | |
| journal_id | TEXT (FK → journal_chantier) | NOT NULL | |
| periode | TEXT | NOT NULL | `matin` \| `apres_midi` |
| heure_releve | TEXT (HH:MM) | NOT NULL | |
| temperature_c | REAL | NOT NULL | |
| vent_kmh | REAL | NULL | |
| condition | TEXT | NOT NULL | `ensoleille` \| `nuageux` \| `pluie` \| `neige` \| `gel` \| `brouillard` \| `tempete` |
| precipitation_type | TEXT(50) | NULL | |
| precipitation_intensite | TEXT | NULL | `faible` \| `moderee` \| `forte` |
| impact | TEXT | NOT NULL | `favorable` \| `defavorable` |
| commentaire_impact | TEXT | NULL | Obligatoire si `defavorable` |
| source | TEXT | NOT NULL | `automatique` \| `manuel` |
| created_at | TEXT (ISO datetime) | NOT NULL | |

#### `presqu_accidents` (= PresquAccident dans specs.md)

| Colonne | Type SQLite | Nullable | Description |
|---------|-------------|----------|-------------|
| id | TEXT (UUID) | NOT NULL PK | |
| journal_id | TEXT (FK → journal_chantier) | NOT NULL | |
| date_heure | TEXT (ISO datetime) | NOT NULL | |
| lieu | TEXT(200) | NOT NULL | Localisation sur chantier |
| description | TEXT | NOT NULL | Description détaillée |
| categorie | TEXT | NOT NULL | `chute_hauteur` \| `chute_plain_pied` \| `chute_objet` \| `electrique` \| `ecrasement` \| `chimique` \| `incendie` \| `autre` |
| gravite_potentielle | TEXT | NOT NULL | `faible` \| `modere` \| `grave` \| `critique` |
| personnes_impliquees | TEXT | NULL | |
| temoins | TEXT | NULL | |
| action_immediate | TEXT | NULL | Actions correctives immédiates |
| action_planifiee | TEXT | NULL | Actions à planifier |
| action_responsable | TEXT(200) | NULL | |
| action_echeance | TEXT (ISO date) | NULL | |
| source_saisie | TEXT | NOT NULL | `manuel` \| `vocal` |
| created_at | TEXT (ISO datetime) | NOT NULL | |

#### `photos` (= Photo dans specs.md)

| Colonne | Type SQLite | Nullable | Description |
|---------|-------------|----------|-------------|
| id | TEXT (UUID) | NOT NULL PK | |
| journal_id | TEXT (FK → journal_chantier) | NOT NULL | |
| chemin_fichier | TEXT(500) | NOT NULL | Chemin local (uploads/) |
| original_name | TEXT(200) | NOT NULL | Nom fichier original |
| mime_type | TEXT(50) | NOT NULL | |
| date_heure_prise | TEXT (ISO datetime) | NOT NULL | |
| categorie | TEXT | NOT NULL | `anomalie` \| `avancement` \| `securite` \| `livraison` \| `autre` |
| description | TEXT | NULL | Commentaire |
| latitude | REAL | NULL | GPS |
| longitude | REAL | NULL | GPS |
| evenement_lie_id | TEXT | NULL | FK vers événement rattaché |
| evenement_lie_type | TEXT(50) | NULL | Type événement (`presqu_accident`, `pointage`…) |
| created_at | TEXT (ISO datetime) | NOT NULL | |

#### `daily_reports` (= Rapport dans specs.md)

| Colonne | Type SQLite | Nullable | Description |
|---------|-------------|----------|-------------|
| id | TEXT (UUID) | NOT NULL PK | |
| journal_id | TEXT (FK → journal_chantier) | NOT NULL UNIQUE | |
| content | TEXT | NOT NULL | Rapport structuré (JSON ou Markdown) |
| generated_at | TEXT (ISO datetime) | NOT NULL | |

### 4.2 Vue timeline (EvenementTimeline de specs.md)

Pas de table dédiée — vue construite côté API par requête multi-tables :

```sql
-- Pseudo-requête : union de tous les événements d'un journal
SELECT 'pointage' as type, created_at as date_heure, ... FROM pointages WHERE journal_id = ?
UNION ALL
SELECT 'meteo' as type, ... FROM meteo WHERE journal_id = ?
UNION ALL
SELECT 'presqu_accident' as type, ... FROM presqu_accidents WHERE journal_id = ?
UNION ALL
SELECT 'photo' as type, ... FROM photos WHERE journal_id = ?
ORDER BY date_heure DESC
```

---

## 5. Reconnaissance vocale — `webkitSpeechRecognition`

### 5.1 Choix technique vs specs.md

| Aspect | specs.md (VOC-01 à VOC-10) | MVP |
|--------|---------------------------|-----|
| Mode dictée (VOC-03) | ✅ | ✅ — Transcription brute vers champ actif |
| Mode commande / routage NLP (VOC-04, VOC-05) | Azure Language Understanding | ❌ Différé — pas de NLP |
| Langue (VOC-02) | FR + termes BTP | ✅ `lang: 'fr-FR'` — Chrome gère le vocabulaire courant |
| Feedback temps réel (VOC-06) | ✅ | ✅ `interimResults: true` |
| Confirmation avant enregistrement (VOC-07) | ✅ | ✅ Affichage transcript → bouton Valider/Annuler |
| Mode hors-ligne (VOC-08) | Windows Speech | ❌ `webkitSpeechRecognition` nécessite connexion |
| Historique commandes (VOC-10) | ✅ | ❌ Différé |

### 5.2 Hook `useWebkitSpeechRecognition`

```typescript
// Interface du hook
interface UseWebkitSpeechRecognitionReturn {
  transcript: string;          // Transcription finale
  interimTranscript: string;   // Transcription en cours (temps réel)
  isListening: boolean;
  isSupported: boolean;        // false si navigateur incompatible
  start: () => void;
  stop: () => void;
  error: string | null;
}

// Configuration
const recognition = new webkitSpeechRecognition();
recognition.lang = 'fr-FR';
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 1;
```

### 5.3 Compatibilité navigateur

| Navigateur | `webkitSpeechRecognition` | Notes |
|-----------|--------------------------|-------|
| Chrome (desktop + Android) | ✅ | Cible principale |
| Edge (Chromium) | ✅ | Fonctionne via webkit prefix |
| Firefox | ❌ | Pas de support |
| Safari | ❌ | Pas de support |

**Fallback** : si `!('webkitSpeechRecognition' in window)`, afficher un champ de saisie texte manuel et un message d'avertissement.

### 5.4 Détection sécurité par mots-clés

En remplacement du NLP (specs.md VOC-04/05), détection côté serveur via matching de mots-clés dans la transcription brute :

```typescript
// packages/shared/src/constants/safety-keywords.ts
export const SAFETY_KEYWORDS = [
  'accident', 'presqu\'accident', 'quasi-accident',
  'chute', 'tombé', 'glissé',
  'blessure', 'blessé', 'coupure',
  'incendie', 'feu', 'fumée',
  'éboulement', 'effondrement', 'écroulement',
  'électrocution', 'électrique',
  'écrasement', 'coincé', 'coincement',
  'danger', 'dangereux', 'urgence',
  'secours', 'pompier', 'samu',
  'intoxication', 'gaz', 'chimique',
  'fracture', 'hémorragie',
] as const;
```

Quand un mot-clé est détecté dans un événement vocal POST :
1. L'API retourne `{ safetyAlert: true, matchedKeywords: [...] }` dans la réponse
2. Le frontend affiche un bandeau d'alerte orange/rouge (composant `SafetyAlert`)
3. L'utilisateur peut convertir en déclaration de presqu'accident en 1 clic

---

## 6. API Routes

### 6.1 Sites

| Méthode | Route | Description | Réf. specs.md |
|---------|-------|-------------|---------------|
| GET | `/api/sites` | Lister les chantiers | AUTH-03, AUTH-04 |
| GET | `/api/sites/:siteId` | Détail d'un chantier | — |
| POST | `/api/sites` | Créer un chantier | — |

### 6.2 Journal

| Méthode | Route | Description | Réf. specs.md |
|---------|-------|-------------|---------------|
| GET | `/api/sites/:siteId/journal?date=YYYY-MM-DD` | Récupérer ou créer le journal du jour | AUTH-05 |

Le journal est créé automatiquement (upsert) à la première requête pour un site + date donné.

### 6.3 Timeline

| Méthode | Route | Description | Réf. specs.md |
|---------|-------|-------------|---------------|
| GET | `/api/sites/:siteId/timeline?date=YYYY-MM-DD&type=...` | Événements agrégés multi-tables | TML-01 à TML-13 |

Paramètres de filtrage : `type` (multi-valeur), `search` (texte), `from`/`to` (plage horaire).

### 6.4 Pointage

| Méthode | Route | Description | Réf. specs.md |
|---------|-------|-------------|---------------|
| GET | `/api/sites/:siteId/pointage?date=YYYY-MM-DD` | Liste des pointages du jour | PTG-01 |
| POST | `/api/sites/:siteId/pointage` | Ajouter un pointage | PTG-02 à PTG-05 |
| PUT | `/api/sites/:siteId/pointage/:id` | Modifier un pointage | — |
| GET | `/api/ouvriers?search=...` | Rechercher un ouvrier | PTG-06 |
| POST | `/api/ouvriers` | Ajouter un ouvrier | — |

### 6.5 Météo

| Méthode | Route | Description | Réf. specs.md |
|---------|-------|-------------|---------------|
| GET | `/api/sites/:siteId/meteo?date=YYYY-MM-DD` | Relevés météo du jour (matin + PM) | MTO-01 |
| POST | `/api/sites/:siteId/meteo` | Saisir/maj un relevé | MTO-02 à MTO-07 |
| GET | `/api/sites/:siteId/meteo/auto` | Pré-remplissage API OpenWeatherMap | MTO-03 |

### 6.6 Sécurité / Presqu'accidents

| Méthode | Route | Description | Réf. specs.md |
|---------|-------|-------------|---------------|
| GET | `/api/sites/:siteId/securite?date=YYYY-MM-DD` | Liste presqu'accidents | SEC-01 |
| POST | `/api/sites/:siteId/securite` | Déclarer un presqu'accident | SEC-02 à SEC-12 |
| GET | `/api/sites/:siteId/securite/:id` | Détail avec photos | SEC-08 |
| PUT | `/api/sites/:siteId/securite/:id` | Modifier | — |

### 6.7 Photos

| Méthode | Route | Description | Réf. specs.md |
|---------|-------|-------------|---------------|
| POST | `/api/sites/:siteId/photos` | Upload multipart (file + métadonnées) | PHO-01 à PHO-04 |
| GET | `/api/sites/:siteId/photos?date=YYYY-MM-DD&categorie=...` | Galerie du jour | PHO-07 |
| GET | `/api/photos/:id/file` | Servir le fichier image | — |
| PUT | `/api/photos/:id` | Modifier description/catégorie | — |

### 6.8 Rapport

| Méthode | Route | Description | Réf. specs.md |
|---------|-------|-------------|---------------|
| POST | `/api/sites/:siteId/rapport/generate?date=YYYY-MM-DD` | Générer le rapport du jour | RPT-01 à RPT-02 |
| GET | `/api/sites/:siteId/rapport?date=YYYY-MM-DD` | Récupérer le rapport | — |

### 6.9 Validation des entrées

Toutes les routes utilisent les **JSON schemas Fastify** pour valider les payloads. Exemples de règles métier validées côté API :

- `meteo.commentaire_impact` obligatoire si `impact === 'defavorable'` (MTO-06)
- `presqu_accidents.gravite_potentielle` doit être dans l'enum autorisé (SEC-03)
- Photos : mime_type limité à `image/jpeg`, `image/png`, `image/webp`
- Upload photos : taille max 10 MB

---

## 7. Écrans et composants (mapping specs.md § Annexe A)

### Pages React

| Page | Écran(s) specs.md | Description |
|------|-------------------|-------------|
| `SiteSelector` | E-AUTH-02 | Sélection du chantier actif (liste, recherche, dernier utilisé) |
| `Timeline` | E-TML-01 | Vue chronologique centrale avec filtres, compteurs, recherche |
| `Pointage` | E-PTG-01, E-PTG-02, E-PTG-03 | Liste ouvriers, formulaire ajout/modif, récap par entreprise |
| `Meteo` | E-MTO-01, E-MTO-02 | Carte météo matin/PM, formulaire saisie |
| `Securite` | E-SEC-01, E-SEC-02, E-SEC-03 | Liste presqu'accidents, formulaire déclaration, fiche détaillée |
| `Photos` | E-PHO-01, E-PHO-02, E-PHO-03 | Galerie miniatures, vue plein écran, capture |
| `Rapport` | E-RPT-01 | Prévisualisation rapport structuré |

### Composants partagés

| Composant | Fonction |
|-----------|----------|
| `VoiceRecorder` | Overlay dictée vocale (E-VOC-01) : animation micro, transcript temps réel, [Valider]/[Annuler] (E-VOC-02) |
| `PhotoCapture` | Capture via `<input capture>` + géoloc GPS |
| `EventCard` | Carte événement timeline (icône type, heure, titre, aperçu) |
| `SafetyAlert` | Bandeau alerte sécurité (mots-clés détectés) |
| `DatePicker` | Navigation par date (calendrier) — TML-11 |
| `SideNav` | Barre de navigation latérale (specs.md § 6.2) |
| `Toast` | Notifications feedback (UX-05) |

### Navigation

```
/ → SiteSelector
/:siteId → Timeline (vue par défaut)
/:siteId/pointage → Pointage
/:siteId/meteo → Meteo
/:siteId/securite → Securite
/:siteId/securite/:id → Détail presqu'accident
/:siteId/photos → Galerie photos
/:siteId/rapport → Rapport
```

---

## 8. Ergonomie et design (mapping specs.md § 6)

### 8.1 Principes conservés

| Réf. | Principe | Implémentation |
|------|----------|----------------|
| UX-01 | Gros boutons, zones larges | Tailwind : `min-h-12 min-w-12`, touch targets 48px |
| UX-02 | Contraste élevé | Tailwind palette avec ratios WCAG AA |
| UX-03 | Navigation 1 clic | `SideNav` avec icônes + texte + liens directs |
| UX-04 | Saisie minimale | Pré-remplissage météo, listes déroulantes, vocal |
| UX-05 | Feedback immédiat | Toast component auto-dismiss |
| UX-06 | Mode sombre | Tailwind `dark:` classes (optionnel, phase UI polish) |
| UX-09 | Persistance automatique | Auto-save sur blur/change (pas de bouton "Sauvegarder") |

### 8.2 Adaptation web (vs Desktop)

| specs.md | MVP Web |
|----------|---------|
| UX-07 Responsive 13"-24" | Responsive 375px (mobile) à 1920px |
| UX-08 Raccourcis clavier | Différé (pas prioritaire sur mobile) |
| UX-10 Indicateur hors-ligne | Différé (pas de mode offline MVP) |

### 8.3 Charte visuelle (conservée de specs.md § 6.3)

| Élément | Valeur |
|---------|--------|
| Police | Inter (web) — alternative à Segoe UI |
| Taille base | 16px |
| Couleur primaire | `#0078D4` |
| Couleur danger | `#D13438` |
| Couleur succès | `#107C10` |
| Couleur warning | `#FFB900` |
| Bordures | `rounded-lg` (8px) |
| Espacement | Grille 8px (Tailwind `space-*`, `gap-*`) |

---

## 9. Plan d'implémentation par phases

### Phase 1 — Scaffolding (P0)

| # | Tâche | Fichiers | Critère de validation |
|---|-------|----------|----------------------|
| 1 | Init pnpm workspace | `pnpm-workspace.yaml`, root `package.json` | `pnpm install` OK |
| 2 | Config TS partagée | `tsconfig.base.json` | tsc --noEmit OK |
| 3 | Package shared: types + constantes | `packages/shared/src/**` | Import depuis apps/ OK |
| 4 | Scaffold apps/web (Vite + React + TS) | `apps/web/**` | `pnpm --filter web dev` démarre |
| 5 | Scaffold apps/api (Fastify + TS) | `apps/api/**` | `pnpm --filter api dev` démarre |
| 6 | Tailwind CSS setup | `apps/web/tailwind.config.ts` | Classes utilitaires appliquées |

### Phase 2 — Base de données & API de base (P0)

| # | Tâche | Fichiers | Critère de validation |
|---|-------|----------|----------------------|
| 7 | Knex config SQLite | `apps/api/src/db/knexfile.ts`, `plugins/db.ts` | `knex migrate:latest` OK |
| 8 | Migrations (8 tables) | `apps/api/src/db/migrations/001-008` | Toutes les tables créées |
| 9 | Seed données de test | `apps/api/src/db/seeds/001_sample_site.ts` | Chantier + ouvriers insérés |
| 10 | Route sites (GET/POST) | `apps/api/src/routes/sites.ts` | `curl /api/sites` → 200 |
| 11 | Route journal (GET upsert) | `apps/api/src/routes/events.ts` | Journal créé auto |
| 12 | Route timeline (agrégation) | `apps/api/src/routes/events.ts` | Événements multi-tables |

### Phase 3 — Modules fonctionnels backend (P0+P1)

| # | Tâche | Fichiers | Critère de validation |
|---|-------|----------|----------------------|
| 13 | Routes pointage CRUD | `apps/api/src/routes/pointage.ts` | POST/GET/PUT testés |
| 14 | Routes météo CRUD + API externe | `apps/api/src/routes/meteo.ts`, `services/meteo-api.ts` | Pré-remplissage OpenWeather OK |
| 15 | Routes presqu'accidents CRUD | `apps/api/src/routes/securite.ts` | Formulaire complet persisté |
| 16 | Routes photos upload + serve | `apps/api/src/routes/photos.ts` | Upload multipart + GET file OK |
| 17 | Safety keyword detector | `apps/api/src/services/safety-detector.ts` | "accident" → safetyAlert: true |
| 18 | Générateur de rapport | `apps/api/src/services/report-generator.ts` | Rapport structuré avec toutes sections |

### Phase 4 — Frontend core (P0)

| # | Tâche | Fichiers | Critère de validation |
|---|-------|----------|----------------------|
| 19 | Hook `useWebkitSpeechRecognition` | `apps/web/src/hooks/useWebkitSpeechRecognition.ts` | Dictée FR, transcript temps réel |
| 20 | Hooks `useGeolocation` + `useCamera` | `apps/web/src/hooks/` | GPS + capture photo fonctionnels |
| 21 | API service typé | `apps/web/src/services/api.ts` | Appels fetch typés |
| 22 | Store Zustand | `apps/web/src/stores/appStore.ts` | Site actif + date persistés |
| 23 | Page SiteSelector | `apps/web/src/pages/SiteSelector.tsx` | Sélection chantier fonctionnelle |
| 24 | Page Timeline | `apps/web/src/pages/Timeline.tsx` | Événements affichés, filtres, compteurs |
| 25 | Composant VoiceRecorder | `apps/web/src/components/VoiceRecorder.tsx` | Overlay vocal → transcription → POST |

### Phase 5 — Modules fonctionnels frontend (P0+P1)

| # | Tâche | Fichiers | Critère de validation |
|---|-------|----------|----------------------|
| 26 | Page Pointage | `apps/web/src/pages/Pointage.tsx` + composants | Saisie ouvrier, tableau, vocal |
| 27 | Page Météo | `apps/web/src/pages/Meteo.tsx` + composants | Carte matin/PM, pré-remplissage |
| 28 | Page Sécurité | `apps/web/src/pages/Securite.tsx` + composants | Déclaration presqu'accident, photos rattachées |
| 29 | Page Photos | `apps/web/src/pages/Photos.tsx` + composants | Galerie, capture, vue plein écran |
| 30 | Page Rapport | `apps/web/src/pages/Rapport.tsx` | Génération, prévisualisation |
| 31 | Composant SafetyAlert | `apps/web/src/components/SafetyAlert.tsx` | Bandeau après détection mot-clé |

### Phase 6 — UI Polish (P1)

| # | Tâche | Critère de validation |
|---|-------|-----------------------|
| 32 | Navigation latérale (SideNav) | Accès 1 clic tous modules |
| 33 | Design system : couleurs, typographie, espacement | Charte visuelle appliquée |
| 34 | Icônes par type événement | Visuels timeline corrects |
| 35 | States : loading, error, empty | UX fluide sans flicker |
| 36 | Responsive 375px → 1920px | Utilisable sur PC portable de chantier ET mobile |

---

## 10. Exigences non fonctionnelles retenues (mapping specs.md § 8)

| Réf. | Exigence | Cible MVP | Notes |
|------|----------|-----------|-------|
| PERF-01 | Temps démarrage app | < 3s | Vite fast refresh + code splitting |
| PERF-02 | Temps réponse saisie | < 200ms | SQLite local, pas de latence réseau |
| PERF-03 | Transcription vocale | < 2s | Dépend de `webkitSpeechRecognition` (réseau) |
| REL-01 | Mode hors-ligne 100% | ❌ Différé | `webkitSpeechRecognition` nécessite Internet |
| REL-05 | Base SQLite | ✅ | Fichier local, durable |
| REL-06 | WAL mode | ✅ | `PRAGMA journal_mode=WAL` dans Knex config |
| SEC-NFR-03 | HTTPS | ✅ en prod | Dev en HTTP localhost |
| ACC-03 | Contraste WCAG AA | ✅ | Tailwind palette vérifiée |

---

## 11. Hypothèses et risques

### Hypothèses

1. **Navigateur cible** : Chrome ou Edge (Chromium) — seuls à supporter `webkitSpeechRecognition`
2. **Connexion Internet** : requise pour la dictée vocale et le pré-remplissage météo
3. **Mono-utilisateur** : pas de gestion de droits, pas de conflits concurrents
4. **Un seul chantier actif** à la fois dans l'application
5. **Stockage photos local** : suffisant pour le volume MVP (< 1000 photos/chantier)

### Risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| `webkitSpeechRecognition` peu fiable en milieu bruyant (chantier) | Dégradé | Fallback saisie texte, test en conditions réelles |
| Chrome requis (Firefox/Safari exclus) | Limitation adoption | Documenter clairement, migration Azure Speech possible |
| SQLite mono-utilisateur | Bloquant si multi-user | Migration PostgreSQL planifiable sans refonte (Knex abstrait le driver) |
| Pas de mode offline | Inutilisable en zone blanche | PWA + service worker en phase future |
| Vocabulaire BTP mal reconnu par Speech API | Qualité basse | Glossaire d'aide, correction manuelle post-dictée |

---

## 12. Vérification end-to-end

### Scénario de validation MVP (parcours specs.md § 5.1)

1. **Ouverture** → SiteSelector → sélectionner "Chantier Résidence Les Pins"
2. **07:00 — Pointage** → Page Pointage → ajouter 3 ouvriers (dont 1 par vocal)
3. **08:00 — Météo matin** → Page Météo → pré-remplissage auto + validation
4. **10:30 — Presqu'accident** → VoiceRecorder → dicter "presqu'accident zone coffrage niveau 2, chute d'un panneau" → SafetyAlert affiché → convertir en déclaration → ajouter 2 photos
5. **14:00 — Météo PM** → saisie manuelle "pluie modérée, défavorable, arrêt coulage"
6. **16:30 — Photos avancement** → capturer 2 photos catégorie "avancement"
7. **17:00 — Rapport** → Page Rapport → Générer → prévisualiser le rapport structuré
8. **Timeline** → tous les événements apparaissent chronologiquement avec icônes, filtres fonctionnels, compteurs corrects
