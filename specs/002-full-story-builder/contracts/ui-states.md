# Contract: UI States — Full Story Builder v0.2

**Branch**: `002-full-story-builder` | **Date**: 2026-03-25

---

## Wave Navigation State

### `_currentWave` module variable

| Value | Active form section | Active nav card |
|-------|--------------------|----|
| `'basic'` | `#basic-form` | `.wave-card[data-wave="basic"]` |
| `'detailed'` | `#detailed-form` | `.wave-card[data-wave="detailed"]` |
| `'full'` | `#full-form` | `.wave-card[data-wave="full"]` |

**Initial value**: `'basic'` (set on DOMContentLoaded)

### `setWave(wave)` — side effects (in order)

1. Update `_currentWave = wave`
2. Hide all three `<section>` form containers; show only the active one
3. Remove `wave-card--active` from all cards; add to the clicked card
4. Close all `<details>` elements (set `open = false`) in all form sections
5. Call `populateForm(loadSession())` — populate the now-visible form's fields
6. Call `updateRightPane()` — re-render right pane for new wave context
7. Call `updateWaveProgress()` — sync all three progress bars

### Wave switch: field preservation

- All field values are already in sessionStorage before the switch.
- `populateForm()` reads from sessionStorage, not from the DOM.
- Content is never lost on wave switch.

---

## Form Field States

Each of the 8 fields has two independent sub-states:

### Content state

| State | Condition | DOM signal |
|-------|-----------|-----------|
| `empty` | `textarea.value.trim() === ''` | None (default) |
| `filled` | `textarea.value.trim() !== ''` | — (drives progress bar only) |

### Status state

| Value | Emoji | Display label | Select option value |
|-------|-------|---------------|---------------------|
| none | — | (no status) | `''` (empty string) |
| `unsure` | 🤔 | "Unsure / Assumption" | `'unsure'` |
| `needs-review` | 🔄 | "Needs review" | `'needs-review'` |
| `confirmed` | ✅ | "Confirmed / Validated" | `'confirmed'` |

**Constraint**: Status select resets to `''` (no status) when content is cleared. Enforced in `normaliseStory()` on every save.

---

## Right-Pane Preview State

### Mode driven by `_currentWave`

| Wave | Fields rendered (in order) |
|------|---------------------------|
| `basic` | target, problem, solution |
| `detailed` | target, empathy, problem, consequences, solution, benefits |
| `full` | context, target, empathy, problem, consequences, solution, benefits, why |

### Per-field render logic

```
if field.content is non-empty:
    render <div class="preview-block">
        <h3 class="preview-label">[field title]</h3>
        [if field.status]: <span class="status-badge">[emoji]</span>
        <p class="preview-content">[field.content via textContent]</p>
    </div>
else:
    render <p class="preview-placeholder">—</p>  (subtle placeholder)
```

### All-empty state (entire wave)

When ALL fields for the active wave are empty:
- Replace all individual field blocks with a single `<p class="preview-placeholder-text">`:
  `"Your story will appear here — fill the form on the left to get started."`
- Do NOT render individual empty-field placeholders.

---

## Progress Bar Step States

Each step indicator in a wave card's progress bar:

| State | Content field | Status field | Display |
|-------|--------------|-------------|---------|
| empty | `''` | any → normalized null | Hollow indicator, no emoji, `aria-label="[Field]: empty"` |
| filled-no-status | non-empty | null | Filled indicator, `✓` symbol, `aria-label="[Field]: filled"` |
| filled-unsure | non-empty | `'unsure'` | Filled indicator, `🤔`, `aria-label="[Field]: filled, unsure"` |
| filled-needs-review | non-empty | `'needs-review'` | Filled indicator, `🔄`, `aria-label="[Field]: filled, needs review"` |
| filled-confirmed | non-empty | `'confirmed'` | Filled indicator, `✅`, `aria-label="[Field]: filled, confirmed"` |

**WCAG 2.1 AA requirement**: State MUST NOT be communicated by color alone. Each state additionally uses: aria-label (text), emoji or symbol (icon), and shape (filled vs hollow circle/dot).

### `updateWaveProgress()` — updates all three cards simultaneously

Called after every:
- `input` event on any textarea
- `change` event on any status select
- `setWave()` call
- Page load

---

## Story Title States

| State | Condition | DOM rendering |
|-------|-----------|--------------|
| `display` | Not editing | `<h2 id="story-title">` visible; `<input id="story-title-input">` hidden |
| `editing` | User clicked title | `<h2>` hidden or inactive; `<input>` visible and focused |
| `empty-display` | `storyTitle === ''` | `<h2>` shows placeholder text via CSS `::before` or `data-placeholder`; styled as hint |

### State transitions

| From | Event | To | Side effects |
|------|-------|----|-------------|
| `display` | click on `<h2>` | `editing` | Show input, focus, select-all |
| `editing` | `Enter` keydown | `display` | Commit value; `saveSession()`; hide input; update `<h2>` text |
| `editing` | `blur` | `display` | Commit value; `saveSession()`; hide input; update `<h2>` text |
| `editing` | `Escape` keydown | `display` | Revert to previous value; hide input; no save |

### Empty title display

If `storyTitle === ''` after commit: `<h2>` shows a styled placeholder (e.g., `"Give your story a title…"`) via CSS pseudo-element — this placeholder text is NOT saved to session.

---

## Advice Toggle State

Managed entirely by the HTML `<details>` element's `open` attribute. No JS state.

| State | `<details open>` | Visible to user |
|-------|-----------------|----------------|
| collapsed (default) | absent | Summary line only |
| expanded | present | Summary + advice body |

**Reset on wave switch**: All `<details>` in the incoming form are set `open = false` before populating fields. Each field's advice state is independent.

---

## Storage Notice State

Inherited from v0.1. If `sessionStorage` is unavailable:
- `_memoryFallback` is set
- `#storage-notice` is un-hidden
- All save/load operations use the in-memory object
- Story data is lost on page reload (user is warned)
