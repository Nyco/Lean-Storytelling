# Merged Features Log

> **Revision**: 2026-03-26 — File created on first archival.

---

### FULL STORY BUILDER (v0.2) — 2026-03-26

**Branch**: `002-full-story-builder`
**Spec**: specs/002-full-story-builder

**What was added:**
- All three story-building waves activated and navigable: Basic Story, Detailed Story, Full Story
- Unified field template with foldable advice (`<details>`/`<summary>`), explainer text, and confidence status dropdown (🤔 / 🔄 / ✅)
- Wave router (`_currentWave` + `setWave()`) replacing v0.1 view toggle pattern
- Wave-contextual right-pane real-time preview (3 / 6 / 8 fields by wave)
- Accessible progress bars — one step indicator per field, emoji + shape + aria-label (WCAG 2.1 AA)
- Story title widget with inline editing, 10-entry default pool, sessionStorage persistence
- Typography refresh: Playfair Display (headings) + DM Sans (UI) — self-hosted `.woff2` under strict CSP
- Removed: submit button, Edit/Cancel buttons, enter/exit edit mode flow (v0.1 artifacts)
- Extended session schema: 5 new content fields + 5 status fields + storyTitle

**New Components:**
- `fonts/` directory — Playfair Display 400+700, DM Sans 400 (`.woff2`)
- `_currentWave` wave router module in `app.js`
- `setWave()`, `updateRightPane()`, `updateWaveProgress()`, `renderStoryTitle()` functions in `app.js`
- `#detailed-form` and `#full-form` sections in `index.html`
- Story title widget (`#story-title-display`, `#story-title-input`) in `index.html`
- Per-field step indicators (`<span class="wave-step">`) in wave card HTML

**Tasks Completed**: 49/52 tasks
*(T050–T052 — manual acceptance testing, accessibility audit, CSP compliance check — are verification tasks deferred to post-merge)*
