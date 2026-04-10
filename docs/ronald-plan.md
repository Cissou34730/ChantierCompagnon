# Ronald Development Plan

Version: 1.0  
Date: April 10, 2026  
Scope baseline: `docs/implementation-spec.md`

## Role

Ronald owns the attendance and weather modules as end-to-end vertical slices. His scope includes backend logic, API design within the agreed contracts, and the frontend pages/forms for those two modules.

This stream is important because attendance and weather are daily mandatory data in the journal.

## Main Objectives

1. Deliver attendance management end to end.
2. Deliver weather management end to end.
3. Provide structured data that feeds both the timeline and the report.
4. Ensure both modules behave correctly within the shared frontend shell.

## Ownership Boundary

Ronald owns attendance and weather only.

He is responsible for:

- worker lookup and worker creation support if needed by attendance
- attendance API routes and service logic
- weather API routes and service logic
- weather prefill integration
- attendance page and components
- weather page and components

He is not responsible for:

- app shell and timeline layout
- safety incidents
- photos
- voice recognition core implementation
- report generation logic

## Primary Files and Areas

Ronald owns these files and directories:

- `apps/api/src/routes/workers.ts`
- `apps/api/src/routes/attendance.ts`
- `apps/api/src/routes/weather.ts`
- `apps/api/src/services/attendance-service.ts`
- `apps/api/src/services/weather-service.ts`
- `apps/api/src/services/weather-provider.ts`
- `apps/api/src/schemas/attendance/**`
- `apps/api/src/schemas/weather/**`
- `apps/web/src/pages/Attendance.tsx`
- `apps/web/src/pages/Weather.tsx`
- `apps/web/src/components/AttendanceForm.tsx`
- `apps/web/src/components/AttendanceTable.tsx`
- `apps/web/src/components/WorkerPicker.tsx`
- `apps/web/src/components/WeatherForm.tsx`
- `apps/web/src/components/WeatherCard.tsx`

## Detailed Work Plan

### Phase 1: Worker and attendance backend

Tasks:

1. Confirm the worker contract and schema from Cyril's shared package.
2. Implement worker listing with optional search.
3. Implement worker creation if attendance needs local worker setup.
4. Implement `GET /api/sites/:siteId/attendance?date=...`.
5. Implement `POST /api/sites/:siteId/attendance`.
6. Implement `PUT /api/sites/:siteId/attendance/:attendanceId`.
7. Return attendance summary totals with the list response.

Expected output:

- attendance data can be created and consumed by the frontend

### Phase 2: Attendance frontend

Tasks:

1. Build the attendance page.
2. Add worker selection and attendance form flows.
3. Add status fields for present, absent, late and left early.
4. Add task and comment fields.
5. Display a daily table or list of attendance entries.
6. Display totals and summary counters.
7. Make the page compatible with the shell provided by Fabien.

Expected output:

- attendance is fully usable by an end user

### Phase 3: Weather backend

Tasks:

1. Implement `GET /api/sites/:siteId/weather?date=...`.
2. Implement `POST /api/sites/:siteId/weather`.
3. Implement `PUT /api/sites/:siteId/weather/:weatherId` if needed.
4. Enforce the business rule that an unfavorable impact requires a comment.
5. Implement `GET /api/sites/:siteId/weather/prefill` using site coordinates.
6. Handle failure from the external provider gracefully.

Expected output:

- weather data can be recorded manually and optionally prefilled

### Phase 4: Weather frontend

Tasks:

1. Build the weather page.
2. Render separate morning and afternoon weather sections.
3. Allow manual entry and manual correction.
4. Provide a prefill action calling the weather endpoint.
5. Display unfavorable weather impact clearly.
6. Ensure validation errors are understandable.

Expected output:

- weather is fully usable without requiring any other module

### Phase 5: Timeline and report integration

Tasks:

1. Make sure attendance responses contain enough information for Jimmy's report generation.
2. Make sure weather responses contain enough information for both Jimmy and Fabien.
3. Verify that timeline event inputs can be built from attendance and weather records.

Expected output:

- attendance and weather integrate cleanly into the global read model

## Dependencies

Ronald depends on Cyril for:

- database schema
- shared contracts
- worker and journal-day base structures
- backend server foundation

Ronald depends on Fabien for:

- frontend shell
- route slots for pages
- shared page layout and navigation

## Handoffs to Other Developers

### To Fabien

- frontend attendance and weather pages ready for shell integration
- event display expectations for timeline cards

### To Jimmy

- attendance summaries for reports
- weather entries for report sections
- stable API contracts and data fields

## Risks in Ronald's Scope

1. Attendance can become too complex if worker management is overbuilt.
2. Weather prefill can block the UI if external API handling is weak.
3. If validation rules are unclear, users may not understand why save fails.

Mitigation:

- keep worker handling minimal
- keep prefill optional and non-blocking
- keep validation explicit and field-level

## Acceptance Criteria

Ronald's plan is complete when:

1. Workers can be selected for attendance.
2. Attendance entries can be created, edited and listed by day.
3. Attendance totals are correct.
4. Morning and afternoon weather entries can be created and edited.
5. Weather prefill is available but not required.
6. Attendance and weather data are ready for the timeline and report features.

## Definition of Done

Ronald is done when attendance and weather both work end to end and produce stable, structured data that the rest of the product can consume without special-case logic.