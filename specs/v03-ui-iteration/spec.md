# Feature Specification: Story Builder UI Polish

**Feature Branch**: `004-story-builder-ui-polish`
**Created**: 2026-03-27
**Status**: Draft

## Context

This spec covers visual and interaction polish to the Story Builder introduced in v0.3. It addresses inconsistencies in the information hierarchy, layout, typography, and interaction patterns discovered after implementation. All changes are frontend-only — no backend changes required.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Clear App Identity and Navigation (Priority: P1)

A user opening the app immediately understands the product name and their session state (anonymous or logged in), and can navigate to auth actions or their profile without confusion.

**Why this priority**: The top bar is present on every screen. Fixing its structure and copy is the highest-impact change per effort.

**Independent Test**: Open the app. Confirm the top bar shows "Lean Storytelling" on the left and the correct auth buttons on the right. Log in, confirm the top bar switches to authenticated state with a "Profile" link.

**Acceptance Scenarios**:

1. **Given** an anonymous user, **When** the app loads, **Then** the top bar shows "Lean Storytelling" on the left (non-clickable), and "Magic Login or Signup" button on the right.
2. **Given** an authenticated user, **When** the app loads, **Then** the top bar shows "Lean Storytelling" on the left, and "Profile" menu on the right.
3. **Given** any user, **When** they look at the top bar, **Then** there is no subtitle or secondary text in the top bar — it contains only the app title and auth controls.

---

### User Story 2 — Story Builder Context Bar (Priority: P1)

A user working on a story always knows which story they are editing and can identify their current save status, without the banner competing with app-level navigation.

**Why this priority**: The Story Builder bar directly supports the core user task (editing a story) and replaces an ambiguous save banner with a clearly structured UI.

**Independent Test**: Load a story in the Story Builder. Confirm the bar below the top bar shows the story title (editable inline), a Save button, and a completion indicator.

**Acceptance Scenarios**:

1. **Given** a story is loaded in the Story Builder, **When** the user views the page, **Then** a secondary bar (below the top bar) shows: the story title on the left, and a Save button + completion indicator on the right.
2. **Given** the story title in the bar, **When** the user clicks it, **Then** it becomes an editable text field.
3. **Given** the story title is being edited, **When** the user clicks outside the field, **Then** the new title is saved (same behavior as existing title widget — no change to underlying mechanism).
4. **Given** a story with unsaved changes, **When** the user clicks the Save button, **Then** the current story version is saved to the server.
5. **Given** a story with no unsaved changes (or no story loaded), **When** the user views the Save button, **Then** the button is visually greyed out and clicking it does nothing.
6. **Given** a story is loaded, **When** the user views the completion indicator, **Then** it shows the fraction of completed waves (e.g. "1 / 3 waves complete") based on whether all fields in each wave are non-empty.

---

### User Story 3 — Accurate Completion Feedback (Priority: P2)

A user understands exactly how close their story is to complete, with feedback at both the wave level and overall level.

**Why this priority**: Completion state drives the completion indicator and Save button affordance. Getting the definition right avoids misleading feedback.

**Independent Test**: Fill in all fields of Wave 1 only. Confirm Wave 1 shows as complete and the overall indicator shows 1/3 waves complete. Leave one field in Wave 2 empty. Confirm Wave 2 does not show as complete.

**Acceptance Scenarios**:

1. **Given** a wave where all its fields are non-empty, **When** the user views that wave card, **Then** the wave is marked as complete.
2. **Given** a wave where at least one field is empty, **When** the user views that wave card, **Then** the wave is not marked as complete.
3. **Given** a story, **When** the overall completion is calculated, **Then** it counts how many of the 3 waves are complete (0, 1, 2, or 3).
4. **Given** a story where all 8 fields across all 3 waves are non-empty, **When** the user views the completion indicator, **Then** it reads "3 / 3 waves complete".

---

### User Story 4 — Clear Left/Right Pane Labels (Priority: P2)

A user immediately understands the purpose of each pane in the two-pane layout without ambiguity.

**Why this priority**: Label clarity reduces confusion. Low effort, high clarity benefit.

**Independent Test**: View the Story Builder with both panes visible. Confirm the left pane header reads "Story Builder" and the right pane header reads "Your story".

**Acceptance Scenarios**:

1. **Given** the two-pane Story Builder layout, **When** the user looks at the left pane, **Then** its header label reads "Story Builder".
2. **Given** the two-pane Story Builder layout, **When** the user looks at the right pane, **Then** its header label reads "Your story".
3. **Given** a wave card in the left pane, **When** the user looks at its header, **Then** it shows the wave name (e.g. "Basic", "Detailed", "Full") and the completion status (complete or incomplete).

---

### Edge Cases

- What happens if the story title is cleared (empty string) when the user clicks out? The field should revert to the previous non-empty title.
- What if auto-save fires at the same time as a manual Save click? The save operations should not conflict — last-write-wins is acceptable.
- What if the user is anonymous (no story loaded from server)? The Save button and story title widget should not be shown, or should be hidden/disabled.

---

## Requirements *(mandatory)*

### Functional Requirements

**Top Bar**

- **FR-001**: The top bar MUST display "Lean Storytelling" as a non-clickable text label on the left.
- **FR-002**: The top bar MUST NOT display any subtitle, tagline, or secondary text.
- **FR-003**: For anonymous users, the top bar MUST display "Log in" and "Sign up" buttons on the right.
- **FR-004**: For authenticated users, the top bar MUST display "Profile" and "Log out" links on the right.

**Story Builder Bar**

- **FR-005**: A secondary bar MUST appear below the top bar when a story is loaded in the Story Builder.
- **FR-006**: The Story Builder bar MUST display the story title as an inline-editable element on the left.
- **FR-007**: Clicking the story title MUST make it editable. Clicking outside (blur) MUST save the new title. This reuses the existing title widget behavior — no change to the underlying save mechanism.
- **FR-008**: If the user clears the story title and clicks out, the title MUST revert to its previous non-empty value.
- **FR-009**: The Story Builder bar MUST display a Save button on the right.
- **FR-010**: Clicking the Save button MUST save the current story version to the server (triggers a PATCH to the current StoryVersion).
- **FR-011**: When there are no pending unsaved changes, the Save button MUST be visually greyed out and non-interactive (clicking does nothing, no tooltip, no animation).
- **FR-012**: The Story Builder bar MUST display a completion indicator showing how many waves are complete out of 3 (e.g. "1 / 3 waves complete").
- **FR-013**: The existing "save banner" shown in the main content area MUST be removed. Its function is replaced by the Story Builder bar.

**Completion Logic**

- **FR-014**: A wave is considered "complete" when all of its fields are non-empty.
- **FR-015**: The 3 waves and their fields are:
  - Wave 1 — Basic: Target, Problem, Solution
  - Wave 2 — Detailed: Empathy, Consequences, Benefits
  - Wave 3 — Full: Context, Why
- **FR-016**: Overall completion = count of complete waves (0, 1, 2, or 3 out of 3).

**Wave Cards**

- **FR-017**: Each wave card header MUST display the wave name and its completion status (e.g. a checkmark or label when all fields in that wave are non-empty).
- **FR-018**: Wave card completion status MUST update in real time as the user edits fields (no page reload required).

**Pane Labels**

- **FR-019**: The left pane header MUST read "Story Builder".
- **FR-020**: The right pane header MUST read "Your story".

**Hero Text**

- **FR-021**: The hero/subtitle text MUST read: "Build your story — one element at a time." (removing the leading "Story Builder —" prefix from the current copy, which now duplicates the left pane label).

### Key Entities

- **Wave**: A named group of story fields (Basic, Detailed, Full). Has a completion state derived from its fields being non-empty.
- **StoryVersion**: The server-side record patched when the user clicks Save. Already exists from v0.3.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can identify the app name and their auth state within 3 seconds of the page loading.
- **SC-002**: A user can identify which story they are editing (title visible) and save it with one click at all times when in the Story Builder.
- **SC-003**: A user can determine story completion status (how many waves are done) without opening any wave or interacting with any field.
- **SC-004**: All UI labels (pane headers, wave headers, completion indicator) are consistent across all screen states (anonymous, authenticated, story loaded, no story loaded).

---

## Assumptions

- All changes are frontend-only. No backend schema changes, no new API endpoints.
- The existing auto-save (debounced 2s PATCH) continues to work in parallel with the manual Save button — the Save button triggers an immediate PATCH.
- "Unsaved changes" state is tracked client-side. A simple dirty flag set on any field change and cleared on successful save is sufficient.
- The existing story title widget inline-edit behavior (click to edit, blur to save) is preserved as-is; this spec only moves the widget into the Story Builder bar.
- The sidebar (Stories List) layout introduced in v0.3 is not changed by this spec.
- Large screen only (same constraint as v0.3). No mobile/responsive changes.
