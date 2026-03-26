Lean Storytelling: specs v0.3

# Context

We have made a 2nd version that covers the end-to-end Story Builder process.

In this document, we focus on the development v0.3, with new features and new architecture.

# Goals (high-level)

The major goal is to move the app from local and static to public internet with a DB and API, add the necessary security and reliability, and features such as account and Stories management:

- Move and re-architect the web app:
    - Adapt from static/local app to public internet
    - Manage server-side storage
    - Use only free/open-source dependencies
    - Keep app modern, elegant, minimalistic, lightweight, easy and fun to maintain
    - Secure by default, encrypt all you can (right balance)
    - Keep all data (local and/or server) in case of crash/close/failure
    - Define the front and back separation and flows
    - Document how to deploy and operate:
        - For beginners
        - Locally on a Linux (or macOS) computer
        - On generic CSPs like Scaleway or OVH using Docker
- New valuable story-writing features:
    - Implement secure yet simple Account CRUD features (modern, frictionless, and balanced onboarding)
    - Implement basic Stories List and Versioning (many Stories per user, and many versions per Story)

# Tech details: build & run

Goals:

Design and code an app properly, and easily deploy and operate.

Roles:

You are a senior architect, senior full-stack dev, senior ops/devops/SRE.

Actions:

- Detail and polish this plan
- Ask me questions and explain the tradeoffs
- A non-coder like me should be able to understand, learn, and validate what you do

Success Criteria:

I can deploy an app on a public server and run user tests in my network.

## Architecture decisions

### Tech stack

- **Frontend:** existing vanilla JS + HTML + CSS (no change)
- **Backend:** Node.js with Fastify — same language as the frontend, lightweight, fast, easy to learn
- **Database:** PostgreSQL — reliable, free, handles JSON natively (good for story fields), runs everywhere
- **API style:** REST — simplest to learn, easy to test with a browser or curl, no overhead

### Deployment: Docker Compose

Docker Compose is confirmed for both local development and production.

Why Docker:
- Consistent environment: works the same on Ubuntu, macOS, and production server
- One command (`docker compose up`) starts the whole stack: frontend + backend + DB
- No "works on my machine" issues
- Easy to share and hand off

Why not Kubernetes or anything heavier: out of scope, adds complexity with no benefit at this scale.

### Architecture

```
Browser (Frontend) -> (HTTPS API calls) -> Backend (Fastify/Node.js) -> Database (PostgreSQL)
```

### Authentication: magic link

Chosen approach: **magic link** (passwordless).

How it works: the user enters their email → the backend sends a one-time login link → the user clicks it → they are logged in. No password to set, remember, or reset.

Why:
- Less code than password + reset flow (no hashing, no password policy, no reset token)
- Better UX: nothing to forget
- Secure: no weak passwords

What it needs:
- An email sending service (Resend — free tier: 3,000 emails/month, easy to set up)
- A short-lived token table in the DB (token + expiry + email, deleted after use)

### Storage strategy

- **In-session (anonymous):** browser sessionStorage (existing behavior)
- **Persistent (authenticated):** server-side PostgreSQL
- **Backup:** automated daily DB dump, stored locally on the server
- **Reliability:** auto-save to server on every field change (debounced), so no data is lost on crash or tab close

### Provider

For each tier, recommend a free or cheap provider:
- **Frontend hosting:** static files served by the backend (no separate CDN needed at this stage)
- **Backend + DB hosting:** single VPS on Scaleway or OVH (1 CPU, 2 GB RAM is enough) — ~€3–5/month
- **Email:** Resend free tier (3,000 emails/month)

### Safety and reliability

- Auto-save to server on every field change (debounced 2s) — no manual save needed
- Optimistic UI: changes appear instantly, sync happens in background
- On network failure: queue writes locally and retry when connection is restored
- Automated daily DB backup with a simple restore procedure, documented step by step

### Security

- HTTPS enforced everywhere (Let's Encrypt, free)
- Magic link tokens: single-use, expire after 15 minutes
- All DB connections over TLS
- Passwords: none to manage (magic link removes this surface)
- Rate limiting on the magic link endpoint to prevent email flooding
- Data encrypted at rest in PostgreSQL

# Functional

Goals:

- Design an onboarding with minimal friction
- Allow users to focus on core value: story creation/crafting and stories management
- Simple but extensible system

Roles:

You are an expert product manager, expert UX/UI designer.

Actions:

- Peer review this plan below
- Ask questions to clarify
- A non-coder like me should be able to understand, learn, and validate what you do

Success Criteria:

The UX and workflow allow users to create and manage their Stories, reliably and securely, on any large screen device.

## Customer journeys

- Anonymous user:

```
Discover/visit → Start Story Building → Edit/review loops
```

Only access to Story Builder, with the three-wave workflow, only one live Story that can be changed/edited forever, but never saved nor versioned.

- Identified and authenticated user:

```
Discover/visit → Start Story Building → Edit/review loops → Save Stories → Manage Stories and Versions / Update Profile
```

Access to Story Builder, Story Management, Profile.

## Let users try and get value before account creation

Allow anonymous users to use the Story Builder: only one Story that they can edit and overwrite forever, no save, no versioning.

Warn the user that nothing is saved if they don't create an account, but apply no usage limitation. Inform the user that with an account they have access to Story Management and Versioning.

CTA on top right of app to log in or sign up.

### sessionStorage migration on sign-up

When an anonymous user signs up or logs in, their current in-progress Story (from sessionStorage) is automatically saved to their account as their first Story (version 1). Nothing is lost.

## Account CRUD

- **Create account:** enter a valid email address → receive a magic link → click to log in. Account is created automatically on first login.
- **Update profile:** add job title and intent (optional, captured after first login).
- **Delete account:** destroys all data permanently (no export — encourage copy-paste before deleting).

## Stories List and Versioning

Allow the user to create and manage multiple Stories, and multiple versions of each Story:

- Create a Story: opens a new empty Story Builder
- Edit a Story: opens the Story Builder with the latest version of the Story
- Delete a Story: removes the Story from the list along with all its versions
- Create a new version from the latest version of an existing Story (version +1)
- Copy or fork any version of an existing Story as version 1 of a new Story
- Delete any version of a Story

UX/flow:

- Create a foldable left sidebar (that will be reused for more features later)
- Show foldable tree/hierarchy (like macOS Finder): My Stories > [Story title] > [Version]

Example:
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


## UI tweaks (frontend-only, no backend dependency)

These can ship independently of the backend migration:

- Add a top bar with the app title "Lean Storytelling" and buttons on the right: "Sign up", "Log in"
- Change the hero text from:
   "Lean Storytelling — Build your story — one element at a time."
   to:
   "Story Builder — Build your story — one element at a time."
