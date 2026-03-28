# Implementation Plan: Story Builder UI Polish

**Branch**: `004-story-builder-polish` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)

## Summary

Polish the Story Builder UI to fix information hierarchy, replace the save banner with a structured Story Builder bar (title + save + completion), unify auth controls in the top bar, add wave-level completion indicators, and rename pane labels to "Craft" / "View". All changes are frontend-only (HTML, CSS, JS) — no backend or schema changes.

---

## Technical Context

**Language/Version**: JavaScript ES2020, HTML5, CSS3 (vanilla, no transpilation)
**Primary Dependencies**: None — zero runtime dependencies (constitution requirement)
**Storage**: Client-side sessionStorage for dirty queue; no new storage
**Testing**: Manual visual testing via quickstart.md scenarios
**Target Platform**: Modern evergreen browsers, large screen (existing v0.3 constraint)
**Project Type**: Web application — frontend only
**Performance Goals**: Real-time UI updates on field change (existing behavior)
**Constraints**: No new dependencies; frontend-only; WCAG 2.1 AA on new interactive elements

---

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | No new dependencies. Removes the save banner (simplification). |
| II. Methodology Fidelity | ✅ PASS | Field names, delivery order, and wave names are unchanged. "Craft" / "View" are UI chrome labels, not methodology terminology. |
| III. Responsive & Progressive | ⚠️ KNOWN VIOLATION | "Large screen only" was established in v0.3 and is explicitly scoped to this feature. No regression introduced. |
| IV. Readability & Maintainability | ✅ PASS | Vanilla JS, small focused changes. |
| V. Incremental Story-Level Growth | ✅ PASS | This is UI polish, not a new story level. |
| VI. Elegant & Focused UI/UX | ✅ PASS | This spec exists specifically to improve elegance and focused hierarchy. |

**Complexity Tracking**:

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Large screen only (Principle III) | Carried over from v0.3 | Responsive layout is a separate feature increment not in scope for this polish pass |

---

## Project Structure

### Documentation (this feature)

```text
specs/004-story-builder-polish/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── quickstart.md        # Test scenarios ✅
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (affected files)

```text
frontend/
├── index.html           # DOM changes: top bar auth, story-builder-bar, pane labels
├── style.css            # New + updated CSS: .story-builder-bar, .save-btn, .wave-card--complete, pane headers
├── app.js               # Wave completion logic: toggle .wave-card--complete on field change
└── auto-save.js         # isDirty flag: set on input, clear on save; expose for Save button
```

No backend files changed. No new files added (extending existing modules only).

---

## Phase 0 Output: Research

See [research.md](research.md) — all decisions resolved, no unknowns.

Key decisions:
1. **Dirty flag**: `isDirty` boolean in `auto-save.js`, set on `input`, cleared on save
2. **Story Builder bar**: new `.story-builder-bar` element wrapping story title + save button + wave-nav (wave-nav relocated inside it)
3. **Top bar anon**: single "Magic Login or Signup" button replaces "Log in" + "Sign up" pair
4. **Wave completion**: `.wave-card--complete` CSS class toggled by `app.js` when all wave steps are filled
5. **Pane labels**: visible `<h2>` elements added inside `.left-pane` and `.right-pane`

---

## Phase 1 Output: Design

### Data Model

No new entities. No schema changes. The `isDirty` flag is ephemeral client-side state — not persisted.

### UI Component Contracts

#### `.story-builder-bar`

New element placed between `<header>` and `.app-container`.

```
.story-builder-bar
├── .story-builder-bar__heading        — "Story Builder" text, non-interactive
├── .story-builder-bar__title-row      — flex row: title widget left, save button right
│   ├── #story-title-display / #story-title-input  — moved from .story-title-widget
│   └── #btn-save                      — Save button
└── .wave-nav                          — moved from standalone position; now row 3 of bar
```

**States of `#btn-save`**:

| Condition | Visual state | Click behavior |
|-----------|-------------|----------------|
| Anonymous user | Greyed (disabled appearance) | No-op |
| Authenticated, no dirty changes | Greyed (disabled appearance) | No-op |
| Authenticated, dirty changes | Active (primary button style) | PATCH current StoryVersion |

#### `.wave-card--complete`

Added to `.wave-card` when all `.wave-step` children have `.wave-step--filled`.

Visual: checkmark icon or "✓" badge visible in `.wave-card-body`.

#### Top bar auth (anonymous)

```html
<!-- before -->
<div class="auth-nav--anon">
  <button id="btn-login">Log in</button>
  <button id="btn-signup">Sign up</button>
</div>

<!-- after -->
<div class="auth-nav--anon">
  <button id="btn-login-signup">Magic Login or Signup</button>
</div>
```

Clicking `#btn-login-signup` opens the existing auth modal (same behavior as the old "Sign up" button).

#### Top bar auth (authenticated)

```html
<!-- after -->
<div class="auth-nav--authed" hidden>
  <button id="btn-profile">Profile</button>
  <!-- Profile button opens existing profile modal -->
</div>
```

#### Pane headers

```html
<!-- left pane: add inside .left-pane -->
<h2 class="pane-label">Craft</h2>

<!-- right pane: add inside .right-pane -->
<h2 class="pane-label">View</h2>
```

### JS Touch Points

**`auto-save.js`**:
- Add `let isDirty = false` module variable
- Set `isDirty = true` in the `input` event listener (already fires on field change)
- Set `isDirty = false` on successful PATCH response
- Export `isDirty` getter function for Save button to read
- Add `manualSave()` function: if authenticated and dirty, call PATCH immediately; else no-op

**`app.js`**:
- Extend `updateWaveProgress()` (or equivalent field-update function) to check if all steps in a wave are filled after each update and toggle `.wave-card--complete` on the card

**`index.html`**:
- Replace `auth-nav--anon` two-button block with single button
- Simplify `auth-nav--authed` to "Profile" button
- Remove `.save-banner` and `.story-title-widget` divs
- Add `.story-builder-bar` with three rows (heading, title-row, wave-nav)
- Move `.wave-nav` inside `.story-builder-bar`
- Add `.pane-label` headings inside `.left-pane` and `.right-pane`

**`style.css`**:
- New rules: `.story-builder-bar`, `.story-builder-bar__heading`, `.story-builder-bar__title-row`
- New rule: `.wave-card--complete` (complete state visual)
- New rule: `.pane-label`
- Remove: `.save-banner` rules
- Update: `.auth-nav--anon` for single button layout

### auth.js touch points

- Update `_updateAuthUI()` (or equivalent) to toggle `#btn-login-signup` vs `#btn-profile` (instead of btn-login/btn-signup vs the existing authed nav)
- Wire `#btn-login-signup` to open auth modal (same as old btn-signup)
- Wire `#btn-save` to call `manualSave()` from `auto-save.js`
