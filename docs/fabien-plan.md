# Fabien Development Plan

Version: 1.0  
Date: April 10, 2026  
Scope baseline: `docs/implementation-spec.md`

## Role

Fabien owns the frontend shell of the application and the central timeline experience. His work defines how the product is navigated and how the different modules are assembled into a coherent user-facing application.

Fabien is the owner of the frontend structure that the other module developers plug into.

## Main Objectives

1. Build the application shell for the frontend.
2. Define routing and navigation.
3. Implement the site selection page.
4. Implement global app state.
5. Implement the timeline page and timeline components.
6. Provide integration points for attendance, weather, safety, photos and reports pages.

## Ownership Boundary

Fabien owns the shell and composition layer of the frontend.

He is responsible for:

- frontend routing
- application layout
- navigation
- page composition structure
- top-level API read integration for shell pages
- timeline UX
- active site and active date state
- reusable empty, loading and error presentation

He is not responsible for:

- backend feature APIs
- attendance business logic
- weather business logic
- safety workflows
- voice recognition implementation
- report generation logic

## Primary Files and Areas

Fabien owns these files and directories:

- `apps/web/src/app/**`
- `apps/web/src/main.tsx`
- `apps/web/src/pages/SiteSelector.tsx`
- `apps/web/src/pages/Timeline.tsx`
- `apps/web/src/components/SideNavigation.tsx`
- `apps/web/src/components/PageHeader.tsx`
- `apps/web/src/components/DateSwitcher.tsx`
- `apps/web/src/components/TimelineEventCard.tsx`
- `apps/web/src/components/EmptyState.tsx`
- `apps/web/src/components/InlineError.tsx`
- `apps/web/src/components/ToastRegion.tsx`
- `apps/web/src/stores/**`
- `apps/web/src/services/api.ts` for app-shell read operations

## Detailed Work Plan

### Phase 1: Frontend app structure

Tasks:

1. Define the React app entry structure.
2. Set up router configuration.
3. Create a layout component that supports desktop and tablet/mobile behaviors.
4. Add a common page header with active site and active date context.
5. Add common styling primitives for content sections, cards and page spacing.

Expected output:

- the frontend has a stable structure before module pages are added

### Phase 2: Navigation and shell

Tasks:

1. Implement site selection as the initial entry point.
2. Persist the last selected site locally.
3. Implement navigation links for:
   - timeline
   - attendance
   - weather
   - safety
   - photos
   - reports
4. Implement date switching at the shell level.
5. Ensure feature pages receive the active site/date context.

Expected output:

- a user can move through the application without feature pages owning global navigation

### Phase 3: App store and frontend state

Tasks:

1. Create a global Zustand store.
2. Store active site id.
3. Store active date.
4. Store timeline filter state.
5. Expose a clean state API for other pages to use.

Expected output:

- other developers can build pages without creating their own duplicate global state

### Phase 4: Timeline implementation

Tasks:

1. Build the timeline page.
2. Fetch timeline data for the selected site/date.
3. Render counters for attendance, weather, safety and photos.
4. Add search and type filters.
5. Render event cards with clear visual differentiation by type and importance.
6. Support loading, empty and error states.
7. Ensure the timeline can display events supplied by Ronald, Regis and Jimmy without layout changes.

Expected output:

- timeline becomes the central read experience of the application

### Phase 5: Integration readiness

Tasks:

1. Provide route placeholders or shell integration points for pages owned by other developers.
2. Ensure pages can mount inside the shared layout.
3. Keep component APIs clean so module pages can reuse shell-level components.

Expected output:

- the shell supports all module flows without refactor pressure later

## Dependencies

Fabien depends on Cyril for:

- shared contracts
- site API
- journal-day API
- base frontend scaffold and workspace setup

Fabien should begin as soon as those primitives exist.

## Handoffs to Other Developers

### To Ronald

- route integration for attendance and weather pages
- shared page layout
- app-store access to active site/date

### To Regis

- route integration for safety and photos pages
- shared error and empty states
- timeline card conventions

### To Jimmy

- report page slot in the shell
- timeline rendering conventions
- top-level data flow for active date and active site

## Risks in Fabien's Scope

1. If routing is not stable early, every feature page will have merge conflicts.
2. If global state is badly scoped, feature modules will duplicate logic.
3. If the timeline assumes the wrong response shape, integration becomes expensive.

Mitigation:

- align with Cyril and Jimmy on response contracts early
- keep the shell thin and generic
- avoid embedding feature-specific business rules in shell components

## Acceptance Criteria

Fabien's plan is complete when:

1. A user can select a site and navigate through the application shell.
2. The active site and date are globally available.
3. The timeline page renders using real API data.
4. Timeline filters and counters work.
5. Other developers can plug in their pages without changing the shell architecture.

## Definition of Done

Fabien is done when the frontend has a stable shell, a working timeline, and a composable structure that the feature teams can use without building their own parallel UI framework.