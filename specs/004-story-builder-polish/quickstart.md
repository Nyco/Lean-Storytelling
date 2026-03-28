# Quickstart: Story Builder UI Polish

Manual test scenarios for validating the feature end-to-end.

---

## Scenario 1: Anonymous user top bar and save button

**Setup**: Open the app, not logged in.

**Steps**:
1. Observe the top bar.
2. Confirm: "Lean Storytelling" on the left, no subtitle.
3. Confirm: single "Magic Login or Signup" button on the right (no "Log in" / "Sign up" pair).
4. Observe the Story Builder bar below the top bar.
5. Confirm: Save button is visually greyed out.
6. Click the greyed Save button.
7. Confirm: nothing happens — no error, no redirect, no toast.

---

## Scenario 2: Authenticated user top bar and save

**Setup**: Log in via magic link.

**Steps**:
1. Observe the top bar.
2. Confirm: "Lean Storytelling" on the left, "Profile" menu on the right (no "Log in" / "Sign up").
3. Open a story.
4. Confirm: Save button is greyed (no changes yet).
5. Edit any field.
6. Confirm: Save button becomes active (not greyed).
7. Click Save.
8. Confirm: story is saved to server (can reload page and content persists).
9. Confirm: Save button returns to greyed state after successful save.

---

## Scenario 3: Story Builder bar layout

**Setup**: Load any story (logged in or anonymous).

**Steps**:
1. Observe the area below the top bar.
2. Confirm: "Story Builder" heading on line 1.
3. Confirm: story title (editable) on left of line 2, Save button on right.
4. Confirm: wave cards displayed on line 3 (full width).
5. Confirm: no separate "save banner" visible anywhere.

---

## Scenario 4: Story title inline editing

**Setup**: Load a story.

**Steps**:
1. Observe the story title in the Story Builder bar.
2. Click the title.
3. Confirm: title becomes an editable text input.
4. Type a new title.
5. Click outside the field.
6. Confirm: new title is saved.
7. Clear the title and click outside.
8. Confirm: title reverts to previous non-empty value.

---

## Scenario 5: Wave completion indicators

**Setup**: Load a story with all empty fields.

**Steps**:
1. Confirm: all 3 wave cards show as incomplete (no checkmark/completion indicator).
2. Fill all 3 fields in Wave 1 (Target, Problem, Solution).
3. Confirm: Wave 1 card shows as complete (checkmark or visual indicator appears in card header).
4. Confirm: Wave 2 and Wave 3 still show as incomplete.
5. Fill 2 of 3 fields in Wave 2.
6. Confirm: Wave 2 still shows as incomplete.
7. Fill the remaining Wave 2 field.
8. Confirm: Wave 2 now shows as complete.
9. Fill both fields in Wave 3.
10. Confirm: all 3 cards show as complete.

---

## Scenario 6: Pane labels

**Setup**: Open the Story Builder (two-pane layout visible).

**Steps**:
1. Confirm: left pane shows a "Craft" label/header.
2. Confirm: right pane shows a "View" label/header.
