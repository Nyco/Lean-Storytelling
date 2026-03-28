# Tasks: Lean Storytelling v0.3 — Public Web App

**Input**: Design documents from `/specs/003-v03-public-app/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api.md ✅ quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story (US1–US7) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US7)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create project skeleton, Docker stack, and environment config.

- [x] T001 Create directory structure: `backend/src/routes/`, `backend/src/services/`, `backend/src/db/migrations/`, `backend/src/plugins/`, `frontend/` (move existing v0.2 files in)
- [x] T002 Initialize backend Node.js 20 project: create `backend/package.json` with dependencies: `fastify`, `@fastify/jwt`, `@fastify/cookie`, `@fastify/static`, `@fastify/cors`, `postgres`, `resend`
- [x] T003 [P] Create `backend/Dockerfile`: Node.js 20 Alpine, copy source, install deps, expose port 3000
- [x] T004 [P] Create `docker-compose.yml` with three services: `db` (postgres:16-alpine with healthcheck), `backend` (build: ./backend, depends_on db, port 3000)
- [x] T005 [P] Create `docker-compose.prod.yml` with production overrides: restart policies, HTTPS cert volume mount, NODE_ENV=production
- [x] T006 [P] Create `.env.example` documenting all required variables: `DATABASE_URL`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `RESEND_API_KEY`, `FROM_EMAIL`, `FRONTEND_URL`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, Fastify server, and shared frontend client — MUST be complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Create `backend/src/db/client.js`: PostgreSQL connection using `postgres` package, reads `DATABASE_URL` from env, exports a singleton `sql` tagged template client
- [x] T008 Create `backend/src/db/migrations/001_init.sql`: full schema for all 4 tables (`users`, `stories`, `story_versions`, `magic_link_tokens`) with indexes and constraints per `data-model.md`
- [x] T009 Create `backend/src/db/migrate.js`: migration runner that reads and executes all `*.sql` files in `migrations/` in order; run on server startup
- [x] T010 [P] Create `backend/src/plugins/jwt.js`: register `@fastify/jwt` and `@fastify/cookie`; configure `ls_session` httpOnly, Secure, SameSite=Lax cookie; 30-day expiry; export `authenticate` preHandler
- [x] T011 [P] Create `backend/src/plugins/cors.js`: register `@fastify/cors` with `FRONTEND_URL` origin and credentials: true
- [x] T012 [P] Create `backend/src/plugins/rate-limit.js`: in-memory rate limiter for magic link endpoint (5 requests per email per hour); Map keyed by email, purge entries older than 1 hour
- [x] T013 Create `backend/src/server.js`: Fastify server entry point; register all plugins; register `@fastify/static` serving `../frontend/` at `/`; run migrations on startup; listen on port 3000
- [x] T014 [P] Create `frontend/api-client.js`: thin `fetch` wrapper with base URL `/api`, automatic JSON headers, cookie credentials; on 401 response: save current Story Builder state to sessionStorage and dispatch `auth:expired` custom event

**Checkpoint**: `docker compose up` should start all containers. The frontend static files should be served at `http://localhost:3000`.

---

## Phase 3: User Story 1 — App Publicly Accessible and Deployable (Priority: P1) 🎯 MVP

**Goal**: A developer can deploy the full stack with one command locally and on a VPS.

**Independent Test**: `docker compose up --build` on a fresh machine → app loads at `http://localhost:3000`.

- [x] T015 [US1] Add `CMD ["node", "src/server.js"]` and health check endpoint `GET /api/health` returning `{ status: "ok" }` in `backend/src/server.js`
- [x] T016 [US1] [P] Verify `quickstart.md` covers all required scenarios: local setup, VPS deployment with HTTPS, backup cron, restore procedure — update if any step is missing
- [x] T017 [US1] [P] Create `docs/deployment.md` as a pointer to `specs/003-v03-public-app/quickstart.md` for easy discovery from the repo root

**Checkpoint**: `docker compose up` works end-to-end. App serves frontend at root. Health endpoint responds.

---

## Phase 4: User Story 2 — Anonymous User Builds a Story (Priority: P2)

**Goal**: Existing v0.2 Story Builder behavior is preserved on the new stack, with a save-nudge banner.

**Independent Test**: Open `http://localhost:3000` without logging in — Story Builder loads, banner is visible, sessionStorage saves field content.

- [x] T018 [US2] Add persistent "Nothing is saved" banner HTML to `frontend/index.html`: shown by default; hidden via CSS class when user is authenticated; contains "Sign up" CTA button
- [x] T019 [US2] Create `frontend/auth.js`: define `isAuthenticated()` (checks for auth session state in memory); on page load, show/hide banner based on auth state; wire "Sign up" CTA to open auth modal (modal stub OK, wired in US3)
- [x] T020 [US2] Verify existing v0.2 sessionStorage read/write logic in `frontend/app.js` still works unchanged after file reorganization — fix any broken paths

**Checkpoint**: Anonymous user can use the full Story Builder. Banner is visible. No regression from v0.2.

---

## Phase 5: User Story 3 — Magic Link Authentication (Priority: P3)

**Goal**: A visitor can sign up or log in via email magic link, with all error states handled.

**Independent Test**: Enter an email → receive link → click link → land in app as logged-in user. Test each error state manually.

### Backend

- [x] T021 [US3] Create `backend/src/services/auth-service.js`: `generateToken()` (32-byte hex via `crypto.randomBytes`), `hashToken()` (SHA-256 hex), `createMagicLinkToken(email)` (insert into DB), `validateMagicLinkToken(rawToken)` (hash, lookup, check expiry and used_at, mark used_at), `createOrGetUser(email)` (upsert user)
- [x] T022 [US3] [P] Create `backend/src/services/email-service.js`: `sendMagicLink(email, verifyUrl)` using Resend SDK; `checkRateLimit(email)` using in-memory store from `rate-limit.js` plugin
- [x] T023 [US3] Create `backend/src/routes/auth.js`: implement `POST /api/auth/magic-link` (validate email, check rate limit, create token, send email, return 200 or 429/503); implement `GET /api/auth/verify` (validate token, create/get user, set JWT cookie, redirect with `?auth=success` or `?auth_error=expired|used`); implement `POST /api/auth/logout` (clear cookie)
- [x] T024 [US3] Register auth routes in `backend/src/server.js` under `/api/auth` prefix

### Frontend

- [x] T025 [US3] Implement auth modal in `frontend/auth.js`: `openAuthModal()`, email input form, submit → `POST /api/auth/magic-link`, show "Check your inbox" state with "Resend" option; handle 429 and 503 responses with appropriate user messages
- [x] T026 [US3] Implement auth callback handler in `frontend/auth.js`: on page load, parse `?auth=success` (hide modal, update UI to authenticated state, remove param from URL) and `?auth_error=expired|used` (show error message with "Send a new link" button)
- [x] T027 [US3] Implement logout in `frontend/auth.js`: `logout()` → `POST /api/auth/logout` → reset app to anonymous state (hide sidebar, show banner, clear auth session in memory)
- [x] T028 [US3] Wire top bar "Log in" / "Sign up" buttons (added in US7 stub) to `openAuthModal()` in `frontend/auth.js`; wire logout button (authenticated state) to `logout()`

**Checkpoint**: Full magic link flow works end-to-end. All 4 error states show correct messages. Logout ends session.

---

## Phase 6: User Story 4 — sessionStorage Migration on Login (Priority: P4)

**Goal**: Anonymous story content is saved to the account automatically on login, with no user action required.

**Independent Test**: Fill story fields as anonymous → complete magic link login → content appears as a saved Story in the sidebar.

- [x] T029 [US4] Implement migration in `frontend/auth.js`: in the `?auth=success` handler, read all story fields from sessionStorage; if any field is non-empty, `POST /api/stories` with the content and appropriate default title
- [x] T030 [US4] Set default title based on account type in `frontend/auth.js`: detect if new account (`GET /api/me` returns `created_at` within last 5 seconds) → "My first story"; existing account → "Imported story"
- [x] T031 [US4] Clear sessionStorage story data after successful migration in `frontend/auth.js`; open the migrated story in the Story Builder

**Checkpoint**: Anonymous → sign-up flow preserves all story content. Existing account login imports as new story. Empty session creates no story.

---

## Phase 7: User Story 5 — Stories List and Versioning (Priority: P5)

**Goal**: Logged-in users can create, edit, version, fork, and delete Stories via a collapsible sidebar.

**Independent Test**: Log in → create story → fill fields → observe "Saved" indicator → create new version → fork a version → delete a version → delete a story.

### Backend

- [x] T032 [US5] Create `backend/src/services/story-service.js`: `getStories(userId)`, `createStory(userId, title, fields)`, `deleteStory(userId, storyId)`, `getVersions(userId, storyId)`, `getVersion(userId, storyId, versionId)`, `createVersion(userId, storyId)` (copy latest), `patchVersion(userId, storyId, versionId, fields)` (latest only), `deleteVersion(userId, storyId, versionId)` (block if last), `forkVersion(userId, storyId, versionId, newTitle)`
- [x] T033 [US5] Create `backend/src/routes/stories.js`: `GET /api/stories`, `POST /api/stories`, `DELETE /api/stories/:storyId` — all protected by `authenticate` preHandler; delegate to story-service
- [x] T034 [US5] Create `backend/src/routes/versions.js`: `GET /api/stories/:storyId/versions`, `GET /api/stories/:storyId/versions/:versionId`, `POST /api/stories/:storyId/versions`, `PATCH /api/stories/:storyId/versions/:versionId` (403 if not latest), `DELETE /api/stories/:storyId/versions/:versionId` (409 if last), `POST /api/stories/:storyId/versions/:versionId/fork` — all protected
- [x] T035 [US5] Register stories and versions routes in `backend/src/server.js`

### Frontend

- [x] T036 [US5] Create `frontend/sidebar.js`: collapsible sidebar container with toggle button; `loadSidebar()` calls `GET /api/stories`, renders accordion tree (story row with expand arrow, version rows with Edit/Fork/Del buttons, "+ New version", "Delete story"); empty state: "No stories yet. Click + New Story to get started."
- [x] T037 [US5] Implement "+ New Story" in `frontend/sidebar.js`: title prompt modal (required, min 1 char) → `POST /api/stories` → reload sidebar → open new version in Story Builder
- [x] T038 [US5] Implement story/version loading in `frontend/app.js`: `loadVersion(storyId, versionId)` — `GET /api/stories/:id/versions/:id` → populate all Story Builder fields; track active `storyId` and `versionId` in memory
- [x] T039 [US5] Create `frontend/auto-save.js`: attach `input` event listeners to all Story Builder fields; debounce 2s; on trigger: set indicator to "Saving…" → `PATCH /api/stories/:id/versions/:id` with changed field → set "Saved"; on failure: set "⚠ Not saved"; add sync indicator element to `frontend/index.html`
- [x] T040 [US5] Implement offline write queue in `frontend/auto-save.js`: on fetch failure, push `{ storyId, versionId, field, value }` to sessionStorage queue (max 50, oldest discarded); `window.addEventListener('online', flushQueue)` replays queue in order
- [x] T041 [US5] Implement "+ New version" in `frontend/sidebar.js`: button click → `POST /api/stories/:id/versions` → reload sidebar → open new version in Story Builder
- [x] T042 [US5] Implement "Fork" in `frontend/sidebar.js`: button click → title prompt modal → `POST /api/stories/:id/versions/:id/fork` → reload sidebar → open forked story in Story Builder
- [x] T043 [US5] Implement read-only mode in `frontend/app.js`: when `loadVersion()` loads a non-latest version, disable all Story Builder inputs and show banner: "You are viewing an older version. Fork it to edit." with Fork CTA
- [x] T044 [US5] Implement delete version in `frontend/sidebar.js`: "Del" button → confirmation modal "Delete this version? This cannot be undone." → `DELETE /api/stories/:id/versions/:id` → on 409 show "Delete the story instead to remove the last version" → reload sidebar
- [x] T045 [US5] Implement delete story in `frontend/sidebar.js`: "Delete story" button → confirmation modal "Delete this story and all its versions? This cannot be undone." → `DELETE /api/stories/:id` → reload sidebar; if deleted story was active, clear Story Builder fields

**Checkpoint**: All Stories CRUD and versioning operations work. Auto-save fires within 3 seconds. Sidebar shows correct tree. Offline queue works on reconnect.

---

## Phase 8: User Story 6 — Account Management (Priority: P6)

**Goal**: Users can view/update their profile and permanently delete their account.

**Independent Test**: First login → profile modal appears → fill → dismiss → visit Profile → update → delete account → data gone, redirected to home.

### Backend

- [x] T046 [US6] Create `backend/src/routes/users.js`: `GET /api/me` (return user), `PATCH /api/me` (update job_title, intent, set onboarded_at), `DELETE /api/me` (type DELETE confirm, delete user cascade, clear cookie) — all protected by `authenticate`
- [x] T047 [US6] Register users routes in `backend/src/server.js`

### Frontend

- [x] T048 [US6] Implement onboarding modal in `frontend/auth.js`: after `?auth=success`, call `GET /api/me`; if `onboarded_at` is null, show modal with job title + intent text inputs (optional); "Save" → `PATCH /api/me { onboarded: true, job_title, intent }`; "Skip" → `PATCH /api/me { onboarded: true }`;  modal never shown again once dismissed
- [x] T049 [US6] [P] Add Profile link to top bar (authenticated state only) in `frontend/index.html`; create Profile section in `frontend/index.html`: job title field, intent field, "Save changes" button, "Delete account" button
- [x] T050 [US6] Implement Profile logic in `frontend/app.js`: `showProfile()` populates fields from `GET /api/me`; "Save changes" → `PATCH /api/me`; "Delete account" → show confirmation modal with "DELETE" text input; enable confirm button only when input === "DELETE"; on confirm → `DELETE /api/me` → call `logout()` → redirect to home

**Checkpoint**: First-login profile modal appears once. Profile page shows/updates data. Account deletion destroys all data and ends session.

---

## Phase 9: User Story 7 — UI Tweaks (Priority: P7)

**Goal**: Top bar with auth buttons and updated hero subtitle, shippable independently.

**Independent Test**: Open app — top bar visible with correct title and buttons; subtitle reads "Story Builder".

- [x] T051 [US7] Add top bar HTML to `frontend/index.html`: `<header>` with "Lean Storytelling" title (left) and auth button group (right): "Log in" + "Sign up" (anonymous state), "Profile" + "Log out" (authenticated state); hidden state controlled by CSS class toggle in `frontend/auth.js`
- [x] T052 [US7] Style top bar in `frontend/style.css`: no default browser styles; consistent with existing Playfair Display / DM Sans typography; single primary action visible; elegant and focused per constitution §VI
- [x] T053 [US7] Update hero subtitle in `frontend/index.html`: change `"Lean Storytelling — Build your story — one element at a time."` to `"Story Builder — Build your story — one element at a time."`

**Checkpoint**: Top bar is visible and correctly styled. Auth state toggles correct button set. Hero text updated.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening, service worker update, session expiry handling.

- [x] T054 [P] Audit all new frontend files (`auth.js`, `sidebar.js`, `auto-save.js`, `api-client.js`) — verify every write of user-supplied content uses `.textContent` not `.innerHTML` (per CLAUDE.md XSS rule)
- [x] T055 [P] Audit all new frontend files — verify no external CDN URLs are referenced (fonts, scripts, styles); all assets must be self-hosted (per CLAUDE.md CSP rule)
- [x] T056 Update `frontend/service-worker.js` `CACHE_FILES` array to include new frontend files: `api-client.js`, `auth.js`, `sidebar.js`, `auto-save.js`
- [x] T057 Implement session expiry handler in `frontend/api-client.js`: listen for `auth:expired` event (dispatched on 401); save current Story Builder field values to sessionStorage; open auth modal with message "Your session has expired. Log in again to continue."
- [x] T058 [P] Validate `docker compose up --build` end-to-end on a clean machine per `quickstart.md` — fix any issues found in documentation or configuration
- [x] T059 [P] Verify Story Builder delivery order in right-pane preview (if applicable) matches constitution §II: Context → Target → Empathy → Problem → Consequences → Solution → Benefits → Why

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3–9 (User Stories)**: All depend on Phase 2 completion
  - US7 (Phase 9) has NO backend dependency — can be done after Phase 1 only
  - US1 (Phase 3) must complete before US2–US6 (needs running server)
  - US3 (Phase 5) must complete before US4 (US4 depends on auth cookie)
  - US5 (Phase 7) must complete before Polish (T057 needs active story context)
- **Phase 10 (Polish)**: Depends on all desired user stories complete

### User Story Dependencies

- **US7 (P7)**: Only requires Phase 1 — frontend-only, fully independent
- **US1 (P1)**: Requires Phase 2 — verifies Docker stack
- **US2 (P2)**: Requires US1 (running server)
- **US3 (P3)**: Requires US2 (auth modal wires into banner CTA)
- **US4 (P4)**: Requires US3 (depends on magic link completion event)
- **US5 (P5)**: Requires US3 (stories require authenticated session)
- **US6 (P6)**: Requires US3 (profile requires authenticated session)

### Within Each User Story

- Backend services before routes (T021 before T023)
- Route registration after routes exist (T024 after T023)
- Frontend auth.js before sidebar.js (sidebar checks auth state)
- auto-save.js after app.js story loading (needs active versionId)

---

## Parallel Opportunities

### Phase 2 (Foundational)
```
T007 → T008 → T009 (sequential: DB client → schema → migration runner)
T010 [P] JWT plugin (independent)
T011 [P] CORS plugin (independent)
T012 [P] Rate-limit plugin (independent)
T013 (after T007–T012: registers all plugins)
T014 [P] api-client.js (independent frontend file)
```

### Phase 5 (US3 — Auth)
```
T021 [P] auth-service.js (independent)
T022 [P] email-service.js (independent)
T023 (after T021, T022: route uses both services)
T025 [P] auth modal UI (independent frontend)
T026 [P] auth callback handler (independent frontend)
```

### Phase 7 (US5 — Stories)
```
T032 story-service.js (first)
T033 [P] stories routes (after T032)
T034 [P] versions routes (after T032)
T036 [P] sidebar.js scaffold (independent frontend)
T039 [P] auto-save.js (independent frontend)
```

---

## Implementation Strategy

### MVP First (User Stories 1–3 only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 9: US7 (UI tweaks — quick win, no backend needed)
4. Phase 3: US1 (deployable app)
5. Phase 4: US2 (anonymous experience preserved)
6. Phase 5: US3 (magic link auth)
7. **STOP and VALIDATE**: Full auth flow works. Deploy and test.

### Incremental Delivery

1. Setup + Foundational + US7 → styled app deploys with one command
2. Add US1 → deployable to VPS ✓
3. Add US2 → anonymous experience confirmed ✓
4. Add US3 → users can log in ✓
5. Add US4 → conversion moment is seamless ✓
6. Add US5 → core versioning feature ✓
7. Add US6 → account management complete ✓
8. Polish → security, service worker, validation ✓

---

## Notes

- [P] tasks = different files, no shared state dependencies
- [Story] label maps each task to its user story for traceability
- Commit after each checkpoint — never commit a broken state
- US7 can be shipped at any point (no backend required)
- US4 depends on US3 completing the auth cookie — do not implement out of order
- All user text written to DOM must use `.textContent` — enforced in T054
- No external CDN references permitted — enforced in T055
