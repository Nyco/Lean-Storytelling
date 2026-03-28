# Feature Specification: Story Builder UI Polish

**Feature Branch**: `004-story-builder-polish`
**Created**: 2026-03-27
**Status**: Draft

## Context

This spec covers visual and interaction polish to the Story Builder introduced in v0.3. It addresses inconsistencies in the information hierarchy, layout, typography, and interaction patterns discovered after implementation. All changes are frontend-only — no backend changes required.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Clear App Identity and Navigation (Priority: P1)

A user opening the app immediately understands the product name and their session state (anonymous or logged in), and can navigate to auth actions or their profile without confusion.

**Why this priority**: The top bar is present on every screen. Fixing its structure and copy is the highest-impact change per effort.

**Independent Test**: Open the app. Confirm the top bar shows "Lean Storytelling" on the left and the correct auth button on the right. Log in, confirm the top bar switches to authenticated state with a "Profile" menu.

**Acceptance Scenarios**:

1. **Given** an anonymous user, **When** the app loads, **Then** the top bar shows "Lean Storytelling" on the left (non-clickable), and a single "Magic Login or Signup" button on the right.
2. **Given** an authenticated user, **When** the app loads, **Then** the top bar shows "Lean Storytelling" on the left, and a "Profile" menu on the right.
3. **Given** any user, **When** they look at the top bar, **Then** there is no subtitle or secondary text in the top bar — it contains only the app title and auth controls.

---

### User Story 2 — Story Builder Context Bar (Priority: P1)

A user working on a story always knows which story they are editing and can identify their current save status, without the banner competing with app-level navigation.

**Why this priority**: The Story Builder bar directly supports the core user task (editing a story) and replaces an ambiguous save banner with a clearly structured UI.

**Independent Test**: Load a story in the Story Builder. Confirm the bar below the top bar shows "Story Builder" on line 1, the story title (editable inline) + Save button on line 2, and the completion indicator with wave cards on line 3.

**Acceptance Scenarios**:

1. **Given** a story is loaded in the Story Builder, **When** the user views the page, **Then** a secondary bar (below the top bar) shows: line 1 — "Story Builder" heading; line 2 — story title on the left, Save button on the right; line 3 — completion indicator full width with wave cards.
2. **Given** the story title in the bar, **When** the user clicks it, **Then** it becomes an editable text field.
3. **Given** the story title is being edited, **When** the user clicks outside the field, **Then** the new title is saved (same behavior as existing title widget — no change to underlying mechanism).
4. **Given** the story title is cleared and the user clicks out, **Then** the title reverts to its previous non-empty value.
5. **Given** an authenticated user with unsaved changes, **When** they click the Save button, **Then** the current story version is saved to the server.
6. **Given** an anonymous user, **When** they view the Save button, **Then** the button is visually greyed out and clicking it does nothing.
7. **Given** a story with no unsaved changes, **When** the user views the Save button, **Then** the button is visually greyed out and clicking it does nothing.

---

### User Story 3 — Wave Completion Feedback (Priority: P2)

A user understands how complete each wave is at a glance, without opening any wave or interacting with any field.

**Why this priority**: Completion state is shown in the Story Builder bar and on each wave card. Getting the logic right is a prerequisite for the UI to be meaningful.

**Independent Test**: Fill all fields in Wave 1 only. Confirm Wave 1 shows as complete and the overall indicator shows "1 / 3 waves complete". Leave one field in Wave 2 empty — confirm Wave 2 does not show as complete.

**Acceptance Scenarios**:

1. **Given** a wave where all its fields are non-empty, **When** the user views the wave card, **Then** the wave is marked as complete (e.g. checkmark or visual indicator on the card header).
2. **Given** a wave where at least one field is empty, **When** the user views the wave card, **Then** the wave is not marked as complete.
3. **Given** all 3 waves complete, **When** the user views the completion indicator in the Story Builder bar, **Then** it reads "3 / 3 waves complete".
4. **Given** any field change, **When** the user edits a field, **Then** the wave completion status updates in real time without a page reload.

---

### User Story 4 — Clear Left/Right Pane Labels (Priority: P2)

A user immediately understands the purpose of each pane in the two-pane layout without ambiguity.

**Why this priority**: Label clarity reduces confusion. Low effort, high clarity benefit.

**Independent Test**: View the Story Builder with both panes visible. Confirm the left pane header reads "Craft" and the right pane header reads "View".

**Acceptance Scenarios**:

1. **Given** the two-pane Story Builder layout, **When** the user looks at the left pane, **Then** its header label reads "Craft".
2. **Given** the two-pane Story Builder layout, **When** the user looks at the right pane, **Then** its header label reads "View".

---

### Edge Cases

- Story title cleared on blur: reverts to previous non-empty value (covered in US2, scenario 4).
- Auto-save fires simultaneously with manual Save: last-write-wins is acceptable; no conflict handling required.
- Anonymous user clicks greyed Save button: nothing happens — no error, no redirect, no tooltip.

---

## Requirements *(mandatory)*

### Functional Requirements

**Top Bar**

- **FR-001**: The top bar MUST display "Lean Storytelling" as a non-clickable text label on the left.
- **FR-002**: The top bar MUST NOT display any subtitle, tagline, or secondary text.
- **FR-003**: For anonymous users, the top bar MUST display a single "Magic Login or Signup" button on the right.
- **FR-004**: For authenticated users, the top bar MUST display a "Profile" menu on the right.

**Story Builder Bar**

- **FR-005**: A secondary bar MUST appear below the top bar whenever a story is loaded in the Story Builder.
- **FR-006**: The Story Builder bar MUST display "Story Builder" as a heading on the first line.
- **FR-007**: The Story Builder bar MUST display the story title as an inline-editable element on the left of the second line. Clicking the title makes it editable; clicking outside (blur) saves the new title. This reuses the existing title widget behavior — no change to the underlying mechanism.
- **FR-008**: If the user clears the story title and clicks out, the title MUST revert to its previous non-empty value.
- **FR-009**: The Story Builder bar MUST display a Save button on the right of the second line (same row as the story title).
- **FR-010**: For authenticated users with unsaved changes, clicking the Save button MUST save the current story version to the server.
- **FR-011**: For anonymous users, the Save button MUST be visually greyed out and non-interactive (clicking does nothing, no tooltip, no animation).
- **FR-012**: When there are no pending unsaved changes, the Save button MUST be visually greyed out and non-interactive.
- **FR-013**: The existing "save banner" in the main content area MUST be removed. Its function is replaced by the Story Builder bar.
- **FR-016**: The Story Builder bar MUST display a completion indicator on the third line (full width), showing wave cards with their completion status.

**Completion Logic**

- **FR-014**: A wave is "complete" when all of its fields are non-empty.
- **FR-015**: The 3 waves and their fields are:
  - Wave 1 — Basic: Target, Problem, Solution
  - Wave 2 — Detailed: Empathy, Consequences, Benefits
  - Wave 3 — Full: Context, Why

**Wave Cards**

- **FR-017**: Each wave card header MUST display the wave name and its completion status (e.g. a visual checkmark or label when all fields in that wave are non-empty).
- **FR-018**: Wave card completion status MUST update in real time as the user edits fields (no page reload required).

**Pane Labels**

- **FR-019**: The left pane header MUST read "Craft".
- **FR-020**: The right pane header MUST read "View".

### Key Entities

- **Wave**: A named group of story fields (Basic, Detailed, Full). Has a completion state derived from all its fields being non-empty.
- **StoryVersion**: The server-side record saved when the user clicks Save. Exists from v0.3; no schema changes needed.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can identify the app name and their auth state within 3 seconds of the page loading.
- **SC-002**: Any user can identify which story they are editing (title visible); authenticated users can save it with one click at all times when in the Story Builder.
- **SC-003**: A user can determine story completion status (how many of 3 waves are done) without opening any wave or interacting with any field.
- **SC-004**: All UI labels (top bar, pane headers, wave card headers, completion indicator) are consistent across all screen states: anonymous, authenticated, story loaded, no story loaded.

---

## Assumptions

- All changes are frontend-only. No backend schema changes, no new API endpoints.
- The existing auto-save (debounced 2s) continues alongside the manual Save button. The Save button triggers an immediate save; they can coexist with last-write-wins semantics.
- "Unsaved changes" state is tracked client-side via a dirty flag: set on any field change, cleared on successful save.
- The existing story title widget inline-edit behavior (click to edit, blur to save) is preserved as-is. This spec moves the widget into the Story Builder bar.
- The sidebar (Stories List) layout introduced in v0.3 is not changed by this spec.
- Large screen only (same constraint as v0.3). No mobile or responsive changes.
- "Magic Login or Signup" is a single button that opens the existing magic link auth modal — no new auth flow required.
