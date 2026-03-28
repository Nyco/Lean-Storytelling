# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a **documentation-only repository** — no code, no build system, no tests. It contains the Lean Storytelling playbook: a structured methodology for crafting business stories using a Target → Problem → Solution framework.

The site is published via GitHub Pages using Jekyll with the `minimal` theme (`_config.yml`).

## Content structure

- `README.md` — The main playbook: full methodology, story building stages, delivery order, extension pack, FAQ, and an example story.
- `docs/` — Supplementary templates and exercises (basic template, shrink to UVP, and planned expansions referenced in `docs/README.md`).
- `COPYING` — CC BY-SA 4.0 license.

## Core methodology (the "big picture")

The playbook defines a **3-level story building progression**:
1. **Basic** — Target + Problem + Solution
2. **Detailed** — adds Empathy, Consequences, Benefits
3. **Full** — adds Context and Why

**Delivery order** (always this sequence): Context → Target → Empathy → Problem → Consequences → Solution → Benefits → Why

The **Extension Pack** adds optional elements: Challenge, Quote, Alternatives, Competition, Unfair Advantage, Warnings, Self-Benefits, AARRR stages, Call to Action, Failure.

The acronym **TopSol** (Target + Problem + Solution) is an older name for the same methodology.

## Contributing

All contributions are Markdown edits. When adding new `docs/` pages, list them in `docs/README.md`. Keep language concise and example-driven, consistent with the existing style.

## Active Technologies
- HTML5, CSS3, JavaScript ES2020 (no transpilation, no bundler) + None — zero runtime dependencies (001-basic-story-form)
- `sessionStorage` (session-scoped, cleared on tab/window close); in-memory object fallback if sessionStorage unavailable (001-basic-story-form)
- JavaScript ES2020, HTML5, CSS3 (no transpilation, no bundler) + None — zero runtime dependencies (002-full-story-builder)
- `sessionStorage` with in-memory object fallback (same as v0.1) (002-full-story-builder)
- Node.js 20 LTS (backend) + Vanilla JS ES2020 (frontend, unchanged from v0.2) + Fastify 5, `@fastify/jwt`, `@fastify/cookie`, `@fastify/static`, `@fastify/cors`, `postgres` (pg client), `resend`, `crypto` (Node built-in for token hashing) (003-v03-public-app)
- PostgreSQL 16 (server-side persistence); browser sessionStorage (anonymous session, existing) (003-v03-public-app)
- JavaScript ES2020, HTML5, CSS3 (vanilla, no transpilation) + None — zero runtime dependencies (constitution requirement) (004-story-builder-polish)
- Client-side sessionStorage for dirty queue; no new storage (004-story-builder-polish)
- JavaScript ES2020, HTML5, CSS3 — no transpilation, no bundler + None — zero runtime dependencies (005-wave-step-labels)
- N/A — this feature touches only rendering logic (005-wave-step-labels)

## Recent Changes
- 003-v03-public-app: Implemented full v0.3 — Node.js/Fastify backend, PostgreSQL, magic link auth, JWT httpOnly cookie, Stories + Versioning sidebar, auto-save with offline queue, sessionStorage migration on login, onboarding/profile modals, account deletion, Docker Compose stack
- 002-full-story-builder: Implemented full v0.2 — all 3 waves active, wave router, real-time preview, unified field template with foldable advice, story title widget, accessible progress bars, self-hosted Playfair Display + DM Sans fonts
- 001-basic-story-form: Added HTML5, CSS3, JavaScript ES2020 (no transpilation, no bundler) + None — zero runtime dependencies

## Known Issues & Gotchas

### ⚠️ XSS Risk: User Content Must Use textContent, Never innerHTML
**Issue:** User-supplied story field content and story title written to the DOM via `innerHTML` would allow script injection.
**Root Cause:** Story fields and title are arbitrary user text stored in sessionStorage and rendered into DOM elements.
**Prevention Rule:** Always write user content via `.textContent = value` (never `.innerHTML`). Status badge emojis are hardcoded constants and may use `textContent` as well. This applies everywhere: right-pane preview blocks, story title display, progress bar aria-labels.

**Explanation:**
`innerHTML` interprets its value as HTML, so a user who types `<img src=x onerror=alert(1)>` into a story field would execute JavaScript in the browser. `textContent` treats the value as plain text and renders it literally — no HTML parsing, no script execution. Since this app stores user input in `sessionStorage` and replays it back into the DOM, every write of that data is a potential injection point. The rule applies to all user-controlled values: story field text, the story title, and any derived display strings.

### ⚠️ Strict CSP Blocks All External Font CDN Calls
**Issue:** The app enforces `Content-Security-Policy: default-src 'self'`, which silently blocks Google Fonts CDN (`fonts.googleapis.com`, `fonts.gstatic.com`) with no visible error in production.
**Root Cause:** CSP is intentional — the app must be fully self-contained and offline-capable.
**Prevention Rule:** All fonts MUST be self-hosted as `.woff2` files in `/fonts/` and declared via `@font-face` in `style.css`. Add any new fonts to the service worker `CACHE_FILES` array for offline support. Never reference an external font CDN URL.

**Explanation:**
`Content-Security-Policy: default-src 'self'` tells the browser to refuse any resource (scripts, styles, fonts, images) loaded from a domain other than the app's own origin. A `<link>` to Google Fonts or an `@import` from `fonts.googleapis.com` will be silently blocked — the font simply falls back to the system default with no console error visible in a deployed environment, making it easy to miss during development (where CSP may not be enforced). The app is designed to work offline, so all assets must be bundled locally. When adding a font: download the `.woff2` file, place it in `/fonts/`, declare it with `@font-face` in `style.css`, and register it in the service worker's `CACHE_FILES` array so it is available when the user is offline.
