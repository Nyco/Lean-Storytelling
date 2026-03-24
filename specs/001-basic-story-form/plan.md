# Implementation Plan: Basic Story Form

**Branch**: `001-basic-story-form` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-basic-story-form/spec.md`

## Summary

A client-side-only vanilla HTML/CSS/JS web app implementing the Lean Storytelling Basic Story
form (Target → Problem → Solution). Zero runtime dependencies, session-only data retention,
AGPLv3 licensed, strict Content Security Policy, offline-capable PWA. The app delivers a
polished single-screen experience covering: form entry, confidence status tagging, assembled
story view, rule-based consistency observations, curated coaching prompts, and an edit loop —
all within one browser session, no server, no tracking, no external calls.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2020 (no transpilation, no bundler)
**Primary Dependencies**: None — zero runtime dependencies
**Storage**: `sessionStorage` (session-scoped, cleared on tab/window close); in-memory object fallback if sessionStorage unavailable
**Testing**: Manual acceptance scenario checklist + Lighthouse audit (PWA/perf/a11y) + axe accessibility scan + smoke-test script
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge); static file hosting — GitHub Pages
**Project Type**: Client-side Progressive Web App (static site, no backend)
**Performance Goals**: Interactive < 2 s on standard mobile connection (SC-003); FCP < 1 s
**Constraints**: Zero external network calls · strict CSP (`default-src 'self'`) via `<meta>` tag · AGPLv3 · no framework · WCAG 2.1 AA on all form elements · offline-capable after first load
**Scale/Scope**: Single user · single story per session · 3 fields (Basic Story only, v1)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see result below.*

| Principle | Evidence | Status |
|-----------|----------|--------|
| I. Simplicity First | Zero deps · no build pipeline · YAGNI enforced · one purpose per screen | ✅ PASS |
| II. Methodology Fidelity | Exactly Target + Problem + Solution · story view renders in playbook delivery order | ✅ PASS |
| III. Responsive & Progressive | Mobile-first CSS · form submittable without JS · PWA manifest + service worker | ✅ PASS |
| IV. Readability & Maintainability | No transpilation · small single-purpose files · co-located per feature | ✅ PASS |
| V. Incremental Growth | Basic Story only · no Detailed/Full/Extension fields introduced | ✅ PASS |
| VI. Elegant & Focused UI/UX | One primary action per view · deliberate typography/spacing · no raw browser defaults | ✅ PASS |

**Post-design re-check**: No violations introduced by Phase 1 design (see data-model.md, contracts/).

## Project Structure

### Documentation (this feature)

```text
specs/001-basic-story-form/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output — local dev + user testing guide
├── contracts/
│   ├── session-state.md # Session storage schema contract
│   └── ui-states.md     # View state machine contract
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
/ (repo root)
├── index.html           # App shell: form view + story view (single page, two panels)
├── style.css            # All styles — mobile-first, no browser defaults left unstyled
├── app.js               # Main controller: view routing, form logic, session state bridge
├── prompts.js           # Coaching prompts data: static arrays keyed by field + status
├── consistency.js       # Consistency observation engine: rule-based keyword heuristics
├── manifest.json        # PWA manifest (name, icons, theme_color, standalone display)
├── service-worker.js    # PWA service worker — cache-first strategy for offline support
├── COPYING              # AGPLv3 license text (existing)
├── README.md            # Lean Storytelling playbook (existing)
├── _config.yml          # Jekyll/GitHub Pages config (existing)
└── docs/
    ├── APP_RUN_DEPLOY.md  # Local run + GitHub Pages deploy instructions (to create)
    └── ...
```

**Structure Decision**: Single project at repo root — no `src/` indirection. This is a
zero-build, co-located feature per Constitution Principle IV. JS is split into three
single-purpose files (controller / prompts data / consistency engine) to support
readability and future testability without premature abstraction.

## Development Phases

### Phase A — Skeleton & Infrastructure

1. `index.html` — semantic HTML structure: form view + story view, CSP meta tag, PWA link tags
2. `manifest.json` — PWA manifest with name, short_name, icons, theme_color, background_color, display: standalone
3. `service-worker.js` — cache-first service worker caching all static assets on install
4. `style.css` — CSS custom properties (tokens), reset, typography, layout skeleton (mobile-first)

### Phase B — Form & Session

5. `app.js` — sessionStorage wrapper, form state read/write, view router (form ↔ story)
6. Form view: Target/Problem/Solution fields with labels, hints, status selectors; submit button
7. Empty-state guard: prompt if all fields empty; allow partial submission otherwise
8. Whitespace normalization on field values before storing

### Phase C — Story View

9. Assembled story narrative: fields in order (Target → Problem → Solution), empty-field placeholders
10. Status badges: visually associated with each field, non-disruptive to narrative flow
11. Edit button: returns to form pre-filled from session state; Cancel preserves state intact

### Phase D — Consistency Engine

12. `consistency.js` — rule-based heuristics for Target↔Problem and Problem↔Solution pair checks
13. Observations rendered in story view: at least one per filled pair, incomplete-story handling

### Phase E — Coaching Prompts

14. `prompts.js` — curated static prompt arrays per field (target/problem/solution), per status weight
15. Prompt selection logic in app.js: surface ≥1 prompt per filled field; weight by status; refresh on edit

### Phase F — Polish & Compliance

16. `style.css` — full visual design: typography scale, colour palette, spacing system, status badge styles, transitions
17. WCAG 2.1 AA pass: labels, focus states, colour contrast ≥ 4.5:1, aria attributes where needed
18. CSP hardening: verify `<meta http-equiv="Content-Security-Policy">` blocks inline scripts and external resources
19. Offline test: verify app loads and functions fully after first load with network disabled

### Phase G — QA & Validation

20. Manual checklist: all 23 acceptance scenarios from spec (US1–US5 + edge cases)
21. Lighthouse audit: PWA ≥ 90, Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95
22. axe DevTools scan: zero critical/serious violations
23. Cross-browser smoke: Chrome, Firefox, Safari (desktop + mobile viewport)
24. User test session: run test script from quickstart.md on local deployment

## Complexity Tracking

> No Constitution violations. Table omitted per instructions (fill only if violations exist).
