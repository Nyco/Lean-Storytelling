# Implementation Plan: Full Story Builder — v0.2

**Branch**: `002-full-story-builder` | **Date**: 2026-03-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-full-story-builder/spec.md`

## Summary

Build the complete end-to-end Lean Storytelling Story Builder: all three waves active and navigable (Basic Story, Detailed Story, Full Story), a unified field template with foldable advice and status emojis, wave-contextual real-time right-pane preview, story title widget with inline editing, accessible wave progress bars with status emoji indicators, and a typography refresh using self-hosted fonts. Builds directly on the v0.1 split-screen two-column layout.

## Technical Context

**Language/Version**: JavaScript ES2020, HTML5, CSS3 (no transpilation, no bundler)
**Primary Dependencies**: None — zero runtime dependencies
**Storage**: `sessionStorage` with in-memory object fallback (same as v0.1)
**Testing**: Manual acceptance testing per spec acceptance scenarios; WCAG 2.1 AA audit
**Target Platform**: Static file hosting — GitHub Pages; modern evergreen browsers; large screens ≥768px
**Project Type**: Client-side web application (single-page, no backend)
**Performance Goals**: Right-pane preview update ≤150ms of keystroke (SC-002); page load ≤2s on average connection
**Constraints**: Strict CSP `default-src 'self'` — no external CDN calls; fonts must be self-hosted; no external JS; AGPLv3
**Scale/Scope**: Single user per session; 8 story fields + title; 3 waves; session-scoped storage only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | PASS | Zero new dependencies; `<details>` for foldable advice (zero JS); wave router is a simple module variable |
| II. Methodology Fidelity | PASS | All 8 fields, all labels, delivery order (Context → Target → Empathy → Problem → Consequences → Solution → Benefits → Why) preserved exactly; no renaming |
| III. Responsive & Progressive | PASS | PWA maintained (manifest + service worker unchanged); split-screen layout preserves ≥768px baseline; JS degrades gracefully |
| IV. Readability & Maintainability | PASS | Single-purpose files; new wave router is a focused module pattern; font declarations are standard CSS `@font-face` |
| V. Incremental Feature Growth | PASS | v0.2 correctly activates Detailed Story then Full Story — the next two levels in strict playbook order |
| VI. Elegant & Focused UI/UX | PASS | Playfair Display + DM Sans font upgrade; deliberate typographic variance; progress bars with emoji status; inline title editing — all serve clarity |

*Post-design re-check: All gates still pass. No constitution violations.*

## Project Structure

### Documentation (this feature)

```text
specs/002-full-story-builder/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── session-state.md # Session storage schema contract
│   └── ui-states.md     # Wave/field UI state transitions
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
fonts/
├── playfair-display-v37-latin-regular.woff2
├── playfair-display-v37-latin-700.woff2
└── dm-sans-v15-latin-regular.woff2

index.html               # Updated: 3 active wave cards; Detailed+Full forms; story title widget; foldable advice
style.css                # Updated: @font-face declarations; typographic scale; advice/toggle styles; title styles
app.js                   # Updated: wave router; extended session schema; real-time save; title editing; progress bars

consistency.js           # Unchanged
prompts.js               # Unchanged
service-worker.js        # Unchanged
manifest.json            # Unchanged
```

**Structure Decision**: Single-project layout (Option 1). All source lives at repository root, consistent with v0.1. No new directories are introduced except `/fonts/` for self-hosted typefaces.

## Development Phases

### Phase A — Session Schema Extension

Extend `createStory()` and `normaliseStory()` in `app.js` to include the five new fields (`empathy`, `consequences`, `benefits`, `context`, `why`) with their paired `*Status` fields, plus `storyTitle`. Extend `loadSession()` / `saveSession()` accordingly. No UI changes in this phase.

**Files**: `app.js`

### Phase B — Font Acquisition and @font-face Declarations

Download Playfair Display (Regular 400, Bold 700) and DM Sans (Regular 400) as `.woff2` files from Google Fonts static export or the font's GitHub releases. Place in `/fonts/`. Add `@font-face` declarations in `style.css`. Update `--font-display` and `--font-body` CSS custom properties to use the new families.

**Fonts selected**:
- **Playfair Display** (OFL 1.1) — elegant serif for page title, story title, wave card titles, preview headings
- **DM Sans** (OFL 1.1) — clean geometric sans for field labels, explainer text, body, form UI

**Files**: `fonts/` (new), `style.css`

### Phase C — Typographic Scale Update

Apply deliberate typographic variance across the hierarchy: page title (Playfair Display, large, bold), story title (Playfair Display, medium, italic or semi-bold), wave card title (DM Sans, upper-weight), field title (DM Sans, semi-bold), explainer text (DM Sans, smaller, muted), advice text (DM Sans, italic, muted), preview body (Playfair Display or DM Sans, readable), status indicators (DM Sans, small, colored). Update size, weight, color, letter-spacing tokens.

**Files**: `style.css`

### Phase D — Story Title Widget

Add `<h2 id="story-title" contenteditable="plaintext-only">` (or an input-toggle pattern) below the page heading in `index.html`. In `app.js`: on DOMContentLoaded, read `storyTitle` from session (or pick a random default from a pool of ≥10 titles). Wire `blur` and `keydown[Enter]` to commit and save. Wire `keydown[Escape]` to revert. Read via `textContent` (never `innerHTML`) to avoid XSS.

**Default title pool** (10 candidates, hardcoded):
1. "The Resilient Leader's Turning Point"
2. "A Market Waiting for Its Hero"
3. "When Pressure Becomes Clarity"
4. "The Problem No One Named"
5. "Quiet Friction, Loud Consequences"
6. "A Solution Built from Empathy"
7. "The Moment Everything Changed"
8. "Complexity Reduced to One Truth"
9. "The Gap Between Vision and Reality"
10. "Where the Story Begins"

**Files**: `index.html`, `app.js`, `style.css`

### Phase E — Wave Router

Replace the v0.1 `_currentView` / `showView()` pattern with a wave router. Introduce `_currentWave` module variable (values: `'basic'` | `'detailed'` | `'full'`). Add `setWave(wave)` function: hides/shows the appropriate `<section>` for each wave form, updates active card class on wave nav, re-populates the active form, collapses all advice sections, and calls `updateRightPane()`. Wire wave card click handlers in DOMContentLoaded.

Remove `handleSubmit()`, `enterEditMode()`, `exitEditMode()`, `handleCancel()`, `showView()`. Remove the form's `submit` event listener. Remove Edit and Cancel button wiring.

**Files**: `app.js`, `index.html`

### Phase F — Detailed Story Form (HTML + CSS)

Add the Detailed Story `<section id="detailed-form">` in `index.html` with three fields: Empathy, Consequences, Benefits. Each field uses the unified template:

```html
<div class="field-group">
  <h3 class="field-title">Empathy</h3>
  <p class="field-explainer">What the Target sees, feels, hears, and says — step into their shoes</p>
  <textarea id="empathy" ...></textarea>
  <details class="field-advice">
    <summary class="field-advice-toggle">Advice</summary>
    <p>What does your hero see in their day-to-day?...</p>
  </details>
  <select id="empathy-status" ...>
    <option value="">— No status</option>
    <option value="unsure">🤔 Unsure / Assumption</option>
    <option value="needs-review">🔄 Needs review</option>
    <option value="confirmed">✅ Confirmed / Validated</option>
  </select>
</div>
```

Same structure for Consequences and Benefits. Add CSS for the unified `.field-group`, `.field-explainer`, `.field-advice`, `.field-advice-toggle` pattern (shared with Basic and Full).

**Files**: `index.html`, `style.css`

### Phase G — Full Story Form (HTML + CSS)

Add `<section id="full-form">` with Context and Why fields, same template as Phase F.

**Files**: `index.html`, `style.css`

### Phase H — Basic Story Form: Revised Field Content + Template Alignment

Update Target, Problem, Solution fields in `index.html` to use the unified field template (Phase F structure): add `<p class="field-explainer">`, `<details class="field-advice">` with correct advice text per FR-008/FR-009/FR-010. Remove the old Edit and Cancel buttons, the `#empty-hint`, and the submit button from the form view.

**Files**: `index.html`, `style.css`

### Phase I — Real-Time Auto-Save (all fields)

Wire `input` and `change` events on all 8 text areas and all 8 status selects to call `saveSession()` with the current story object read from all form fields. Remove the submit-based save pattern. `populateForm()` must now target the active wave's fields.

**Files**: `app.js`

### Phase J — Wave-Contextual Right-Pane Preview

Extend `updateRightPane()` (refactor of `updateStoryPreview()`) to render the right pane based on `_currentWave`:
- `'basic'`: render Target, Problem, Solution blocks
- `'detailed'`: render Target, Empathy, Problem, Consequences, Solution, Benefits blocks (paired order)
- `'full'`: render all 8 in canonical delivery order (Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why)

When all displayed fields are empty, show a single `<p class="preview-placeholder-text">` message instead of multiple empty blocks. Each block shows the status emoji badge (FR-018) if a status is set.

**Files**: `app.js`, `index.html` (preview containers), `style.css`

### Phase K — Active Progress Bars with Status Emojis (Accessibility)

Update wave card progress bars in `index.html` to have one step indicator per field. In `app.js`, refactor `updateWaveProgress()` to update all three wave cards simultaneously based on session state. Each step indicator:
- Shows the status emoji if a status is set
- Shows a neutral filled indicator (e.g., `✓`) if content is filled but no status
- Shows an empty indicator if no content
- Includes `aria-label="[Field]: [state]"` for screen reader accessibility
- Does not rely on color alone (shape + label + emoji convey state)

**Files**: `app.js`, `index.html`, `style.css`

### Phase L — README Cleanup

Verify and remove (if present) the sections: "Lean Storytelling web app (MVP)", "Run locally", "Quickstart and public review".

**Files**: `README.md`

## Complexity Tracking

> No constitution violations requiring justification.
