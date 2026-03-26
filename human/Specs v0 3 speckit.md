# Lean Storytelling — v0.3 Spec

## Feature scope

v0.3 migrates the app from a local static app to a publicly deployable web app with server-side persistence, user accounts, and Stories management.

**In scope:**
- UI tweaks (frontend-only, no backend dependency)
- Magic link authentication
- Account CRUD (create, update profile, delete)
- Anonymous user experience with sessionStorage migration on sign-up
- Stories List and Versioning

**Out of scope:**
- Mobile/small screen support (large screen only)
- Data export
- Billing or paid plans
- Email verification beyond magic link
- Admin panel

---

## Architecture

```
Browser (vanilla JS + HTML + CSS)
  → HTTPS REST API
    → Backend: Node.js + Fastify
      → Database: PostgreSQL
```

- **Deployment:** Docker Compose for both local dev (Ubuntu, macOS) and production (VPS)
- **Hosting:** single VPS on Scaleway or OVH (1 CPU, 2 GB RAM), ~€3–5/month
- **Email:** Resend (free tier: 3,000 emails/month)
- **HTTPS:** Let's Encrypt (free, auto-renewed)
- **Session:** JWT issued on login, stored as httpOnly cookie, 30-day expiry. Cleared on logout.
- **Rate limiting:** magic link endpoint limited to 5 requests per email per hour

---

## Data model

### User
| Field | Type | Notes |
|---|---|---|
| id | UUID | primary key |
| email | string | unique, required |
| job_title | string | optional, max 100 chars |
| intent | string | optional, max 200 chars |
| created_at | timestamp | |
| onboarded_at | timestamp | null until profile modal is dismissed |

### Story
| Field | Type | Notes |
|---|---|---|
| id | UUID | primary key |
| user_id | UUID | foreign key → User |
| title | string | required, max 100 chars |
| created_at | timestamp | |

### StoryVersion
| Field | Type | Notes |
|---|---|---|
| id | UUID | primary key |
| story_id | UUID | foreign key → Story |
| version_number | integer | starts at 1, auto-incremented per story |
| context | text | optional |
| target | text | optional |
| empathy | text | optional |
| problem | text | optional |
| consequences | text | optional |
| solution | text | optional |
| benefits | text | optional |
| why | text | optional |
| created_at | timestamp | |
| updated_at | timestamp | updated on every auto-save |

### MagicLinkToken
| Field | Type | Notes |
|---|---|---|
| id | UUID | primary key |
| email | string | |
| token | string | hashed, single-use |
| expires_at | timestamp | 15 minutes after creation |
| used_at | timestamp | null until consumed |

---

## Features

### F1 — UI tweaks (frontend-only)

No backend changes. Can ship independently.

1. **Top bar:** persistent bar across the full app width. Left: "Lean Storytelling" (app title, non-clickable). Right: "Log in" and "Sign up" buttons (stub, wired to auth flows in F2).
2. **Hero text change:** replace `"Lean Storytelling — Build your story — one element at a time."` with `"Story Builder — Build your story — one element at a time."`

---

### F2 — Magic link authentication

**Sign-up and login share the same flow.** There is no separate sign-up form — an account is created automatically on first login.

**Flow:**
1. User clicks "Sign up" or "Log in"
2. Modal: single email input field + "Send me a link" button
3. Backend: generate a single-use token, store hashed in `MagicLinkToken`, send email via Resend
4. UI: show "Check your inbox. The link expires in 15 minutes." with a "Resend" option (respects rate limit)
5. User clicks link in email
6. Backend: validate token (exists, not used, not expired), mark as used, create User if not exists, issue JWT as httpOnly cookie
7. Redirect to app

**Error states:**
- Token expired: show "This link has expired." + "Send a new link" button
- Token already used: show "This link has already been used." + "Send a new link" button
- Email send failure: show "We couldn't send the email. Please try again." with retry button
- Rate limit hit: show "Too many attempts. Please wait before requesting a new link."

**Logout:** clears httpOnly cookie, redirects to home.

---

### F3 — Account CRUD

**Create:** handled by F2 (automatic on first magic link login).

**Update profile:**
- Fields: `job_title` (free text, max 100 chars, optional) and `intent` (free text, max 200 chars, optional)
- Shown once in a modal after first login (onboarding). Dismissible. Never shown again automatically.
- Also accessible anytime via a "Profile" link in the top bar (authenticated state only).

**Delete account:**
- Accessible from Profile page
- Confirmation modal: user must type `DELETE` (uppercase) to confirm
- On confirm: all User, Story, StoryVersion records are permanently deleted. JWT cookie is cleared. Redirect to home.
- No data export. UI copy: "This will permanently delete your account and all your stories. Consider copy-pasting anything you want to keep before proceeding."

---

### F4 — Anonymous user experience

- Anonymous users have full access to the Story Builder (all 3 waves)
- One in-progress Story only, stored in sessionStorage (existing v0.2 behavior)
- No save, no versioning
- A non-blocking banner is shown: "Nothing is saved. Create an account to save your stories and manage versions." with "Sign up" CTA
- "Log in" and "Sign up" buttons visible in top bar at all times

**sessionStorage migration on account creation or login:**
- If sessionStorage contains story content when the user completes a magic link login:
  - **New account (sign-up):** save the sessionStorage content as Story 1, version 1. Title defaults to "My first story" (editable).
  - **Existing account (log in):** save the sessionStorage content as a new Story (not overwriting existing stories), version 1. Title defaults to "Imported story" (editable).
  - **Empty sessionStorage:** do nothing.
- sessionStorage is cleared after migration.

---

### F5 — Stories List and Versioning

**UI pattern:** foldable left sidebar showing an accordion tree. Sidebar is collapsible (toggle button). Only Stories List is in scope for v0.3 — sidebar structure is extensible but no other sections are added.

```
┌───────────────────────────────────────────────┐
│ My Stories                    [+ New Story]   │
├───────────────────────────────────────────────┤
│ ▶ Product Launch 2025        v3    2 days ago │
├───────────────────────────────────────────────┤
│ ▼ Investor Pitch             v2    today      │
│   ├─ v2  today          [Edit] [Fork] [Del]   │
│   ├─ v1  last week      [Edit] [Fork] [Del]   │
│   └─ [+ New version]   [Delete story]         │
├───────────────────────────────────────────────┤
│ ▶ Team Onboarding            v1    yesterday  │
└───────────────────────────────────────────────┘
```

**Operations:**

| Action | Behavior |
|---|---|
| Create Story | Opens empty Story Builder. User names the story in a prompt. Creates Story + version 1. |
| Edit Story | Opens Story Builder loaded with the latest version of the Story. Auto-saves on field change (debounced 2s). |
| Edit a specific version | Opens Story Builder loaded with that version (read-only for non-latest versions — display a banner: "You are viewing an older version. Fork it to edit.") |
| New version (+1) | Creates a copy of the latest version with version_number +1. Opens it in Story Builder. |
| Fork any version | Creates a new Story with version 1 copied from the selected version. Opens it in Story Builder. |
| Delete a version | Confirmation modal: "Delete this version? This cannot be undone." Deletes the StoryVersion record. Not allowed if it is the only version of the Story (must delete the Story instead). |
| Delete a Story | Confirmation modal: "Delete this story and all its versions? This cannot be undone." Deletes the Story and all its StoryVersions. |

**Auto-save behavior (authenticated):**
- Every field change triggers a debounced (2s) PATCH request to the current StoryVersion
- A subtle sync indicator shows: "Saving…" → "Saved" → "⚠ Not saved" on failure
- On network failure: pending writes are queued in sessionStorage. On reconnect (`navigator.online` event), queue is flushed in order. Queue holds a maximum of 50 operations; older ones are discarded on overflow.

---

## Security

- HTTPS enforced everywhere (Let's Encrypt)
- Magic link tokens: single-use, expire after 15 minutes, stored hashed
- JWT in httpOnly cookie (not accessible to JavaScript)
- Rate limiting: 5 magic link requests per email per hour
- All DB connections over TLS
- Disk encryption at OS/VPS level (configured at server setup, out of scope for app code)

---

## Deployment

The app must be deployable with a single command on Ubuntu and macOS:

```
docker compose up
```

Docker Compose stack:
- `frontend`: static files served by Fastify (no separate CDN)
- `backend`: Node.js + Fastify
- `db`: PostgreSQL

Documentation must cover:
- Local setup (Ubuntu, macOS)
- Production deployment on a VPS (Scaleway or OVH)
- Daily automated DB backup and step-by-step restore procedure
