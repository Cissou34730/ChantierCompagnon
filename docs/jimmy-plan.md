# Jimmy Development Plan

Version: 1.0  
Date: April 10, 2026  
Scope baseline: `docs/implementation-spec.md`

## Role

Jimmy owns the cross-module integration layer, the report generation workflow, and the final MVP closure work. His job is to turn separate feature streams into one coherent product that completes the full daily journal flow.

Jimmy is the integration owner of the team.

## Main Objectives

1. Implement report generation end to end.
2. Ensure attendance, weather, safety and photo data all feed the final report.
3. Stabilize timeline integration across feature modules.
4. Close contract mismatches and module integration gaps.
5. Prepare the product for a coherent MVP handoff.

## Ownership Boundary

Jimmy owns the read-model integration and final assembly layer.

He is responsible for:

- report generation backend logic
- report endpoints
- report page and preview UI
- timeline aggregation support where cross-feature coordination is needed
- final contract harmonization across modules
- end-to-end integration fixes within MVP scope

He is not responsible for:

- creating the initial repository foundation
- building the shell from scratch
- owning attendance, weather, safety or photo modules in isolation

## Primary Files and Areas

Jimmy owns these files and directories:

- `apps/api/src/routes/reports.ts`
- `apps/api/src/services/report-generator-service.ts`
- `apps/api/src/services/timeline-service.ts` where cross-module aggregation is centralized
- `apps/api/src/schemas/reports/**`
- `apps/web/src/pages/Reports.tsx`
- `apps/web/src/components/ReportPreview.tsx`
- `packages/shared/src/contracts/reports/**`
- cross-feature contract cleanup in `packages/shared/**` when integration requires it

## Detailed Work Plan

### Phase 1: Report contract and assembly design

Tasks:

1. Confirm the final report structure from the implementation spec.
2. Define the report response contract.
3. Define the rules for mapping attendance, weather, safety and photo data into report sections.
4. Confirm how empty sections should render.

Expected output:

- a stable report model before report generation code is written

### Phase 2: Backend report generation

Tasks:

1. Implement `POST /api/sites/:siteId/reports/generate?date=...`.
2. Load all source data for the selected site/date:
   - journal day
   - attendance
   - weather
   - safety incidents
   - photos
3. Generate structured markdown content.
4. Upsert the `daily_reports` record.
5. Implement `GET /api/sites/:siteId/reports?date=...`.

Expected output:

- reports can be generated and fetched on demand

### Phase 3: Frontend report flow

Tasks:

1. Build the reports page.
2. Add generate and regenerate actions.
3. Render report markdown or a rendered preview.
4. Handle the no-report and no-data states clearly.
5. Make the page fit naturally into Fabien's shell.

Expected output:

- a user can generate and read the daily report from the application

### Phase 4: Timeline integration support

Tasks:

1. Confirm that all module records can map cleanly to timeline event shapes.
2. Implement or stabilize the timeline aggregation service if that work is not already locked down elsewhere.
3. Resolve mismatches between Ronald's and Regis's payloads and Fabien's rendering assumptions.
4. Normalize event importance and preview rules where needed.

Expected output:

- timeline data is coherent across all modules

### Phase 5: End-to-end hardening

Tasks:

1. Walk through the complete user journey from site selection to report generation.
2. Identify missing fields, missing joins, bad naming or integration bugs.
3. Fix cross-module issues that sit between ownership boundaries.
4. Keep the team inside MVP scope and avoid speculative features.

Expected output:

- the product behaves as one integrated application rather than separate demos

## Dependencies

Jimmy depends on Cyril for:

- shared contracts
- report table and base backend structure
- stable database schema

Jimmy depends on Ronald for:

- attendance and weather APIs
- stable source data contracts

Jimmy depends on Regis for:

- safety and photo APIs
- final linked-photo behavior

Jimmy depends on Fabien for:

- report page integration into the shell
- stable active site/date flow
- timeline rendering expectations

## Handoffs to Other Developers

Jimmy's handoff is the final integrated MVP. His work is mostly the last convergence layer rather than an upstream dependency.

He should, however, provide back to the team:

- final report contract confirmations
- final timeline aggregation assumptions
- final cross-module naming decisions that were required during integration

## Risks in Jimmy's Scope

1. Integration issues often appear late and can hide in small contract mismatches.
2. Report generation can become inconsistent if feature teams expose slightly different data shapes.
3. Timeline aggregation can become duplicated if ownership is unclear.

Mitigation:

- centralize read-model assumptions in one service
- use shared contracts strictly
- resolve naming mismatches quickly instead of adding adapters everywhere

## Acceptance Criteria

Jimmy's plan is complete when:

1. Reports can be generated and viewed for any site/date with available data.
2. Reports include attendance, weather, safety, photos and general observations sections.
3. Timeline data from all modules is coherent and renderable.
4. The end-to-end journey works without manual data patching or developer-only steps.
5. Remaining issues are no longer integration issues but normal product backlog items.

## Definition of Done

Jimmy is done when the five parallel development streams converge into one consistent MVP that a user can operate from site selection through report generation.