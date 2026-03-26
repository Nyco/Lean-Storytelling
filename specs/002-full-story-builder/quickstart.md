# Quickstart & Integration Scenarios: Full Story Builder v0.2

**Branch**: `002-full-story-builder` | **Date**: 2026-03-25

---

## How to run the app

No build step. Open `index.html` in any modern evergreen browser — or serve with any static file server:

```bash
# Python (built-in)
python3 -m http.server 8080

# Node (if npx available)
npx serve .
```

Then open `http://localhost:8080`.

---

## Manual Acceptance Testing Scenarios

These scenarios map directly to the spec's acceptance criteria. Run them in order after each implementation phase to verify correctness.

---

### Scenario 1: Wave navigation — all three cards active (FR-001, FR-002, US1)

1. Open the app.
2. Verify: three wave cards are visible — "Basic Story", "Detailed Story", "Full Story". No "Wave N" label on any card.
3. Verify: all three cards are clickable (not greyed out, no `pointer-events: none`).
4. Click "Detailed Story" → left pane shows three fields: Empathy, Consequences, Benefits.
5. Click "Full Story" → left pane shows two fields: Context, Why.
6. Click "Basic Story" → left pane shows three fields: Target, Problem, Solution.
7. Verify: the active card is visually highlighted (distinct border/background from the others).

**Pass criteria**: All six steps complete without error; active card is visually obvious.

---

### Scenario 2: Content preserved across wave switches (FR-003, US1)

1. On Basic Story, type "Product Manager" in Target.
2. Switch to Detailed Story → type "Cannot prioritise" in Empathy.
3. Switch to Full Story → type "Digital disruption" in Context.
4. Switch back to Basic Story → Target still shows "Product Manager".
5. Switch back to Detailed Story → Empathy still shows "Cannot prioritise".
6. Switch back to Full Story → Context still shows "Digital disruption".

**Pass criteria**: All content survives all six wave switches.

---

### Scenario 3: Real-time right-pane preview (FR-016, FR-017, US2)

**Basic wave**:
1. On Basic Story, type a character in Target.
2. Verify: right pane Target block updates immediately (no button press).
3. Verify: right pane shows only Target, Problem, Solution (not Empathy or Context).

**Detailed wave**:
4. Switch to Detailed Story, type in Empathy.
5. Verify: right pane shows six blocks: Target, Empathy, Problem, Consequences, Solution, Benefits.
6. Verify: previously typed Target content appears in the Target block.

**Full wave**:
7. Switch to Full Story, type in Context.
8. Verify: right pane shows all eight fields in order: Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why.

**Pass criteria**: All updates are immediate; field set changes on wave switch.

---

### Scenario 4: All-empty placeholder (FR-017, US2)

1. Clear all fields (reload or use a fresh session).
2. On Basic Story, verify: right pane shows a single placeholder message ("Your story will appear here…"), not three empty blocks.
3. Switch to Detailed Story with all fields empty → same single placeholder message.
4. Type one character in Empathy → individual field blocks appear.

**Pass criteria**: Single placeholder when all-empty; individual blocks when any field is filled.

---

### Scenario 5: No submit button (FR-004, US2)

1. Open the app.
2. Verify: no "View my story" button visible anywhere on the page.
3. Verify: no "Cancel" button visible.
4. Verify: typing in a field immediately appears in the right pane without pressing any button.

**Pass criteria**: Form-to-story workflow requires zero button presses.

---

### Scenario 6: Unified field template — foldable advice (FR-005, FR-006, US5)

1. Open Basic Story.
2. Verify: for each of Target, Problem, Solution: title is visible, explainer text is visible, advice section is collapsed.
3. Click the advice toggle on Target → advice text expands (FR-008 content).
4. Click the toggle again → advice collapses.
5. Verify: Target textarea content is unchanged before and after.
6. Switch to Detailed Story → verify: all three advice sections are collapsed (reset on wave switch).

**Pass criteria**: Advice is collapsed by default; toggle works; reset on wave switch.

---

### Scenario 7: Status dropdown with emojis (FR-007, US1/US7)

1. On any field, open the status dropdown.
2. Verify options: no status, 🤔 Unsure / Assumption, 🔄 Needs review, ✅ Confirmed / Validated.
3. Select "🤔 Unsure / Assumption" → right pane shows 🤔 badge next to the field block.
4. Select "✅ Confirmed / Validated" → right pane badge updates to ✅.
5. Clear the textarea → status selector resets to no-status automatically (normalisation).

**Pass criteria**: All four options present; badge appears in right pane; auto-reset on content clear.

---

### Scenario 8: Progress bar step indicators (FR-019, FR-020, FR-021, US7)

1. Open Basic Story with all fields empty.
2. Verify: Basic Story card progress bar shows three hollow/empty indicators.
3. Type in Target → Target step immediately shows filled state (e.g., ✓ or filled dot).
4. Set Target status to ✅ → Target step shows ✅ emoji.
5. Clear Target → step returns to empty state; emoji removed.
6. Switch to Detailed Story → verify its three step indicators are correctly tied to Empathy/Consequences/Benefits.

**WCAG check**: Inspect each step indicator — state must be conveyed by aria-label (text), not color alone.

**Pass criteria**: All steps update live; emoji appears with status; empty clears indicator; aria-labels present.

---

### Scenario 9: Story title widget (FR-022–FR-025, US6)

1. Open the app for the first time in a session (or clear sessionStorage).
2. Verify: a non-empty default title appears below the page heading (e.g., "The Resilient Leader's Turning Point").
3. Click the title → it becomes an editable input.
4. Type a custom title → press Enter → title displays as styled heading, input hidden.
5. Switch waves → title remains visible and unchanged.
6. Reload the page (same tab/session) → custom title is restored.
7. Click title again → clear it entirely → blur → verify: placeholder hint appears (not stored as title).

**Pass criteria**: Default assigned; edit/commit works; persists through wave switches and reload.

---

### Scenario 10: Session persistence across reload (FR-028, US1-US4)

1. Fill fields across all three waves: type in Target, Empathy, Context.
2. Reload the page (F5 or Ctrl+R).
3. Verify: Target, Empathy, Context values are all restored from sessionStorage.
4. Open a new tab → verify: all fields are empty (session-only, not shared across tabs).
5. Close the tab → open a new tab to the same URL → verify: all fields are empty.

**Pass criteria**: Data persists within session; does not persist across sessions or tabs.

---

### Scenario 11: Typography and font rendering

1. Open the app and wait for fonts to load.
2. Verify: the page title uses Playfair Display (serif).
3. Verify: the story title uses Playfair Display (serif, slightly smaller).
4. Verify: field labels, explainer text, and form UI use DM Sans (sans-serif).
5. Open browser DevTools → Network → verify no requests to `fonts.googleapis.com` or `fonts.gstatic.com`.
6. Verify: fonts are served from `/fonts/*.woff2`.

**Pass criteria**: Self-hosted fonts load; no external CDN calls; visual hierarchy is clear.

---

### Scenario 12: WCAG 2.1 AA — accessibility audit

Run with axe DevTools or Lighthouse accessibility audit:

- All form inputs have associated `<label>` elements.
- All status selects have `aria-label` or associated `<label>`.
- All progress step indicators have `aria-label` describing field and state.
- Color contrast ≥ 4.5:1 for all text.
- All interactive elements are keyboard-focusable (Tab order logical).
- Advice `<details>`/`<summary>` is keyboard-operable (Enter/Space).
- Story title edit mode: input receives focus automatically; Escape reverts.

**Pass criteria**: Zero critical or serious WCAG violations in automated scan; keyboard navigation complete without mouse.
