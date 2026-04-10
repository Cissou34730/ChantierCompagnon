# ChantierCompagnon Implementation Specification

Version: 2.0  
Date: April 10, 2026  
Status: Draft  
Source of truth: `docs/specs.md`

## 1. Document Purpose

This document converts the functional specification in `docs/specs.md` into an implementation-ready technical specification for a TypeScript-based solution.

It is intentionally more concrete than the functional document. It defines:

- the target architecture
- the MVP scope and deferred scope
- the repository and package structure
- the domain model and TypeScript contracts
- the API surface
- the expected frontend behavior
- the voice-recognition approach
- the storage and file-handling strategy
- the implementation phases and acceptance criteria

This specification supersedes the original desktop-oriented technical choices in `docs/specs.md` where they conflict with the current product direction.

## 2. Product Summary

ChantierCompagnon is a construction site journal application used by site managers to record day-to-day operational events such as attendance, weather, safety incidents, and photos, then generate a structured daily report.

The implementation target for the first version is:

- frontend: React + Vite + TypeScript
- backend: Fastify + TypeScript
- database: SQLite
- query layer: Knex
- voice recognition: browser-native `webkitSpeechRecognition`
- deployment shape: monorepo with shared TypeScript contracts

The application must support a voice-first workflow, but in the MVP the voice layer is limited to browser transcription and confirmation, not intent routing through Azure or another NLP platform.

## 3. Core Product Goals

The implementation must directly support the business goals described in `docs/specs.md`.

### 3.1 Primary goals

1. Replace paper-based site journals with a structured digital workflow.
2. Reduce daily reporting time for site managers.
3. Improve traceability for safety-related events.
4. Centralize operational data for report generation.
5. Keep the initial product simple enough to deploy quickly.

### 3.2 MVP success criteria

The MVP is considered successful if a site manager can:

1. Select an active construction site.
2. Record attendance entries for workers.
3. Record weather for morning and afternoon.
4. Create a near-miss or safety event.
5. Capture and categorize photos.
6. Use voice input through `webkitSpeechRecognition` to populate text content.
7. View all recorded data in a daily timeline.
8. Generate a structured daily report from recorded data.

## 4. Mandatory Technical Decisions

The following choices are fixed for this version.

| Topic | Decision | Notes |
|------|----------|-------|
| Frontend | React + Vite + TypeScript | Browser-based UI |
| Backend | Fastify + TypeScript | REST API |
| Database | SQLite | Local-first persistence for the application runtime |
| Query layer | Knex | SQL migrations and query abstraction |
| Voice recognition | `webkitSpeechRecognition` only | No Azure Speech in this version |
| LLM / NLP | Not used | No intent extraction in MVP |
| Monorepo | pnpm workspaces | Shared contracts between frontend and backend |
| Shared types | Dedicated shared package | API contracts and enums live in one place |
| Authentication | Deferred | MVP assumes controlled access environment |
| ERP export | Deferred | Report generation only in MVP |
| OCR delivery note extraction | Deferred | No Azure Document Intelligence |
| Full offline sync | Deferred | Can be designed later without changing domain model |

## 5. Constraints and Deviations from the Functional Spec

`docs/specs.md` describes a desktop Windows application with Azure-backed services and offline support. This implementation deliberately differs in several areas.

### 5.1 Replaced assumptions

| Functional spec assumption | Implementation choice |
|------|------|
| Desktop UI with WPF/WinUI | Web application built with React |
| ASP.NET backend | Fastify backend |
| Azure Speech SDK | Browser-native `webkitSpeechRecognition` |
| Azure Document Intelligence | Deferred |
| Azure Blob Storage | Local file storage for MVP |
| Entra ID / Azure AD auth | Deferred |
| ERP connector in v1 | Deferred |

### 5.2 Consequences of using `webkitSpeechRecognition`

1. Voice input works only in browsers that expose `webkitSpeechRecognition`.
2. Chrome and Edge Chromium are the primary supported browsers.
3. Firefox is not supported for voice capture.
4. Safari support must be treated as unavailable for this project.
5. Network connectivity is generally required for browser speech recognition.
6. A manual text fallback must exist everywhere voice capture is offered.
7. There is no reliable structured command extraction in MVP.
8. Voice is treated as transcription assistance, not an autonomous command router.

## 6. Target Users and Environment

### 6.1 Primary user

Primary user: site manager working on a construction site.

Important characteristics:

- often working under time pressure
- often standing or moving during use
- may have gloves or dirty hands
- may work in noisy conditions
- may use a laptop or tablet with Chrome/Edge
- needs very low-friction data entry

### 6.2 Secondary user

Secondary user: project or works supervisor reviewing generated reports.

### 6.3 Usage context

The UI must be usable:

- on Windows laptops in a site office
- on tablets with touch input
- in variable lighting conditions
- with limited but not absent connectivity for MVP

## 7. Scope Definition

### 7.1 MVP scope

The MVP includes the following modules.

| Functional area | Included in MVP | Implementation notes |
|------|------|------|
| Site selection | Yes | No login, simple active-site selection |
| Timeline | Yes | Central daily event feed |
| Attendance | Yes | Manual forms and optional voice-filled text fields |
| Weather | Yes | Manual entry with optional weather API prefill |
| Safety / near misses | Yes | Structured form, photo attachment, keyword warning |
| Photos | Yes | Upload/capture, category, description, gallery |
| Report generation | Yes | Structured report stored locally |
| Voice overlay | Yes | `webkitSpeechRecognition` transcription and confirmation |

### 7.2 Deferred scope

The following items are explicitly out of MVP scope.

| Functional area | Status | Reason |
|------|------|------|
| Authentication / SSO | Deferred | Not required for first delivery |
| ERP export | Deferred | Requires enterprise-specific mapping and integration |
| Delivery notes OCR | Deferred | Requires OCR service |
| Equipment tracking | Deferred | Important but not required for first usable release |
| Full offline mode with sync queue | Deferred | Requires service worker, queueing and conflict rules |
| Photo annotations | Deferred | Adds complex canvas editing UX |
| Safety notification workflow | Deferred | Requires user and role model |
| Report signature workflow | Deferred | Depends on auth and identity model |

## 8. Repository Structure

The repository should be organized as a TypeScript monorepo.

```text
ChantierCompagnon/
  apps/
    api/
      src/
        db/
        plugins/
        routes/
        services/
        schemas/
        utils/
        server.ts
      uploads/
      package.json
      tsconfig.json
    web/
      src/
        app/
        components/
        features/
        hooks/
        pages/
        services/
        stores/
        styles/
        utils/
        main.tsx
      package.json
      tsconfig.json
      vite.config.ts
  packages/
    shared/
      src/
        contracts/
        constants/
        enums/
        types/
        index.ts
      package.json
      tsconfig.json
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
```

## 9. Package Responsibilities

### 9.1 `packages/shared`

This package contains all runtime-safe shared contracts between frontend and backend.

It must include:

- enums used by both applications
- public API request and response types
- domain DTOs
- shared constants such as safety keywords
- shared validation helpers only if they do not depend on browser or server runtime APIs

It must not include:

- database access code
- React-specific code
- Fastify-specific code

### 9.2 `apps/api`

Responsibilities:

- expose REST endpoints
- validate incoming payloads
- manage SQLite persistence
- build timeline responses
- manage file uploads for photos
- call external weather API
- generate structured reports
- run safety keyword detection on transcribed content

### 9.3 `apps/web`

Responsibilities:

- render all screens
- manage the active site and active date state
- capture voice input through `webkitSpeechRecognition`
- collect manual form input
- capture or upload photos
- display timeline and detailed modules
- trigger report generation

## 10. Architecture Overview

### 10.1 Logical architecture

```text
Browser UI (React)
  -> typed API client
  -> Fastify REST API
  -> SQLite database
  -> local uploads directory

Optional external service:
  -> weather API for automatic prefill
```

### 10.2 Data flow summary

1. User selects a site and date.
2. Frontend loads or creates the daily journal context.
3. User records information through manual forms, photo capture, or voice-assisted text entry.
4. Frontend submits validated requests to the API.
5. API writes normalized records to SQLite.
6. Timeline endpoint aggregates data from all feature tables into a unified event feed.
7. Report generation endpoint composes a daily summary from persisted records.

## 11. Domain Model

The functional document contains a broad data model. The implementation retains the same business concepts but normalizes them for the MVP.

### 11.1 Core entities

The MVP will implement these persisted entities:

- Site
- JournalDay
- Worker
- AttendanceEntry
- WeatherEntry
- SafetyIncident
- PhotoRecord
- DailyReport

The timeline is not persisted as a dedicated table in the first version. It is computed on demand from feature-specific records.

### 11.2 Shared enums

```ts
export type SiteStatus = 'active' | 'suspended' | 'completed';

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'left_early';

export type WeatherPeriod = 'morning' | 'afternoon';

export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'frost'
  | 'fog'
  | 'storm';

export type WeatherImpact = 'favorable' | 'unfavorable';

export type SafetySeverity = 'low' | 'moderate' | 'high' | 'critical';

export type SafetyCategory =
  | 'fall_from_height'
  | 'slip_trip_fall'
  | 'falling_object'
  | 'electrical'
  | 'crush_or_entrapment'
  | 'chemical'
  | 'fire'
  | 'other';

export type PhotoCategory =
  | 'anomaly'
  | 'progress'
  | 'safety'
  | 'delivery'
  | 'other';

export type ReportStatus =
  | 'draft'
  | 'pending_validation'
  | 'validated'
  | 'sent'
  | 'send_error';

export type InputSource = 'manual' | 'voice' | 'automatic';

export type TimelineEventType =
  | 'attendance'
  | 'weather'
  | 'safety'
  | 'photo'
  | 'note';

export type TimelineImportance = 'normal' | 'important' | 'critical';
```

### 11.3 Shared TypeScript contracts

The following contracts must exist in `packages/shared`.

#### 11.3.1 Site

```ts
export interface Site {
  id: string;
  code: string;
  name: string;
  address: string;
  clientName: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  expectedEndDate: string | null;
  status: SiteStatus;
  createdAt: string;
}
```

#### 11.3.2 Journal day

```ts
export interface JournalDay {
  id: string;
  siteId: string;
  date: string;
  reportStatus: ReportStatus;
  generalObservations: string | null;
  createdAt: string;
}
```

#### 11.3.3 Worker

```ts
export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  employeeCode: string | null;
  primaryQualification: string | null;
  createdAt: string;
}
```

#### 11.3.4 Attendance entry

```ts
export interface AttendanceEntry {
  id: string;
  journalDayId: string;
  workerId: string;
  arrivalTime: string | null;
  departureTime: string | null;
  status: AttendanceStatus;
  assignedTask: string | null;
  comment: string | null;
  inputSource: InputSource;
  createdAt: string;
}

export interface CreateAttendanceEntryRequest {
  workerId: string;
  arrivalTime?: string | null;
  departureTime?: string | null;
  status: AttendanceStatus;
  assignedTask?: string | null;
  comment?: string | null;
  inputSource: InputSource;
}
```

#### 11.3.5 Weather entry

```ts
export interface WeatherEntry {
  id: string;
  journalDayId: string;
  period: WeatherPeriod;
  recordedAtTime: string;
  temperatureCelsius: number;
  windKmh: number | null;
  condition: WeatherCondition;
  precipitationType: string | null;
  precipitationIntensity: 'low' | 'moderate' | 'high' | null;
  impact: WeatherImpact;
  impactComment: string | null;
  source: 'manual' | 'automatic';
  createdAt: string;
}
```

#### 11.3.6 Safety incident

```ts
export interface SafetyIncident {
  id: string;
  journalDayId: string;
  occurredAt: string;
  location: string;
  description: string;
  category: SafetyCategory;
  potentialSeverity: SafetySeverity;
  involvedPeople: string | null;
  witnesses: string | null;
  immediateActions: string | null;
  plannedActions: string | null;
  actionOwner: string | null;
  actionDueDate: string | null;
  inputSource: InputSource;
  createdAt: string;
}
```

#### 11.3.7 Photo record

```ts
export interface PhotoRecord {
  id: string;
  journalDayId: string;
  filePath: string;
  originalFileName: string;
  mimeType: string;
  capturedAt: string;
  category: PhotoCategory;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  linkedEntityId: string | null;
  linkedEntityType: 'safety' | 'attendance' | 'weather' | 'note' | null;
  createdAt: string;
}
```

#### 11.3.8 Timeline event

```ts
export interface TimelineEvent {
  id: string;
  journalDayId: string;
  type: TimelineEventType;
  occurredAt: string;
  title: string;
  preview: string;
  importance: TimelineImportance;
  hasPhotos: boolean;
  inputSource: InputSource;
  photoThumbnailUrl?: string | null;
  linkedEntityId: string;
}
```

#### 11.3.9 Report

```ts
export interface DailyReport {
  id: string;
  journalDayId: string;
  status: ReportStatus;
  generatedAt: string;
  contentMarkdown: string;
}
```

## 12. Database Design

### 12.1 Database engine

SQLite is the persistence layer for the API.

Requirements:

1. Use `better-sqlite3` for the runtime driver.
2. Use Knex migrations for schema creation and evolution.
3. Enable WAL mode on startup.
4. Use ISO date and datetime strings in UTC for persisted timestamps.
5. Use UUID strings for all entity identifiers.

### 12.2 Tables

#### 12.2.1 `sites`

Columns:

- `id TEXT PRIMARY KEY`
- `code TEXT NOT NULL`
- `name TEXT NOT NULL`
- `address TEXT NOT NULL`
- `client_name TEXT NOT NULL`
- `latitude REAL NULL`
- `longitude REAL NULL`
- `start_date TEXT NOT NULL`
- `expected_end_date TEXT NULL`
- `status TEXT NOT NULL`
- `created_at TEXT NOT NULL`

Constraints:

- `status` must be one of `active`, `suspended`, `completed`
- `code` should be unique

#### 12.2.2 `journal_days`

Columns:

- `id TEXT PRIMARY KEY`
- `site_id TEXT NOT NULL`
- `date TEXT NOT NULL`
- `report_status TEXT NOT NULL`
- `general_observations TEXT NULL`
- `created_at TEXT NOT NULL`

Constraints:

- foreign key `site_id -> sites.id`
- unique composite index on `(site_id, date)`

#### 12.2.3 `workers`

Columns:

- `id TEXT PRIMARY KEY`
- `first_name TEXT NOT NULL`
- `last_name TEXT NOT NULL`
- `company_name TEXT NOT NULL`
- `employee_code TEXT NULL`
- `primary_qualification TEXT NULL`
- `created_at TEXT NOT NULL`

#### 12.2.4 `attendance_entries`

Columns:

- `id TEXT PRIMARY KEY`
- `journal_day_id TEXT NOT NULL`
- `worker_id TEXT NOT NULL`
- `arrival_time TEXT NULL`
- `departure_time TEXT NULL`
- `status TEXT NOT NULL`
- `assigned_task TEXT NULL`
- `comment TEXT NULL`
- `input_source TEXT NOT NULL`
- `created_at TEXT NOT NULL`

#### 12.2.5 `weather_entries`

Columns:

- `id TEXT PRIMARY KEY`
- `journal_day_id TEXT NOT NULL`
- `period TEXT NOT NULL`
- `recorded_at_time TEXT NOT NULL`
- `temperature_celsius REAL NOT NULL`
- `wind_kmh REAL NULL`
- `condition TEXT NOT NULL`
- `precipitation_type TEXT NULL`
- `precipitation_intensity TEXT NULL`
- `impact TEXT NOT NULL`
- `impact_comment TEXT NULL`
- `source TEXT NOT NULL`
- `created_at TEXT NOT NULL`

Validation rule:

- `impact_comment` is required when `impact = 'unfavorable'`

#### 12.2.6 `safety_incidents`

Columns:

- `id TEXT PRIMARY KEY`
- `journal_day_id TEXT NOT NULL`
- `occurred_at TEXT NOT NULL`
- `location TEXT NOT NULL`
- `description TEXT NOT NULL`
- `category TEXT NOT NULL`
- `potential_severity TEXT NOT NULL`
- `involved_people TEXT NULL`
- `witnesses TEXT NULL`
- `immediate_actions TEXT NULL`
- `planned_actions TEXT NULL`
- `action_owner TEXT NULL`
- `action_due_date TEXT NULL`
- `input_source TEXT NOT NULL`
- `created_at TEXT NOT NULL`

#### 12.2.7 `photos`

Columns:

- `id TEXT PRIMARY KEY`
- `journal_day_id TEXT NOT NULL`
- `file_path TEXT NOT NULL`
- `original_file_name TEXT NOT NULL`
- `mime_type TEXT NOT NULL`
- `captured_at TEXT NOT NULL`
- `category TEXT NOT NULL`
- `description TEXT NULL`
- `latitude REAL NULL`
- `longitude REAL NULL`
- `linked_entity_id TEXT NULL`
- `linked_entity_type TEXT NULL`
- `created_at TEXT NOT NULL`

#### 12.2.8 `daily_reports`

Columns:

- `id TEXT PRIMARY KEY`
- `journal_day_id TEXT NOT NULL UNIQUE`
- `status TEXT NOT NULL`
- `content_markdown TEXT NOT NULL`
- `generated_at TEXT NOT NULL`

## 13. API Design

The API is REST-based and JSON-first, except for multipart photo uploads.

All endpoints are prefixed by `/api`.

### 13.1 General API principles

1. Every write endpoint validates its payload with Fastify schema.
2. Every endpoint returns typed JSON responses matching `packages/shared` contracts.
3. All timestamps are returned as ISO UTC strings.
4. Errors are returned in a consistent envelope.

#### 13.1.1 Error response shape

```ts
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### 13.2 Sites

#### `GET /api/sites`

Purpose: list available construction sites.

Response:

```ts
interface GetSitesResponse {
  items: Site[];
}
```

#### `GET /api/sites/:siteId`

Purpose: retrieve one site.

#### `POST /api/sites`

Purpose: create a site record.

Request:

```ts
interface CreateSiteRequest {
  code: string;
  name: string;
  address: string;
  clientName: string;
  latitude?: number | null;
  longitude?: number | null;
  startDate: string;
  expectedEndDate?: string | null;
}
```

### 13.3 Journal day lifecycle

#### `GET /api/sites/:siteId/journal-days/:date`

Purpose: fetch the journal for a specific site/date, creating it if it does not exist yet.

Response:

```ts
interface GetJournalDayResponse {
  item: JournalDay;
}
```

Behavior:

1. Validate `date` as `YYYY-MM-DD`.
2. If a record exists, return it.
3. If not, create it with status `draft`.

### 13.4 Timeline

#### `GET /api/sites/:siteId/timeline`

Query parameters:

- `date` required
- `types` optional comma-separated list
- `search` optional full-text-like filter on title/preview
- `fromTime` optional `HH:mm`
- `toTime` optional `HH:mm`

Response:

```ts
interface GetTimelineResponse {
  date: string;
  siteId: string;
  counters: {
    attendance: number;
    weather: number;
    safety: number;
    photo: number;
    note: number;
  };
  items: TimelineEvent[];
}
```

Aggregation rules:

1. Attendance entries create timeline events with summary counts or individual cards depending on UI mode.
2. Weather creates one event per period.
3. Safety incidents always create high-importance or critical events.
4. Photos create separate timeline events unless explicitly attached to another entity and hidden by a future UX option.
5. Results are sorted by `occurredAt` descending by default.

### 13.5 Workers

#### `GET /api/workers`

Query parameters:

- `search` optional

Response: `Worker[]`

#### `POST /api/workers`

Purpose: create a worker for attendance usage.

### 13.6 Attendance

#### `GET /api/sites/:siteId/attendance`

Query parameters:

- `date` required

Response:

```ts
interface GetAttendanceResponse {
  items: AttendanceEntry[];
  summary: {
    totalWorkers: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    leftEarlyCount: number;
  };
}
```

#### `POST /api/sites/:siteId/attendance`

Purpose: create an attendance record for the journal day.

#### `PUT /api/sites/:siteId/attendance/:attendanceId`

Purpose: update an attendance record.

### 13.7 Weather

#### `GET /api/sites/:siteId/weather`

Query parameters:

- `date` required

#### `GET /api/sites/:siteId/weather/prefill`

Purpose: call the weather API using site coordinates and return a prefill object for the current period.

Response:

```ts
interface WeatherPrefillResponse {
  suggested: Pick<
    WeatherEntry,
    'temperatureCelsius' | 'windKmh' | 'condition' | 'precipitationType'
  >;
  source: 'openweather';
}
```

#### `POST /api/sites/:siteId/weather`

Rules:

1. Only one morning and one afternoon record per journal day are required.
2. Multiple edits are allowed.
3. Unfavorable impact requires an impact comment.

### 13.8 Safety incidents

#### `GET /api/sites/:siteId/safety-incidents`

Query parameters:

- `date` required
- `severity` optional
- `category` optional

#### `POST /api/sites/:siteId/safety-incidents`

Purpose: create a near-miss / safety incident.

Request payload fields:

- `occurredAt`
- `location`
- `description`
- `category`
- `potentialSeverity`
- optional free-text corrective actions and witness fields
- `inputSource`

#### `GET /api/sites/:siteId/safety-incidents/:incidentId`

Response should include linked photos.

### 13.9 Photos

#### `POST /api/sites/:siteId/photos`

Multipart fields:

- `file` required
- `date` required
- `capturedAt` required
- `category` required
- `description` optional
- `latitude` optional
- `longitude` optional
- `linkedEntityId` optional
- `linkedEntityType` optional

Validation:

1. Allow `image/jpeg`, `image/png`, `image/webp`.
2. Max file size: 10 MB.
3. Reject unsupported MIME types.

#### `GET /api/sites/:siteId/photos`

Purpose: list gallery items for a given date and optional category.

#### `GET /api/photos/:photoId/file`

Purpose: serve the stored file.

### 13.10 Report generation

#### `POST /api/sites/:siteId/reports/generate`

Query parameters:

- `date` required

Behavior:

1. Load site, journal day, attendance, weather, safety incidents, photos.
2. Build a structured markdown report.
3. Upsert the corresponding `daily_reports` record.
4. Return the generated report object.

#### `GET /api/sites/:siteId/reports`

Query parameters:

- `date` required

Response:

```ts
interface GetDailyReportResponse {
  item: DailyReport | null;
}
```

## 14. Voice Recognition Specification

`webkitSpeechRecognition` is mandatory for voice input in this implementation.

### 14.1 Supported usage pattern

Voice is used to help users populate text or descriptions in these contexts:

- attendance notes
- weather comments
- safety incident descriptions
- photo descriptions
- general observations

The MVP does not support robust command interpretation such as extracting worker names and timestamps into structured fields automatically. Any future command mode must be treated as a new feature, not implied by this version.

### 14.2 Browser wrapper contract

Frontend hook: `useWebkitSpeechRecognition`

```ts
export interface UseWebkitSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}
```

### 14.3 Hook behavior

Configuration requirements:

```ts
const recognition = new webkitSpeechRecognition();
recognition.lang = 'fr-FR';
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 1;
```

Runtime behavior:

1. When the user starts voice capture, the hook resets prior transcript state.
2. Interim results update in real time in the overlay.
3. Final results append to `transcript`.
4. On stop, the UI must ask for explicit confirmation before save.
5. If the browser does not support the API, the voice button must be disabled and the UI must offer manual text entry.

### 14.4 UI states for voice capture

The voice recorder component must support these states:

- `idle`
- `listening`
- `processing`
- `confirmed`
- `error`
- `unsupported`

Voice overlay requirements:

- microphone state
- current transcription text
- explicit actions: cancel, stop, validate
- a short compatibility or connectivity error when needed

### 14.5 Safety keyword detection

Because command understanding is not implemented, the server must scan transcribed text for safety-related keywords.

Shared constant example:

```ts
export const SAFETY_KEYWORDS = [
  'accident',
  'near miss',
  'presqu accident',
  'chute',
  'blessure',
  'blessé',
  'incendie',
  'feu',
  'fumée',
  'électrique',
  'électrocution',
  'danger',
  'urgence',
  'éboulement',
  'effondrement',
  'coincement',
  'écrasement',
  'fracture'
] as const;
```

The detection service must:

1. normalize the text to lower case
2. strip common punctuation
3. compare against configured keywords
4. return a boolean flag and matched keywords

Response extension for voice-enabled writes:

```ts
interface SafetyDetectionMetadata {
  safetyAlert: boolean;
  matchedKeywords: string[];
}
```

## 15. Frontend Application Design

### 15.1 Routing

Minimum routes:

```text
/                              -> site selection
/sites/:siteId                 -> timeline
/sites/:siteId/attendance      -> attendance module
/sites/:siteId/weather         -> weather module
/sites/:siteId/safety          -> safety list
/sites/:siteId/safety/:id      -> safety detail
/sites/:siteId/photos          -> photo gallery
/sites/:siteId/reports         -> report page
```

### 15.2 Global frontend state

State store should contain at minimum:

- active site id
- active site summary
- active date
- active timeline filters
- last voice compatibility status

Suggested store shape:

```ts
interface AppStoreState {
  activeSiteId: string | null;
  activeDate: string;
  timelineFilters: {
    types: TimelineEventType[];
    search: string;
    fromTime: string | null;
    toTime: string | null;
  };
  setActiveSiteId: (siteId: string) => void;
  setActiveDate: (date: string) => void;
  setTimelineFilters: (partial: Partial<AppStoreState['timelineFilters']>) => void;
}
```

### 15.3 Page responsibilities

#### Site selection page

Responsibilities:

- load all sites
- allow quick search
- persist last selected site locally
- redirect to timeline after selection

#### Timeline page

Responsibilities:

- load counters and timeline items for the active site/date
- support type filtering
- support text search
- support date navigation
- provide quick actions to create new records
- visually emphasize important safety items

#### Attendance page

Responsibilities:

- list daily attendance entries
- add and edit entries
- show status totals
- allow voice-assisted comments or task entry

#### Weather page

Responsibilities:

- display morning and afternoon weather blocks
- prefill from weather API if available
- allow manual corrections
- require impact comment if impact is unfavorable

#### Safety page

Responsibilities:

- list safety incidents
- create new incident
- show detail screen with linked photos
- support voice-assisted description entry

#### Photos page

Responsibilities:

- display daily gallery
- filter by category
- capture or upload photo
- edit description and category
- optionally link the photo to a safety incident

#### Reports page

Responsibilities:

- trigger report generation
- show generated markdown or rendered preview
- allow regeneration after data updates

### 15.4 Shared components

Required shared components:

- `SideNavigation`
- `PageHeader`
- `DateSwitcher`
- `TimelineEventCard`
- `VoiceRecorderOverlay`
- `SafetyAlertBanner`
- `PhotoUploadField`
- `EmptyState`
- `InlineError`
- `ToastRegion`

### 15.5 UI behavior requirements

1. Primary actions must be easy to trigger on touch devices.
2. Important warnings must be visible without scrolling where possible.
3. Forms must autosave only through explicit server writes after field confirmation, not every keystroke.
4. The UI must always present a manual path when voice is unavailable.

## 16. Backend Service Design

### 16.1 Route layer

Each feature owns its route module.

Suggested route modules:

- `routes/sites.ts`
- `routes/journalDays.ts`
- `routes/timeline.ts`
- `routes/workers.ts`
- `routes/attendance.ts`
- `routes/weather.ts`
- `routes/safetyIncidents.ts`
- `routes/photos.ts`
- `routes/reports.ts`

### 16.2 Service layer

Suggested services:

- `journal-day-service`
- `timeline-service`
- `attendance-service`
- `weather-service`
- `safety-incident-service`
- `photo-service`
- `report-generator-service`
- `safety-detection-service`

Each service should contain business rules, while route handlers remain thin.

### 16.3 Schema validation

Fastify schema must validate:

- required fields
- enum values
- date and time string formats where feasible
- file MIME types and upload limits
- conditional requirements such as weather impact comments

## 17. Timeline Composition Rules

The timeline is the central read model of the application.

### 17.1 Event generation rules

#### Attendance event rule

Option A for MVP: generate one aggregate attendance event for the day.

Recommended title example:

- `Attendance update`

Recommended preview example:

- `12 workers recorded, 2 absent, 1 late`

#### Weather event rule

One event per weather entry.

Example title:

- `Morning weather`

Example preview:

- `Cloudy, 12°C, wind 20 km/h, favorable`

#### Safety event rule

One event per safety incident.

Importance mapping:

- `low` -> `important`
- `moderate` -> `important`
- `high` -> `critical`
- `critical` -> `critical`

#### Photo event rule

One event per photo upload in MVP.

Example title:

- `Safety photo added`

Example preview:

- `2:45 PM, scaffolding anomaly, GPS attached`

### 17.2 Counter rules

Counters shown above the timeline must be computed from the returned timeline scope for the active site/date.

Required counters:

- attendance
- weather
- safety
- photos

## 18. Report Generation Specification

The report is generated locally by the backend from persisted records.

### 18.1 Output format

The first implementation stores report content as markdown.

This is preferred over direct PDF generation for MVP because:

1. it is simpler to generate
2. it is easy to render in the frontend
3. it can later be transformed into PDF without changing the data model

### 18.2 Report sections

The report generator must build these sections, even if some are empty.

1. Header
2. Weather conditions
3. Workforce attendance summary
4. Work progress and notes
5. Safety incidents / near misses
6. Photos and anomalies
7. General observations

### 18.3 Report section rules

#### Header

Must include:

- site name
- site code
- client
- report date

#### Weather conditions

Must summarize morning and afternoon entries if present.

#### Workforce attendance summary

Must include totals by attendance status.

#### Work progress and notes

For MVP this section can be composed from attendance assigned tasks and free-text observations until a dedicated notes module exists.

#### Safety incidents

Must list incidents ordered by time with location, description, severity, and immediate actions.

#### Photos and anomalies

Must list photo entries with category and description.

#### General observations

Must include journal-level observation text if set.

### 18.4 Example report skeleton

```md
# Daily Site Report

## Header
- Site: Residence Les Pins
- Code: CH-001
- Date: 2026-04-10

## Weather Conditions
- Morning: Cloudy, 12°C, favorable
- Afternoon: Moderate rain, 10°C, unfavorable, concrete pour stopped

## Workforce Attendance Summary
- Present: 12
- Absent: 2
- Late: 1

## Work Progress and Notes
- Reinforcement preparation on level 2 slab

## Safety Incidents / Near Misses
- 10:30 - Falling object - Formwork zone level 2 - High severity

## Photos and Anomalies
- Safety photo: unsecured formwork panel

## General Observations
- End of day slowed by weather conditions
```

## 19. Photo Handling Specification

### 19.1 Storage model

Photos are stored on local disk in the backend application directory under `apps/api/uploads`.

Recommended structure:

```text
uploads/
  {siteId}/
    {date}/
      {photoId}-{safeOriginalName}.jpg
```

### 19.2 Processing steps on upload

1. Validate MIME type.
2. Generate photo id.
3. Normalize and sanitize the original filename.
4. Create the folder if needed.
5. Persist the file.
6. Save metadata to SQLite.
7. Return the created `PhotoRecord`.

### 19.3 Compression

Automatic compression is not mandatory in the first build, but the API design must not prevent adding it later.

## 20. Weather API Integration

The weather module may call an external provider such as OpenWeather.

### 20.1 Integration rules

1. Weather prefill is optional, not blocking.
2. If the external API fails, the weather form must still be usable manually.
3. Auto-filled entries must be editable before save.
4. The source must be stored as `automatic` when prefilled data is accepted.

## 21. Validation Rules by Feature

### 21.1 Attendance

- worker id required
- status required
- arrival and departure must use `HH:mm` when present

### 21.2 Weather

- period required
- temperature required
- condition required
- impact required
- impact comment required when impact is unfavorable

### 21.3 Safety incidents

- occurredAt required
- location required
- description required
- category required
- potentialSeverity required

### 21.4 Photos

- file required
- category required
- capturedAt required

## 22. Non-Functional Requirements for This Implementation

### 22.1 Performance targets

- application initial render under 3 seconds on a standard project laptop
- standard write requests under 300 ms locally
- timeline fetch under 500 ms for a normal daily dataset

### 22.2 Reliability targets

- no data loss on normal process restart
- WAL mode enabled in SQLite
- invalid writes rejected with clear error messages

### 22.3 Compatibility targets

- Windows 10 and Windows 11 for primary use
- Chrome and Edge Chromium for voice-enabled use
- touch-friendly layout from tablet width upward

### 22.4 Accessibility targets

- keyboard accessible forms
- labels on all inputs
- contrast compatible with WCAG AA for primary content

## 23. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `webkitSpeechRecognition` is browser-limited | Voice unavailable in unsupported browsers | Manual text fallback everywhere |
| Construction noise hurts transcription quality | Lower voice accuracy | Confirmation UI and editable text before save |
| No auth in MVP | Weak access control | Deploy in controlled environment only |
| SQLite limits future concurrency | Scaling constraint | Keep repository and service design database-agnostic enough for PostgreSQL later |
| No OCR in MVP | Delivery note workflow incomplete | Keep it explicitly out of scope |
| No full offline support | Connectivity issues block some flows | Manual entry still works except voice and remote weather prefill |

## 24. Implementation Phases

### 24.1 Phase 1: monorepo and foundations

Deliverables:

- pnpm workspace
- shared package
- React app scaffold
- Fastify app scaffold
- common TypeScript config

Acceptance criteria:

- both apps start
- shared package compiles
- imports resolve cleanly across packages

### 24.2 Phase 2: persistence and base APIs

Deliverables:

- SQLite migrations
- site routes
- journal-day route
- worker routes

Acceptance criteria:

- database schema can be created from scratch
- sample site and worker data can be seeded

### 24.3 Phase 3: feature APIs

Deliverables:

- attendance API
- weather API and prefill integration
- safety incident API
- photo upload API
- timeline API
- report generation API

Acceptance criteria:

- each module supports create and read flows
- timeline returns unified events
- report generation returns structured markdown

### 24.4 Phase 4: frontend feature flows

Deliverables:

- site selection page
- timeline page
- attendance page
- weather page
- safety pages
- photo gallery page
- report page

Acceptance criteria:

- core user journey can be completed in the browser

### 24.5 Phase 5: voice support

Deliverables:

- `useWebkitSpeechRecognition`
- voice overlay component
- integration into forms with confirmation UI
- safety keyword warning banner

Acceptance criteria:

- voice can populate supported text fields in Chrome/Edge
- unsupported browser state is handled gracefully

### 24.6 Phase 6: polish

Deliverables:

- responsive layout improvements
- loading and error states
- timeline counters and filters
- visual priority rules for safety items

Acceptance criteria:

- application is usable on laptop and tablet layouts
- no dead-end states in core flows

## 25. End-to-End Acceptance Scenario

The following scenario must work from start to finish.

1. User opens the application.
2. User selects an active site.
3. User opens attendance and records workers for the day.
4. User opens weather and saves a morning weather record.
5. User triggers voice input using `webkitSpeechRecognition` and dictates a safety-related description.
6. User confirms the transcript and creates a safety incident.
7. User attaches one or more photos to that safety incident.
8. User opens the timeline and sees attendance, weather, safety, and photo events in chronological order.
9. User generates the daily report.
10. User views the generated markdown report in the reports page.

## 26. Future Evolution Path

The current design must leave room for later additions without forcing a rewrite.

Planned evolution areas:

1. Replace or augment `webkitSpeechRecognition` with Azure Speech if needed.
2. Add intent extraction for voice commands.
3. Add OCR-based delivery note parsing.
4. Add authentication and role-based access.
5. Add offline queueing and synchronization.
6. Add ERP export mapping and integration.
7. Add equipment tracking module.

## 27. Final Specification Statement

This implementation is a TypeScript web application backed by a TypeScript API and SQLite, centered around a daily site journal workflow.

For voice capture, `webkitSpeechRecognition` is the required and explicit mechanism for this version. The implementation must not assume Azure speech services, intent-routing NLP, or desktop-only Windows APIs.

The MVP must prioritize a working end-to-end site journal experience over enterprise integrations, while keeping the data model and package structure extensible enough for those integrations in later phases.