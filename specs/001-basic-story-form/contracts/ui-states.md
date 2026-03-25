# Contract: UI View State Machine

**Branch**: `001-basic-story-form` | **Date**: 2026-03-24
**Scope**: All view states the app can be in, valid transitions, and what each state renders

---

## States

| State ID | Name | Description |
|----------|------|-------------|
| `FORM_EMPTY` | Form — empty | App just opened, all fields blank, no session data |
| `FORM_PARTIAL` | Form — partial | One or two fields filled; user is composing |
| `FORM_COMPLETE` | Form — complete | All three fields filled |
| `FORM_EDIT` | Form — edit mode | Form re-opened from story view; fields pre-filled |
| `STORY_VIEW` | Story view | Assembled story, consistency observations, coaching prompts displayed |

---

## Transition Table

| From | Event | Guard | To |
|------|-------|-------|----|
| `FORM_EMPTY` | User types in any field | — | `FORM_PARTIAL` |
| `FORM_PARTIAL` | User fills remaining fields | All 3 non-empty | `FORM_COMPLETE` |
| `FORM_COMPLETE` | User clears a field | At least 1 empty | `FORM_PARTIAL` |
| `FORM_PARTIAL` | User clears all fields | All 3 empty | `FORM_EMPTY` |
| `FORM_EMPTY` | User submits | All fields empty | `FORM_EMPTY` + show prompt ("fill at least one field") |
| `FORM_PARTIAL` | User submits | ≥1 field non-empty | `STORY_VIEW` |
| `FORM_COMPLETE` | User submits | — | `STORY_VIEW` |
| `FORM_EDIT` | User submits | ≥1 field non-empty | `STORY_VIEW` |
| `FORM_EDIT` | User cancels | — | `STORY_VIEW` (previous story unchanged) |
| `STORY_VIEW` | User activates Edit | — | `FORM_EDIT` (form pre-filled) |

---

## What Each State Renders

### `FORM_EMPTY` / `FORM_PARTIAL` / `FORM_COMPLETE`
- Three labelled textareas: Target, Problem, Solution
- Coaching hint under each label
- Status selector per field (null / unsure / needs-review / confirmed)
- Submit button (enabled always; empty-state guard fires on submit, not on button)
- If all-empty submission attempted: non-blocking inline prompt above form

### `FORM_EDIT`
- Same as form states above
- Fields pre-filled with current session values
- Status selectors pre-set to current session statuses
- Cancel button visible (returns to `STORY_VIEW` without saving)
- Submit button label: "Update story" (instead of "View my story")

### `STORY_VIEW`
- Assembled story narrative: filled fields in order (Target → Problem → Solution)
- Empty fields shown as placeholder indicators (e.g., "— not yet filled —")
- Status badge alongside each field's content (omitted if status is null)
- Consistency observations section (Target↔Problem + Problem↔Solution)
- Coaching questions section (≥1 prompt per filled field)
- Edit button (returns to `FORM_EDIT`)

---

## Visual Focus Rule (Constitution Principle VI)

Each state has exactly one primary action:

| State | Primary Action |
|-------|---------------|
| `FORM_*` | Submit / "View my story" button |
| `FORM_EDIT` | Submit / "Update story" button |
| `STORY_VIEW` | Edit button |

No competing calls-to-action are permitted on any single view.

---

## Empty-State Guard Detail

Triggered when: user activates submit and all three field contents are `""` after trimming.

Behaviour:
- Do **not** navigate to `STORY_VIEW`
- Display a single non-blocking inline message above the form (e.g., *"Fill at least one field to build your story."*)
- Message rendered via `aria-live="polite"` region for screen readers
- Message dismissed automatically when user starts typing in any field
