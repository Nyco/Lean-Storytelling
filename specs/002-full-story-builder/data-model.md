# Data Model: Full Story Builder — v0.2

**Branch**: `002-full-story-builder` | **Date**: 2026-03-25

---

## Entity: Story (v0.2)

Extends the v0.1 Story object with five new narrative fields and a title. All data is session-scoped and discarded when the tab closes.

### Fields

| Field | Type | Validation | Notes |
|-------|------|-----------|-------|
| `target` | string | trim; may be empty | Basic Story — first field |
| `targetStatus` | `'unsure'` \| `'needs-review'` \| `'confirmed'` \| `null` | null if target is empty | |
| `problem` | string | trim; may be empty | Basic Story — second field |
| `problemStatus` | `'unsure'` \| `'needs-review'` \| `'confirmed'` \| `null` | null if problem is empty | |
| `solution` | string | trim; may be empty | Basic Story — third field |
| `solutionStatus` | `'unsure'` \| `'needs-review'` \| `'confirmed'` \| `null` | null if solution is empty | |
| `empathy` | string | trim; may be empty | Detailed Story — first field |
| `empathyStatus` | `'unsure'` \| `'needs-review'` \| `'confirmed'` \| `null` | null if empathy is empty | |
| `consequences` | string | trim; may be empty | Detailed Story — second field |
| `consequencesStatus` | `'unsure'` \| `'needs-review'` \| `'confirmed'` \| `null` | null if consequences is empty | |
| `benefits` | string | trim; may be empty | Detailed Story — third field |
| `benefitsStatus` | `'unsure'` \| `'needs-review'` \| `'confirmed'` \| `null` | null if benefits is empty | |
| `context` | string | trim; may be empty | Full Story — first field |
| `contextStatus` | `'unsure'` \| `'needs-review'` \| `'confirmed'` \| `null` | null if context is empty | |
| `why` | string | trim; may be empty | Full Story — second field |
| `whyStatus` | `'unsure'` \| `'needs-review'` \| `'confirmed'` \| `null` | null if why is empty | |
| `storyTitle` | string | trim; may be empty | Falls back to random pool default if empty |

### Constraints

- A `*Status` field MUST be `null` when its paired content field is empty (normalisation enforced on save and load).
- Status values MUST be one of the four valid values: `'unsure'`, `'needs-review'`, `'confirmed'`, `null`. Any other value is normalised to `null`.
- `storyTitle` is stored as a plain string. An empty title is valid (triggers placeholder display); it is NOT replaced by a default on empty — defaults are only assigned on first session load when no title exists at all.
- All string fields are trimmed on save and load. Leading/trailing whitespace is never persisted.

### JSON serialisation (sessionStorage)

```json
{
  "target": "...", "targetStatus": "confirmed",
  "problem": "...", "problemStatus": "unsure",
  "solution": "...", "solutionStatus": null,
  "empathy": "...", "empathyStatus": null,
  "consequences": "", "consequencesStatus": null,
  "benefits": "", "benefitsStatus": null,
  "context": "", "contextStatus": null,
  "why": "", "whyStatus": null,
  "storyTitle": "The Resilient Leader's Turning Point"
}
```

### State transitions: *Status fields

```
null  ←────────────────────────────────────────────────────────────
 ↑                                                                  │
 │  content cleared                                                 │
 │                                                                  │
 ↓  content entered                                                 │
"unsure" ─── user selects "needs-review" ──→ "needs-review"        │
   ↑                                              │                  │
   └──────────────────────────────────────────────┘                  │
                                                                     │
"confirmed" ←── user selects "confirmed" ───────────────────────────┘
```

All transitions are user-driven via the status dropdown select element.

---

## Entity: Wave

Represents one of three progressive story-building stages. Not stored in session — derived from the `_currentWave` module variable in `app.js`.

| Property | Type | Values |
|----------|------|--------|
| `id` | string | `'basic'` \| `'detailed'` \| `'full'` |
| `label` | string | `"Basic Story"` \| `"Detailed Story"` \| `"Full Story"` |
| `fields` | string[] | See field mapping below |

### Field mapping per wave

| Wave | Fields (in build order) | Progress bar steps |
|------|------------------------|--------------------|
| `basic` | target, problem, solution | Target, Problem, Solution |
| `detailed` | empathy, consequences, benefits | Empathy, Consequences, Benefits |
| `full` | context, why | Context, Why |

### Right-pane display per wave

| Wave | Preview fields (in display order) |
|------|-----------------------------------|
| `basic` | target → problem → solution |
| `detailed` | target, empathy, problem, consequences, solution, benefits |
| `full` | context, target, empathy, problem, consequences, solution, benefits, why |

---

## Entity: FieldAdvice

Static coaching text associated with a field. Defined inline in HTML. Not stored in session — always rendered fresh on form load.

| Property | Type | Notes |
|----------|------|-------|
| `fieldId` | string | Matches the paired textarea `id` |
| `adviceText` | string | Authored content; rendered as HTML in `<details>` |
| `isOpen` | boolean | Runtime only; reset to `false` on wave switch |

### Lifecycle

- `isOpen` defaults to `false` on page load and on every wave switch.
- Managed natively by the `<details>` `open` attribute — no JS state needed.
- Advice content never enters sessionStorage.

---

## Entity: StoryTitle

| Property | Type | Validation |
|----------|------|-----------|
| `value` | string | Trimmed; empty is valid |
| `isEditing` | boolean | Runtime-only; not persisted |

### Default pool (hardcoded, 10 entries)

Selected randomly on first session load when no saved title exists:

1. "The Resilient Leader's Turning Point"
2. "A Market Waiting for Its Hero"
3. "When Pressure Becomes Clarity"
4. "The Problem No One Named"
5. "Quiet Friction, Loud Consequences"
6. "A Solution Built from Empathy"
7. "The Moment Everything Changed"
8. "Complexity Reduced to One Truth"
9. "The Gap Between Vision and Reality"
10. "Where the Story Begins"

### State transitions

```
Session load, no saved title → random default assigned → display mode
Session load, saved title    → saved value restored    → display mode

display mode  ──click title──→  edit mode (input visible)
edit mode     ──Enter / blur──→  display mode (value committed + saved)
edit mode     ──Escape────────→  display mode (value reverted, no save)
```

---

## Normalisation Rules (enforced in `normaliseStory()`)

1. All string fields: apply `.trim()`.
2. All `*Status` fields: if paired content field is empty after trim, set status to `null`.
3. All `*Status` fields: if value is not in `{null, 'unsure', 'needs-review', 'confirmed'}`, set to `null`.
4. `storyTitle`: trim only. Do not default to pool value — that is an init-time concern, not a normalisation concern.
5. Unknown fields on the parsed JSON object are ignored (forward-compatibility: `Object.assign(createStory(), parsed)`).
