# Project Specification Memory: Lean Storytelling App

> **Revision**: 2026-03-26 — Bootstrapped from first archival: `specs/002-full-story-builder`
> **Note**: `001-basic-story-form` was never formally archived; its Basic Story requirements are captured here via FR-008/009/010 from 002.

---

## Product Vision

A client-side web application that guides users through the **Lean Storytelling methodology** — a structured approach to crafting business stories using a Target → Problem → Solution framework, progressively enriched through three waves: Basic, Detailed, and Full Story.

---

## User Scenarios & Testing

### User Story 1 — Navigate Between Waves (Priority: P1)
[Source: specs/002-full-story-builder]

A user opens the app and sees three active wave cards: "Basic Story", "Detailed Story", "Full Story". They click any card to switch the left-pane form to that wave's fields. Switching never loses previously entered content.

**Acceptance Scenarios**:
1. All three wave cards are active, clickable, clearly labelled — no "Wave N" label.
2. Clicking "Detailed Story" switches the left pane to Empathy, Consequences, Benefits; active card is highlighted.
3. Content typed in any field survives wave switches.
4. Each wave card's progress bar reflects current fill state of that wave's fields.

---

### User Story 2 — Real-Time Story Preview (Priority: P1)
[Source: specs/002-full-story-builder]

As the user types in any field, the right-pane "Your Story" panel updates immediately — no button press required. Preview is wave-contextual: Basic shows 3 fields, Detailed shows 6 paired, Full shows all 8 in canonical delivery order.

**Acceptance Scenarios**:
1. Right pane updates on every keystroke.
2. Basic wave: shows Target → Problem → Solution only.
3. Detailed wave: shows Target, Empathy, Problem, Consequences, Solution, Benefits (paired order).
4. Full wave: shows all 8 in canonical order: Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why.
5. All displayed fields empty → single placeholder message shown.
6. No submit or "View my story" button exists; wave cards are the only navigation.

---

### User Story 3 — Fill the Detailed Story (Priority: P2)
[Source: specs/002-full-story-builder]

The user navigates to "Detailed Story" and fills Empathy, Consequences, Benefits. Each field uses the unified template (title, explainer, foldable advice, status dropdown). Content appears in right-pane preview in correct paired order.

---

### User Story 4 — Fill the Full Story (Priority: P3)
[Source: specs/002-full-story-builder]

The user navigates to "Full Story" and fills Context and Why. Context appears at the top of the story preview; Why at the very bottom.

---

### User Story 5 — Foldable Field Advice (Priority: P3)
[Source: specs/002-full-story-builder]

Every field has an optional advice section hidden by default. User can expand/collapse independently per field. Toggle state does not affect field content or status. Advice collapses on wave switch.

---

### User Story 6 — Story Title (Priority: P4)
[Source: specs/002-full-story-builder]

A story title widget appears below the page heading, above the wave nav. On first load, a random default title is shown. Click to edit; Enter/blur commits; Escape reverts. Title persists in sessionStorage.

---

### User Story 7 — Accessible Progress Bars with Status Emojis (Priority: P4)
[Source: specs/002-full-story-builder]

Each wave card has one step indicator per field. Steps reflect fill state (filled/empty) and confidence status emoji. State is conveyed via shape + aria-label + emoji — never color alone (WCAG 2.1 AA).

---

### Edge Cases
[Source: specs/002-full-story-builder]

- Wave switch while advice expanded → advice collapses; each wave form renders fresh.
- Story title cleared entirely → stays empty; placeholder hint appears but is not stored.
- Field status set + user clears content → status auto-resets to null.
- Extremely long story title → truncates gracefully in display mode.
- Right-pane Detailed field adjacent to empty Basic field → both render without layout break.
- All displayed fields empty in right pane → single placeholder message, not multiple empty blocks.

---

## Requirements

### Functional Requirements

#### Basic Story (001-basic-story-form + 002-full-story-builder)

- **FR-001**: The wave navigation bar MUST display three active, clickable cards: "Basic Story", "Detailed Story", "Full Story". All three MUST be interactive. No "Wave N" label on any card. [Source: specs/002-full-story-builder]
- **FR-002**: Clicking a wave card MUST switch the left-pane form to that wave's fields immediately (no full-page navigation). Active wave MUST be visually distinguished. [Source: specs/002-full-story-builder]
- **FR-003**: Switching waves MUST preserve all previously entered content and confidence statuses for all fields across all three waves. [Source: specs/002-full-story-builder]
- **FR-004**: No submit button, no Cancel button, no edit mode toggle. Form is always visible; wave cards are the only navigation controls. [Source: specs/002-full-story-builder]

#### Field Template (universal)

- **FR-005**: Every field MUST follow: (1) field title, (2) explainer text always visible, (3) textarea, (4) collapsible advice section (collapsed by default, keyboard-accessible toggle), (5) confidence status dropdown with emoji per option. [Source: specs/002-full-story-builder]
- **FR-006**: Collapsible advice MUST be collapsed on form load and wave switch. Toggle is keyboard-accessible; independent per field. [Source: specs/002-full-story-builder]
- **FR-007**: Status dropdown values: none, Unsure/Assumption 🤔, Needs review/Iteration 🔄, Confirmed/Validated ✅. Keyboard accessible. [Source: specs/002-full-story-builder]

#### Basic Story — field content

- **FR-008**: Target — explainer: "Describe the person at the centre of your story. Who are they? What role do they play? Prepare the audience for the kind of change they will go through." Advice: "Every story needs a hero…" [Source: specs/002-full-story-builder]
- **FR-009**: Problem — explainer: "What problem, challenge, or pain does your Target face? Be specific and concrete. Turn the sentence in positive form, not 'the lack of' Solution." Advice: "No problem, no story…" [Source: specs/002-full-story-builder]
- **FR-010**: Solution — explainer: "How does your product, service, or business offering address the Problem for the Target? Focus on the what. Minimalise the description of the Solution in only one short, precise sentence." Advice: "The solution should arrive like a breath of fresh air…" [Source: specs/002-full-story-builder]

#### Detailed Story — field content

- **FR-011**: Empathy — explainer: "What the Target sees, feels, hears, and says — step into their shoes." Full advice text in spec FR-011. [Source: specs/002-full-story-builder]
- **FR-012**: Consequences — explainer: "How the Problem impacts the Target's daily life, the pain that is felt." Full advice text in spec FR-012. [Source: specs/002-full-story-builder]
- **FR-013**: Benefits — explainer: "The qualitative advantages your Solution provides. What does your hero gain? How does your Solution relieve the Target?" Full advice text in spec FR-013. [Source: specs/002-full-story-builder]

#### Full Story — field content

- **FR-014**: Context — explainer: "Set the scene! The environment in which the Target operates…" Full advice text in spec FR-014. [Source: specs/002-full-story-builder]
- **FR-015**: Why — explainer: "The core motivation or guiding principle of this story…" Advice includes warning: "The most difficult part. Craft it carefully. This must not kill the vibe or momentum you have created." [Source: specs/002-full-story-builder]

#### Real-Time Preview

- **FR-016**: Right-pane preview MUST update in real time on every keystroke — no button press required. [Source: specs/002-full-story-builder]
- **FR-017**: Right-pane adapts by active wave. When all displayed fields empty → single placeholder message. [Source: specs/002-full-story-builder]
- **FR-018**: Confidence status emoji MUST be displayed as a badge alongside field content in the right pane when set. [Source: specs/002-full-story-builder]

#### Progress Bars

- **FR-019**: Each wave card progress bar has one step indicator per field. Steps update live: non-empty = filled, empty = unfilled. [Source: specs/002-full-story-builder]
- **FR-020**: Filled field with status → step shows emoji. Filled without status → neutral filled indicator (✓ or filled dot). [Source: specs/002-full-story-builder]
- **FR-021**: Step indicators MUST meet WCAG 2.1 AA — state MUST NOT rely on color alone; shape + label + emoji convey state. [Source: specs/002-full-story-builder]

#### Story Title

- **FR-022**: Story title widget MUST appear below page heading, above wave nav, visible on all wave views. [Source: specs/002-full-story-builder]
- **FR-023**: On session start with no saved title, a random default from a pool of ≥10 titles MUST be assigned. [Source: specs/002-full-story-builder]
- **FR-024**: Story title MUST persist in sessionStorage and restore on page load within same session. [Source: specs/002-full-story-builder]
- **FR-025**: Title toggles between display mode (styled heading) and edit mode (inline input) on click. Enter/blur commits; Escape reverts. [Source: specs/002-full-story-builder]

#### Typography & Design

- **FR-026**: Self-hosted fonts (no external CDN calls). Display font for headings; body font for form/preview content. [Source: specs/002-full-story-builder]
- **FR-027**: Deliberate typographic variance across: page title, story title, wave card title, field title, explainer, advice, preview content, status indicators. [Source: specs/002-full-story-builder]

#### Session Storage

- **FR-028**: Session storage persists all 8 story fields + statuses + storyTitle. Session-only (cleared on tab close). Fallback: in-memory object. [Source: specs/002-full-story-builder]

#### README

- **FR-029**: README MUST NOT contain sections about the web app MVP, local run instructions, or quickstart/public review. [Source: specs/002-full-story-builder]

### Key Entities

**Story (v0.2)** [Source: specs/002-full-story-builder]
- Fields: `target`, `problem`, `solution` (Basic); `empathy`, `consequences`, `benefits` (Detailed); `context`, `why` (Full); each with paired `*Status` (`'unsure'` | `'needs-review'` | `'confirmed'` | `null`); plus `storyTitle` string.
- Constraints: `*Status` is `null` when paired content field is empty. Status auto-nulled when content cleared.
- Storage: sessionStorage with in-memory fallback. All fields trimmed on save/load.

**Wave** [Source: specs/002-full-story-builder]
- Three waves: `basic` (target, problem, solution), `detailed` (empathy, consequences, benefits), `full` (context, why).
- Not persisted — derived from `_currentWave` module variable.
- Right-pane display order per wave defined in data-model.md.

**FieldAdvice** [Source: specs/002-full-story-builder]
- Static authored coaching text per field. Collapsed by default via `<details>` element.
- Never stored in sessionStorage. Reset to closed on every wave switch.

**StoryTitle** [Source: specs/002-full-story-builder]
- Editable string with display/edit mode toggle. 10-entry default pool (hardcoded).
- Persisted in sessionStorage. Empty is valid (shows placeholder, not stored default).

---

## Success Criteria

[Source: specs/002-full-story-builder]

- **SC-001**: User can navigate to all three waves and begin filling fields within 30 seconds.
- **SC-002**: Right-pane preview updates within 150ms of a keystroke.
- **SC-003**: User can fill all 8 fields across all waves in a single session with no data loss.
- **SC-004**: All progress step indicators correctly reflect fill state and confidence emoji after manual acceptance testing.
- **SC-005**: Story title widget discoverable and editable without instructions within 15 seconds.
- **SC-006**: App passes WCAG 2.1 AA with zero critical/serious violations across all three wave forms.
- **SC-007**: Foldable advice expanded at least once per session in user testing (confirms discoverability).
