# Research: Story Builder UI Polish

**Feature**: 004-story-builder-polish
**Date**: 2026-03-27
**Status**: Complete — no unknowns

---

## Decision: Dirty flag implementation

**Decision**: Track unsaved changes via a simple boolean `isDirty` module variable in `auto-save.js`. Set on any field `input` event, cleared on successful save (both auto-save and manual).

**Rationale**: The simplest possible approach — no additional data structure, no persistence, no reactivity library. Matches existing code style (module-level state variables already used in auto-save.js for the queue and debounce timer).

**Alternatives considered**:
- Comparing field values to last-saved snapshot: more accurate but higher complexity, not needed given debounced auto-save already handles most cases.
- Custom event / pub-sub: overkill for a single boolean state.

---

## Decision: Story Builder Bar layout

**Decision**: Introduce a new `.story-builder-bar` element between the `<header>` and `.app-container`. It contains three rows:
1. "Story Builder" heading
2. Story title (existing `.story-title-widget` content, moved here) + Save button
3. Wave nav cards (existing `.wave-nav`, moved here)

The `.save-banner` is removed. The `.story-title-widget` standalone div is removed. The `.wave-nav` is moved inside `.story-builder-bar`.

**Rationale**: Consolidating into one bar gives a single coherent context band for the Story Builder. Re-using the existing wave cards avoids duplication. Moving the title into this bar satisfies the information hierarchy (app title in header → Story Builder label in bar → story title inline).

**Alternatives considered**:
- Keeping `.wave-nav` separate and adding a new summary row: would duplicate wave completion data.
- Using the `<header>` for story context: would mix app identity with document context — violates Principle VI (one focal point per screen zone).

---

## Decision: Top bar auth controls

**Decision**: Replace the two-button anonymous state ("Log in" + "Sign up") with a single "Magic Login or Signup" button that opens the existing auth modal. The authenticated state shows a "Profile" dropdown/menu.

**Rationale**: The v0.3 spec already merged sign-up and login into one magic link flow. Having two buttons that do the same thing is misleading. One button is simpler and matches the actual UX.

**Alternatives considered**:
- Keep two buttons with different labels ("Log in" / "Sign up") but both opening the same modal: creates false distinction, confuses users.

---

## Decision: Wave completion indicator on card headers

**Decision**: Add a CSS class `.wave-card--complete` applied when all steps in a wave have `.wave-step--filled`. Show a visual checkmark (✓) or completion badge inside `.wave-card-body` when this class is present. The JS that already updates `.wave-step--filled` in `app.js` will be extended to also toggle `.wave-card--complete`.

**Rationale**: Minimal JS change. The step dots already carry the completion state — the card-level class just surfaces it visually at the header. Reuses existing DOM structure.

**Alternatives considered**:
- Separate completion tracking object: unnecessary when the DOM already encodes state.

---

## Decision: Pane labels

**Decision**: Add a `<h2>` or visible heading element inside `.left-pane` and `.right-pane` with text "Craft" and "View" respectively. Style as section headers within each pane.

**Rationale**: The current panes have no visible label. Adding a simple heading achieves FR-019/FR-020 without structural changes.

**Alternatives considered**:
- `aria-label` only: meets accessibility but user can't see the label. Fails the acceptance scenario.

---

## No unknowns remain

All decisions derive from existing code patterns. No new dependencies. No NEEDS CLARIFICATION items.
