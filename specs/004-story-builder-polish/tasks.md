# Tasks: Story Builder UI Polish

**Input**: Design documents from `/specs/004-story-builder-polish/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story. US1 and US2 are both P1 and must be done first (in sequence, as they share files). US3 and US4 are P2 and independent of each other.

---

## Phase 1: Setup

**Purpose**: No new project initialization needed — this feature modifies existing frontend files. Verify working directory and branch.

- [X] T001 Verify current branch is `004-story-builder-polish` and working tree is clean

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No cross-story foundational work required. All 4 user stories modify different logical sections of the app. Proceed directly to user story phases.

*(No tasks — skip to Phase 3)*

---

## Phase 3: User Story 1 — Clear App Identity and Navigation (Priority: P1) 🎯 MVP

**Goal**: Replace the two-button anonymous auth state ("Log in" + "Sign up") with a single "Magic Login or Signup" button. Update authenticated state to show a "Profile" menu.

**Independent Test**: Open app as anonymous user — confirm single "Magic Login or Signup" button. Log in — confirm "Profile" menu appears and "Magic Login or Signup" is hidden.

### Implementation

- [X] T002 [US1] In `frontend/index.html`, replace the two `<button>` elements inside `.auth-nav--anon` with a single `<button class="btn btn--primary" id="btn-login-signup">Magic Login or Signup</button>`
- [X] T003 [US1] In `frontend/index.html`, update `.auth-nav--authed` to contain a single `<button class="btn btn--ghost" id="btn-profile">Profile</button>` (remove any existing child elements that differ)
- [X] T004 [US1] In `frontend/auth.js`, replace all references to `#btn-login` and `#btn-signup` with `#btn-login-signup` (both buttons opened the auth modal — wire the new single button to the same handler); update `#btn-profile` handler to open the profile modal (same as before)
- [X] T005 [P] [US1] In `frontend/style.css`, update `.auth-nav--anon` rules to match single-button layout (remove any two-button spacing/gap that no longer applies)

**Checkpoint**: Top bar shows correct auth controls for anonymous and authenticated states.

---

## Phase 4: User Story 2 — Story Builder Context Bar (Priority: P1)

**Goal**: Remove `.save-banner`. Introduce `.story-builder-bar` containing three rows: (1) "Story Builder" heading, (2) story title + Save button, (3) wave cards as completion indicator. Add `isDirty` tracking and `manualSave()` to auto-save.

**Independent Test**: Load any story. Confirm the story builder bar is visible with three rows. Edit a field — confirm Save button becomes active. Click Save — confirm story saves to server and button returns to greyed state.

### Implementation

- [X] T006 [US2] In `frontend/auto-save.js`, add `let isDirty = false` module variable; set `isDirty = true` inside the existing field `input` event listener; set `isDirty = false` after a successful PATCH response; export a `getIsDirty()` getter function
- [X] T007 [US2] In `frontend/auto-save.js`, add `manualSave()` function: if `getIsDirty()` is true and user is authenticated, immediately call the same PATCH logic used by auto-save (bypass debounce); if not dirty or not authenticated, do nothing
- [X] T008 [US2] In `frontend/index.html`, remove the `.save-banner` div (`id="save-banner"`) and the standalone `.story-title-widget` div entirely
- [X] T009 [US2] In `frontend/index.html`, add a `.story-builder-bar` element between the `<header>` and the `.app-container` div containing:
  - Row 1: `<h2 class="story-builder-bar__heading">Story Builder</h2>`
  - Row 2: `<div class="story-builder-bar__title-row">` containing the story title elements (moved from the old `.story-title-widget`: `#story-title-display` and `#story-title-input`) and a new `<button class="btn btn--primary btn--sm" id="btn-save" disabled>Save</button>`
  - Row 3: move the entire `.wave-nav` `<nav>` element inside `.story-builder-bar` as the third row
- [X] T010 [US2] In `frontend/style.css`, add CSS rules for `.story-builder-bar` (full-width bar, background, padding matching app style), `.story-builder-bar__heading` (section label), and `.story-builder-bar__title-row` (flex row, title on left, save button on right)
- [X] T011 [US2] In `frontend/style.css`, add CSS rule for `#btn-save` disabled/greyed state (`opacity`, `cursor: default`, `pointer-events: none` when `disabled` attribute is set) and active state (inherits `.btn--primary`)
- [X] T012 [P] [US2] In `frontend/style.css`, remove the `.save-banner` CSS ruleset (it is no longer rendered)
- [X] T013 [US2] In `frontend/app.js` (or `auth.js`), wire `#btn-save`: import `manualSave` and `getIsDirty` from `auto-save.js`; on click call `manualSave()`; listen to the dirty-state change (e.g. a custom `dirtychange` event dispatched from `auto-save.js`) to toggle the `disabled` attribute on `#btn-save`; also update disabled state after successful save

**Checkpoint**: Story Builder bar is visible. Save button activates when fields are edited and saves successfully when clicked.

---

## Phase 5: User Story 3 — Wave Completion Feedback (Priority: P2)

**Goal**: Show a visual completion indicator on each wave card header when all fields in that wave are non-empty. Update in real time on field change.

**Independent Test**: Fill all 3 fields of Wave 1 — confirm Wave 1 card header shows a completion indicator. Leave one field empty — confirm it disappears.

### Implementation

- [X] T014 [P] [US3] In `frontend/index.html`, add a `<span class="wave-complete-badge" aria-hidden="true">✓</span>` inside each `.wave-card-body` div (one per wave card, 3 total)
- [X] T015 [P] [US3] In `frontend/style.css`, add `.wave-complete-badge { display: none; }` by default; add `.wave-card--complete .wave-complete-badge { display: inline; }` to reveal it when the card has the complete class; style the badge to match the design (color, size, positioning next to wave title)
- [X] T016 [US3] In `frontend/app.js`, extend the function that marks `.wave-step--filled` (called on every field change) to also check whether all `.wave-step` elements within a given `.wave-card` have `.wave-step--filled`; if so, add `.wave-card--complete` to the card; if not, remove it

**Checkpoint**: Each wave card shows a checkmark when all its fields are filled, and removes it in real time when a field is cleared.

---

## Phase 6: User Story 4 — Clear Left/Right Pane Labels (Priority: P2)

**Goal**: Add visible "Craft" and "View" labels to the left and right panes.

**Independent Test**: View the two-pane layout. Confirm left pane shows "Craft" label and right pane shows "View" label.

### Implementation

- [X] T017 [P] [US4] In `frontend/index.html`, add `<h2 class="pane-label">Craft</h2>` as the first child inside `.left-pane`
- [X] T018 [P] [US4] In `frontend/index.html`, add `<h2 class="pane-label">View</h2>` as the first child inside `.right-pane`
- [X] T019 [P] [US4] In `frontend/style.css`, add `.pane-label` CSS rule: style as a subtle section label (appropriate font size, weight, colour matching the existing pane header aesthetic from Principle VI)

**Checkpoint**: Both panes have visible labels.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, consistency review, and cleanup.

- [X] T020 Review `.story-builder-bar` visual design for consistency with app aesthetic: spacing, typography, colour all match Principle VI (refined minimalism); fix any visual inconsistencies in `frontend/style.css`
- [X] T021 Verify WCAG 2.1 AA compliance on new interactive elements: `#btn-save` has appropriate `aria-label` or visible text; `#btn-login-signup` is accessible; wave completion badges are `aria-hidden` (decorative)
- [X] T022 Run all 6 manual scenarios from `specs/004-story-builder-polish/quickstart.md` and confirm each passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **US1 (Phase 3)**: Start after setup — no dependencies
- **US2 (Phase 4)**: Start after US1 — shares `index.html` and `auth.js`; run sequentially
- **US3 (Phase 5)**: Independent of US1 and US2 — can start after setup; shares `index.html` and `app.js`
- **US4 (Phase 6)**: Independent of all others — can start after setup; shares `index.html`
- **Polish (Phase 7)**: After all user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent — start after setup
- **US2 (P1)**: Must follow US1 — both touch `index.html` auth area; sequential preferred
- **US3 (P2)**: Independent of US1/US2 — touches `app.js` and wave-card HTML
- **US4 (P2)**: Independent of all — touches only pane div headers and CSS

### Parallel Opportunities

- US3 and US4 can run in parallel (different sections of `index.html`, different CSS rules, different JS)
- Within US3: T014 (HTML) and T015 (CSS) can run in parallel
- Within US4: T017 (HTML left), T018 (HTML right), T019 (CSS) can all run in parallel

---

## Parallel Example: US3 + US4 together

```
# These can all run simultaneously:
T014 — Add .wave-complete-badge HTML spans (index.html, wave cards)
T015 — Add .wave-complete-badge CSS rules (style.css)
T017 — Add pane-label "Craft" to left pane (index.html)
T018 — Add pane-label "View" to right pane (index.html)
T019 — Add .pane-label CSS rule (style.css)

# Then follow with:
T016 — Extend wave completion logic in app.js (depends on T014/T015 being in place)
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. T001: Verify branch
2. Phase 3 (US1): Fix top bar — 4 tasks
3. Phase 4 (US2): Add Story Builder bar — 8 tasks
4. **Validate**: Test top bar and Story Builder bar manually (Scenarios 1–4 from quickstart.md)

### Full Delivery

5. Phase 5 (US3): Wave completion feedback — 3 tasks
6. Phase 6 (US4): Pane labels — 3 tasks
7. Phase 7 (Polish): Review + quickstart validation — 3 tasks

---

## Notes

- `[P]` = safe to run in parallel (different logical sections or files)
- All tasks are frontend-only — no server restarts required
- `auto-save.js` changes (T006, T007) are the only JS module additions; keep them minimal
- The `isDirty` event notification to `#btn-save` (T013) should use a simple custom DOM event (`dirtychange`) dispatched on `document` — avoids tight coupling between modules
- Commit after each phase checkpoint
- Total: 22 tasks across 6 phases
