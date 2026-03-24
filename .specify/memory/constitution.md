<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Modified principles: none
Added sections:
  - Principle VI. Elegant & Focused UI/UX (new)
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes required
  - .specify/templates/spec-template.md ✅ no changes required
  - .specify/templates/tasks-template.md ✅ no changes required
Deferred TODOs: none
-->

# Lean Storytelling App Constitution

## Core Principles

### I. Simplicity First (NON-NEGOTIABLE)

The app MUST remain simple and minimalistic at every version increment.
Dependencies MUST be kept to the strict minimum — each added dependency requires explicit
justification. The UI MUST avoid visual clutter; one purpose per screen.
YAGNI (You Aren't Gonna Need It) applies at all levels: no feature is built ahead of its
designated story-building level (Basic → Detailed → Full → Extension Pack).

**Rationale**: The Lean Storytelling methodology is itself lean and minimal. The app must
embody the same philosophy it teaches.

### II. Lean Storytelling Methodology Fidelity (NON-NEGOTIABLE)

All UI copy, field labels, help text, and delivery order MUST match the Lean Storytelling
playbook exactly as documented in `README.md`.
The Basic Story exposes exactly three fields: Target, Problem, Solution — in that build order.
The delivery order (Context → Target → Empathy → Problem → Consequences → Solution →
Benefits → Why) MUST be respected whenever story output is presented to the user.
No field renaming, reordering, or omission is permitted without a constitution amendment.

**Rationale**: Consistency between the playbook and the app is essential for user trust and
for teaching the methodology correctly.

### III. Responsive & Progressive

The app MUST be usable on any screen size (mobile-first CSS).
Core functionality (filling and reading the Basic Story form) MUST work without JavaScript
as a baseline; JavaScript MAY enhance the experience but MUST NOT be required for the
primary user journey.
The app MUST be a valid Progressive Web App (PWA): manifest + service worker for
offline capability SHOULD be added no later than the first public release.

**Rationale**: Business users access tools across devices and unreliable networks.
Accessibility and reach are non-negotiable for a coaching tool.

### IV. Readability & Maintainability

Source code MUST prioritise clarity over cleverness. Files MUST be small and single-purpose.
HTML, CSS, and JS MUST be co-located per feature/component where possible.
No build pipeline or transpilation is required for v1; plain HTML/CSS/JS is the default
unless a specific need justifies otherwise (and is documented).
All logic MUST be readable by a developer unfamiliar with the codebase within 5 minutes.

**Rationale**: The project is intended to grow incrementally across many versions.
Long-term maintainability and onboarding cost matter more than short-term cleverness.

### V. Incremental Story-Level Feature Growth

New features MUST follow the Lean Storytelling progression in strict order:
1. Basic Story (Target + Problem + Solution) — v1 scope
2. Detailed Story (+ Empathy + Consequences + Benefits) — future
3. Full Story (+ Context + Why) — future
4. Extension Pack (optional elements) — future

No feature from a higher level MAY be implemented before the lower level is complete
and validated. Each level MUST be independently shippable and testable.

**Rationale**: Mirrors the methodology's own incremental structure and keeps scope
controlled at every release.

### VI. Elegant & Focused UI/UX (NON-NEGOTIABLE)

The app MUST look and feel polished, modern, and elegant — not merely functional.
No default browser styles may be left unstyled; every visual element MUST be a deliberate
design decision.

Design MUST be focused: each screen has exactly one primary action, one focal point.
Visual noise, decoration for its own sake, and competing calls-to-action are forbidden.

Typography, spacing, and colour MUST convey quality and calm confidence — consistent with
the professional audience (leaders, managers, product people) the methodology targets.

Transitions and micro-interactions SHOULD be smooth and intentional; they MUST serve
clarity and flow, never distraction.

Elegance and simplicity (Principle I) are complementary, not in conflict. The goal is
refined minimalism: every element present is beautiful; nothing unnecessary is present.

**Rationale**: A coaching tool for professionals signals its own credibility through its
craft. A poorly designed UI undermines trust in the methodology it teaches.

## Technology Constraints

- **Stack**: Vanilla HTML + CSS + JavaScript (no framework required for v1)
- **Dependencies**: Zero runtime dependencies for v1; any future dependency requires
  explicit justification against Principle I
- **Hosting**: Static file hosting compatible (GitHub Pages, Netlify, etc.)
- **Browser support**: Modern evergreen browsers; no IE support required
- **Accessibility**: WCAG 2.1 AA compliance MUST be maintained for all form elements
- **Licensing**: CC BY-SA 4.0 applies to content; code license MUST be declared in repo

## Development Workflow

- Features are specified before implementation using the speckit workflow
  (spec → plan → tasks → implement)
- Each story-building level (see Principle V) is treated as a separate feature increment
- All UI copy changes that affect methodology terminology MUST be reviewed against
  `README.md` before merging
- All visual design decisions MUST be reviewed against Principle VI before merging
- The constitution MUST be reviewed when a new story-building level is started
- Commits MUST be atomic and scoped to a single task; conventional commit format
  (`feat:`, `fix:`, `docs:`, `chore:`) is RECOMMENDED

## Governance

This constitution supersedes all other development practices and informal agreements.
Any amendment requires:
1. A clear description of what changes and why
2. A version bump following semantic versioning (MAJOR / MINOR / PATCH as defined below)
3. An update to this file via the `/speckit.constitution` command

**Versioning policy**:
- MAJOR: Removal or redefinition of a principle; breaking change to methodology fidelity
- MINOR: New principle or section added; materially expanded guidance
- PATCH: Wording clarifications, typo fixes, non-semantic refinements

All pull requests MUST verify compliance with Principles I, II, and VI before merge.
Complexity violations MUST be documented in the plan's Complexity Tracking table.

**Version**: 1.1.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
