# Cyril Development Plan

Version: 1.0  
Date: April 10, 2026  
Scope baseline: `docs/implementation-spec.md`

## Role

Cyril owns the technical foundation of the project. His job is to make the repository, shared contracts, backend runtime, and database ready so that the other four developers can build features without inventing infrastructure on their own.

This is the most architecture-heavy workstream. If Cyril does this part well, the rest of the team can work in parallel with minimal friction.

## Main Objectives

1. Establish the monorepo structure.
2. Define shared TypeScript contracts used everywhere.
3. Set up the Fastify backend foundation.
4. Create the SQLite schema and migrations.
5. Deliver the site and journal-day backend primitives used by every module.
6. Create enough sample data to unblock the rest of the team.

## Ownership Boundary

Cyril owns the platform layer, not the feature modules themselves.

He is responsible for:

- repository structure
- workspace configuration
- TypeScript base configuration
- shared package layout
- database schema
- backend application bootstrap
- site management endpoints
- journal-day lifecycle endpoints
- database access plugin and common backend utilities

He is not responsible for:

- attendance feature logic
- weather feature logic
- safety feature logic
- photo feature logic
- voice UI
- report UI

## Primary Files and Areas

Cyril owns these files and directories:

- root `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `packages/shared/**`
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/src/server.ts`
- `apps/api/src/plugins/**`
- `apps/api/src/db/**`
- `apps/api/src/routes/sites.ts`
- `apps/api/src/routes/journalDays.ts`
- `apps/api/src/utils/**`

## Detailed Work Plan

### Phase 1: Repository and workspace foundations

Tasks:

1. Create the pnpm workspace configuration for `apps/*` and `packages/*`.
2. Define the root TypeScript configuration with strict mode enabled.
3. Add root scripts for install, dev, build and typecheck.
4. Scaffold `apps/api`, `apps/web`, and `packages/shared`.
5. Make sure workspace dependency resolution works consistently.

Expected output:

- the monorepo can install in one command
- the shared package is consumable from frontend and backend
- all packages compile with a single typecheck command

### Phase 2: Shared contracts package

Tasks:

1. Create shared enums for site status, attendance status, weather condition, safety severity, photo category, report status, input source and timeline event type.
2. Create shared domain interfaces for `Site`, `JournalDay`, `Worker`, `AttendanceEntry`, `WeatherEntry`, `SafetyIncident`, `PhotoRecord`, `TimelineEvent`, and `DailyReport`.
3. Create request and response contracts for site and journal-day endpoints.
4. Create a shared constants file for safety keywords.
5. Export all shared types cleanly from a single package entry point.

Expected output:

- all other developers can import contracts from one location
- there is no duplicated API typing across the repo

### Phase 3: Backend bootstrap

Tasks:

1. Create the Fastify server bootstrap.
2. Register CORS.
3. Register multipart support for future photo uploads.
4. Create a database plugin exposing the Knex instance.
5. Add a health-check route if needed for local startup verification.
6. Register route modules in a clean structure.

Expected output:

- backend starts locally without feature code
- route registration is structured and ready for extension

### Phase 4: Database schema

Tasks:

1. Configure Knex for SQLite using `better-sqlite3`.
2. Enable WAL mode during startup.
3. Create migrations for:
   - `sites`
   - `journal_days`
   - `workers`
   - `attendance_entries`
   - `weather_entries`
   - `safety_incidents`
   - `photos`
   - `daily_reports`
4. Add indexes where obviously needed:
   - site/date unique index on journal days
   - lookup indexes for `journal_day_id`
   - indexes for photo and safety lookups
5. Create seed data for at least one site and a few workers.

Expected output:

- database can be created from scratch
- database is ready for all feature teams

### Phase 5: Site and journal-day APIs

Tasks:

1. Implement `GET /api/sites`.
2. Implement `GET /api/sites/:siteId`.
3. Implement `POST /api/sites`.
4. Implement `GET /api/sites/:siteId/journal-days/:date` with create-if-missing behavior.
5. Validate payloads and params with Fastify schemas.

Expected output:

- frontend shell can load sites
- every feature team can rely on a journal-day existing for a site/date pair

## Dependencies

Cyril has no blocking dependency on the rest of the team. His plan must start first.

He should, however, align early with Fabien on:

- route naming
- API response shape
- shared contract names

## Handoffs to Other Developers

### To Fabien

- shared contracts package
- site listing endpoint
- journal-day endpoint
- initial app structure assumptions

### To Ronald

- workers table and shared worker contract
- attendance and weather table schemas
- base route/module conventions

### To Regis

- safety and photo tables
- multipart backend registration
- storage directory conventions

### To Jimmy

- final table structure
- report table
- timeline-related shared types

## Risks in Cyril's Scope

1. If shared contracts are unstable, every other stream slows down.
2. If migrations are wrong, all feature teams build on a broken schema.
3. If route structure is inconsistent, later integration will be messy.

Mitigation:

- finalize naming early
- keep contracts minimal and stable
- avoid speculative abstractions

## Acceptance Criteria

Cyril's plan is complete when:

1. The monorepo installs and typechecks.
2. The backend starts with Fastify and SQLite.
3. All shared interfaces required by the MVP exist.
4. The full database schema exists through migrations.
5. Site and journal-day endpoints are usable by the frontend.
6. The other four developers can start their own work without waiting for more infrastructure changes.

## Definition of Done

Cyril is done when the project has a stable technical foundation and no other developer needs to create their own workaround for repository structure, typing, database setup or backend bootstrapping.