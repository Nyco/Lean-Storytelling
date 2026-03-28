# Fixes and feedback from v0.3 implementation

Add these changes to the branch 003-v03-public-app

## Top bar / Banner

Focus on app name:

Remove the text "Story Builder — Build your story — one element at a time." from this top bar, as we must separate the app "Lean Storytelling" as a whole, from one of its feature "Story Builder"

Clarify and simplify signup/login:

When the user is anonymous/unidentified/unauthenticated:
The buttons "Log in" and "Sign up" must be replaced by "Magic Login or Signup" with sub-label "Send me link by email" in the button, aligned right end

Action menu for identified/authenticated users:

When the user is identified/authenticated:
The magic link button is replaced by an round dummy avatar menu, with a drop-down menu that shows "Profile", "Billing" "Log out" items (which are fake and inactive), aligned right end

Unnecessary bar, screen estate on the top bar:

Remove the bar that contains the message "Nothing is saved." and the button "Sign up to save your stories and manage versions", when the user is anonymous/unidentified/unauthenticated, and warn user on the top bar at the left of the magic link button that shows "Login to save your work!" with a subtle warning emoji

## Story Builder bar

Dive into the "Story Builder" feature of the "Lean Storytelling" app:

Add a bar "Story Builder" below the top bar / banner, with a sub-title "Shape your narrative step by step."

## Information hierachy

App > Feature > Object name:

The hierarchy must be clarified: Lean Storytelling > Story Builder > Story title
So, the font size and focus must be gradual

## Story title widget

Avoid user guessing:

It is not clear whether the Story title is editable, make it more obvious with a subtule frame about it, with slight change when hovering, add a small and subtle crayon emoji on its leftzdf


Always show the "Save" button on right side of the title:

- When is the Story is still incomplete (one or more field are still empty), show "Save" button as inactive
- When Story complete (all fields no-empty)
    - if user is anonymous/unidentified/unauthenticated, then show "Save" button as inactive
    - if user is identified/authenticated, then make "Save" button active


## Wave cards

Selected wave card:

The blue focus is clear, but the top of the selected cards is thicker, which is werid: make it the same thickness as left, rioght, and bottom

Add names to checkboxes:

The checkbox-based progression is quite clear, but the user does not know what a iven checkbox is about: giving the name of the story element is necessary:
- Basic Story: [] Target > [] Problem > [] Solution
- Detailed Story: [] Empathy > [] Consequences > [] Benefits
- Full Story: [] Context > [] Why

Detach checkbox from status:

Overlapping the filled/empty toggle with the status emoji is weird, as a user can't distinguish, even more when green status on green filled, so split the checkbox first, then a placeholder for the status, and then the name

## Left and right panes

Panes titles:

Both pane must have their title, still for clear and unambiguous information hierarchy:
- left pane is "Craft"
- right pane is "View"

Panes fonts:

- Use the current "Your Story" formatting form the right pane, for the pane title
- Use the current right pane formatting for Story element (context, target, empathy, problem, etc.) for both panes
- The "Advice" must not be in italic, as the moving arrow is rendered weirdly
- Remove the status emojis in the right pane, because the user already has that info on the left, and this prevent an emoji-less copy-paste (some users just hate emojis)
