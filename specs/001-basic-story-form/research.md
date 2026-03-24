# Research: Basic Story Form

**Branch**: `001-basic-story-form` | **Date**: 2026-03-24
**Phase**: 0 — Resolves all NEEDS CLARIFICATION from plan.md Technical Context

---

## 1. CSP on GitHub Pages (static hosting, no server headers)

**Decision**: Declare CSP via `<meta http-equiv="Content-Security-Policy">` in `index.html`.

**Rationale**: GitHub Pages does not allow custom HTTP response headers. The `<meta>` CSP tag
is supported by all modern evergreen browsers and covers `default-src`, `script-src`,
`style-src`, `img-src`, `connect-src`, etc. It cannot restrict `frame-ancestors` or `sandbox`
(those require HTTP headers), but those directives are not needed for this app.

**Directive**: `default-src 'self'` — blocks all external resources, inline scripts, inline
styles, and external connections. All assets (HTML, CSS, JS, icons, manifest, service worker)
must be served from the same origin.

**Note on inline styles**: `default-src 'self'` blocks inline `style=""` attributes and
`<style>` blocks unless `'unsafe-inline'` is added. All styles must be in `style.css`.
JavaScript `element.style` property assignments are **not** blocked by CSP — only style
attributes in HTML and `<style>` blocks.

**Alternatives considered**:
- Custom headers via `_headers` file (Netlify) — not available on GitHub Pages
- Nonce-based CSP for inline scripts — unnecessary since all JS is in external files

---

## 2. sessionStorage API Pattern

**Decision**: Wrap `sessionStorage` in a thin module (`storage.js` or inline in `app.js`)
that catches `SecurityError` / `QuotaExceededError` and falls back to an in-memory object.

**Rationale**: `sessionStorage` is per-tab, automatically cleared when the tab/window closes —
exactly matching FR-010. No explicit clear-on-close handler needed. The fallback ensures the
app degrades gracefully (FR-003 edge case: browser does not support sessionStorage).

**Storage key**: `leanstory_session` — a single JSON-serialised object:
```json
{
  "target": "", "targetStatus": null,
  "problem": "", "problemStatus": null,
  "solution": "", "solutionStatus": null
}
```

**Alternatives considered**:
- `localStorage` — explicitly rejected (persists across sessions, violates FR-010)
- `IndexedDB` — overkill for a flat 6-field object; no clear session-scoping

---

## 3. PWA for Vanilla JS (Manifest + Service Worker)

**Decision**: Two files — `manifest.json` + `service-worker.js` — registered from `index.html`.
No libraries, no Workbox.

**Manifest** (`manifest.json`):
```json
{
  "name": "Lean Storytelling",
  "short_name": "Story",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "icons": [{ "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }]
}
```

**Service Worker** — cache-first strategy:
1. On `install`: pre-cache `['/', '/index.html', '/style.css', '/app.js', '/prompts.js', '/consistency.js', '/manifest.json']`
2. On `fetch`: serve from cache; on miss, fetch from network and cache the response
3. Cache name versioned: `leanstory-v1` — bump version string to invalidate on update

**Registration**: `navigator.serviceWorker.register('/service-worker.js')` in `app.js`,
inside `if ('serviceWorker' in navigator)` guard. Fails silently on unsupported browsers.

**Constraint**: Service worker requires HTTPS or `localhost`. Local dev must use a local HTTP
server, not `file://` protocol (see quickstart.md).

**Alternatives considered**:
- Workbox — introduces a dependency, violates Principle I
- No service worker — violates FR-012 (offline after first load)

---

## 4. WCAG 2.1 AA for the Form Pattern

**Decision**: Apply these rules to every interactive element:

| Requirement | Implementation |
|-------------|---------------|
| Labels | `<label for="...">` explicitly associated with each `<textarea>` and `<select>` |
| Colour contrast | Text on background ≥ 4.5:1; large text / UI components ≥ 3:1 |
| Focus indicator | Visible `:focus-visible` outline — never `outline: none` without alternative |
| Status selector | `<select>` or accessible `role="radiogroup"` — no custom widget unless fully ARIA-labelled |
| Error/hint text | Associated via `aria-describedby` on each field |
| Empty-state prompt | Announced via `role="alert"` or `aria-live="polite"` |
| Keyboard navigation | Full tab order; no keyboard trap; Enter/Space activate buttons |

**Testing tool**: axe DevTools browser extension — run against both form view and story view.
Target: zero critical or serious violations.

**Alternatives considered**:
- Custom styled radio buttons for status — feasible but adds complexity; `<select>` is simpler
  and fully accessible out of the box

---

## 5. Consistency Observation Heuristics (Rule-Based, No AI)

**Decision**: Simple keyword-overlap and length heuristics. No NLP, no external library.

**Algorithm** (per field pair):

*Target ↔ Problem*:
- Extract significant words (length > 3, not stopwords) from Target and Problem
- If overlap ≥ 1 word (case-insensitive): observation = "connected"
- If no overlap AND both fields are ≥ 10 chars: observation = "possible disconnect — check that the Problem describes a challenge your Target actually faces"
- If either field is < 10 chars: observation = "too short to evaluate connection — consider expanding"

*Problem ↔ Solution*:
- Same word-overlap check between Problem and Solution
- If overlap ≥ 1: observation = "connected"
- If no overlap AND both ≥ 10 chars: observation = "possible disconnect — check that the Solution directly addresses the Problem"
- If either < 10 chars: observation = "too short to evaluate — consider expanding"

**Stopwords list** (minimal, ~30 common English words): the, and, for, that, with, this,
have, from, they, will, your, more, been, were, when, their, than, then, into, its, our, etc.

**Observation types** mapped to UI display:
- `connected` → neutral/positive badge
- `disconnect` → amber warning
- `too-short` → grey/informational

**Alternatives considered**:
- Levenshtein distance — more complex, not more meaningful for this use case
- Sentence embedding / cosine similarity — requires external library or API, violates constraints
- No consistency check — violates FR-007

---

## 6. Coaching Prompts Data Structure

**Decision**: Static JavaScript object in `prompts.js`, exported as a plain `const`.
No JSON file (avoids a fetch call that would complicate offline/CSP setup).

**Structure**:
```js
const PROMPTS = {
  target: {
    default: [ /* open-ended questions about the target audience */ ],
    unsure:  [ /* questions leaning toward validation */ ],
    confirmed: [ /* questions leaning toward deepening */ ],
  },
  problem: {
    default: [ /* questions about problem depth and evidence */ ],
    unsure:  [ /* validation-leaning */ ],
    confirmed: [ /* deepening-leaning */ ],
  },
  solution: {
    default: [ /* questions about solution fit and differentiation */ ],
    unsure:  [ /* validation-leaning */ ],
    confirmed: [ /* deepening-leaning */ ],
  }
};
```

**Selection logic** (in `app.js`):
1. For each filled field, get its status key (`unsure` / `needs-review` / `confirmed` / `default`)
2. Pick `PROMPTS[field][statusKey]` array; fall back to `PROMPTS[field].default`
3. Shuffle the array (Fisher-Yates, seeded by field content length for reproducibility per session)
4. Surface the first 2–3 prompts per field

**Prompt count per field**: minimum 5 per bucket to allow meaningful variation.

**Alternatives considered**:
- Fetch from a JSON file — adds async complexity and a network call (problematic for offline)
- AI-generated prompts — explicitly out of scope per spec Assumptions
