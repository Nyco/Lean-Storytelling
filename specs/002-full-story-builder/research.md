# Research: Full Story Builder — v0.2

**Branch**: `002-full-story-builder` | **Date**: 2026-03-25
**Status**: Complete — no NEEDS CLARIFICATION items remain

---

## R-001: Self-hosted font strategy under strict CSP

**Decision**: Self-host Playfair Display and DM Sans as `.woff2` files in `/fonts/`.

**Rationale**: The app enforces `Content-Security-Policy: default-src 'self'`, which blocks all external resource loads including Google Fonts CDN (`fonts.googleapis.com`, `fonts.gstatic.com`). Self-hosting is the only compliant path.

**Alternatives considered**:
- *Google Fonts CDN*: Blocked by CSP. Rejected.
- *System font stack*: Avoids the download step but cannot guarantee Playfair Display on any platform. Violates Constitution Principle VI (elegant typography). Rejected.
- *Inline base64 in CSS*: Dramatically inflates CSS file size (~500KB+ per font weight) and is unmaintainable. Rejected.

**Implementation**: Download Playfair Display Regular + Bold 700 and DM Sans Regular from the OFL-licensed Google Fonts static export (or font maintainer GitHub releases). Place `.woff2` files in `/fonts/`. Declare with `@font-face` in `style.css`. Add `fonts/` to the service worker cache list so fonts are available offline.

**License**: Both fonts use OFL 1.1 — compatible with AGPLv3 and self-hosting.

---

## R-002: Foldable advice — HTML `<details>`/`<summary>` vs JS toggle

**Decision**: Use native HTML `<details>`/`<summary>` elements.

**Rationale**: Native disclosure widgets are keyboard-accessible out of the box (`Enter`/`Space` on `<summary>`), require zero JS, have native semantics (`open` attribute for CSS state), and are supported in all modern evergreen browsers. Constitution Principle I (Simplicity) and IV (Readability) both favor zero-JS when the platform provides the capability natively.

**Alternatives considered**:
- *JS-driven aria-expanded toggle*: Adds JS complexity and requires manual ARIA management. No benefit over `<details>` in this context. Rejected.
- *CSS-only checkbox hack*: Hackier, semantically wrong, harder to maintain. Rejected.

**CSS note**: `details[open] .field-advice-body` targets the expanded state without any JS. `summary::marker` / `summary::-webkit-details-marker` can be suppressed and replaced with a custom arrow icon for design control.

---

## R-003: Story title inline editing — contenteditable vs input toggle

**Decision**: Use an input-toggle pattern: display as styled `<h2>` with a click handler that replaces it (or reveals an overlapping `<input>`) for edit mode. Read value via `value` property on the input (never `innerHTML`).

**Rationale**: `contenteditable="plaintext-only"` is the simpler option but has inconsistent cross-browser paste behavior and requires careful `textContent` reading to avoid XSS. An input-toggle (`<h2>` + hidden `<input>`, toggled by JS) gives full control over rendering and value extraction with zero XSS surface. Constitution Principle IV (Readability) favors the more explicit pattern.

**Alternatives considered**:
- *`contenteditable="plaintext-only"`*: Simpler markup but browser-inconsistent; `textContent` reading is safe but `innerText` is not — easy to confuse. Accepted as fallback but not preferred.
- *Always-visible `<input>`*: Less elegant — an input styled as a heading looks like an input, not a title. Rejected per Principle VI.

**XSS note**: In either approach, the value MUST be read via `.value` (input) or `.textContent` (contenteditable) and written into the DOM via `.textContent = value` — never `innerHTML`. The title is stored in `sessionStorage` as a plain string.

---

## R-004: Wave state management

**Decision**: Module-level `_currentWave` variable (`'basic'` | `'detailed'` | `'full'`), managed by a `setWave(wave)` function that updates the DOM. No framework, no router library.

**Rationale**: Three discrete states, one active at a time — a simple string variable plus a rendering function is sufficient. A class-based state machine or external router would be over-engineering for this scope (Constitution Principle I, YAGNI).

**`setWave()` responsibilities**:
1. Update `_currentWave`
2. Show/hide the three wave form sections (`#basic-form`, `#detailed-form`, `#full-form`)
3. Toggle `wave-card--active` class on the nav cards
4. Collapse all `<details>` advice sections (reset to closed state)
5. Populate the active form's fields from session
6. Call `updateRightPane()` to re-render the right pane for the new wave context
7. Call `updateWaveProgress()` to update all three progress bars

---

## R-005: Real-time save — removing the submit pattern

**Decision**: Wire `input` events on all textareas and `change` events on all status selects to call `saveSession()` immediately. No submit button, no debounce required.

**Rationale**: Session storage writes are synchronous and fast. With 8 short text fields and no backend, the overhead of saving on every keystroke is negligible. Debouncing adds complexity without meaningful benefit at this scale. Constitution Principle I (Simplicity) favors the straightforward approach.

**Removed from v0.1**: `handleSubmit()`, `enterEditMode()`, `exitEditMode()`, `handleCancel()`, `showView()`, the form `submit` event listener, the Edit button, the Cancel button, the `#empty-hint` element.

---

## R-006: Wave-contextual right-pane preview rendering

**Decision**: Three rendering modes driven by `_currentWave`. Each mode builds its preview DOM from the current session object. An all-empty check per mode shows a single placeholder instead of multiple empty blocks.

**Basic mode** (3 blocks): Target → Problem → Solution
**Detailed mode** (6 blocks): Target, Empathy, Problem, Consequences, Solution, Benefits
**Full mode** (8 blocks): Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why

**Empty state**: If all displayed fields for the active mode are empty, render one `<p class="preview-placeholder">` message (e.g., "Your story will appear here — fill the form on the left to get started."). This avoids cluttering the right pane with multiple empty placeholder rows.

**Status badge**: If a field has a status, the emoji is rendered as a `<span class="status-badge">` inside the preview block. Used `textContent` assignment — never `innerHTML` — for user-supplied content.

---

## R-007: Progress bar accessibility (WCAG 2.1 AA)

**Decision**: Each step indicator conveys state through three simultaneous channels: icon/emoji, `aria-label`, and shape/border — never color alone.

**State signals**:
| State | Emoji shown | Shape | `aria-label` |
|-------|-------------|-------|-------------|
| Empty | — | hollow circle | `"[Field]: empty"` |
| Filled (no status) | ✓ | filled circle | `"[Field]: filled"` |
| Filled + Unsure | 🤔 | filled circle | `"[Field]: filled, unsure"` |
| Filled + Needs review | 🔄 | filled circle | `"[Field]: filled, needs review"` |
| Filled + Confirmed | ✅ | filled circle | `"[Field]: filled, confirmed"` |

**Color contrast**: Filled state uses `--color-green-600` (#16a34a) on white — contrast ratio ≥4.5:1 for AA. Unfilled uses `--color-neutral-300` — decorative, not informational.

---

## R-008: Font file sourcing

**Fonts selected**:
- **Playfair Display** by Claus Eggers Sørensen — OFL 1.1 — weights: 400 (Regular), 700 (Bold) — used for page title, story title headings, preview section headers
- **DM Sans** by Colophon Foundry — OFL 1.1 — weight: 400 (Regular) — used for all UI text, form labels, explainer text, body

**Source**: Google Fonts static export (direct `.woff2` download) — same files served by CDN but self-hosted. This is explicitly permitted by OFL 1.1.

**File sizes** (estimated):
- `playfair-display-latin-400.woff2` ≈ 32KB
- `playfair-display-latin-700.woff2` ≈ 33KB
- `dm-sans-latin-400.woff2` ≈ 18KB
Total font payload: ≈ 83KB — acceptable for a coaching tool (well under 200KB target).

**Service worker**: Font files MUST be added to the `CACHE_FILES` list in `service-worker.js` so they are available offline.
