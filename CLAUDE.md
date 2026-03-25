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

## Recent Changes
- 001-basic-story-form: Added HTML5, CSS3, JavaScript ES2020 (no transpilation, no bundler) + None — zero runtime dependencies
