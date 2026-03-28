# Feature Specification: Wave Card Step Indicator Redesign

**Feature Branch**: `005-wave-step-labels`
**Created**: 2026-03-27
**Status**: Draft

## Context

The wave progress indicators (the small dot/circle elements inside each wave card) have three usability issues discovered after the Story Builder UI Polish (v0.4):

1. The active wave card has a visually heavier top border than its left, right, and bottom borders — inconsistent and visually odd.
2. The step dots give no indication of which story element they represent — a user cannot tell which dot corresponds to Target, Problem, or Solution without knowing the order.
3. The checkbox dot and status emoji occupy the same visual slot — when both are present (e.g., green dot + green "confirmed" emoji), they visually merge and neither is readable.

All changes are frontend-only.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Uniform Active Card Border (Priority: P1)

A user viewing the wave navigation bar can clearly identify the selected wave card without the odd visual weight difference between the top and side borders.

**Why this priority**: The border inconsistency is a visible glitch on every page load. It is a minimal fix and unblocks the rest of the wave card visual improvements.

**Independent Test**: Open the Story Builder. Observe the active wave card (highlighted in blue). Confirm all four borders are the same thickness.

**Acceptance Scenarios**:

1. **Given** the Story Builder is open, **When** the user looks at the active wave card, **Then** all four borders are the same thickness — no border side appears thicker than another.
2. **Given** the active wave card, **When** compared to inactive cards, **Then** the active card is still visually distinct (e.g., via colour or background) despite having uniform border thickness.
3. **Given** the user clicks a different wave card, **When** it becomes active, **Then** the new active card also shows uniform borders.

---

### User Story 2 — Labeled and Separated Step Indicators (Priority: P1)

A user reading the wave cards can instantly understand which story fields are complete or incomplete, what each indicator represents, and what its validation status is — without ambiguity or visual overlap between the checkbox state and the status emoji.

**Why this priority**: Without field names, users must memorise field order to interpret the progress dots. Without separation of checkbox and status, the indicators are unreadable when both states are present. This is the core usability improvement of the feature.

**Independent Test**: Open the Story Builder. Look at the wave progress area inside any wave card. Confirm each step shows three distinct elements: a filled/empty checkbox, a status emoji slot (empty or showing an emoji), and the field name label. Fill a field and set its status — confirm all three update independently without visual overlap.

**Acceptance Scenarios**:

1. **Given** the wave progress indicators, **When** the user looks at any wave card, **Then** each step displays the name of its corresponding story field (e.g., "Target", "Problem", "Solution" for Basic Story).
2. **Given** a step with no content and no status, **When** the user views it, **Then** it shows: an empty checkbox indicator, an empty status slot, and the field name.
3. **Given** a step with content but no status, **When** the user views it, **Then** it shows: a filled checkbox indicator, an empty status slot, and the field name.
4. **Given** a step with content and a status (e.g., "confirmed" ✅), **When** the user views it, **Then** it shows: a filled checkbox indicator, the status emoji, and the field name — all three visually distinct and non-overlapping.
5. **Given** any field is edited, **When** the change fills or empties the field, **Then** the checkbox indicator updates in real time without a page reload.
6. **Given** any field's status is changed, **When** the dropdown changes, **Then** the status emoji in the step indicator updates in real time without a page reload.

---

### Edge Cases

- What if all three elements (checkbox, status, name) together are too wide for a compact wave card? Field names may be abbreviated or truncated at narrow widths, but must remain visible at normal screen widths.
- What if the status emoji renders differently across OS/browsers? The status slot must have a fixed width to avoid layout shift when an emoji appears or disappears.
- What if a wave card has only 2 steps (Full Story: Context + Why)? The layout must remain visually consistent with 2 or 3 steps.

---

## Requirements *(mandatory)*

### Functional Requirements

**Active Card Border**

- **FR-001**: The active wave card MUST display the same border thickness on all four sides.
- **FR-002**: The active wave card MUST remain visually distinguishable from inactive cards (via border colour, background colour, or both — not via border thickness).

**Step Indicator Layout**

- **FR-003**: Each step within a wave card MUST display the name of its corresponding story field.
- **FR-004**: Each step MUST present three elements in a defined left-to-right order: (1) checkbox indicator, (2) status emoji slot, (3) field name label.
- **FR-005**: The checkbox indicator MUST be in a filled/coloured state when the field has content, and in an empty state when the field is empty.
- **FR-006**: The status emoji slot MUST have a fixed width. When no status is set, the slot is visually blank but reserves the same horizontal space as when an emoji is shown.
- **FR-007**: The filled/empty state of the checkbox indicator MUST be visually distinguishable regardless of whether a status emoji is also displayed — no colour blending or overlapping.
- **FR-008**: The checkbox and status states MUST update in real time as the user edits fields or changes status dropdowns — no page reload required.

**Field Name Mapping**

- **FR-009**: The field names displayed in step indicators MUST match the app's canonical names:
  - Basic Story: Target, Problem, Solution
  - Detailed Story: Empathy, Consequences, Benefits
  - Full Story: Context, Why

### Key Entities

- **WaveStep**: A single indicator within a wave card's progress row. Carries three display properties: checkbox state (filled or empty), status (null / unsure / needs-review / confirmed), and field name label.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can identify which story fields are complete and incomplete within a wave card without relying on field order memory — verified when the field name is visible next to each indicator.
- **SC-002**: A user can simultaneously read the filled/empty state and the validation status of a field without visual confusion — verified when both the checkbox and status emoji are visible and non-overlapping.
- **SC-003**: The active wave card passes a visual consistency check: all four border sides are equal in thickness.
- **SC-004**: All step indicator states update immediately when the user edits a field or changes its status — no perceptible delay or reload required.

---

## Assumptions

- All changes are frontend-only. No backend changes required.
- The field names are fixed and canonical — they match the Lean Storytelling methodology names.
- The status emoji set is unchanged: 🤔 (unsure), 🔄 (needs-review), ✅ (confirmed).
- The fixed-width status slot must accommodate a single emoji character.
- Large screen only (same constraint as v0.3/v0.4). No mobile/responsive changes.
- The wave progress row will become wider with labels added. This is acceptable at normal screen widths; the layout does not need to compress to its previous size.
