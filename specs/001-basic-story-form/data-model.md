# Data Model: Basic Story Form

**Branch**: `001-basic-story-form` | **Date**: 2026-03-24
**Phase**: 1 — Entities, validation rules, state transitions

---

## Entities

### Story

The single in-session data structure representing the user's Basic Story.

| Field | Type | Constraints |
|-------|------|-------------|
| `target` | `string` | Trimmed; empty string `""` if not filled; max display length unconstrained but UI must remain readable |
| `targetStatus` | `FieldStatus \| null` | null = no status set |
| `problem` | `string` | Same as `target` |
| `problemStatus` | `FieldStatus \| null` | null = no status set |
| `solution` | `string` | Same as `target` |
| `solutionStatus` | `FieldStatus \| null` | null = no status set |

**Validation rules**:
- A field containing only whitespace MUST be normalised to `""` before storage (FR edge case)
- A field with `status != null` but `content == ""` MUST have its status reset to `null` (edge case: status without content is meaningless)
- The Story is considered "empty" if all three content fields are `""`
- The Story is considered "partial" if 1 or 2 content fields are non-empty
- The Story is considered "complete" if all 3 content fields are non-empty

---

### FieldStatus

An enum of confidence levels. Stored as a string literal in sessionStorage.

| Value | Display Label | Meaning |
|-------|--------------|---------|
| `"unsure"` | Unsure / Assumption / Hypothesis | Content is a guess or untested idea |
| `"needs-review"` | Needs review / Iteration | Content exists but needs work |
| `"confirmed"` | Confirmed / Validated | Content has been tested or agreed upon |
| `null` | *(no badge)* | Status not set; field appears without a status indicator |

---

### CoachingPrompt

A single curated prompt surfaced in the coaching section after story submission.

| Field | Type | Notes |
|-------|------|-------|
| `text` | `string` | The open-ended question or suggestion; must not be yes/no answerable |
| `fieldKey` | `"target" \| "problem" \| "solution"` | Which story field this prompt belongs to |
| `weightedFor` | `FieldStatus[] \| null` | Status values for which this prompt is preferred; null = default/any |

Prompts are never stored in sessionStorage — they are computed fresh on each story submission
from the static `PROMPTS` object in `prompts.js`.

---

### ConsistencyObservation

A structured observation about the relationship between two adjacent story fields.

| Field | Type | Notes |
|-------|------|-------|
| `pair` | `"target-problem" \| "problem-solution"` | Which field pair is being evaluated |
| `type` | `"connected" \| "disconnect" \| "too-short" \| "incomplete"` | Observation result |
| `message` | `string` | Human-readable observation surfaced in the story view |

`type: "incomplete"` is used when one or both fields in a pair are empty — the system cannot
evaluate and must not generate false observations (FR-007, acceptance scenario 4 of US3).

Observations are never stored — computed fresh on each story submission.

---

## Session State Schema

The full session payload serialised to `sessionStorage` under key `leanstory_session`:

```json
{
  "target": "string",
  "targetStatus": "unsure | needs-review | confirmed | null",
  "problem": "string",
  "problemStatus": "unsure | needs-review | confirmed | null",
  "solution": "string",
  "solutionStatus": "unsure | needs-review | confirmed | null"
}
```

**Lifecycle**:
1. **Initialise**: on app load, read `leanstory_session` from sessionStorage; if absent, use default empty Story
2. **Write**: on every form submission, serialise current Story and write to sessionStorage
3. **Read**: on edit activation, deserialise from sessionStorage and pre-fill form fields
4. **Discard**: automatically on tab/window close (sessionStorage semantics); no explicit clear needed

See `contracts/session-state.md` for the full storage contract.

---

## State Transitions

### View States

```
[FORM VIEW] --submit--> [STORY VIEW]
[STORY VIEW] --edit--> [FORM VIEW]  (pre-filled)
[FORM VIEW] --cancel (from edit)--> [STORY VIEW]  (unchanged)
```

### Field Fill States

```
EMPTY --user types--> PARTIAL
PARTIAL --clears all--> EMPTY
PARTIAL --fills remaining--> COMPLETE
COMPLETE --clears one--> PARTIAL
```

### Field Status States

```
null --user selects status--> unsure | needs-review | confirmed
unsure | needs-review | confirmed --user changes--> (any other status)
any status --field content cleared--> null  (auto-reset)
```
