# Tasks: Wave Card Step Indicator Redesign

**Input**: Design documents from `/specs/005-wave-step-labels/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Organization**: US1 (border fix) is a single CSS task. US2 (step indicator redesign) has parallel HTML/CSS tasks followed by a sequential JS task. Both stories are P1.

---

## Phase 1: Setup

**Purpose**: Verify working directory. No new project initialization required — this feature modifies existing frontend files only.

- [X] T001 Verify current branch is `005-wave-step-labels` and working tree is clean

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No cross-story foundational work required. Both user stories modify independent CSS rules and one modifies the same HTML+JS. Proceed directly to user story phases.

*(No tasks — skip to Phase 3)*

---

## Phase 3: User Story 1 — Uniform Active Card Border (Priority: P1) 🎯 MVP

**Goal**: Remove the `border-top: 3px` override on `.wave-card--active` so all four card borders are the same 1.5px thickness. The active card remains visually distinct via blue border colour and light blue background.

**Independent Test**: Open the Story Builder. Inspect the active wave card — all four borders must appear equal in thickness. Click another card — the new active card also has uniform borders.

### Implementation

- [X] T002 [US1] In `frontend/style.css`, update `.wave-card--active`: remove the `border-top: 3px solid var(--color-blue-600)` declaration so only `border-color: var(--color-blue-500)` and `background: var(--color-blue-50)` remain (all four borders inherit the base `.wave-card` thickness of 1.5px)

**Checkpoint**: Active wave card has equal-thickness borders on all four sides.

---

## Phase 4: User Story 2 — Labeled and Separated Step Indicators (Priority: P1)

**Goal**: Each `.wave-step` gains three child elements — checkbox indicator, status emoji slot, field name label — displayed as a flex row. The wave-progress list becomes a vertical column. The status emoji and checkbox state are visually independent. JS is updated to target sub-elements rather than setting `textContent` on the outer span.

**Independent Test**: Open the Story Builder. Each wave card shows step rows with field names (Target, Problem, etc.), a checkbox circle, and a status slot. Fill a field and set a status — confirm checkbox fills and emoji appears in separate positions without overlap.

### Implementation

- [X] T003 [P] [US2] In `frontend/index.html`, replace all 8 flat `.wave-step` spans with the three-child structure below. Field name for each span is its canonical label. Example for Target:
  ```html
  <span class="wave-step" data-wave="basic" data-field="target" aria-label="Target: empty">
    <span class="wave-step__check" aria-hidden="true"></span>
    <span class="wave-step__status" aria-hidden="true"></span>
    <span class="wave-step__label">Target</span>
  </span>
  ```
  Apply the same structure for all 8 fields: Target, Problem, Solution (basic), Empathy, Consequences, Benefits (detailed), Context, Why (full).

- [X] T004 [P] [US2] In `frontend/style.css`, update `.wave-progress` to use column layout: change `flex-direction` to `column` and reduce `gap` to `var(--space-1)`; remove `flex-wrap: wrap`

- [X] T005 [P] [US2] In `frontend/style.css`, update the wave step rules:
  - Change `.wave-step` from a circle (`width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--color-border)`) to a flex row container: `display: flex; align-items: center; gap: 6px; font-size: var(--font-size-xs); color: var(--color-text-muted)` — remove all circle geometry from the outer element
  - Add `.wave-step__check`: `display: inline-flex; align-items: center; justify-content: center; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid var(--color-border); flex-shrink: 0; transition: background-color var(--transition-fast), border-color var(--transition-fast)`
  - Update `.wave-step--filled` to target the inner check: `.wave-step--filled .wave-step__check { background: var(--color-green-600); border-color: var(--color-green-600); }`
  - Add `.wave-step__status`: `width: 1.2em; flex-shrink: 0; text-align: center` (fixed-width slot; empty string shows no emoji but preserves alignment)
  - Add `.wave-step__label`: `color: var(--color-text-muted)` (inherits font-size from `.wave-step`)

- [X] T006 [US2] In `frontend/app.js`, update `updateWaveProgress()` inside `Object.entries(WAVE_STEP_FIELDS).forEach(...)`: after querying the outer `step`, add `const statusEl = step.querySelector('.wave-step__status')`; remove the three `step.textContent = ...` assignments; instead set `if (statusEl) statusEl.textContent = (filled && status && STATUS_EMOJI[status]) ? STATUS_EMOJI[status] : ''`; keep the `step.classList.toggle('wave-step--filled', filled)` and all `step.setAttribute('aria-label', ...)` logic unchanged

**Checkpoint**: Wave cards display labeled step rows with independent checkbox and status emoji slots. Fill/empty and status changes update in real time.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility review and quickstart validation.

- [X] T007 Review accessibility on modified elements: confirm `.wave-step__check` and `.wave-step__status` are `aria-hidden="true"` in HTML; confirm outer `.wave-step` aria-label is updated correctly by JS for all three states (empty, filled no-status, filled with-status); confirm `wave-step__label` text is not duplicated in the aria-label
- [X] T008 Run all 6 manual scenarios from `specs/005-wave-step-labels/quickstart.md` and confirm each passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **US1 (Phase 3)**: Start after setup — touches only `style.css` `.wave-card--active` rules; independent of US2
- **US2 (Phase 4)**: Start after setup — T003/T004/T005 can run in parallel (different files); T006 must follow T003 (needs HTML sub-elements in place)
- **Polish (Phase 5)**: After both US1 and US2 complete

### User Story Dependencies

- **US1 (P1)**: Independent — single CSS task, no dependency on US2
- **US2 (P1)**: Independent of US1 — but T006 depends on T003 being done first

### Parallel Opportunities

- T003 (HTML), T004 (CSS wave-progress), T005 (CSS wave-step) can all run in parallel — different files or independent rule sets
- T002 (US1 CSS) can run in parallel with any US2 task except T005 (both modify `style.css`) — if running sequentially, do T002 before T005 or merge into one editing pass

---

## Parallel Example: US2

```
# These can run simultaneously:
T003 — Restructure 8 .wave-step spans in index.html
T004 — Update .wave-progress to column layout in style.css
T005 — Add .wave-step__check, __status, __label rules in style.css

# Then follow with:
T006 — Update updateWaveProgress() in app.js (depends on T003 HTML structure)
```

---

## Implementation Strategy

### MVP First (US1)

1. T001: Verify branch
2. T002: Fix active card border (1 CSS line removed)
3. **Validate**: Confirm uniform borders — Scenario 1 from quickstart.md

### Full Delivery

4. T003 + T004 + T005 (parallel): HTML restructure + CSS rules
5. T006: JS update
6. T007 + T008: Accessibility review + quickstart validation

---

## Notes

- `[P]` = safe to run in parallel (different files or independent sections)
- All tasks are frontend-only — no server restarts required
- T002 is a removal task (delete one CSS line) — verify the active card still renders with a visible selected state after the change
- T006 modifies `updateWaveProgress()` only — no other JS changes required
- Total: 8 tasks across 4 phases
