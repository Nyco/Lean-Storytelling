# Contract: Session State — Full Story Builder v0.2

**Branch**: `002-full-story-builder` | **Date**: 2026-03-25
**Storage mechanism**: `sessionStorage` key `leanstory_session`; in-memory object fallback

---

## Schema (v0.2)

The session object is a single flat JSON object stored under `leanstory_session`.

```typescript
interface StorySession {
  // Basic Story
  target:             string;        // trimmed; "" if empty
  targetStatus:       Status | null;
  problem:            string;
  problemStatus:      Status | null;
  solution:           string;
  solutionStatus:     Status | null;

  // Detailed Story (new in v0.2)
  empathy:            string;
  empathyStatus:      Status | null;
  consequences:       string;
  consequencesStatus: Status | null;
  benefits:           string;
  benefitsStatus:     Status | null;

  // Full Story (new in v0.2)
  context:            string;
  contextStatus:      Status | null;
  why:                string;
  whyStatus:          Status | null;

  // Meta (new in v0.2)
  storyTitle:         string;        // trimmed; "" if cleared by user
}

type Status = 'unsure' | 'needs-review' | 'confirmed';
```

---

## Invariants

These invariants MUST hold after every call to `normaliseStory()` and before every `saveSession()`:

1. **Status nullability**: `*Status` is `null` when its paired content field `=== ''` after trim.
2. **Valid status values**: Every `*Status` is one of `{null, 'unsure', 'needs-review', 'confirmed'}`.
3. **Trimmed strings**: No field contains leading or trailing whitespace.
4. **No extra keys**: The stored object contains exactly the 19 keys above — no more.
5. **Type safety**: All string fields are strings (not `null`, `undefined`, or numbers).

---

## `createStory()` — initial/default object

Returns a fresh Story with all fields empty and all statuses null:

```javascript
function createStory() {
  return {
    target: '',            targetStatus: null,
    problem: '',           problemStatus: null,
    solution: '',          solutionStatus: null,
    empathy: '',           empathyStatus: null,
    consequences: '',      consequencesStatus: null,
    benefits: '',          benefitsStatus: null,
    context: '',           contextStatus: null,
    why: '',               whyStatus: null,
    storyTitle: '',
  };
}
```

---

## `normaliseStory(raw)` — validation + coercion

Input: any object (parsed JSON from sessionStorage, or partial form data).
Output: a Story object satisfying all invariants.

```
1. base = Object.assign(createStory(), raw)       // fill missing keys with defaults
2. For each content field: base[field] = (base[field] || '').trim()
3. For each *Status field:
   a. If paired content field is '': base[*Status] = null
   b. Else if value not in VALID_STATUSES: base[*Status] = null
4. base.storyTitle = (base.storyTitle || '').trim()
5. Return base
```

`VALID_STATUSES = new Set(['unsure', 'needs-review', 'confirmed', null])`

---

## `loadSession()` — read from storage

```
1. If _memoryFallback is set: return Object.assign({}, _memoryFallback)
2. raw = sessionStorage.getItem('leanstory_session')
3. If null: return createStory()  [first load — caller applies storyTitle default]
4. parsed = JSON.parse(raw)       [catch SyntaxError → return createStory()]
5. Return normaliseStory(parsed)
```

---

## `saveSession(story)` — write to storage

```
1. clean = normaliseStory(story)
2. If _memoryFallback !== null: _memoryFallback = Object.assign({}, clean); return
3. sessionStorage.setItem('leanstory_session', JSON.stringify(clean))
   [catch QuotaExceededError → switch to _memoryFallback; showStorageNotice()]
```

---

## Story title initialisation (first load)

Called once in `DOMContentLoaded`, after `loadSession()`:

```
session = loadSession()
if session.storyTitle === '':
    session.storyTitle = TITLE_POOL[Math.floor(Math.random() * TITLE_POOL.length)]
    saveSession(session)
renderStoryTitle(session.storyTitle)
```

`TITLE_POOL` is a hardcoded array of ≥10 strings (see data-model.md).

---

## Backwards compatibility (v0.1 → v0.2)

A session saved by v0.1 (keys: `target`, `problem`, `solution`, `*Status`) will be loaded by v0.2's `normaliseStory()` correctly: `Object.assign(createStory(), parsed)` fills all missing v0.2 fields with their empty defaults. No migration step needed.
