# Feature Specification: Basic Story Form

**Feature Branch**: `001-basic-story-form`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Build a super simple app, with only one form and three fields (Basic Story = Target + Problem + Solution), with a superb design, that allows the user to structure the story, view and validate their whole story and check consistency, review and edit their input, receive open-ended questions and suggestions for them to own their iterations and enhance their story in loops"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fill the Basic Story (Priority: P1)

A user opens the app for the first time and is greeted by a focused, elegant form with three
clearly labelled fields: Target, Problem, and Solution. Each field includes a brief coaching
hint explaining what it represents. The user fills in as many fields as they wish — no field
is mandatory — but the app gently encourages filling all three to build a complete story.
The user can submit at any time, even with only one field filled.

**Why this priority**: This is the single core interaction — everything else builds on having
story content. Without this, no other user story is possible.

**Independent Test**: Open the app, fill any combination of fields, submit — the assembled
story view reflects exactly what was filled. Delivers complete standalone value.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user reads each field label and hint, **Then** they understand what each field expects without external help.
2. **Given** all three fields are filled, **When** the user submits, **Then** the assembled Basic Story is displayed in full.
3. **Given** only one or two fields are filled, **When** the user submits, **Then** the story view displays what exists and gently indicates which fields are still empty, without blocking.
4. **Given** all fields are empty, **When** the user attempts to submit, **Then** the app encourages them to fill at least one field before proceeding.
5. **Given** the user has filled and submitted a story during the current session, **When** they return to the form via Edit, **Then** the form is pre-filled with their current session content and statuses. No data persists after the browser tab or window is closed.

---

### User Story 2 - Mark Field Confidence Status (Priority: P2)

For each field, the user can tag their content with a confidence status to track the
maturity of each story element independently:
- **Unsure / Assumption / Hypothesis** — content is a guess or untested idea
- **Needs review / Iteration** — content exists but the user knows it needs work
- **Confirmed / Validated** — content has been tested or agreed upon

This allows the user to track which parts of their story are solid and which still need
attention, driving a deliberate iteration loop.

**Why this priority**: Story building is iterative. Users rarely have all three elements
validated at the same time. Without status tracking, the app cannot support the loop of
reflection and refinement described in the feature request.

**Independent Test**: Open form → fill a field → assign a status → submit → story view
shows field content alongside its status badge. All three statuses are independently
selectable and displayable.

**Acceptance Scenarios**:

1. **Given** a field has content, **When** the user selects a status, **Then** the status is visually associated with that field both in the form and in the story view.
2. **Given** a field has no explicit status set, **When** the story view is displayed, **Then** the field appears without a status badge (neutral / unset).
3. **Given** the user changes a field status from "Confirmed" to "Needs review", **When** the form is submitted, **Then** the updated status is reflected everywhere in the app.
4. **Given** status badges are visible in the story view, **When** the user reads the story, **Then** the status badges do not disrupt the narrative readability.

---

### User Story 3 - View, Validate & Check Consistency (Priority: P3)

After submitting, the user sees their full story assembled and presented in a clear, readable
view. The system surfaces consistency observations — for example, whether the Problem is
clearly connected to the Target, and whether the Solution credibly addresses the Problem.
The user can read their story as a narrative and assess whether it holds together.

**Why this priority**: Seeing the story assembled is the primary payoff moment. Consistency
feedback turns the app from a form into a coaching tool.

**Independent Test**: Submit a story with at least two fields → story view displays →
consistency observations appear alongside the narrative.

**Acceptance Scenarios**:

1. **Given** a submitted story with all three fields filled, **When** the story view is displayed, **Then** Target, Problem, and Solution appear as a coherent narrative in the correct sequence.
2. **Given** a submitted story, **When** consistency is evaluated, **Then** at least one observation about the Target↔Problem relationship and one about Problem↔Solution is surfaced (when both fields in a pair are filled).
3. **Given** a story where the Problem does not reference the Target, **When** consistency is evaluated, **Then** the system flags the potential disconnect to the user.
4. **Given** only one field is filled, **When** the story view is displayed, **Then** consistency observations acknowledge the story is incomplete rather than generating false observations.

---

### User Story 4 - Review & Edit (Priority: P4)

The user reviews their displayed story and decides to refine one or more fields. They can
return to the form with their existing content and statuses pre-filled, make changes, and
resubmit to see the updated story and refreshed coaching feedback.

**Why this priority**: Iteration is central to the Lean Storytelling methodology. Without
an edit loop, the app is a dead end after first submission.

**Independent Test**: From story view, activate edit → form re-opens pre-filled with content
and statuses → modify a field → resubmit → updated story and refreshed feedback displayed.

**Acceptance Scenarios**:

1. **Given** the story view is displayed, **When** the user activates "Edit", **Then** the form opens with all fields pre-filled with the current content and statuses.
2. **Given** the form is pre-filled and the user modifies a field and submits, **When** the story view returns, **Then** it reflects the change and consistency observations refresh.
3. **Given** the user is in edit mode, **When** they cancel, **Then** the previous story and statuses remain intact and unchanged.

---

### User Story 5 - Receive Coaching Questions & Suggestions (Priority: P5)

After viewing their story, the user receives a set of open-ended coaching questions and
suggestions — contextual prompts drawn from a curated set of pre-written questions per
field. Questions may be surfaced or weighted based on simple content signals (e.g., field
length, missing fields, confidence statuses). They encourage iterative improvement across
multiple sessions.

**Why this priority**: This is the coaching layer that differentiates the app from a plain
form. It drives the story iteration loop.

**Independent Test**: Submit any story with at least one field filled → coaching section
appears with at least one relevant question or suggestion.

**Acceptance Scenarios**:

1. **Given** a submitted story with at least one field filled, **When** the coaching section is displayed, **Then** at least one question or suggestion appears for each filled field.
2. **Given** a field is marked "Unsure / Assumption", **When** coaching is displayed, **Then** questions for that field lean toward validation and testing the assumption.
3. **Given** a field is marked "Confirmed / Validated", **When** coaching is displayed, **Then** questions for that field lean toward deepening or extending the content.
4. **Given** coaching questions are displayed, **When** the user reads them, **Then** all questions are open-ended (not yes/no) and invite reflection or elaboration.
5. **Given** the user edits and resubmits, **When** the coaching section refreshes, **Then** questions update to reflect new content and statuses.

---

### Edge Cases

- What happens when all fields are empty and the user tries to submit? The app encourages filling at least one field but does not hard-block.
- What happens when a user submits a field containing only whitespace? The system MUST treat it as empty.
- What happens when the user's browser does not support sessionStorage? The story remains usable for the session using in-memory state; a graceful notice informs the user that within-session persistence is unavailable.
- What happens when a field contains very long text? The UI MUST remain readable and must not overflow or break layout on any screen size.
- What happens when a field has a status but no content? The status MUST be ignored or cleared; a status without content has no meaning.
- What happens when the user closes the tab or window? All story data is discarded — this is by design. No data lingers in the browser after the session ends.
- What happens when the right pane "Your Story" is displayed before any story has been submitted? The right pane MUST show instructional placeholder text (e.g., "Your story will appear here — fill the form on the left to get started") rather than an empty or broken layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST present a single form with exactly three fields: Target, Problem, and Solution, in that order.
- **FR-002**: Each field MUST display a label and a short coaching hint consistent with the Lean Storytelling playbook definitions.
- **FR-003**: No field is mandatory. The app MUST allow submission with any combination of filled fields, including only one. If all fields are empty, the app MUST gently prompt the user to fill at least one before proceeding.
- **FR-004**: Each field MUST offer a selectable confidence status: **Unsure / Assumption / Hypothesis**, **Needs review / Iteration**, or **Confirmed / Validated**. Status is optional; a field may have no status set.
- **FR-005**: Upon submission, the app MUST display the assembled story as a readable narrative showing the filled fields in sequence (Target → Problem → Solution), clearly indicating any fields that are empty.
- **FR-006**: Confidence statuses MUST be displayed alongside their respective field content in the story view, visually distinct but not disruptive to narrative readability.
- **FR-007**: The app MUST surface consistency observations about the relationships between filled adjacent field pairs (Target↔Problem, Problem↔Solution) after each submission.
- **FR-008**: The app MUST display open-ended coaching questions and suggestions after each submission, surfaced from a curated set of pre-written prompts per field. Questions may be weighted or varied based on field content signals and confidence statuses. No external service or AI is required.
- **FR-009**: The app MUST allow the user to return to the form from the story view, pre-filled with current content and statuses, to review and edit.
- **FR-010**: The app MUST hold the user's story and field statuses in **session-only storage** (sessionStorage or equivalent in-memory state). All data MUST be completely discarded when the browser tab or window is closed. No story data MUST persist across sessions.
- **FR-014**: The app MUST declare a strict **Content Security Policy** (`default-src 'self'`) that blocks all external resources, inline scripts, and inline styles. All assets MUST be self-contained and served from the same origin.
- **FR-015**: The app MUST display a sticky wave navigation bar below the app title containing three wave cards: Wave 1 "Basic Story" (active), Wave 2 "Detailed Story" (inactive), and Wave 3 "Full Story" (inactive). Wave 2 and Wave 3 MUST be visually disabled and non-interactive.
- **FR-016**: Each wave card MUST contain a mini progress bar at the bottom showing wave-specific steps. Wave 1 steps: Target, Problem, Solution. Wave 2 steps: Empathy, Consequences, Benefits. Wave 3 steps: Context, Why. The Wave 1 progress bar MUST reflect the current form completion state (which steps have content). Wave 2 and Wave 3 progress bars are static and inactive.
- **FR-017**: On large screens (viewport width ≥ 768px), the app MUST render a two-column layout: the left pane contains the input form; the right pane displays the story preview. Both panes MUST be simultaneously visible.
- **FR-018**: The right pane MUST display a "Your Story" section with Target, Problem, and Solution content blocks. Below the story blocks, the right pane MUST include placeholder sections for "Consistency Check" and "Coaching" in a visually inactive/disabled state (fake door — no functionality, placeholder instructional text only). These sections will be activated in a future iteration.
- **FR-019**: The design system MUST use subtle shades of blue and green as its primary accent palette. The visual aesthetic MUST be zen, pure, minimalistic, and focused.
- **FR-011**: The app MUST be fully usable on large screens (desktop, laptop, tablet — viewport width ≥ 768px) without loss of functionality. Smartphone/narrow-viewport layout support is explicitly out of scope for this version.
- **FR-012**: The app MUST be usable offline after the initial page load.
- **FR-013**: All user-supplied content MUST be rendered as plain text only. No Markdown, HTML, or any markup MUST be interpreted or injected into the DOM, eliminating XSS attack surface without requiring a sanitization library.

### Key Entities

- **Story**: The user's Basic Story with three named components — Target, Problem, Solution. Each component may be empty. Stored locally in the user's browser.
- **Field Status**: An optional confidence tag on a story field — one of: Unsure/Assumption/Hypothesis, Needs review/Iteration, Confirmed/Validated. Stored alongside field content.
- **Coaching Prompt**: A pre-written open-ended question or suggestion associated with a story field, optionally weighted by the field's status or content signals.
- **Consistency Observation**: A structured observation about the logical relationship between two adjacent filled story components (Target↔Problem or Problem↔Solution).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can open the app, understand all three fields and the status tags without external help, fill the form, and view their assembled story in under 3 minutes.
- **SC-002**: Users who complete at least one edit cycle report the coaching questions as useful in improving their story.
- **SC-003**: The app is interactive within 2 seconds on a standard mobile connection.
- **SC-004**: 90% of users who submit a story engage with the coaching section (scroll to or interact with it).
- **SC-005**: The full iteration loop (fill → view → review → edit → resubmit) is completable in a single browser session with no data loss.
- **SC-006**: Users actively use field status tags in at least 50% of sessions after the first submission (indicating the feature is discoverable and valued).

## Clarifications

### Session 2026-03-24

- Q: When the assembled story view displays user-typed content, should it be rendered as plain text only, or as formatted text (Markdown / HTML)? → A: Plain text only — no markup interpreted, eliminating XSS surface.
- Q: What open-source license should the app code be published under? → A: GNU AGPLv3 — copyleft extended to network use; all derivatives and network-served versions must remain open.
- Q: Which frontend approach should the app use? → A: Vanilla HTML/CSS/JS — no framework, no bundler, zero runtime dependencies.
- Q: Should the app include any usage analytics, error tracking, or telemetry? → A: None for this version — no tracking, no external calls; analytics may be reconsidered in a future version.
- Q: Should a Content Security Policy be declared, and should story data persist across browser sessions? → A: Strict CSP (`default-src 'self'`); all story data MUST be deleted when the user closes the app (session-only storage, no cross-session persistence).

## Assumptions

- The app targets professionals (product managers, leaders, founders) familiar with basic business concepts; no onboarding tutorial is required beyond field hints.
- No user accounts or authentication are needed; the story is held in session-only storage and discarded when the tab or window is closed.
- The initial version serves a single story per user — no story history or library view.
- Coaching prompts appear after story submission, not inline while typing, to preserve focus.
- The app is a client-side-only web application; no server or backend is required.
- Story export (PDF, share link, etc.) is out of scope for this version.
- The visual design system is established from scratch in this feature, consistent with Constitution Principle VI (Elegant & Focused UI/UX) and Principle I (Simplicity First).
- AI-powered coaching is explicitly out of scope and deferred to a future version; all coaching prompts are curated and pre-written.
- The app code is published under the **GNU Affero General Public License v3.0 (AGPLv3)**. All third-party dependencies MUST be AGPLv3-compatible. Dependency licenses MUST be audited before inclusion.
- The app is built with **vanilla HTML, CSS, and JavaScript only** — no framework, no bundler, zero runtime dependencies. This guarantees an empty third-party FOSS audit scope and aligns with Simplicity First (Principle I).
- The app MUST make **no external network calls** of any kind — no analytics, no telemetry, no CDN-loaded assets. All assets are self-contained. Analytics may be reconsidered in a future version.

## Iterations

### Iteration 2026-03-25: Wave Navigation, Split Screen & Design Refresh

**Change**: Add sticky wave navigation bar with per-wave progress bars, split the screen into a two-column layout (form left, story preview right), refresh the design system with a subtle blue/green palette, and add inactive fake-door placeholders for consistency check and coaching in the right pane.
**Scope**: Feature-wide
**Artifacts updated**: spec.md, plan.md, tasks.md
**Tasks added**: T049–T059
**Tasks removed**: —
**Tasks marked complete**: —
