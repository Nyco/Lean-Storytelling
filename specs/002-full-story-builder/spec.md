# Feature Specification: Full Story Builder — v0.2

**Feature Branch**: `002-full-story-builder`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "v0.2 — end-to-end Story Builder: all three waves active (Basic, Detailed, Full Story), unified field template with foldable advice and status emojis, real-time right-pane preview, story title widget, typography refresh, active progress bars with accessibility."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Navigate Between Waves (Priority: P1)

A user opens the app and sees three active wave cards in the navigation bar: "Basic Story", "Detailed Story", and "Full Story". They click any card to switch the left-pane form to that wave's fields. The active wave card is visually highlighted. Switching waves never loses previously entered content.

**Why this priority**: This is the structural backbone of the entire v0.2 experience. Without multi-wave navigation, none of the new fields are reachable.

**Independent Test**: Open the app → click "Detailed Story" → Empathy, Consequences, Benefits fields appear in the left pane → click "Basic Story" → Target, Problem, Solution reappear, previously typed content intact.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user views the wave navigation bar, **Then** all three cards (Basic Story, Detailed Story, Full Story) are active, clickable, and clearly labelled — with no "Wave N" label shown on any card.
2. **Given** the user is on the Basic Story form, **When** they click "Detailed Story", **Then** the left pane switches immediately to the Detailed Story fields (Empathy, Consequences, Benefits) and the "Detailed Story" card appears highlighted/active.
3. **Given** the user has typed content in the Target field, **When** they switch to Detailed Story and then return to Basic Story, **Then** their Target content is still present and unchanged.
4. **Given** any wave is active, **When** the user views the wave's card in the navigation bar, **Then** the wave's progress bar at the bottom of the card reflects the current fill state of that wave's fields.

---

### User Story 2 — Real-Time Story Preview (Priority: P1)

As the user types in any field — regardless of which wave is active — the right pane "Your Story" panel updates immediately, without requiring any button press. The preview shows all story elements in the canonical Lean Storytelling delivery order: Context → Target → Empathy → Problem → Consequences → Solution → Benefits → Why.

**Why this priority**: The removal of the submit button and the live preview are the core UX shift of v0.2. Without this, the split-screen concept breaks.

**Independent Test**: Open the app → type in the Target field → the "Target" block in the right pane updates character-by-character → switch to Detailed Story → type in Empathy → the "Empathy" block in the right pane updates in real time.

**Acceptance Scenarios**:

1. **Given** the user is typing in any field, **When** they enter or remove a character, **Then** the corresponding block in the right-pane "Your Story" preview updates immediately.
2. **Given** the Basic Story wave is active, **When** the user views the right pane, **Then** it shows only the Target, Problem, and Solution blocks (in that order), regardless of whether Detailed or Full Story fields have content.
3. **Given** the Detailed Story wave is active, **When** the user views the right pane, **Then** it shows six blocks in this paired order: Target, Empathy, Problem, Consequences, Solution, Benefits — pairing each Basic field with its Detailed enrichment.
4. **Given** the Full Story wave is active, **When** the user views the right pane, **Then** it shows all eight fields in canonical delivery order: Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why.
5. **Given** all fields in the currently displayed right-pane set are empty, **When** the user views the right pane, **Then** it shows a single inviting placeholder message rather than multiple empty blocks.
6. **Given** there is no submit or "View my story" button, **When** the user looks at the form, **Then** no such button is present; navigation between waves is achieved exclusively via the wave cards.

---

### User Story 3 — Fill the Detailed Story (Priority: P2)

The user navigates to the "Detailed Story" wave and fills three fields: Empathy, Consequences, and Benefits. Each field has a title, explainer text, foldable advice, and a status dropdown with emojis. Content appears in the right-pane preview in the correct story order.

**Why this priority**: Detailed Story is the second layer of the methodology. It unlocks "connection" between storyteller and audience.

**Independent Test**: Navigate to Detailed Story → fill Empathy, Consequences, Benefits → view the right pane → all three fields appear in the story preview, each positioned between its logically adjacent Basic Story fields.

**Acceptance Scenarios**:

1. **Given** the user is on the Detailed Story form, **When** they read each field, **Then** they see: title, explainer text, and a collapsed advice section (not auto-expanded).
2. **Given** the Empathy field, **When** the user expands the advice, **Then** the text reads: "What does your hero see in their day-to-day? What do they feel? What do they hear from colleagues, customers, or the market? What do they say about their situation? This is where the 'connection' happens between the storyteller and the audience."
3. **Given** the Consequences field, **When** the user expands the advice, **Then** the text reads: "How painful is this Problem, really? What happens to your hero because of this Problem? How does it affect their daily work, their relationships, their results? What does life look like if nothing changes?"
4. **Given** the Benefits field, **When** the user expands the advice, **Then** the text reads: "What are the real advantages your Solution gives the Target? Not features — but outcomes. What changes for them? What do they gain, recover, or feel differently about? What's the impact?"
5. **Given** the user fills a Detailed Story field, **When** they view the right pane, **Then** that field's content appears in the correct position relative to its adjacent Basic Story fields.

---

### User Story 4 — Fill the Full Story (Priority: P3)

The user navigates to the "Full Story" wave and fills two fields: Context and Why. Both follow the same field template. Context appears at the very top of the right-pane story; Why at the very bottom.

**Why this priority**: Full Story adds the finishing touch. Context and Why are the most challenging elements — intentionally placed last in the build progression.

**Independent Test**: Navigate to Full Story → fill Context and Why → view the right pane → Context appears at the top of the story, Why at the bottom.

**Acceptance Scenarios**:

1. **Given** the user is on the Full Story form, **When** they read the Context field, **Then** the explainer text reads: "Set the scene! The environment in which the Target operates — location, industry, time, anything that helps the audience understand how the Target will undergo transformation."
2. **Given** the Context field, **When** the user expands the advice, **Then** the text reads: "Describe the universe your Target lives and works in. What is happening in their industry, market, or daily environment? What makes this story relevant right now?"
3. **Given** the user is on the Full Story form, **When** they read the Why field, **Then** the explainer text reads: "The core motivation or guiding principle of this story. What changes the Target's world? What's their guiding light during this Story? What drives this story at its deepest level?"
4. **Given** the Why field, **When** the user expands the advice, **Then** the advice includes the warning: "The most difficult part. Craft it carefully. This must not kill the vibe or momentum you have created."
5. **Given** Context is filled, **When** the user views the right pane, **Then** Context appears first (top of the story). Given Why is filled, it appears last (bottom of the story).

---

### User Story 5 — Foldable Field Advice (Priority: P3)

Every field across all three waves has an optional advice section hidden by default. The user can expand it and collapse it independently per field. The toggle state does not affect field content or status.

**Why this priority**: Advice is coaching, not instruction. It should be available without cluttering the default view.

**Independent Test**: Open any form → all advice sections are collapsed → click the advice toggle on one field → advice expands → click again → it collapses → field content is unchanged.

**Acceptance Scenarios**:

1. **Given** the user opens any form, **When** they view the fields, **Then** all advice sections are collapsed and a subtle toggle/indicator signals that guidance is available.
2. **Given** an advice section is collapsed, **When** the user clicks the toggle, **Then** the advice text expands without displacing the field's textarea or status selector.
3. **Given** an advice section is expanded, **When** the user clicks the toggle again, **Then** it collapses.
4. **Given** the user has content in a field and the advice is expanded, **When** they collapse the advice, **Then** the field content remains intact.

---

### User Story 6 — Story Title (Priority: P4)

A story title widget appears below the page heading and above the wave navigation bar. On first load, a random but serious-sounding default title is assigned. The user can click it to edit it at any time. The title persists in session storage.

**Why this priority**: The title gives the story an identity and encourages ownership.

**Independent Test**: Open the app → a default title is visible → click the title → edit it → commit → the new title displays and persists through wave switches.

**Acceptance Scenarios**:

1. **Given** the user opens the app for the first time in a session, **When** they view the story title area, **Then** a non-empty default title is shown (e.g., "The Resilient Leader's Turning Point").
2. **Given** the story title is displayed, **When** the user clicks it, **Then** it becomes an editable inline input.
3. **Given** the user has entered a custom title and pressed Enter or clicked away, **When** the title is committed, **Then** it reverts to styled heading display text showing the new value.
4. **Given** the user switches between waves, **When** they return to any view, **Then** the story title remains visible and unchanged above the wave navigation bar.
5. **Given** the user has set a custom title, **When** they reload the page within the same session, **Then** the custom title is restored.

---

### User Story 7 — Accessible Progress Bars with Status Emojis (Priority: P4)

Each wave card's mini progress bar shows one step indicator per field. When a field has content, its indicator shows "filled". When a status is set, the corresponding emoji is shown. All indicators are accessible to color-blind and low-vision users.

**Why this priority**: Progress bars give a clear at-a-glance sense of story completeness.

**Independent Test**: Type in Target → Target step in Basic Story card's bar shows filled → set status "Confirmed/Validated" → ✅ emoji appears on the step indicator → a screen reader announces the field name and status correctly.

**Acceptance Scenarios**:

1. **Given** a field is empty, **When** the user views the corresponding step, **Then** it appears in a neutral/unfilled state.
2. **Given** the user types content in a field, **When** the field becomes non-empty, **Then** the corresponding step immediately switches to a filled state.
3. **Given** a field has content and a confidence status set, **When** the user views the step indicator, **Then** the emoji for that status is displayed on or alongside the indicator.
4. **Given** a step indicator uses color to convey state, **When** a color-blind or low-vision user reads it, **Then** the state is also communicated through text label, shape, or icon — not color alone (WCAG 2.1 AA).
5. **Given** the user removes content from a previously filled field, **When** the field becomes empty, **Then** the step returns to neutral/unfilled and any emoji is removed.

---

### Edge Cases

- What happens when the user switches waves while an advice section is expanded? The advice collapses — each wave form renders fresh on activation.
- What happens when the story title is cleared entirely? The field stays empty; a placeholder hint ("Give your story a title…") appears but is not stored as the title.
- What happens when a field has a status set and the user clears its content? The status is automatically reset to "no status".
- What happens when the user types an extremely long story title? The title truncates gracefully in display mode without overflowing its container.
- What happens when the right pane has a Detailed Story field adjacent to an empty Basic Story field? The empty field shows a subtle placeholder; the filled Detailed field shows its content — no layout break.
- What happens if all displayed fields for the active wave are empty in the right pane? The right pane shows a single inviting placeholder message instead of multiple empty blocks. Fields from other waves are not shown regardless of content.

---

## Requirements *(mandatory)*

### Functional Requirements

**Navigation & Waves**

- **FR-001**: The wave navigation bar MUST display three active, clickable cards: "Basic Story", "Detailed Story", and "Full Story". All three MUST be enabled and interactive. No "Wave N" label MUST appear on any card.
- **FR-002**: Clicking a wave card MUST switch the left-pane form to that wave's fields immediately, without full-page navigation. The active wave MUST be visually distinguished from inactive ones.
- **FR-003**: Switching waves MUST preserve all previously entered content and confidence statuses for all fields across all three waves.
- **FR-004**: The "View my story" submit button, the Cancel button, and the v0.1 edit mode (enterEditMode / exitEditMode flow) MUST be removed entirely. The form is always visible on the left pane; wave navigation cards are the only controls for switching between form views. There is no rollback or cancel concept — all field edits are live.

**Field Template (universal across all waves)**

- **FR-005**: Every field across all three waves MUST follow this template: (1) field title, (2) explainer text always visible below the title, (3) text input area, (4) collapsible advice section collapsed by default with a visible accessible toggle, (5) confidence status dropdown with one emoji per option.
- **FR-006**: The collapsible advice section MUST be collapsed on form load and on wave switch. A visible, keyboard-accessible toggle MUST allow independent expand/collapse per field.
- **FR-007**: The confidence status dropdown MUST use distinct emojis for each value: no status = (none), Unsure/Assumption/Hypothesis = 🤔, Needs review/Iteration = 🔄, Confirmed/Validated = ✅. Each option MUST be accessible via keyboard.

**Basic Story — revised field content**

- **FR-008**: Target field: explainer = "Describe the person at the centre of your story. Who are they? What role do they play? Prepare the audience for the kind of change they will go through." Advice = "Every story needs a hero — the person who will be most changed by your solution. The more specifically you define this person, the more powerfully your story will connect with the real people it is for."
- **FR-009**: Problem field: explainer = "What problem, challenge, or pain does your Target face? Be specific and concrete. Turn the sentence in positive form, not 'the lack of' Solution." Advice = "No problem, no story. The Problem (or antagonism) is the engine of your narrative. A good story has a good villain. It must be real, specific, and felt — not a vague pain point, but the actual thing that drives their frustration."
- **FR-010**: Solution field: explainer = "How does your product, service, or business offering address the Problem for the Target? Focus on the what. Minimalise the description of the Solution in only one short, precise sentence." Advice = "The solution should arrive like a breath of fresh air after the tension of the problem. Keep it short. The goal is relief, not a product demo. Curiosity is your friend here."

**Detailed Story — field content**

- **FR-011**: Empathy field: explainer = "What the Target sees, feels, hears, and says — step into their shoes." Advice = "What does your hero see in their day-to-day? What do they feel? What do they hear from colleagues, customers, or the market? What do they say about their situation? This is where the 'connection' happens between the storyteller and the audience."
- **FR-012**: Consequences field: explainer = "How the Problem impacts the Target's daily life, the pain that is felt." Advice = "How painful is this Problem, really? What happens to your hero because of this Problem? How does it affect their daily work, their relationships, their results? What does life look like if nothing changes?"
- **FR-013**: Benefits field: explainer = "The qualitative advantages your Solution provides. What does your hero gain? How does your Solution relieve the Target?" Advice = "What are the real advantages your Solution gives the Target? Not features — but outcomes. What changes for them? What do they gain, recover, or feel differently about? What's the impact?"

**Full Story — field content**

- **FR-014**: Context field: explainer = "Set the scene! The environment in which the Target operates — location, industry, time, anything that helps the audience understand how the Target will undergo transformation." Advice = "Describe the universe your Target lives and works in. What is happening in their industry, market, or daily environment? What makes this story relevant right now?"
- **FR-015**: Why field: explainer = "The core motivation or guiding principle of this story. What changes the Target's world? What's their guiding light during this Story? What drives this story at its deepest level?" Advice = "What is the deeper purpose behind what you're building? Why does this matter beyond the transaction? What transformation — in your Target, in your company, in the world — are you ultimately working toward? Warning: The most difficult part. Craft it carefully. This must not kill the vibe or momentum you have created."

**Real-Time Preview**

- **FR-016**: The right-pane "Your Story" preview MUST update in real time as the user types in any field across any wave. No button press is required.
- **FR-017**: The right-pane "Your Story" preview MUST adapt its displayed fields based on the active wave:
  - **Basic Story active**: show Target → Problem → Solution only.
  - **Detailed Story active**: show the six paired fields in this order — Target, Empathy, Problem, Consequences, Solution, Benefits — pairing each Basic field with its Detailed enrichment layer.
  - **Full Story active**: show all eight fields in canonical delivery order — Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why.
  When all displayed fields for the active wave are empty, a single inviting placeholder message replaces the individual field blocks.
- **FR-018**: For each field in the right pane, if a confidence status is set, its emoji MUST be displayed alongside the field content as a status badge.

**Progress Bars**

- **FR-019**: Each wave card's progress bar MUST contain one step indicator per field in that wave. Step indicators MUST update live: non-empty content = filled, empty = unfilled.
- **FR-020**: When a filled field has a confidence status set, its step indicator MUST display the corresponding emoji. When no status is set, the indicator shows a neutral filled state (e.g., a checkmark or filled dot).
- **FR-021**: Progress bar step indicators MUST meet WCAG 2.1 AA: fill state MUST NOT rely on color alone; text labels or icons MUST be accessible to screen readers; contrast ratios MUST meet minimum thresholds.

**Story Title**

- **FR-022**: A story title widget MUST appear below the page heading and above the wave navigation bar, visible on all wave views.
- **FR-023**: On session start with no saved title, a random default title from a pool of at least 10 serious candidates MUST be assigned and displayed.
- **FR-024**: The story title MUST persist in session storage and be restored on page load within the same session.
- **FR-025**: The title MUST switch between display mode (styled heading text) and edit mode (inline input) on user click. Committing via Enter or blur returns to display mode.

**Typography & Design**

- **FR-026**: The app MUST use an editorially refined font system: a display or high-quality sans font for headings and a legible body font for form content and preview text. Fonts MUST be self-hosted or embedded (no external CDN calls) to comply with the existing Content Security Policy.
- **FR-027**: The typography system MUST apply deliberate, visible variance in size, weight, color, and spacing across: page title, story title, wave card title, field title, explainer text, advice text, preview body content, and status indicators.

**Session Storage**

- **FR-028**: Session storage MUST be extended to persist all 8 story fields and their statuses (empathy, empathyStatus, consequences, consequencesStatus, benefits, benefitsStatus, context, contextStatus, why, whyStatus) plus the storyTitle string. All data remains session-only.

**README**

- **FR-029**: If the README contains sections about the Lean Storytelling web app (MVP), local run instructions, or quickstart/public review, those sections MUST be removed.

### Key Entities

- **Story (v0.2)**: Extends the v0.1 Story entity with five new fields: `empathy`, `consequences`, `benefits`, `context`, `why` — each with a paired `*Status` confidence field. Adds `storyTitle` string.
- **Wave**: A named group of story fields with a navigation card, progress bar, and form view. Three waves: Basic (Target, Problem, Solution), Detailed (Empathy, Consequences, Benefits), Full (Context, Why).
- **FieldAdvice**: Static coaching text associated with a field. Collapsed by default. Not stored in session.
- **StoryTitle**: A short editable string. Stored in session. Defaults to a randomly chosen serious title from a fixed pool.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can navigate to all three waves and begin filling fields within 30 seconds of opening the app, with no instructions.
- **SC-002**: The right-pane preview updates within 150ms of a keystroke in any field, creating a visually seamless live-edit experience.
- **SC-003**: A user can fill all 8 story fields across all three waves in a single session with no data loss when switching between waves.
- **SC-004**: All progress step indicators across all three wave cards correctly reflect fill state and confidence status emoji after a user fills and statuses each field — confirmed in manual acceptance testing.
- **SC-005**: The story title widget is discoverable and editable without instructions — users can identify it as editable and commit a change within 15 seconds.
- **SC-006**: The app passes WCAG 2.1 AA validation with zero critical or serious violations across all three wave forms, with particular attention to progress bar state indicators (color independence, screen reader labels).
- **SC-007**: In user testing, the foldable advice is expanded at least once per session — confirming discoverability without being intrusive.

---

## Assumptions

- This feature builds on the v0.1 split-screen two-column layout. No structural layout changes are introduced; only the left-pane form content and right-pane preview data change.
- The canonical story delivery order (Context → Target → Empathy → Problem → Consequences → Solution → Benefits → Why) is fixed by the Lean Storytelling playbook and is not user-configurable.
- The "static advice" text per field is authored content fixed in the codebase. It is not user-editable or dynamically generated.
- Fonts will be self-hosted or embedded inline to comply with the strict CSP (`default-src 'self'`). No external font CDN calls are permitted.
- The consistency check and coaching features remain as inactive fake-door placeholders in the right pane (same as v0.1). They are not activated in this version.
- The app remains client-side only — vanilla HTML/CSS/JS, no backend, no external calls, AGPLv3 licensed.
- Session storage auto-saves on every `input` event. There is no explicit "save" or "submit" action. The v0.1 Cancel button, Edit button, and edit/cancel mode are removed entirely — they were an artifact of the now-obsolete form↔story toggle pattern.
- The pool of 10+ default story titles is hardcoded in the app. No external data source is needed.
- All 8 story fields use the same four-option confidence status vocabulary. There is no field-specific status vocabulary.
- The README sections to remove (web app MVP, run locally, quickstart/public review) may not currently exist; the requirement is to ensure they are absent post-implementation.
- The app targets large screens (≥ 768px) as established in v0.1 (FR-011 of 001-basic-story-form). Smartphone layout remains out of scope.

## Clarifications

### Session 2026-03-25

- Q: Should the Cancel button and v0.1 edit mode be kept in any form in v0.2? → A: Remove entirely. The form is always visible; there is no committed snapshot to roll back to. All edits are live.
- Q: In the right-pane preview, should empty field blocks be shown with placeholders or hidden? → A: The right pane is wave-contextual. Basic wave: show Target, Problem, Solution only. Detailed wave: show Target+Empathy, Problem+Consequences, Solution+Benefits (paired). Full wave: show all 8 in canonical order. When all displayed fields are empty, show a single placeholder message.
