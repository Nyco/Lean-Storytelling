# Tasks: Basic Story Form

**Branch**: `001-basic-story-form` | **Date**: 2026-03-24
**Input**: Design documents from `/specs/001-basic-story-form/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Tech stack**: Vanilla HTML5 / CSS3 / JavaScript ES2020 · Zero dependencies · AGPLv3 · GitHub Pages

**Organization**: Tasks grouped by user story — each story is independently implementable and testable.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable — different file from other [P] tasks, no shared dependency
- **[Story]**: User story this task belongs to (US1–US5)
- Exact file paths included in every task description

---

## Phase 1: Setup (Project Skeleton)

**Purpose**: Create all source files and static assets from scratch so Phase 2 and story phases can proceed.

- [x] T001 Create `index.html` — semantic HTML5 shell with `<meta http-equiv="Content-Security-Policy" content="default-src 'self'">`, PWA `<link rel="manifest">`, viewport meta, and empty `<main>` with `#form-view` and `#story-view` sections
- [x] T002 [P] Create `style.css` — CSS custom properties (colour tokens, spacing scale, type scale), full browser reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }`), and `body` baseline (font-family, line-height, background)
- [x] T003 [P] Create `app.js` — module scaffold: `DOMContentLoaded` entry point, empty named functions for `initSession()`, `showView(id)`, `handleSubmit()`, `handleEdit()`, `handleCancel()`
- [x] T004 [P] Create `prompts.js` — `const PROMPTS = { target: { default:[], unsure:[], 'needs-review':[], confirmed:[] }, problem: {...}, solution: {...} }` with placeholder arrays (to be filled in Phase 7)
- [x] T005 [P] Create `consistency.js` — `const STOPWORDS = [...]` list (~30 words) and stub functions `getSignificantWords(text)`, `evaluatePair(a, b)`, `getObservations(story)` returning empty array
- [x] T006 [P] Create `manifest.json` — `{ "name": "Lean Storytelling", "short_name": "Story", "start_url": "/", "display": "standalone", "background_color": "#ffffff", "theme_color": "#1a1a2e", "icons": [{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"}] }`
- [x] T007 [P] Create `service-worker.js` — cache name `leanstory-v1`, `install` event pre-caches `['/', '/index.html', '/style.css', '/app.js', '/prompts.js', '/consistency.js', '/manifest.json']`, `fetch` event returns cache-first with network fallback

**Checkpoint**: All source files exist. App loads in browser (blank page, no errors in console).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user story phases depend on. Must be complete before any story work begins.

**⚠️ CRITICAL**: No user story phase can start until this phase is complete.

- [x] T008 Implement `sessionStorage` wrapper in `app.js` — `loadSession()` reads and parses `leanstory_session`; `saveSession(story)` serialises and writes; both catch `SecurityError`/`QuotaExceededError` and fall back to module-level in-memory object `_memoryFallback`; on parse failure reset to empty story; show one non-blocking `<p class="notice">` if fallback is active
- [x] T009 Implement Story object factory in `app.js` — `createStory()` returns `{ target:'', targetStatus:null, problem:'', problemStatus:null, solution:'', solutionStatus:null }`; `normaliseStory(story)` trims all string fields and sets `*Status` to `null` where paired content is `""`
- [x] T010 Implement view router in `app.js` — `showView('form'|'story')` toggles `hidden` attribute on `#form-view` / `#story-view`; register service worker inside `if ('serviceWorker' in navigator)` guard on `DOMContentLoaded`

**Checkpoint**: `loadSession()`, `saveSession()`, `createStory()`, `normaliseStory()`, `showView()` all callable from console. Service worker registered on `localhost`.

---

## Phase 3: User Story 1 — Fill the Basic Story (Priority: P1) 🎯 MVP

**Goal**: A user can open the app, read field labels and hints, fill any combination of fields, submit, and see their assembled story. This is the complete standalone MVP.

**Independent Test**: Open app → fill Target only → submit → story view shows Target content and indicates Problem/Solution as empty. Open app → submit with all fields empty → inline prompt appears, no navigation.

- [x] T011 [US1] Add form view HTML to `#form-view` in `index.html` — `<form id="story-form">` containing three `<fieldset>` groups, each with `<label for="...">` (Target / Problem / Solution), `<p class="hint">` coaching text per the playbook, `<textarea id="target|problem|solution" name="...">`, and a `<button type="submit">View my story</button>` at the end
- [x] T012 [P] [US1] Style form view in `style.css` — `.story-form` layout (single column, max-width 640px, centred), `fieldset` (border-none, margin-bottom spacing), `label` (bold, display block), `.hint` (muted colour, small size, margin-bottom), `textarea` (full-width, min-height 120px, border, border-radius, padding, resize vertical), `button[type=submit]` (primary colour, full-width, padding, border-radius, cursor pointer, hover state)
- [x] T013 [US1] Implement form population in `app.js` — `populateForm(story)` sets each textarea's `.value` from session; call `populateForm(loadSession())` on `DOMContentLoaded` in the form init path
- [x] T014 [US1] Implement empty-state guard in `app.js` — in `handleSubmit()`: after `normaliseStory()`, if all three content fields are `""`, inject message `"Fill at least one field to build your story."` into `<p id="empty-hint" role="alert" aria-live="polite">` (add this element to `index.html` above the form); clear message when any textarea receives `input` event
- [x] T015 [US1] Implement story view HTML in `#story-view` in `index.html` — three `<section class="story-field">` blocks (one per field) each with `<h2>` field name, `<div class="field-content">` (filled text or `<em class="empty-placeholder">not yet filled</em>`), and an `<button id="edit-btn">Edit</button>` at the bottom of the view
- [x] T016 [P] [US1] Style story view in `style.css` — `#story-view` layout (single column, max-width 640px, centred), `.story-field` (margin-bottom, padding), `.story-field h2` (field label style), `.field-content` (readable body text, line-height), `.empty-placeholder` (italic, muted colour), `#edit-btn` (secondary button style)
- [x] T017 [US1] Implement `renderStoryView(story)` in `app.js` — for each field: if content non-empty set `textContent` of `.field-content`; else insert `<em class="empty-placeholder">not yet filled</em>`; then call `showView('story')`
- [x] T018 [US1] Wire submit flow in `app.js` — `handleSubmit(event)`: `event.preventDefault()`, read textarea values into story object, call `normaliseStory()`, empty-state guard (T014), `saveSession(story)`, `renderStoryView(story)`; attach to `<form>` `submit` event on init

**Checkpoint**: US1 fully functional. Fill form → submit → story view shows content. Empty submit → prompt. All 5 acceptance scenarios of US1 pass manually.

---

## Phase 4: User Story 2 — Mark Field Confidence Status (Priority: P2)

**Goal**: Each field has a status selector. Selected status persists through session and displays as a badge in the story view.

**Independent Test**: Fill Target, set status to "Confirmed / Validated", submit → story view shows Target content with a "Confirmed" badge. Clear field content → badge absent on resubmit.

- [x] T019 [US2] Add status `<select>` per field in `index.html` — inside each `<fieldset>`, after `<textarea>`, add `<label for="target-status" class="sr-only">Target confidence</label><select id="target-status" name="targetStatus"><option value="">— no status —</option><option value="unsure">Unsure / Assumption / Hypothesis</option><option value="needs-review">Needs review / Iteration</option><option value="confirmed">Confirmed / Validated</option></select>`; repeat for problem and solution
- [x] T020 [P] [US2] Style status selectors and badges in `style.css` — `select` (full-width, border, border-radius, padding, appearance reset, chevron background-image); `.status-badge` (inline-block, padding, border-radius, font-size small, font-weight medium); badge colour variants: `.badge-unsure` (amber background), `.badge-needs-review` (blue background), `.badge-confirmed` (green background)
- [x] T021 [US2] Extend `populateForm(story)` in `app.js` — also set each `<select>` `.value` from `story.*Status`
- [x] T022 [US2] Extend `handleSubmit()` in `app.js` — read each `<select>` `.value` into `story.*Status`; `normaliseStory()` already resets status if content empty (T009)
- [x] T023 [US2] Extend `renderStoryView(story)` in `app.js` — after rendering field content, if `story.*Status` is non-null, append `<span class="status-badge badge-{status}">{label}</span>` inside `.story-field`; status→label map: `unsure`→"Unsure / Assumption", `needs-review`→"Needs review", `confirmed`→"Confirmed / Validated"

**Checkpoint**: US2 fully functional. Status badge appears/disappears correctly. Status cleared when field content removed. All 4 acceptance scenarios of US2 pass manually.

---

## Phase 5: User Story 3 — View, Validate & Check Consistency (Priority: P3)

**Goal**: After submission the story view shows structured consistency observations for Target↔Problem and Problem↔Solution pairs.

**Independent Test**: Fill Target "Product managers" and Solution "A dashboard", leave Problem empty → submit → observations section shows one connected/evaluable pair observation and one "incomplete" note for the missing pair.

- [x] T024 [US3] Implement `getSignificantWords(text)` in `consistency.js` — lowercase, split on non-word chars, filter out words ≤ 3 chars and words in `STOPWORDS`, return `Set`
- [x] T025 [US3] Implement `evaluatePair(textA, textB, pairKey)` in `consistency.js` — if either text `""`: return `{ pair: pairKey, type: 'incomplete', message: 'One or both fields empty — cannot evaluate.' }`; if either text < 10 chars: return `{ ..., type: 'too-short', message: 'Content too short to evaluate — consider expanding.' }`; compute word overlap; if overlap ≥ 1: return `{ ..., type: 'connected', message: 'These fields appear connected.' }`; else return `{ ..., type: 'disconnect', message: 'Possible disconnect — check that ...' }` (use distinct messages for target-problem vs problem-solution per research.md)
- [x] T026 [US3] Implement `getObservations(story)` in `consistency.js` — call `evaluatePair(story.target, story.problem, 'target-problem')` and `evaluatePair(story.problem, story.solution, 'problem-solution')`; return array of two observations
- [x] T027 [US3] Add consistency section HTML to `#story-view` in `index.html` — `<section id="consistency-section"><h2>Consistency</h2><ul id="consistency-list"></ul></section>` inserted between story fields and the Edit button
- [x] T028 [P] [US3] Style consistency section in `style.css` — `#consistency-section` (margin-top); `#consistency-list li` (list-style none, padding, border-left 3px solid); colour-coded border per type: `.obs-connected` (green), `.obs-disconnect` (amber), `.obs-too-short` (grey), `.obs-incomplete` (grey lighter)
- [x] T029 [US3] Extend `renderStoryView(story)` in `app.js` — import/call `getObservations(story)`, clear `#consistency-list`, for each observation append `<li class="obs-{type}">{message}</li>`

**Checkpoint**: US3 fully functional. Consistency observations appear for all pair/fill combinations. All 4 acceptance scenarios of US3 pass manually.

---

## Phase 6: User Story 4 — Review & Edit (Priority: P4)

**Goal**: From the story view the user can return to the form pre-filled, edit, resubmit (refreshing all output) or cancel (restoring the unchanged story view).

**Independent Test**: Submit a story → click Edit → form shows prior values and statuses → change Problem → resubmit → story view reflects new Problem, consistency and coaching refresh. Click Edit again → click Cancel → original story view restored.

- [x] T030 [US4] Add Cancel button to form edit mode in `index.html` — inside `#form-view` add `<button type="button" id="cancel-btn" hidden>Cancel</button>` alongside the submit button
- [x] T031 [P] [US4] Style edit mode UI in `style.css` — `#cancel-btn` (secondary/ghost button style, margin-left); add rule to update submit button text via `[data-edit-mode] button[type=submit]::after` or by swapping a `data-` attribute — coordinate with T032 JS approach
- [x] T032 [US4] Implement `enterEditMode()` in `app.js` — set `_editMode = true`; call `populateForm(loadSession())`; show `#cancel-btn` (remove `hidden`); change submit button `textContent` to `"Update story"`; call `showView('form')`; attach one-time `cancel-btn` click → `exitEditMode(false)`
- [x] T033 [US4] Implement `exitEditMode(save)` in `app.js` — if `save === false`: call `renderStoryView(loadSession())` (re-render from session, no save), hide `#cancel-btn`, reset submit label to `"View my story"`, set `_editMode = false`; wire Edit button click in story view → `enterEditMode()`
- [x] T034 [US4] Ensure full refresh on edit+resubmit in `app.js` — in `handleSubmit()`, after saving session, always re-run `getObservations()` and coaching prompt selection before calling `renderStoryView()`; call `exitEditMode(true)` to reset UI state

**Checkpoint**: US4 fully functional. Edit/cancel/resubmit all work. Observations and prompts refresh on resubmit. All 3 acceptance scenarios of US4 pass manually.

---

## Phase 7: User Story 5 — Receive Coaching Questions & Suggestions (Priority: P5)

**Goal**: After submission the story view shows 2–3 open-ended coaching prompts per filled field, weighted by field status.

**Independent Test**: Fill all three fields, set Target to "Confirmed", submit → coaching section shows ≥1 prompt per field; Target prompts lean toward deepening; refresh by editing and resubmitting → prompts update.

- [x] T035 [US5] Fill `PROMPTS` object in `prompts.js` with real content — at least 5 open-ended prompts per field per bucket (`default`, `unsure`, `needs-review`, `confirmed`); prompts must be non-yes/no, invite reflection; ensure `unsure` bucket leans toward validation ("How could you test this assumption?") and `confirmed` leans toward deepening ("What nuance or context would strengthen this further?")
- [x] T036 [US5] Implement `selectPrompts(story)` in `app.js` — for each field key (`target`, `problem`, `solution`): skip if content `""`; resolve status key (null → `'default'`); get `PROMPTS[field][statusKey]`; Fisher-Yates shuffle seeded by `content.length % arrayLength`; take first 2–3; return `{ target: [...], problem: [...], solution: [...] }`
- [x] T037 [US5] Add coaching section HTML to `#story-view` in `index.html` — `<section id="coaching-section"><h2>Coaching</h2><div id="coaching-target" class="coaching-group" hidden></div><div id="coaching-problem" class="coaching-group" hidden></div><div id="coaching-solution" class="coaching-group" hidden></div></section>` inserted after `#consistency-section`
- [x] T038 [P] [US5] Style coaching section in `style.css` — `#coaching-section` (margin-top, padding-top, border-top); `.coaching-group` (margin-bottom); `.coaching-group h3` (field name label, small caps or subdued style); `.prompt-item` (padding, border-left, font-style italic, margin-bottom small)
- [x] T039 [US5] Extend `renderStoryView(story)` in `app.js` — call `selectPrompts(story)`; for each field: if prompts array non-empty, un-hide `#coaching-{field}`, set inner HTML to `<h3>{Field}</h3><ul>{prompts as <li class="prompt-item">}</li></ul>`; else hide the group

**Checkpoint**: US5 fully functional. ≥1 prompt per filled field. Status-weighted prompts visible. Refresh on resubmit confirmed. All 5 acceptance scenarios of US5 pass manually.

---

## Phase 8: Polish & Compliance

**Purpose**: Visual completeness, accessibility, security hardening, PWA readiness, and full QA.

- [x] T040 [P] Complete visual design in `style.css` — finalise full colour palette (background, surface, primary, accent, muted, danger); complete typography scale (h1–h3, body, small, hint); spacing system (4px base unit, t-shirt scale); smooth transitions on view switch (`transition: opacity 0.2s ease`); status badge final colours; button hover/active/focus states; all elements deliberately styled — no raw browser defaults remain
- [x] T041 [P] WCAG 2.1 AA pass in `index.html` and `style.css` — add `aria-describedby="target-hint"` (etc.) to each textarea referencing its hint `<p>`; add `id` attributes to all hint paragraphs; ensure all `<select>` have explicit `<label>`; add `class="sr-only"` CSS rule (`position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0)`) for screen-reader-only labels; verify `:focus-visible` outline on all interactive elements; colour contrast ≥ 4.5:1 for all text
- [x] T042 [P] Add `icon-192.png` and `icon-512.png` PWA icons to repo root — create simple SVG-based icons or use a placeholder PNG (plain coloured square with "LS" text is sufficient for v1); reference paths match `manifest.json`
- [x] T043 Verify CSP enforcement — open app in Chrome with DevTools Network tab; confirm zero requests to external origins; confirm Console shows no CSP violation errors; test that an injected `<script>` tag in DevTools is blocked
- [x] T044 Run Lighthouse audit against `http://localhost:8080` — target: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, PWA ≥ 90; resolve any flagged issues before marking complete
- [x] T045 Run axe DevTools scan — open form view, run scan, resolve all critical/serious violations; repeat on story view; target: zero critical/serious issues
- [x] T046 Manual QA — run all 23 acceptance scenarios from `specs/001-basic-story-form/quickstart.md` checklist; tick each; resolve any failures
- [x] T047 [P] Cross-browser smoke test — verify form fill → submit → story view → edit → resubmit flow in Chrome, Firefox, and Safari (desktop viewport + 375px mobile viewport in DevTools); note and fix any rendering differences
- [x] T048 [P] Create `docs/APP_RUN_DEPLOY.md` — copy/adapt local run and deploy instructions from `specs/001-basic-story-form/quickstart.md` for end-user audience (shorter, no QA steps, just "how to run" and "how to deploy to GitHub Pages")

---

## Phase 9: UX Redesign — Wave Navigation, Split Screen & Design Refresh

**Purpose**: Implement sticky wave navigation bar, two-column layout, right-pane story preview, per-wave progress bars, design color refresh, and fake-door placeholders for consistency check and coaching. Addresses FR-015–FR-019 and the updated FR-011.

**Dependencies**: Phases 1–8 complete. All new tasks can be executed in dependency order within this phase.

- [x] T049 Add sticky wave navigation bar HTML to `index.html` — a `<nav class="wave-nav">` placed below the app title containing three `<div class="wave-card">` elements: Wave 1 `data-wave="1"` with title "Basic Story" and subtitle "Setup the mandatory and fundamental building blocks"; Wave 2 `data-wave="2"` with title "Detailed Story" and subtitle "Enrich with depth and connection" and `aria-disabled="true"`; Wave 3 `data-wave="3"` with title "Full Story" and subtitle "Add the finishing touch" and `aria-disabled="true"`; each card contains an empty `<div class="wave-progress">` at the bottom; Wave 1 gets class `wave-card--active`, Wave 2 and 3 get class `wave-card--inactive`
- [x] T050 [P] Style wave navigation bar in `style.css` — `.wave-nav` sticky (position: sticky; top: 0; z-index: 100); flex row, gap, padding, background white/near-white, border-bottom; `.wave-card` flex-1, padding, border-radius, cursor default; `.wave-card--active` blue/green accent border-top (3px), slightly elevated background tint; `.wave-card--inactive` opacity 0.45, cursor not-allowed, pointer-events none; wave title bold, subtitle small muted; overall aesthetic: zen, minimal, clean
- [x] T051 Add wave-specific progress bar step indicators HTML inside each `.wave-progress` in `index.html` — Wave 1: three `<span class="wave-step" data-step="target|problem|solution">` with text labels "Target", "Problem", "Solution"; Wave 2: three `<span class="wave-step wave-step--inactive">` "Empathy", "Consequences", "Benefits"; Wave 3: two `<span class="wave-step wave-step--inactive">` "Context", "Why"; each step span will receive class `wave-step--filled` via JS when the corresponding field has content
- [x] T052 [P] Style wave progress step indicators in `style.css` — `.wave-progress` flex row, gap small, margin-top small; `.wave-step` inline-block, padding 2px 6px, font-size 0.7rem, border-radius 99px, background light-neutral, color muted; `.wave-step--filled` background green-subtle, color green-dark; `.wave-step--inactive` opacity 0.4; smooth transition on fill state
- [x] T053 Restructure `index.html` for two-column layout — wrap the entire content area in `<div class="app-container">`; place `<div class="left-pane">` containing `#form-view`; place `<div class="right-pane">` containing a new `#story-preview` section; the existing `#story-view` toggle section is kept but hidden by default (progressive enhancement — right pane replaces its role on large screens)
- [x] T054 [P] Two-column CSS layout in `style.css` — `.app-container` CSS Grid with `grid-template-columns: 1fr 1fr`; column-gap; height: `calc(100vh - wave-nav-height)`; overflow-y auto on each pane; layout applies at all times (large screen only — no responsive breakpoint needed per FR-011 scope restriction); `.left-pane` and `.right-pane` padding, scroll independently
- [x] T055 Add right pane story preview HTML to `index.html` inside `#story-preview` — `<h2>Your Story</h2>`; three `<article class="preview-field">` blocks each with `<h3>` field name and `<div class="preview-content">` (empty state: `<p class="preview-placeholder-text">Your story will appear here — fill the form on the left to get started.</p>`); below story blocks: two `<section class="preview-placeholder preview-placeholder--disabled">` — one for "Consistency Check" with placeholder copy "Consistency analysis coming soon", one for "Coaching" with placeholder copy "Coaching questions coming soon"; both sections include a `<span class="coming-soon-badge">Coming soon</span>`
- [x] T056 [P] Style right pane story preview in `style.css` — `#story-preview` padding; `.preview-field` margin-bottom, padding-bottom, border-bottom light; `.preview-field h3` small-caps or subdued label style; `.preview-content` body text, line-height; `.preview-placeholder-text` italic, muted color; `.preview-placeholder--disabled` opacity 0.45, background light-neutral tint, border-radius, padding, margin-top; `.coming-soon-badge` inline-block, font-size 0.7rem, border-radius, border 1px dashed muted, padding 2px 8px, color muted
- [x] T057 Implement `updateStoryPreview(story)` in `app.js` — for each field (target, problem, solution): if content non-empty set `.preview-content` textContent; else restore placeholder text; call `updateStoryPreview(loadSession())` on DOMContentLoaded; call `updateStoryPreview(story)` at the end of `handleSubmit()` after `renderStoryView()`
- [x] T058 Implement Wave 1 progress bar step update in `app.js` — `updateWaveProgress()` reads current textarea values; for each step span (`[data-step="target|problem|solution"]`) toggles class `wave-step--filled` if the corresponding textarea has non-empty trimmed content; attach to each textarea `input` event and call once on DOMContentLoaded
- [x] T059 [P] Refresh color design tokens in `style.css` — replace or extend existing `--color-*` custom properties with subtle blue variants (`--color-blue-50` through `--color-blue-700`) and green variants (`--color-green-50` through `--color-green-700`); apply to: active wave card accent, wave step filled state, button primary color, status badge confirmed color, consistency obs-connected color, focus ring; keep backgrounds near-white/light neutral; verify all text contrast ratios meet WCAG 2.1 AA (≥ 4.5:1)

**Checkpoint**: Wave nav bar visible and sticky. Wave 1 active, Wave 2/3 visually disabled. Progress step indicators update as user fills fields. Two-column layout shows form left, story preview right. Right pane updates on submit. Consistency check and coaching are visible as inactive placeholders. Color tokens refreshed across all components.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; all T001–T007 can run in parallel
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks all story phases
- **Phase 3 (US1)**: Depends on Phase 2 — no dependency on other story phases; this IS the MVP
- **Phase 4 (US2)**: Depends on Phase 3 (extends form + story view from US1)
- **Phase 5 (US3)**: Depends on Phase 2 — can run in parallel with Phase 4 (separate files: consistency.js)
- **Phase 6 (US4)**: Depends on Phase 3 (extends edit flow from US1)
- **Phase 7 (US5)**: Depends on Phase 2 — can start in parallel (prompts.js separate from other story work)
- **Phase 8 (Polish)**: Depends on all story phases complete

### User Story Dependencies

| Story | Depends on | Can parallel with |
|-------|-----------|------------------|
| US1 (P1) | Foundation | — |
| US2 (P2) | US1 (extends form HTML) | US3 initial work |
| US3 (P3) | Foundation | US2, US5 (consistency.js independent) |
| US4 (P4) | US1 (extends edit flow) | US3, US5 |
| US5 (P5) | Foundation | US3 (prompts.js independent) |

### Parallel Opportunities Within Each Phase

**Phase 1**: T001–T007 all parallelizable (all different files)

**Phase 3 (US1)**:
```
Parallel group A: T011 (index.html form HTML) + T012 (style.css form styles)
Then: T013 (populateForm) + T014 (empty guard) → T017 (renderStoryView)
Parallel group B: T015 (index.html story HTML) + T016 (style.css story styles)
Then: T018 (wire submit)
```

**Phase 5 (US3)**:
```
Parallel: T024 (getSignificantWords) + T025 (evaluatePair) → T026 (getObservations)
Parallel: T027 (story HTML) + T028 (style.css) → T029 (wire to renderStoryView)
```

---

## Implementation Strategy

### MVP (User Story 1 only — Phases 1–3)

1. Complete Phase 1: Setup (all files exist)
2. Complete Phase 2: Foundational (session + router + story object)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 5 acceptance scenarios pass, offline works, CSP clean
5. Deploy to GitHub Pages — this is the shippable MVP

### Full Feature Delivery (all stories)

| Phase | Delivers |
|-------|---------|
| 1–3 | MVP: form + story view |
| + Phase 4 | Status tags and badges |
| + Phase 5 | Consistency observations |
| + Phase 6 | Edit loop |
| + Phase 7 | Coaching prompts |
| + Phase 8 | Polish, PWA, full QA |

Each phase is independently deployable and testable before the next begins.

---

## Task Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1: Setup | T001–T007 | 7 tasks |
| Phase 2: Foundational | T008–T010 | 3 tasks |
| Phase 3: US1 Fill Form (P1) 🎯 | T011–T018 | 8 tasks |
| Phase 4: US2 Status Tags (P2) | T019–T023 | 5 tasks |
| Phase 5: US3 Consistency (P3) | T024–T029 | 6 tasks |
| Phase 6: US4 Edit Loop (P4) | T030–T034 | 5 tasks |
| Phase 7: US5 Coaching (P5) | T035–T039 | 5 tasks |
| Phase 8: Polish & QA | T040–T048 | 9 tasks |
| Phase 9: UX Redesign | T049–T059 | 11 tasks |
| **Total** | | **59 tasks** |

**MVP scope**: T001–T018 (18 tasks, Phases 1–3)
