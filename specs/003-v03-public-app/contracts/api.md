# API Contracts: Lean Storytelling v0.3

**Branch**: `003-v03-public-app`
**Date**: 2026-03-27
**Base URL**: `/api`
**Auth**: httpOnly cookie `ls_session` (JWT). Routes marked 🔒 require a valid session.

---

## Authentication

### POST /api/auth/magic-link

Request a magic link by email. Creates a token and sends an email.

**Request**
```json
{ "email": "user@example.com" }
```

**Responses**
| Status | Meaning |
|---|---|
| 200 | Email sent (or silently accepted if address is invalid — prevents enumeration) |
| 429 | Rate limit hit (5 requests per email per hour) |
| 503 | Email service unavailable |

**200 body**
```json
{ "message": "Check your inbox. The link expires in 15 minutes." }
```

**429 body**
```json
{ "error": "too_many_requests", "message": "Too many attempts. Please wait before requesting a new link." }
```

---

### GET /api/auth/verify?token=TOKEN

Validates a magic link token, creates a User if needed, sets JWT cookie, redirects to app.

**Query params**: `token` (raw 64-char hex string)

**Responses**
| Status | Meaning |
|---|---|
| 302 | Valid token → redirect to `/?auth=success` with `ls_session` cookie set |
| 302 | Invalid/expired/used → redirect to `/?auth_error=expired` or `/?auth_error=used` |

*No JSON body — this endpoint is followed by the browser from the email link.*

---

### POST /api/auth/logout 🔒

Clears the session cookie.

**Request**: no body

**Response**: `200 { "message": "Logged out" }` — cookie cleared

---

## Users

### GET /api/me 🔒

Returns the current authenticated user's profile.

**Response 200**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "job_title": "Product Manager",
  "intent": "Better stakeholder communication",
  "created_at": "2026-03-27T10:00:00Z",
  "onboarded_at": "2026-03-27T10:05:00Z"
}
```

---

### PATCH /api/me 🔒

Update profile fields. Partial update — only provided fields are changed. Also used to mark onboarding complete (`onboarded_at`).

**Request**
```json
{
  "job_title": "Product Manager",
  "intent": "Better stakeholder communication",
  "onboarded": true
}
```

**Response 200**: Updated user object (same shape as GET /api/me)

**Validation errors 400**
```json
{ "error": "validation_error", "fields": { "job_title": "max 100 characters" } }
```

---

### DELETE /api/me 🔒

Permanently delete the current user and all their data (Stories, Versions, Tokens). Clears session cookie.

**Request**
```json
{ "confirm": "DELETE" }
```

**Responses**
| Status | Meaning |
|---|---|
| 200 | Account deleted, cookie cleared |
| 400 | `confirm` field missing or not exactly `"DELETE"` |

---

## Stories

### GET /api/stories 🔒

List all stories for the current user, each with the latest version's metadata.

**Response 200**
```json
[
  {
    "id": "uuid",
    "title": "Investor Pitch",
    "created_at": "2026-03-20T09:00:00Z",
    "latest_version": {
      "version_number": 2,
      "updated_at": "2026-03-27T08:30:00Z"
    }
  }
]
```

---

### POST /api/stories 🔒

Create a new story. Automatically creates version 1 (empty fields unless `fields` are provided for sessionStorage migration).

**Request**
```json
{
  "title": "My first story",
  "fields": {
    "target": "...",
    "problem": "...",
    "solution": "..."
  }
}
```
`fields` is optional — omit for a blank new story.

**Response 201**
```json
{
  "id": "uuid",
  "title": "My first story",
  "created_at": "...",
  "version": { "id": "uuid", "version_number": 1, ... }
}
```

---

### DELETE /api/stories/:storyId 🔒

Delete a story and all its versions.

**Response**: `204 No Content`

**Errors**
| Status | Meaning |
|---|---|
| 404 | Story not found or not owned by current user |

---

## Story Versions

### GET /api/stories/:storyId/versions 🔒

List all versions of a story, sorted by version_number ascending.

**Response 200**
```json
[
  {
    "id": "uuid",
    "version_number": 1,
    "created_at": "...",
    "updated_at": "...",
    "is_latest": false
  },
  {
    "id": "uuid",
    "version_number": 2,
    "created_at": "...",
    "updated_at": "...",
    "is_latest": true
  }
]
```

---

### GET /api/stories/:storyId/versions/:versionId 🔒

Get full content of a specific version.

**Response 200**
```json
{
  "id": "uuid",
  "version_number": 2,
  "is_latest": true,
  "context": "...",
  "target": "...",
  "empathy": "...",
  "problem": "...",
  "consequences": "...",
  "solution": "...",
  "benefits": "...",
  "why": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

---

### PATCH /api/stories/:storyId/versions/:versionId 🔒

Auto-save one or more fields. Only allowed on the latest version.

**Request** (partial — only send changed field)
```json
{ "target": "SaaS startup founders" }
```

**Responses**
| Status | Meaning |
|---|---|
| 200 | `{ "updated_at": "2026-03-27T10:31:05Z" }` |
| 403 | Version is not the latest — read-only |
| 404 | Version not found or not owned by user |

---

### POST /api/stories/:storyId/versions 🔒

Create a new version (+1) as a copy of the current latest version.

**Request**: no body

**Response 201**
```json
{
  "id": "uuid",
  "version_number": 3,
  "created_at": "...",
  "updated_at": "...",
  "is_latest": true,
  ...all fields copied from previous latest...
}
```

---

### POST /api/stories/:storyId/versions/:versionId/fork 🔒

Fork any version as version 1 of a new Story.

**Request**
```json
{ "title": "Investor Pitch (fork)" }
```

**Response 201**
```json
{
  "story": { "id": "uuid", "title": "Investor Pitch (fork)", ... },
  "version": { "id": "uuid", "version_number": 1, ...all fields copied... }
}
```

---

### DELETE /api/stories/:storyId/versions/:versionId 🔒

Delete a specific version. Not allowed if it is the only version of the story.

**Responses**
| Status | Meaning |
|---|---|
| 204 | Deleted |
| 409 | Cannot delete the only version — delete the story instead |
| 404 | Version not found or not owned by user |

---

## Common Error Shape

All error responses follow this shape:

```json
{
  "error": "error_code",
  "message": "Human-readable description"
}
```

Common error codes: `unauthorized`, `forbidden`, `not_found`, `validation_error`, `conflict`, `too_many_requests`, `service_unavailable`.

---

## Auth Error — Unauthenticated Request

Any 🔒 route called without a valid session:

```
401 { "error": "unauthorized", "message": "Authentication required." }
```

Frontend behaviour on 401: show re-authentication modal (magic link flow), preserve current Story Builder state in sessionStorage.
