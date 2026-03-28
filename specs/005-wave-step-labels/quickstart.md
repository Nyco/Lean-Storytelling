# Quickstart: Wave Card Step Indicator Redesign

Manual test scenarios for validating the feature end-to-end.

---

## Scenario 1: Uniform active card border

**Setup**: Open the Story Builder (any story, any auth state).

**Steps**:
1. Look at the three wave cards in the Story Builder bar.
2. Observe the active wave card (highlighted in blue — "Basic Story" is active by default).
3. Measure or visually compare the top, right, bottom, and left borders of the active card.
4. Confirm: all four borders appear the same thickness.
5. Click "Detailed Story" to make it the active card.
6. Confirm: the new active card also has uniform border thickness.
7. Confirm: the active card remains visually distinct from inactive cards (blue colour vs grey).

---

## Scenario 2: Step indicators show field names

**Setup**: Open the Story Builder.

**Steps**:
1. Look at the wave progress area inside the "Basic Story" card.
2. Confirm: three rows are visible, labelled "Target", "Problem", "Solution" (in that order).
3. Look at the "Detailed Story" card.
4. Confirm: three rows labelled "Empathy", "Consequences", "Benefits".
5. Look at the "Full Story" card.
6. Confirm: two rows labelled "Context", "Why".

---

## Scenario 3: Checkbox fills independently of status

**Setup**: Open the Story Builder. All fields empty. No status set.

**Steps**:
1. Confirm: all steps show an empty (unfilled) checkbox circle.
2. Fill the "Target" field with any text.
3. Confirm: the "Target" checkbox in the Basic Story card is now filled (coloured).
4. Confirm: the "Problem" and "Solution" checkboxes remain empty.
5. Clear the "Target" field.
6. Confirm: the "Target" checkbox returns to empty state.

---

## Scenario 4: Status emoji in its own slot

**Setup**: Open the Story Builder. Fill the "Target" field with text. Set the Target status dropdown to "Confirmed / Validated" (✅).

**Steps**:
1. Look at the "Target" step in the Basic Story card.
2. Confirm: the checkbox circle is filled (green).
3. Confirm: the ✅ emoji appears in a separate slot to the right of the checkbox.
4. Confirm: the "Target" label is visible to the right of the emoji slot.
5. Confirm: the checkbox and emoji are visually distinct — they do not overlap or merge.
6. Change the status to "Unsure / Assumption" (🤔).
7. Confirm: the emoji slot now shows 🤔 and the checkbox remains filled.
8. Remove the status (select "— No status").
9. Confirm: the status slot is empty but the checkbox remains filled.

---

## Scenario 5: All three elements update in real time

**Setup**: Open the Story Builder. All fields empty.

**Steps**:
1. Start typing in the "Problem" field.
2. Confirm: the "Problem" checkbox fills immediately as text appears (without page reload).
3. Set the "Problem" status to "Needs review" (🔄).
4. Confirm: the 🔄 emoji appears in the "Problem" status slot immediately.
5. Clear the "Problem" field entirely.
6. Confirm: the checkbox empties and the status slot clears immediately.

---

## Scenario 6: Layout consistency across wave cards

**Setup**: Open the Story Builder.

**Steps**:
1. Compare the step indicator layout across Basic Story (3 steps), Detailed Story (3 steps), and Full Story (2 steps).
2. Confirm: all step rows are vertically aligned (checkbox column, status column, label column all line up).
3. Confirm: no step label is truncated or overflows the wave card boundaries.
4. Confirm: the status slot in each row occupies the same horizontal width whether empty or showing an emoji (no layout shift when emoji appears or disappears).
