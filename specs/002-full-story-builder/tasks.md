# Tasks: Full Story Builder — v0.2

**Input**: Design documents from `/specs/002-full-story-builder/`
**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/ ✓ | quickstart.md ✓

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US7)
- File paths are relative to repository root (`/home/nyco/code/Lean-Storytelling/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Acquire font assets and establish the `/fonts/` directory before any CSS work begins.

- [X] T001 Create `/fonts/` directory in repository root
- [X] T002 [P] Download `playfair-display-v*-latin-regular.woff2` (OFL 1.1) into `fonts/` — see research.md R-008 for source
- [X] T003 [P] Download `playfair-display-v*-latin-700.woff2` (OFL 1.1) into `fonts/`
- [X] T004 [P] Download `dm-sans-v*-latin-regular.woff2` (OFL 1.1) into `fonts/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure changes that MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Extend `createStory()` in `app.js` to include 10 new session fields: `empathy`, `empathyStatus`, `consequences`, `consequencesStatus`, `benefits`, `benefitsStatus`, `context`, `contextStatus`, `why`, `whyStatus`, `storyTitle` — see contracts/session-state.md for full schema
- [X] T006 Update `normaliseStory()` in `app.js` to trim and validate all 8 content fields and their paired `*Status` fields, and `storyTitle`; enforce the null-when-empty status invariant for all new fields — see contracts/session-state.md Normalisation Rules
- [X] T007 [P] Add `@font-face` declarations in `style.css` for Playfair Display 400, Playfair Display 700, and DM Sans 400 pointing to `/fonts/*.woff2` — replace `--font-display` and `--font-body` CSS custom properties
- [X] T008 [P] Remove obsolete v0.1 patterns from `app.js`: delete `handleSubmit()`, `enterEditMode()`, `exitEditMode()`, `handleCancel()`, and the `showView()` function; remove their DOMContentLoaded event wiring — see spec FR-004
- [X] T009 [P] Remove the form `submit` event listener, the Edit button (`#edit-btn`), the Cancel button (`#cancel-btn`), and the `#empty-hint` element from `index.html`
- [X] T010 Add font files to the `CACHE_FILES` array in `service-worker.js` so self-hosted fonts are available offline

**Checkpoint**: Session schema extended; fonts declared; obsolete v0.1 patterns removed. User story implementation can begin.

---

## Phase 3: User Story 1 — Navigate Between Waves (Priority: P1) 🎯 MVP

**Goal**: All three wave cards are active and clicking any card switches the left-pane form to that wave's fields. The active card is visually highlighted. Content is preserved across switches.

**Independent Test** (Quickstart Scenario 1 + 2): Click each wave card → correct form fields appear → type in Target, Empathy, Context → switch waves in any order → all content is still present.

- [X] T011 [US1] Add wave router module to `app.js`: introduce `_currentWave` variable (default `'basic'`); implement `setWave(wave)` function with all 7 side effects documented in contracts/ui-states.md — hide/show sections, toggle active card class, collapse advice `<details>`, populate form, call `updateRightPane()`, call `updateWaveProgress()`
- [X] T012 [US1] Update wave nav HTML in `index.html`: change all three wave cards to use `data-wave="basic|detailed|full"` attributes; remove any "Wave N" labels; ensure all three have no `aria-disabled`, no `pointer-events: none`, no `opacity < 1` — see spec FR-001
- [X] T013 [US1] Add three form section wrappers in `index.html` as siblings: `<section id="basic-form">` (wrapping existing Target/Problem/Solution fields), `<section id="detailed-form">` (empty placeholder), `<section id="full-form">` (empty placeholder) — only `#basic-form` visible initially
- [X] T014 [US1] Wire wave card click handlers in `DOMContentLoaded` in `app.js`: `document.querySelectorAll('.wave-card')` → `addEventListener('click', () => setWave(card.dataset.wave))`
- [X] T015 [US1] Update `style.css`: active wave card styling (`.wave-card--active` — distinct border, background, no opacity reduction); ensure all three cards appear fully interactive (same cursor, same visual weight except active highlight)
- [X] T016 [US1] Update `populateForm(story)` in `app.js` to target only the currently active wave's fields (use `_currentWave` to determine which field IDs to populate), preventing DOM errors when inactive form fields are not rendered

**Checkpoint**: All three wave cards clickable; left-pane form switches correctly; content survives wave switches.

---

## Phase 4: User Story 2 — Real-Time Story Preview (Priority: P1)

**Goal**: The right pane updates instantly as the user types, showing wave-contextual content (3 fields for Basic, 6 paired for Detailed, all 8 for Full). No button press required.

**Independent Test** (Quickstart Scenarios 3 + 4 + 5): Type in Target → right pane updates instantly → switch waves → right pane field set changes → all fields empty → single placeholder shown.

- [X] T017 [US2] Wire `input` events on all 3 existing textareas (`target`, `problem`, `solution`) and `change` events on their 3 status selects in `DOMContentLoaded` in `app.js` to call `saveSession()` immediately (replacing the old submit-based save)
- [X] T018 [US2] Also wire `input` events to call `updateRightPane()` directly (in addition to `saveSession()`) so the right pane updates on every keystroke
- [X] T019 [US2] Refactor `updateStoryPreview()` into `updateRightPane()` in `app.js`: implement the three rendering modes driven by `_currentWave` — Basic (target, problem, solution), Detailed (target, empathy, problem, consequences, solution, benefits), Full (context, target, empathy, problem, consequences, solution, benefits, why) — per contracts/ui-states.md Right-Pane Preview State
- [X] T020 [US2] Implement the all-empty state check in `updateRightPane()`: when all displayed fields for the active wave are `''`, render a single `<p class="preview-placeholder-text">` instead of individual field blocks — see contracts/ui-states.md
- [X] T021 [US2] Add status emoji badge rendering to `updateRightPane()` in `app.js`: for each filled field with a non-null status, append `<span class="status-badge">[emoji]</span>` inside the preview block — use `textContent` for user content, never `innerHTML` — see spec FR-018
- [X] T022 [US2] Update right-pane HTML in `index.html`: add `div.preview-block` containers for all 8 fields (with `id="preview-[field]"`); these are hidden/shown dynamically by `updateRightPane()` based on wave context
- [X] T023 [US2] Update `style.css` for right-pane preview: styled `.preview-block`, `.preview-label`, `.preview-content`, `.preview-placeholder-text`, `.status-badge` — preview should feel like a polished story document, not a data dump
- [X] T024 [US2] Call `updateRightPane()` inside `setWave()` (already specified in T011) and on page load in `DOMContentLoaded` after `populateForm()`; verify Basic wave preview is correct state on first render

**Checkpoint**: Right pane updates live on every keystroke; wave switch changes the displayed field set; empty state shows single placeholder.

---

## Phase 5: User Story 3 — Fill the Detailed Story (Priority: P2)

**Goal**: The Detailed Story form is fully functional with Empathy, Consequences, and Benefits fields using the unified field template.

**Independent Test** (Quickstart Scenario 6 partial): Navigate to Detailed Story → fill Empathy, Consequences, Benefits → right pane shows them in paired order alongside Basic fields → content survives wave switches.

- [X] T025 [US3] Build Detailed Story form HTML in `<section id="detailed-form">` in `index.html`: three field groups (Empathy, Consequences, Benefits), each using the unified template: `<h3 class="field-title">`, `<p class="field-explainer">`, `<textarea id="[field]">`, `<details class="field-advice"><summary>`, `<select id="[field]-status">` with the 4 options (none, 🤔, 🔄, ✅) — copy exact text from spec FR-011/FR-012/FR-013
- [X] T026 [US3] Extend `populateForm(story)` in `app.js` to also populate `#empathy`, `#consequences`, `#benefits` and their status selects when `_currentWave === 'detailed'`
- [X] T027 [US3] Wire `input` and `change` events for `#empathy`, `#empathy-status`, `#consequences`, `#consequences-status`, `#benefits`, `#benefits-status` in `DOMContentLoaded` in `app.js` to call `saveSession()` and `updateRightPane()` — consistent with T017/T018 pattern
- [X] T028 [US3] Update `saveSession()` wiring in `app.js`: ensure the story object assembled for save reads all 8 content fields and all 8 status fields from the DOM (not just the 3 Basic Story fields) — collect from the full DOM across all form sections regardless of visibility
- [X] T029 [US3] [P] Add CSS in `style.css` for the unified field template elements: `.field-title`, `.field-explainer`, `.field-advice`, `.field-advice-toggle` (suppress `<summary>` default marker, add custom indicator), `.field-advice-body` — these styles are shared with Basic and Full Story forms

**Checkpoint**: Navigate to Detailed Story → fill all three fields → content appears in right pane paired with Basic fields → session persists content on wave switch.

---

## Phase 6: User Story 4 — Fill the Full Story (Priority: P3)

**Goal**: The Full Story form is fully functional with Context and Why fields. Context appears at the top of the right-pane story; Why at the bottom.

**Independent Test** (Quickstart Scenario 3 Full wave): Navigate to Full Story → fill Context and Why → right pane shows all 8 fields in canonical delivery order with Context first and Why last.

- [X] T030 [US4] Build Full Story form HTML in `<section id="full-form">` in `index.html`: two field groups (Context, Why), each using the unified template — copy exact text from spec FR-014/FR-015 including the Why advice warning ("The most difficult part. Craft it carefully…")
- [X] T031 [US4] Extend `populateForm(story)` in `app.js` to populate `#context`, `#why` and their status selects when `_currentWave === 'full'`
- [X] T032 [US4] Wire `input` and `change` events for `#context`, `#context-status`, `#why`, `#why-status` in `DOMContentLoaded` in `app.js` to call `saveSession()` and `updateRightPane()`
- [X] T033 [US4] Verify `updateRightPane()` Full mode renders Context as the first block and Why as the last block in the canonical delivery order — no code change expected if T019 was implemented correctly; add this as an explicit checkpoint test

**Checkpoint**: Full Story form fills correctly; Context and Why appear in correct positions in the right pane.

---

## Phase 7: User Story 5 — Foldable Field Advice on Basic Story (Priority: P3)

**Goal**: The Basic Story form fields are updated to match the unified template with foldable advice, revised explainer text, and revised advice text. All advice sections collapse on wave switch.

**Independent Test** (Quickstart Scenario 6): Open Basic Story → all advice sections collapsed → click advice toggle on Target → expands → click again → collapses → content unchanged → switch to Detailed Story and back → advice still collapsed.

- [X] T034 [US5] Update Basic Story Target field HTML in `index.html` to use the unified template: add `<p class="field-explainer">` with FR-008 explainer text; wrap existing `<textarea id="target">` in the field group; add `<details class="field-advice">` with FR-008 advice text — remove any old hint/label markup
- [X] T035 [US5] [P] Update Basic Story Problem field HTML in `index.html` same way: FR-009 explainer and advice text
- [X] T036 [US5] [P] Update Basic Story Solution field HTML in `index.html` same way: FR-010 explainer and advice text
- [X] T037 [US5] Add advice collapse to `setWave()` in `app.js`: `document.querySelectorAll('.field-advice').forEach(d => d.removeAttribute('open'))` — this resets all `<details>` elements on every wave switch (spec edge case: advice resets when switching waves)

**Checkpoint**: All three Basic Story fields match unified template; advice collapses on wave switch; explainer text matches spec FR-008/009/010.

---

## Phase 8: User Story 6 — Story Title Widget (Priority: P4)

**Goal**: An editable story title appears below the page heading, above the wave nav. On first load, a random serious default title is shown. Clicking it enters edit mode; Enter or blur commits; Escape reverts.

**Independent Test** (Quickstart Scenario 9): Open app → default title visible → click → edit → Enter → styled heading restored with new title → switch waves → title unchanged → reload → title restored.

- [X] T038 [US6] Add story title widget HTML in `index.html` between the page `<h1>` and the wave nav `<nav>`: a container `<div class="story-title-widget">` containing `<h2 id="story-title-display">` (display mode) and `<input id="story-title-input" type="text">` (edit mode, hidden by default)
- [X] T039 [US6] Define `TITLE_POOL` constant in `app.js`: array of 10 default titles from data-model.md StoryTitle section
- [X] T040 [US6] Implement story title init in `DOMContentLoaded` in `app.js`: if `session.storyTitle === ''`, pick a random title from `TITLE_POOL`, save it, then call `renderStoryTitle(title)` — otherwise call `renderStoryTitle(session.storyTitle)` with saved value
- [X] T041 [US6] Implement `renderStoryTitle(title)` in `app.js`: updates `#story-title-display` text (using `textContent`, not `innerHTML`); shows display element, hides input; if `title === ''`, shows CSS placeholder text
- [X] T042 [US6] Implement title edit mode in `app.js`: `#story-title-display` click → hide display, show and focus `#story-title-input`, pre-fill with current title; `#story-title-input` `blur` and `keydown[Enter]` → commit: read `.value`, call `saveSession()` with updated `storyTitle`, call `renderStoryTitle()`; `keydown[Escape]` → revert to previous value, call `renderStoryTitle()` without saving
- [X] T043 [US6] Add `.story-title-widget` CSS in `style.css`: display `<h2>` uses Playfair Display, appropriate size and weight to sit between page title and wave nav; edit-mode `<input>` matches the heading's visual size and font; Escape/Enter commit feel natural; overflow truncates gracefully (spec edge case)

**Checkpoint**: Default title appears on fresh session; click-to-edit works; Enter/blur commits; Escape reverts; title survives wave switches and page reload.

---

## Phase 9: User Story 7 — Accessible Progress Bar Step Indicators (Priority: P4)

**Goal**: Each wave card's progress bar has one step per field. Each step reflects fill state and confidence status emoji live. All states are accessible without relying on color alone (WCAG 2.1 AA).

**Independent Test** (Quickstart Scenario 8): Fill Target, set status ✅ → Target step shows ✅ emoji with filled indicator → clear Target → step returns to empty hollow indicator → Detailed Story card steps update when Empathy/Consequences/Benefits are filled.

- [X] T044 [US7] Update wave card HTML in `index.html`: replace the existing generic `.wave-progress` markup with per-field step indicators — Basic Story card: three `<span class="wave-step" data-wave="basic" data-field="target|problem|solution" aria-label="Target: empty">` spans; Detailed Story card: three spans (empathy, consequences, benefits); Full Story card: two spans (context, why)
- [X] T045 [US7] Refactor `updateWaveProgress()` in `app.js` to iterate all three wave cards and all their fields: for each step indicator, read the story from session, determine content fill state and status, set the displayed emoji (`🤔`, `🔄`, `✅`, or `✓` for filled-no-status, or `''` for empty), update `aria-label` to `"[Field]: [state description]"` — see contracts/ui-states.md Progress Bar Step States
- [X] T046 [US7] Wire `updateWaveProgress()` to also trigger on `input` and `change` events for all 8 textareas and all 8 status selects (in addition to `saveSession()` and `updateRightPane()` — same pattern)
- [X] T047 [US7] Update `style.css` for step indicators: empty state = hollow circle (border only); filled state = filled circle with `--color-green-600` background; emoji overlays the indicator; ensure contrast ≥ 4.5:1 for the filled state text/background; shape difference (hollow vs filled) conveys state independent of color — WCAG 2.1 AA

**Checkpoint**: All wave cards' step indicators update live; emoji appears when status is set; state conveyed by shape + aria-label + emoji, not color alone.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Typography refinement, README cleanup, offline support, and final accessibility pass.

- [X] T048 [P] Apply full typographic scale in `style.css`: page `<h1>` (Playfair Display, large, bold), story title `<h2>` (Playfair Display, medium), wave card title (DM Sans, semi-bold), `.field-title` (DM Sans, semi-bold, slightly smaller), `.field-explainer` (DM Sans, regular, muted color), advice text (DM Sans, italic, muted), preview body (DM Sans or Playfair Display, comfortable reading size) — see plan.md Phase C and constitution Principle VI
- [X] T049 [P] Verify and clean `README.md`: remove sections "Lean Storytelling web app (MVP)", "Run locally", "Quickstart and public review" if present — see spec FR-029
- [ ] T050 Run all 12 Quickstart acceptance scenarios from `quickstart.md` manually and confirm each passes; note any failures for follow-up
- [ ] T051 Accessibility audit: open app with axe DevTools or browser built-in accessibility checker; verify zero critical/serious WCAG 2.1 AA violations across all three wave forms; check keyboard navigation end-to-end (Tab order, Enter on advice toggle, Enter on story title edit, wave card keyboard activation)
- [ ] T052 Verify no external network requests: open DevTools Network tab → filter by `fonts.googleapis.com` / `fonts.gstatic.com` / any non-localhost host → confirm zero external font or script requests — CSP compliance check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — download fonts immediately; T002/T003/T004 fully parallel
- **Foundational (Phase 2)**: Depends on T001 (fonts directory). T005/T006 sequential (schema then normalise). T007/T008/T009/T010 all parallel with each other once Phase 1 is done.
- **US1 (Phase 3)**: Depends on Phase 2 complete — requires clean session schema and removed obsolete patterns
- **US2 (Phase 4)**: Depends on Phase 3 complete — requires wave router and `_currentWave` to be in place
- **US3 (Phase 5)**: Depends on Phase 2 (session schema extended). Can start in parallel with US1 and US2 for the HTML/CSS work, but JS wiring (T027/T028) requires Phase 2 complete.
- **US4 (Phase 6)**: Depends on Phase 2 and T029 (unified field CSS). Same parallelism as US3.
- **US5 (Phase 7)**: Depends on T029 (unified field CSS) to already exist. T034/T035/T036 parallel. T037 depends on T011 (setWave).
- **US6 (Phase 8)**: Depends on Phase 2 (storyTitle in session schema). Otherwise independent.
- **US7 (Phase 9)**: Depends on Phase 2 (session schema) and T011 (wave router for `updateWaveProgress()`).
- **Polish (Phase 10)**: Depends on all user stories complete.

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 complete. No dependency on other user stories.
- **US2 (P1)**: Requires US1 complete (`_currentWave` and `setWave()` must exist for wave-contextual rendering).
- **US3 (P2)**: Requires Phase 2 complete and T029 (field CSS). HTML/CSS work parallel with US1.
- **US4 (P3)**: Requires Phase 2 complete and T029 (field CSS). HTML/CSS parallel with earlier phases.
- **US5 (P3)**: Requires T029 (field CSS) and T037 side effect in T011. Otherwise independent of US3/US4.
- **US6 (P4)**: Requires Phase 2 complete (storyTitle in schema). Otherwise fully independent.
- **US7 (P4)**: Requires Phase 2 (schema) and T011 (setWave registers updateWaveProgress call). HTML work parallel.

### Parallel Opportunities Within Each Story

**Phase 3 (US1)**: T012 (HTML) ∥ T015 (CSS) before T011 (JS router) → then T014 (click wiring) → T016 (populateForm)

**Phase 4 (US2)**: T022 (HTML containers) ∥ T023 (CSS) → T019 (renderRightPane logic) → T017/T018/T020/T021/T024

**Phase 5 (US3)**: T025 (HTML) ∥ T029 (CSS — already marked [P]) → T026 (populateForm) → T027/T028

**Phase 6 (US4)**: T030 (HTML) → T031 (populateForm) → T032 (event wiring)

**Phase 7 (US5)**: T034 ∥ T035 ∥ T036 (three parallel HTML updates) → T037 (setWave side effect)

**Phase 9 (US7)**: T044 (HTML) ∥ T047 (CSS) → T045 (updateWaveProgress logic) → T046 (event wiring)

**Phase 10 (Polish)**: T048 ∥ T049 ∥ T050 (independent); T051 after T050; T052 any time

---

## Implementation Strategy

### MVP First (US1 + US2 — P1 stories only)

1. Complete Phase 1: Setup (font acquisition)
2. Complete Phase 2: Foundational (schema, @font-face, remove obsolete patterns)
3. Complete Phase 3: US1 Wave Navigation
4. Complete Phase 4: US2 Real-Time Preview
5. **STOP and VALIDATE**: All three waves navigable; right pane updates live; Quickstart Scenarios 1–5 pass
6. Deploy/demo — Basic Story form is fully functional with real-time preview

### Incremental Delivery

1. Setup + Foundational → ready
2. US1 (wave nav) + US2 (live preview) → Basic Story fully live → demo!
3. US3 (Detailed Story fields) → Empathy/Consequences/Benefits working
4. US4 (Full Story fields) → Context/Why working
5. US5 (Basic Story advice) → unified template complete across all waves
6. US6 (Story Title) → story identity widget live
7. US7 (Progress Bars) → full accessibility + visual progress tracking
8. Polish → typography, README, final audit

---

## Implementation Summary

| Phase | User Story | Tasks | Files Touched |
|-------|-----------|-------|--------------|
| 1: Setup | — | T001–T004 | `fonts/` |
| 2: Foundational | — | T005–T010 | `app.js`, `style.css`, `service-worker.js`, `index.html` |
| 3: Wave Navigation | US1 (P1) | T011–T016 | `app.js`, `index.html`, `style.css` |
| 4: Real-Time Preview | US2 (P1) | T017–T024 | `app.js`, `index.html`, `style.css` |
| 5: Detailed Story | US3 (P2) | T025–T029 | `index.html`, `app.js`, `style.css` |
| 6: Full Story | US4 (P3) | T030–T033 | `index.html`, `app.js` |
| 7: Basic Story Advice | US5 (P3) | T034–T037 | `index.html`, `app.js` |
| 8: Story Title | US6 (P4) | T038–T043 | `index.html`, `app.js`, `style.css` |
| 9: Progress Bars | US7 (P4) | T044–T047 | `index.html`, `app.js`, `style.css` |
| 10: Polish | — | T048–T052 | `style.css`, `README.md` |

**Total tasks**: 52 | **Parallel opportunities**: 21 tasks marked [P] | **No test tasks** (not requested)

---

## Notes

- `[P]` tasks affect different files — safe to run in parallel with other `[P]` tasks in the same phase
- `[Story]` label maps each task to a user story for traceability back to spec.md
- All user content MUST be written to the DOM via `.textContent` — never `innerHTML` — to prevent XSS
- Commit after each phase checkpoint to keep git history clean and rollback safe
- Stop after Phase 3+4 (US1+US2) for the first demo opportunity — the app is already useful
