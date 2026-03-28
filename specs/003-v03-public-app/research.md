# Research: Lean Storytelling v0.3 — Public Web App

**Branch**: `003-v03-public-app`
**Date**: 2026-03-27
**Status**: Complete — all unknowns resolved

---

## R-001 — Magic Link Authentication Pattern

**Decision**: Generate a 32-byte cryptographically random token (hex-encoded = 64 chars), store its SHA-256 hash in the DB, embed the raw token in the email link. On verification, hash the incoming token and compare to the stored hash.

**Rationale**: Storing the hash means a DB breach does not expose valid tokens. The raw token in the link is never stored. This is the industry-standard pattern (same as password reset tokens).

**Token lifecycle**:
1. Request: generate token, hash it, store `{ email, token_hash, expires_at: now+15min, used_at: null }`
2. Email: send link with raw token as query param: `https://app.example.com/api/auth/verify?token=RAW_TOKEN`
3. Verify: hash incoming token, query DB, check not expired and not used, mark `used_at = now`
4. Session: issue JWT as httpOnly cookie, redirect to app
5. Cleanup: tokens older than 24h can be deleted (optional background job)

**Alternatives considered**:
- UUID v4 token (not used): lower entropy than 32-byte random
- Email/password (not used): more code, password policy complexity, more surface area for weak credentials

---

## R-002 — JWT Session in httpOnly Cookie

**Decision**: Use `@fastify/jwt` + `@fastify/cookie`. Issue a JWT on successful magic link verification, set as an httpOnly, Secure, SameSite=Lax cookie named `ls_session`. 30-day expiry.

**Rationale**:
- httpOnly prevents JavaScript from reading the token → XSS-safe
- Secure enforces HTTPS-only transmission
- SameSite=Lax allows the cookie to be set when the browser follows the redirect from the email link (cross-site navigation), while blocking CSRF from third-party POST requests
- 30 days: appropriate for user testing phase; reduces re-auth friction

**JWT payload**: `{ sub: user_id, email, iat, exp }`

**Alternatives considered**:
- Bearer token in localStorage: rejected — accessible to JavaScript, XSS risk
- Server-side session (session table): rejected — more DB complexity, JWT is stateless and simpler for this scale

---

## R-003 — Docker Compose Stack

**Decision**: Single `docker-compose.yml` for both local dev and production. Three services: `db` (PostgreSQL 16 Alpine), `backend` (Node.js 20 Alpine), `frontend` (static files served by Fastify itself, no separate nginx needed for v0.3).

**Service definitions**:
```
db:
  image: postgres:16-alpine
  env: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
  volumes: postgres_data:/var/lib/postgresql/data
  healthcheck: pg_isready

backend:
  build: ./backend
  depends_on: db (healthcheck)
  env: DATABASE_URL, JWT_SECRET, RESEND_API_KEY, FRONTEND_URL
  ports: 3000:3000

(frontend is served as static files by the Fastify backend — no separate container)
```

**Rationale**: Serving frontend from Fastify avoids a third container and simplifies CORS (same origin). Acceptable for v0.3 user-testing scale.

**Alternatives considered**:
- nginx for static files: rejected — extra container, extra config, no benefit at this scale
- Separate frontend container: rejected — adds complexity for no gain at v0.3 scale
- Kubernetes: explicitly out of scope per spec

---

## R-004 — Auto-Save Pattern

**Decision**: Debounced PATCH to the current StoryVersion endpoint, 2 seconds after last keystroke. Partial update: only send the changed field. Last-write-wins (no conflict resolution needed for single-user stories).

**Frontend implementation**:
```
input.addEventListener('input', () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => patchField(fieldName, value), 2000)
})
```

**Sync indicator states**:
- Immediately on input: "Saving…"
- On successful PATCH response: "Saved"
- On PATCH failure: "⚠ Not saved" (retry on next input)

**Offline queue**: On network failure, push pending writes to a sessionStorage queue (max 50 items, FIFO, oldest discarded on overflow). Listen for `window.addEventListener('online', flushQueue)` to replay.

**Alternatives considered**:
- Full document save (all fields on every change): rejected — wasteful, creates race conditions on fast typing
- WebSocket-based sync: rejected — overkill for single-user editing at this scale

---

## R-005 — PostgreSQL Setup and Backup

**Decision**: PostgreSQL 16 Alpine in Docker. Daily backup via `pg_dump` run by a cron job on the host (or as a Docker exec command). Backup files stored as `/backups/YYYY-MM-DD.sql.gz`.

**Backup command**:
```bash
docker exec ls-db pg_dump -U $PGUSER $PGDATABASE | gzip > /backups/$(date +%F).sql.gz
```

**Restore command**:
```bash
gunzip -c /backups/YYYY-MM-DD.sql.gz | docker exec -i ls-db psql -U $PGUSER $PGDATABASE
```

**Cron schedule**: `0 3 * * *` (3am daily)

**Retention**: Keep last 30 days (cron to delete older files)

**Alternatives considered**:
- Managed DB (e.g., Neon, Supabase): rejected — adds external dependency, no offline support, cost at scale
- SQLite: considered but rejected — doesn't support concurrent writes well, harder to backup consistently across Docker

---

## R-006 — Resend Email Integration

**Decision**: Use the `resend` npm package. Inject `RESEND_API_KEY` via environment variable. From address: `noreply@[configured domain]`. Single magic link email template, plain HTML.

**Integration pattern**:
```js
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({
  from: process.env.FROM_EMAIL,
  to: email,
  subject: 'Your Lean Storytelling login link',
  html: `<p>Click to log in (expires in 15 minutes):</p><a href="${verifyUrl}">${verifyUrl}</a>`
})
```

**Rate limiting**: Enforce in the route handler using an in-memory store (Map keyed by email, value: array of request timestamps). Purge entries older than 1 hour. For v0.3 user-testing scale, in-memory is sufficient — no Redis needed.

**Alternatives considered**:
- Nodemailer + SMTP: rejected — requires configuring an SMTP server; Resend handles deliverability
- SendGrid: considered — Resend is simpler API and more generous free tier for transactional email

---

## R-007 — Project File Structure

**Decision**: Separate `backend/` and `frontend/` directories at the repo root. Frontend is the existing v0.2 app, reorganized. Backend is a new Node.js/Fastify project.

```
/
├── backend/
│   ├── src/
│   │   ├── routes/         # auth.js, users.js, stories.js, versions.js
│   │   ├── services/       # auth-service.js, story-service.js, email-service.js
│   │   ├── db/             # client.js, migrations/
│   │   └── plugins/        # jwt.js, cors.js, rate-limit.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── fonts/
│   └── service-worker.js
├── docker-compose.yml
├── .env.example
└── docs/
    └── deployment.md
```

**Rationale**: Clean separation of concerns; each part is independently understandable. Frontend served as static files by Fastify's `@fastify/static` plugin.
