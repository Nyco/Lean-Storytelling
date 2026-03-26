# Project Plan Memory: Lean Storytelling App

> **Revision**: 2026-03-26 — Bootstrapped from first archival: `specs/002-full-story-builder`

---

## Technical Context

**Language/Version**: JavaScript ES2020, HTML5, CSS3 (no transpilation, no bundler)
**Primary Dependencies**: None — zero runtime dependencies
**Storage**: `sessionStorage` with in-memory object fallback (cleared on tab/window close)
**Testing**: Manual acceptance testing per spec acceptance scenarios; WCAG 2.1 AA audit
**Target Platform**: Static file hosting — GitHub Pages; modern evergreen browsers; large screens ≥768px
**Project Type**: Client-side web application (single-page, no backend, AGPLv3)
**Performance Goals**: Right-pane preview update ≤150ms of keystroke; page load ≤2s
**Constraints**: Strict CSP `default-src 'self'` — no external CDN calls; fonts must be self-hosted; no external JS
**Scale/Scope**: Single user per session; 8 story fields + title; 3 waves; session-scoped storage only

---

## Project Structure

### Source Code (repository root)

```text
fonts/
├── playfair-display-v*-latin-regular.woff2   # OFL 1.1 — display/serif headings
├── playfair-display-v*-latin-700.woff2       # OFL 1.1 — bold display headings
└── dm-sans-v*-latin-regular.woff2            # OFL 1.1 — UI body/form text

index.html               # 3 wave sections + story title widget + all field HTML
style.css                # @font-face; typographic scale; wave/field/preview styles
app.js                   # Wave router; session schema; real-time save; title widget; progress bars

consistency.js           # Placeholder (inactive coaching feature)
prompts.js               # Placeholder (inactive coaching feature)
service-worker.js        # PWA offline support; caches fonts + app files
manifest.json            # PWA manifest
```

### Feature Specs

```text
specs/
├── 001-basic-story-form/     # Basic Story (v0.1) — archived: no (no formal archival)
└── 002-full-story-builder/   # Full Story Builder (v0.2) — archived: yes (2026-03-26)
```

---

## Architecture Decisions

### Wave Router Pattern
[Source: specs/002-full-story-builder]

Module-level `_currentWave` variable (`'basic'` | `'detailed'` | `'full'`), managed by `setWave(wave)`.
`setWave()` responsibilities: update `_currentWave`, show/hide form sections, toggle `wave-card--active`, collapse all `<details>` advice, populate form, call `updateRightPane()`, call `updateWaveProgress()`.

**Why**: Three discrete states, one active at a time — a string variable plus rendering function is sufficient. Framework/router would be over-engineering (Constitution Principle I, YAGNI).

### Self-Hosted Fonts
[Source: specs/002-full-story-builder]

Playfair Display (Regular 400, Bold 700) + DM Sans (Regular 400) self-hosted as `.woff2` in `/fonts/`.
Fonts added to service worker CACHE_FILES for offline availability.

**Why**: CSP `default-src 'self'` blocks Google Fonts CDN. System font stack rejected (Constitution Principle VI).
**Fonts**: Playfair Display for headings/story preview; DM Sans for all UI/form text.

### Foldable Advice — Native `<details>`/`<summary>`
[Source: specs/002-full-story-builder]

HTML-native disclosure widgets for all field advice sections. Collapsed by default via absence of `open` attribute.

**Why**: Zero JS, native keyboard accessibility (Enter/Space), native semantics. JS toggle adds complexity with no benefit (Constitution Principles I + IV).

### Real-Time Auto-Save (No Submit Pattern)
[Source: specs/002-full-story-builder]

`input` events on all textareas and `change` events on all status selects call `saveSession()` immediately.
v0.1 patterns removed: `handleSubmit()`, `enterEditMode()`, `exitEditMode()`, `handleCancel()`, `showView()`, Edit button, Cancel button, `#empty-hint`, form submit event listener.

**Why**: sessionStorage writes are synchronous and fast at this scale. Debouncing adds complexity without meaningful benefit (Constitution Principle I).

### Story Title — Input-Toggle Pattern
[Source: specs/002-full-story-builder]

`<h2>` display mode + hidden `<input>` edit mode, toggled by click. Value read via `.value` (input), never `innerHTML`.

**Why**: `contenteditable` has inconsistent cross-browser paste behavior. Always-visible input is less elegant (Constitution Principle VI). Input-toggle gives full rendering control with zero XSS surface.

### Wave-Contextual Right-Pane Preview
[Source: specs/002-full-story-builder]

`updateRightPane()` renders three modes based on `_currentWave`:
- `'basic'`: Target → Problem → Solution (3 blocks)
- `'detailed'`: Target, Empathy, Problem, Consequences, Solution, Benefits (6 paired blocks)
- `'full'`: Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why (8 blocks, canonical delivery order)

All-empty check per mode → single `<p class="preview-placeholder-text">` instead of multiple empty blocks.

### Progress Bar Accessibility (WCAG 2.1 AA)
[Source: specs/002-full-story-builder]

Each step indicator uses three simultaneous channels: emoji, `aria-label`, shape/border.
States: empty (hollow circle), filled-no-status (✓ + filled circle), filled+unsure (🤔), filled+needs-review (🔄), filled+confirmed (✅).
Color contrast: `--color-green-600` (#16a34a) on white ≥4.5:1 for AA.

---

## Dependencies

| Dependency | Version | License | Purpose |
|-----------|---------|---------|---------|
| Playfair Display | v37 | OFL 1.1 | Display serif font — headings, preview headers |
| DM Sans | v15 | OFL 1.1 | Geometric sans — UI text, form labels, body |

*Zero runtime JavaScript dependencies.*

---

## Routing & Navigation

No client-side routing library. Wave state managed by `_currentWave` + `setWave()` in `app.js`.
Sections: `#basic-form`, `#detailed-form`, `#full-form` — shown/hidden by CSS class via `setWave()`.

---

## Testing Strategy

- Manual acceptance testing per spec acceptance scenarios (quickstart.md)
- WCAG 2.1 AA audit (axe DevTools or browser built-in)
- CSP compliance check: DevTools Network tab, filter for external hosts
- No automated tests (not in scope for v1)

---

## Future Work

*(Items intentionally deferred per Constitution Principle V — incremental story-level feature growth)*

- Extension Pack: Challenge, Quote, Alternatives, Competition, Unfair Advantage, Warnings, Self-Benefits, AARRR, Call to Action, Failure
- Consistency check feature (currently inactive placeholder in right pane)
- Coaching/prompts feature (currently inactive placeholder)
- Smartphone layout (currently out of scope — large screens ≥768px only)
- Automated tests
