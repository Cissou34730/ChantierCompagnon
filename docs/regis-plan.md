# Regis Development Plan

Version: 1.0  
Date: April 10, 2026  
Scope baseline: `docs/implementation-spec.md`

## Role

Regis owns the voice-assisted capture flow, the safety incident module, and the photo workflow. This is the most product-differentiating stream because it connects voice-first input with real operational events on site.

His work must strictly use `webkitSpeechRecognition` for the voice layer.

## Main Objectives

1. Implement browser-based voice capture with `webkitSpeechRecognition`.
2. Provide a safe fallback for unsupported browsers.
3. Deliver safety incident creation and detail flows.
4. Deliver photo upload/capture and gallery flows.
5. Connect voice transcripts to safety-related workflows.

## Ownership Boundary

Regis owns voice, safety and photos.

He is responsible for:

- voice hook and voice overlay
- safety keyword detection backend logic
- safety incident routes and services
- photo routes and services
- safety pages and forms
- photo pages and upload components

He is not responsible for:

- application shell
- attendance or weather modules
- report generation logic
- low-level repository setup

## Primary Files and Areas

Regis owns these files and directories:

- `apps/web/src/hooks/useWebkitSpeechRecognition.ts`
- `apps/web/src/components/VoiceRecorderOverlay.tsx`
- `apps/web/src/components/SafetyAlertBanner.tsx`
- `apps/web/src/components/PhotoUploadField.tsx`
- `apps/web/src/pages/Safety.tsx`
- `apps/web/src/pages/SafetyDetail.tsx`
- `apps/web/src/pages/Photos.tsx`
- `apps/web/src/components/SafetyIncidentForm.tsx`
- `apps/web/src/components/PhotoGallery.tsx`
- `apps/api/src/routes/safetyIncidents.ts`
- `apps/api/src/routes/photos.ts`
- `apps/api/src/services/safety-detection-service.ts`
- `apps/api/src/services/safety-incident-service.ts`
- `apps/api/src/services/photo-service.ts`
- `apps/api/src/schemas/safety/**`
- `apps/api/src/schemas/photos/**`

## Detailed Work Plan

### Phase 1: Voice capture infrastructure

Tasks:

1. Implement the `useWebkitSpeechRecognition` hook.
2. Configure it with:
   - `lang = 'fr-FR'`
   - `continuous = true`
   - `interimResults = true`
   - `maxAlternatives = 1`
3. Expose state for support detection, current transcript, interim transcript, listening state and errors.
4. Create a reusable overlay component that displays transcript progress in real time.
5. Add explicit actions for stop, cancel, reset and validate.
6. Add unsupported-browser handling.

Expected output:

- voice capture is usable in Chrome and Edge
- unsupported browsers still allow manual input

### Phase 2: Safety backend

Tasks:

1. Implement safety keyword detection using the shared keyword list.
2. Normalize transcribed text before keyword scanning.
3. Implement `GET /api/sites/:siteId/safety-incidents?date=...`.
4. Implement `POST /api/sites/:siteId/safety-incidents`.
5. Implement `GET /api/sites/:siteId/safety-incidents/:incidentId`.
6. Include linked photos in the detail response.
7. Validate category, severity and required fields.

Expected output:

- safety incidents can be created, listed and inspected in detail

### Phase 3: Safety frontend

Tasks:

1. Build the safety incidents list page.
2. Build the safety incident creation form.
3. Build the safety incident detail page.
4. Allow voice-assisted description entry through the overlay.
5. Display a warning banner when the transcript contains alert keywords.
6. Make it easy to attach photos to a safety incident.

Expected output:

- end users can capture a near miss quickly and clearly

### Phase 4: Photo backend

Tasks:

1. Implement `POST /api/sites/:siteId/photos` as multipart upload.
2. Validate file type and size.
3. Store files under a stable directory convention.
4. Save metadata to SQLite.
5. Implement `GET /api/sites/:siteId/photos?date=...`.
6. Implement `GET /api/photos/:photoId/file`.

Expected output:

- photos are retrievable and linked to the right site/day

### Phase 5: Photo frontend

Tasks:

1. Build the photos page and gallery.
2. Implement photo selection or capture input.
3. Support category and description fields.
4. Support optional link to a safety incident.
5. Display image previews and metadata.

Expected output:

- photo workflows are complete from selection to display

## Dependencies

Regis depends on Cyril for:

- multipart registration
- database schema for safety and photos
- shared contracts and constants

Regis depends on Fabien for:

- shell integration
- shared layout and navigation
- timeline rendering entry points

## Handoffs to Other Developers

### To Fabien

- safety and photo event shapes for the timeline
- UI patterns for critical event emphasis

### To Jimmy

- stable safety incident data
- stable photo records and URLs
- safety warning metadata if relevant to reports

## Risks in Regis's Scope

1. `webkitSpeechRecognition` browser support is limited.
2. Construction noise can degrade transcript quality.
3. Photo upload can become brittle if storage paths are inconsistent.
4. Safety form UX can become too heavy for quick field capture.

Mitigation:

- always provide manual fallback
- require transcript confirmation before save
- keep file naming deterministic and sanitized
- keep the safety form structured but compact

## Acceptance Criteria

Regis's plan is complete when:

1. Voice capture works with `webkitSpeechRecognition` in supported browsers.
2. Unsupported browsers fall back cleanly to manual input.
3. Safety incidents can be created and viewed.
4. Photos can be uploaded, listed and viewed back.
5. Photos can be attached to safety incidents.
6. Safety and photo data are ready for the timeline and report flows.

## Definition of Done

Regis is done when the product's most differentiating workflow, voice-assisted safety and photo capture, works end to end without relying on Azure or undeclared external services.