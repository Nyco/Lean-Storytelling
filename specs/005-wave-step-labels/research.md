# Research: Wave Card Step Indicator Redesign

**Feature**: 005-wave-step-labels
**Date**: 2026-03-27
**Status**: Complete — no unknowns

---

## Decision: Active card border fix

**Decision**: Remove the `border-top: 3px solid var(--color-blue-600)` override from `.wave-card--active` in `style.css`. Use a uniform `border: 1.5px solid var(--color-blue-500)` instead. Visual distinction from inactive cards is maintained via the blue border colour and the `var(--color-blue-50)` background.

**Rationale**: The 3px top border was added to signal the active state visually. However, uniform border thickness with blue colour is already sufficient — and is cleaner per Principle VI (no unnecessary visual weight).

**Alternatives considered**:
- Keep 3px top as a deliberate accent: Valid design pattern, but the user explicitly flagged it as "weird". Rejected.
- Use a coloured left border instead: Common in sidebar nav patterns, but the card is already styled with full border and background — adding a left accent would introduce competing visual signals.

---

## Decision: Step indicator HTML structure

**Decision**: Replace each flat `.wave-step` span with a three-child structure:
```html
<span class="wave-step" data-wave="..." data-field="..." aria-label="...">
  <span class="wave-step__check" aria-hidden="true"></span>
  <span class="wave-step__status" aria-hidden="true"></span>
  <span class="wave-step__label">FieldName</span>
</span>
```
The outer `.wave-step` becomes a flex row (aligns items centre). The field name is static HTML; the check and status are updated by JS.

**Rationale**: Each element is independently addressable by JS and CSS. The status emoji no longer shares a slot with the checkbox indicator. The field name is plain text, readable without JS.

**Alternatives considered**:
- Data attributes + CSS `content`: Using `::before`/`::after` pseudo-elements populated via CSS `attr()` for the label — simpler HTML but `attr()` for content is poorly supported and prevents styling the label independently. Rejected.
- Pure JS rendering: Build the inner structure entirely in `updateWaveProgress()` — more complex JS, harder to inspect static HTML. Rejected.

---

## Decision: Wave progress layout direction

**Decision**: Change `.wave-progress` from `flex-direction: row` (dots in a horizontal line) to `flex-direction: column` (one step row per field). Each step row is `[checkbox] [status slot] [label]` left-to-right.

**Rationale**: With a label added, a horizontal row of (check + status + label) × 3 fields would be very wide and likely overflow or compress the card. A vertical column of labelled rows is readable at any card width and maps naturally to a checklist — which is exactly what this represents.

**Alternatives considered**:
- Keep horizontal, abbreviate labels: "Tgt", "Prb", "Sol" — too cryptic, defeats the purpose. Rejected.
- Inline layout (check + name + status all on one horizontal card-spanning row): Would require the wave card to expand to full width or wrap. The vertical column fits neatly inside the existing card width. Rejected.

---

## Decision: JS update strategy for sub-elements

**Decision**: In `updateWaveProgress()`, after locating the outer `.wave-step`, use `querySelector` to find `.wave-step__check` and `.wave-step__status` within it. Update only those children — do NOT set `textContent` on the outer `.wave-step` (which would destroy the child structure).

The `.wave-step--filled` class is toggled on the **outer** `.wave-step` so that CSS can target `.wave-step--filled .wave-step__check` to apply the filled styles.

**Rationale**: Minimal change to the existing update logic. The aria-label on the outer element is still updated as before. Only two new lines: `querySelector` for the two sub-elements, and separate `textContent` assignments.

**Alternatives considered**:
- Toggle class on `.wave-step__check` directly: Slightly simpler CSS selectors (`.wave-step__check--filled`) but requires the outer element to be re-queried for the aria-label anyway. No real gain. Rejected in favour of consistent existing pattern.

---

## No unknowns remain

All decisions derive from existing code patterns and the current CSS token system. No new dependencies or architectural changes required.
