# Contract: Session State

**Branch**: `001-basic-story-form` | **Date**: 2026-03-24
**Scope**: What the app writes to and reads from `sessionStorage`

---

## Storage Key

`leanstory_session`

---

## Schema (JSON)

```json
{
  "target":        "string — trimmed, empty string if not filled",
  "targetStatus":  "\"unsure\" | \"needs-review\" | \"confirmed\" | null",
  "problem":       "string — trimmed, empty string if not filled",
  "problemStatus": "\"unsure\" | \"needs-review\" | \"confirmed\" | null",
  "solution":      "string — trimmed, empty string if not filled",
  "solutionStatus":"\"unsure\" | \"needs-review\" | \"confirmed\" | null"
}
```

**Example — partial story with one status set**:
```json
{
  "target": "Product managers at early-stage startups",
  "targetStatus": "confirmed",
  "problem": "",
  "problemStatus": null,
  "solution": "",
  "solutionStatus": null
}
```

---

## Invariants

1. `target`, `problem`, `solution` MUST always be strings (never `null` or `undefined`)
2. A `*Status` field MUST be `null` whenever its paired content field is `""`
3. All string values MUST be pre-trimmed before write — no leading/trailing whitespace stored
4. The object MUST always contain all six keys — no partial writes

---

## Lifecycle

| Event | Action |
|-------|--------|
| App loads, key exists | Deserialise; validate invariants; use as initial form state |
| App loads, key absent | Use default empty Story `{ target:"", targetStatus:null, ... }` |
| User submits form | Serialise current Story; write to `leanstory_session` |
| User activates Edit | Read from `leanstory_session`; pre-fill form |
| Tab / window closes | `sessionStorage` cleared automatically by browser — by design |
| `sessionStorage` unavailable | Fall back to in-memory object; no write attempted; inform user via non-blocking notice |

---

## Error Handling

- `JSON.parse` failure on read → treat as absent key; reset to empty Story; log warning to console
- `QuotaExceededError` on write → fall back to in-memory; no data loss within the current session
- `SecurityError` (private browsing restriction) → in-memory fallback; graceful notice to user
