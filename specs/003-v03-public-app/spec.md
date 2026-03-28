# Feature Specification: Lean Storytelling v0.3 — Public Web App

**Feature Branch**: `003-v03-public-app`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Lean Storytelling v0.3: migrate to public web app with auth, accounts, and stories management"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — App is publicly accessible and deployable (Priority: P1)

A developer or owner can deploy the app on a Linux VPS or a local machine (Ubuntu or macOS) using a single command, and reach it via a public URL over HTTPS.

**Why this priority**: All other features require a running, accessible app. This is the foundation everything else builds on.

**Independent Test**: Run the single deploy command on a fresh Ubuntu or macOS machine — the Story Builder loads in a browser and is usable.

**Acceptance Scenarios**:

1. **Given** a fresh machine with Docker installed, **When** the single deploy command is run from the project root, **Then** the app is accessible at a local URL within 60 seconds.
2. **Given** a VPS with Docker installed, **When** the documented deployment procedure is followed, **Then** the app is accessible via a public HTTPS URL.
3. **Given** the app is running, **When** the browser loads it with no connection to external services, **Then** all app features function correctly (no external CDN dependencies at runtime).
4. **Given** a new deployment, **When** the documentation is followed by a beginner, **Then** local setup, VPS deployment, and DB backup/restore procedures are all covered.

---

### User Story 2 — Anonymous user builds a story (Priority: P2)

A visitor who has not created an account can open the app and immediately start building a story using all three waves of the Story Builder. Their work is stored for the duration of their session.

**Why this priority**: Preserving the existing anonymous experience ensures no regression from v0.2 and lets users get value before committing to an account.

**Independent Test**: Open the app without logging in — all three waves are accessible, the save-nudge banner is visible, and story content survives page refreshes within the same session.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the app, **When** they start filling story fields, **Then** their input is retained for the duration of the browser session without requiring an account.
2. **Given** an anonymous user has content in the Story Builder, **When** they close and reopen the tab, **Then** their content is gone (session-only, expected and acceptable).
3. **Given** an anonymous user is in the Story Builder, **When** the page loads, **Then** a non-blocking banner reads: "Nothing is saved. Create an account to save your stories and manage versions." with a "Sign up" CTA.
4. **Given** an anonymous user, **When** they look at the top bar, **Then** "Log in" and "Sign up" buttons are always visible.

---

### User Story 3 — User creates an account and logs in via magic link (Priority: P3)

A visitor enters their email address, receives a one-time login link, clicks it, and is logged into the app. If no account exists for that email, it is created automatically.

**Why this priority**: Authentication unlocks all persistent features. No auth means no value from P4 onwards.

**Independent Test**: Enter an email, receive a link, click it — land in the app as a logged-in user with a session.

**Acceptance Scenarios**:

1. **Given** a visitor clicks "Sign up" or "Log in", **When** they enter a valid email and submit, **Then** they see "Check your inbox. The link expires in 15 minutes." and receive an email with a login link.
2. **Given** a user clicks the magic link within 15 minutes, **When** the link is valid and unused, **Then** they are logged in and redirected to the app.
3. **Given** a user clicks an expired magic link (>15 min old), **When** they land on the page, **Then** they see "This link has expired." and a "Send a new link" button.
4. **Given** a user clicks an already-used magic link, **When** they land on the page, **Then** they see "This link has already been used." and a "Send a new link" button.
5. **Given** an email cannot be delivered, **When** the user submits their email, **Then** they see "We couldn't send the email. Please try again." with a retry button.
6. **Given** a user requests more than 5 magic links within one hour, **When** they attempt another request, **Then** they see "Too many attempts. Please wait before requesting a new link."
7. **Given** a logged-in user clicks "Log out", **When** they confirm, **Then** their session ends and they are returned to the home screen as an anonymous user.

---

### User Story 4 — Anonymous story is saved on sign-up or login (Priority: P4)

When an anonymous user completes the magic link login flow while having story content in their session, that content is automatically saved to their account. Nothing is lost at the conversion moment.

**Why this priority**: Bridges the anonymous and authenticated experiences. Losing work at sign-up would be a serious trust and conversion issue.

**Independent Test**: Fill story fields as anonymous, complete sign-up — the content appears as a saved Story in the account with no extra steps.

**Acceptance Scenarios**:

1. **Given** an anonymous user has content in the Story Builder, **When** they complete a first-time login (new account), **Then** their content is saved as Story 1, version 1, with the default title "My first story" (editable by the user).
2. **Given** an anonymous user has content, **When** they log in to an existing account, **Then** their content is saved as a new Story (without overwriting existing stories), version 1, with the default title "Imported story" (editable).
3. **Given** an anonymous user has an empty Story Builder, **When** they log in, **Then** no new Story is created.
4. **Given** migration completes successfully, **When** the user is in the app, **Then** their session storage is cleared and the Stories sidebar is visible.

---

### User Story 5 — Authenticated user creates and manages stories with versioning (Priority: P5)

A logged-in user can create multiple named stories, have their work auto-saved continuously, create and manage multiple versions of each story, fork any version into a new story, and delete stories or versions.

**Why this priority**: This is the core new functional value of v0.3 for authenticated users — the primary reason to have an account.

**Independent Test**: Log in, create a story, fill fields, observe auto-save, create a new version, fork a version, delete a version — all operations complete with no data loss.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they click "+ New Story", **Then** they are prompted for a story title, and an empty Story Builder opens with that story active.
2. **Given** a logged-in user editing a story, **When** they change any field, **Then** the change is auto-saved within 3 seconds, confirmed by a "Saved" indicator.
3. **Given** a logged-in user who loses network connectivity, **When** they continue editing, **Then** changes are queued locally and synced automatically when connection is restored, with no manual action required.
4. **Given** a logged-in user, **When** they open the Stories sidebar, **Then** they see a collapsible tree listing their stories, each expandable to show versions with timestamps.
5. **Given** a logged-in user viewing a story, **When** they click "+ New version", **Then** a copy of the latest version is created as version +1 and opened in the Story Builder.
6. **Given** a logged-in user viewing any version, **When** they click "Fork", **Then** a new Story is created with version 1 copied from that version and opened in the Story Builder.
7. **Given** a logged-in user viewing a non-latest version, **When** they open it, **Then** the Story Builder is read-only with a visible banner: "You are viewing an older version. Fork it to edit."
8. **Given** a logged-in user deleting a version, **When** the story has more than one version, **Then** a confirmation modal appears and deletion proceeds on confirm.
9. **Given** a logged-in user trying to delete the only version of a story, **When** they click delete, **Then** the action is blocked with a message directing them to delete the story instead.
10. **Given** a logged-in user deleting a story, **When** they confirm in the modal, **Then** the story and all its versions are permanently removed from the account.

---

### User Story 6 — User manages their account profile and can delete their account (Priority: P6)

After first login, a user sees a one-time profile modal to optionally provide their job title and intent. They can update this from a Profile page at any time. They can also permanently delete their account and all data.

**Why this priority**: Account management is a supporting feature — required for a complete product but not the primary reason to use the app.

**Independent Test**: Log in for the first time → profile modal appears → fill it → dismiss → visit Profile page → update → delete account → all data gone, redirected to home.

**Acceptance Scenarios**:

1. **Given** a user logs in for the first time, **When** the app loads, **Then** a dismissible modal appears asking for job title and intent (both optional, no validation required).
2. **Given** a user dismisses the profile modal, **When** they log in again later, **Then** the modal does not appear again.
3. **Given** a logged-in user, **When** they visit their Profile page, **Then** they can view and update their job title (max 100 characters) and intent (max 200 characters).
4. **Given** a user on the Profile page, **When** they click "Delete account", **Then** a confirmation modal appears with the instruction to type `DELETE` to confirm.
5. **Given** a user types `DELETE` in the confirmation modal, **When** they click confirm, **Then** all their data is permanently deleted, their session ends, and they are redirected to home.
6. **Given** a user who has not typed `DELETE`, **When** they look at the confirm button, **Then** it is disabled and cannot be clicked.

---

### User Story 7 — UI tweaks ship independently of the backend (Priority: P7)

The top bar and hero text changes are purely cosmetic frontend changes and can be deployed before the backend is ready.

**Why this priority**: No dependencies, low risk, can be shipped and validated at any point in the delivery sequence.

**Independent Test**: Open the app — top bar is visible with correct title and auth buttons; hero text reads "Story Builder".

**Acceptance Scenarios**:

1. **Given** any user visits the app, **When** the page loads, **Then** a persistent top bar is visible with "Lean Storytelling" on the left and "Log in" / "Sign up" buttons on the right.
2. **Given** any user visits the app, **When** the Story Builder loads, **Then** the subtitle reads "Story Builder — Build your story — one element at a time."

---

### Edge Cases

- What happens when a magic link is opened in a different browser than the one where login was initiated? → The link is valid in any browser; the session is established wherever the link is opened.
- What happens when two browser tabs have anonymous story content and the user logs in from one? → Only the tab completing the login triggers migration; the other tab retains its session state until refreshed.
- What happens when the Stories sidebar is empty (new account, no migration content)? → An empty state is shown: "No stories yet. Click + New Story to get started."
- What happens when a Story title is left blank during creation? → The title field is required; the user cannot proceed without entering at least one character.
- What happens when the offline write queue overflows (more than 50 pending operations)? → The oldest operations are discarded; the sync indicator shows "⚠ Not saved" until connectivity is restored.
- What happens when a user's session expires mid-session? → The app detects the expired session and shows a modal prompting re-authentication via magic link, without losing the user's current Story Builder content.

---

## Requirements *(mandatory)*

### Functional Requirements

**Deployment & Infrastructure**
- **FR-001**: The app MUST be deployable with a single command on Ubuntu and macOS.
- **FR-002**: The app MUST be accessible via HTTPS on a public URL when deployed to a VPS.
- **FR-003**: The app MUST function without any external CDN or third-party asset dependencies at runtime.
- **FR-004**: Deployment documentation MUST cover: local setup (Ubuntu, macOS), VPS production deployment, and DB backup and restore procedures step by step.

**Anonymous Experience**
- **FR-005**: Anonymous users MUST have full access to all three waves of the Story Builder without creating an account.
- **FR-006**: Anonymous users MUST see a non-blocking persistent banner informing them their work is not saved, with a "Sign up" CTA.
- **FR-007**: Anonymous story data MUST persist for the duration of the browser session only.

**Authentication**
- **FR-008**: Users MUST be able to sign up and log in via a single magic link flow — no separate sign-up form exists.
- **FR-009**: Magic link tokens MUST be single-use and expire after 15 minutes.
- **FR-010**: The magic link request endpoint MUST enforce a rate limit of 5 requests per email per hour.
- **FR-011**: All four error states (token expired, token already used, email send failure, rate limit hit) MUST be handled with user-facing messages and recovery actions.
- **FR-012**: Users MUST be able to log out, ending their session immediately.

**sessionStorage Migration**
- **FR-013**: On login, if the user's session contains story content, it MUST be saved to their account automatically as a new Story, version 1.
- **FR-014**: After migration, session story data MUST be cleared from the browser.
- **FR-015**: If session story data is empty at login time, no Story MUST be created.

**Account Management**
- **FR-016**: A one-time optional profile modal (job title, intent) MUST appear after first login and never again automatically.
- **FR-017**: Users MUST be able to view and update their profile at any time via a Profile page.
- **FR-018**: Users MUST be able to permanently delete their account and all associated data by typing `DELETE` in a confirmation modal.

**Stories & Versioning**
- **FR-019**: Authenticated users MUST be able to create multiple named Stories.
- **FR-020**: The Story Builder MUST auto-save every field change within 3 seconds (debounced), requiring no manual save action from the user.
- **FR-021**: A sync indicator MUST display one of three states at all times when editing: "Saving…", "Saved", or "⚠ Not saved".
- **FR-022**: On network failure, pending writes MUST be queued locally and flushed automatically on reconnect (maximum queue size: 50 operations; oldest discarded on overflow).
- **FR-023**: Authenticated users MUST be able to create a new version (+1) from the latest version of any Story.
- **FR-024**: Authenticated users MUST be able to fork any version of any Story as version 1 of a new Story.
- **FR-025**: Non-latest versions MUST be read-only, with a visible banner offering to fork.
- **FR-026**: Authenticated users MUST be able to delete any version, except when it is the only remaining version of a Story.
- **FR-027**: Authenticated users MUST be able to delete a Story and all its versions permanently.
- **FR-028**: All destructive actions (delete version, delete story, delete account) MUST require explicit confirmation before executing.

**UI Tweaks**
- **FR-029**: A persistent top bar MUST be visible on all pages, with the app title on the left and auth action buttons on the right.
- **FR-030**: The Story Builder subtitle MUST read "Story Builder — Build your story — one element at a time."

### Key Entities

- **User**: A person with an account. Identified by email. Optionally has a job title and intent. Owns Stories. Created automatically on first login.
- **Story**: A named container belonging to a User. Has a title and a creation date. Contains one or more Versions.
- **StoryVersion**: A saved snapshot of a Story. Contains all nine story content fields (Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why) plus a version number and timestamps. The latest version is editable; older versions are read-only.
- **MagicLinkToken**: A short-lived, single-use credential emailed to a user to authenticate them. Expires after 15 minutes and is invalidated after first use.
- **Anonymous Session**: A temporary browser-side state holding one in-progress Story for unauthenticated visitors. Not stored on any server.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The app can be deployed from scratch on a fresh machine in under 10 minutes by following the documentation.
- **SC-002**: A visitor can start building a story within 5 seconds of landing on the app, with no sign-up required.
- **SC-003**: A new user can complete the full sign-up flow (enter email → receive link → click → logged in) in under 2 minutes.
- **SC-004**: Authenticated users never lose more than 3 seconds of work — auto-save completes within that window under normal connectivity.
- **SC-005**: 100% of story content entered by an anonymous user before sign-up is preserved in their account after login (zero data loss at the conversion moment).
- **SC-006**: Zero accidental deletions are possible — all destructive actions require at least one explicit confirmation step.
- **SC-007**: The app remains usable during a network outage — unsaved changes are queued and synced on reconnect with no user action required.

---

## Assumptions

- Users are on large-screen devices (desktop or laptop). Mobile and small-screen support is explicitly out of scope for v0.3.
- The owner/developer has basic familiarity with running terminal commands and Docker.
- The VPS provider (Scaleway or OVH) supports Docker and allows standard HTTP/HTTPS ports.
- The email sending service free tier (3,000 emails/month) is sufficient for the user testing phase of v0.3.
- The existing v0.2 Story Builder frontend (vanilla JS, HTML, CSS) is the starting point and is not being rewritten.
- Story content fields are the same nine as in v0.2 (Context, Target, Empathy, Problem, Consequences, Solution, Benefits, Why, plus Story title). No new fields are added in v0.3.
- A 30-day session expiry is acceptable for the user testing audience — no "remember me" toggle is needed.
- Data export is not required. Users are informed before deleting their account to copy-paste any content they wish to keep.
- Admin tools, billing, and paid plans are out of scope for v0.3.
