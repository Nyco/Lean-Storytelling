# Quickstart: Local Development & User Testing

**Branch**: `001-basic-story-form` | **Date**: 2026-03-24
**Audience**: Developer running the app locally; facilitator running a user test session

---

## Prerequisites

- A modern browser (Chrome, Firefox, Safari, or Edge)
- Python 3 **or** Node.js (for local HTTP server — required for service worker / PWA features)
- The repository cloned locally

> **Why a local server?** Service workers require HTTPS or `localhost`. Opening `index.html`
> directly via `file://` will work for basic form/story functionality but the service worker
> will not register and offline mode will not activate.

---

## Run Locally

### Option A — Python (no install needed on macOS/Linux)

```bash
cd /path/to/Lean-Storytelling
python3 -m http.server 8080
```

Open: `http://localhost:8080`

### Option B — Node.js (npx, no global install)

```bash
cd /path/to/Lean-Storytelling
npx serve . -p 8080
```

Open: `http://localhost:8080`

### Option C — VS Code Live Server extension

Right-click `index.html` → **Open with Live Server**. The extension serves from `localhost`
automatically.

---

## Verify Core Behaviours After First Load

Open browser DevTools and check:

| Check | Where to look | Expected |
|-------|--------------|----------|
| No CSP violations | Console tab | No red CSP error messages |
| No external requests | Network tab | All requests to `localhost` only |
| sessionStorage key absent on first load | Application → Session Storage | `leanstory_session` not present |
| Service worker registered | Application → Service Workers | Status: "activated and running" |

---

## Verify Offline Mode

1. Load the app once (all assets cached by service worker)
2. In DevTools → Network tab → select **Offline** throttle
3. Reload the page
4. Expected: app loads fully, form is usable

---

## Verify Session Data Cleared on Close

1. Fill in all three fields and submit
2. Check DevTools → Application → Session Storage → `leanstory_session` is present
3. Close the tab
4. Open a new tab to `http://localhost:8080`
5. Expected: form is empty, `leanstory_session` key is absent

---

## QA Checklist — Acceptance Scenarios

Run through all 23 acceptance scenarios from the spec. Tick each one manually.

### User Story 1 — Fill the Basic Story

- [ ] Labels and hints are self-explanatory without external help
- [ ] Submit with all 3 fields filled → assembled story displayed in full
- [ ] Submit with 1 or 2 fields filled → story shows what exists; empty fields indicated
- [ ] Submit with all fields empty → inline prompt appears; no navigation to story view
- [ ] After submitting, clicking Edit → form pre-filled with current session values

### User Story 2 — Field Confidence Status

- [ ] Selecting a status on a filled field → badge visible in form and story view
- [ ] Field with no status → no badge shown in story view
- [ ] Changing status from Confirmed to Needs review → updated everywhere after resubmit
- [ ] Status badges visible in story view → narrative readability not disrupted

### User Story 3 — View, Validate & Check Consistency

- [ ] All 3 fields filled → story displays in Target → Problem → Solution order
- [ ] 2 filled fields → at least one consistency observation per filled pair
- [ ] Problem not connected to Target (different topic) → disconnect observation flagged
- [ ] Only 1 field filled → observations acknowledge incomplete story (no false flags)

### User Story 4 — Review & Edit

- [ ] Edit button from story view → form opens pre-filled with content and statuses
- [ ] Modify a field, resubmit → updated story and refreshed observations displayed
- [ ] Cancel from edit mode → previous story view restored unchanged

### User Story 5 — Coaching Questions

- [ ] At least 1 prompt per filled field after submission
- [ ] Field marked "Unsure" → prompts lean toward validation
- [ ] Field marked "Confirmed" → prompts lean toward deepening
- [ ] All prompts are open-ended (no yes/no questions)
- [ ] Edit and resubmit → coaching section refreshes

### Edge Cases

- [ ] Submit with whitespace-only field → treated as empty
- [ ] Very long field text → UI remains readable, no layout overflow
- [ ] Field has status but content is cleared → status reset to none

---

## Lighthouse Audit

Run Lighthouse in Chrome DevTools (or `npx lighthouse http://localhost:8080 --view`):

| Category | Minimum Target |
|----------|---------------|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| PWA | ≥ 90 |

---

## Accessibility Scan (axe)

1. Install the [axe DevTools browser extension](https://www.deque.com/axe/browser-extensions/)
2. Open the app → run axe scan on the **form view**
3. Navigate to story view → run axe scan again
4. Expected: zero critical or serious violations

---

## User Test Session Guide

**Goal**: Validate that a first-time user can complete the full iteration loop without help.

**Setup**:
- Facilitator runs the app locally (Option A or B above)
- Participant uses their own device or the facilitator's machine
- No instructions given beyond "This is a storytelling tool — try it out"

**Observe and note**:

| Observation | Success Signal |
|-------------|---------------|
| Does the user understand the three fields without reading external docs? | SC-001: yes within 3 min |
| Does the user discover the status tags? | SC-006: unprompted interaction |
| Does the user read the consistency observations? | Visible engagement |
| Does the user engage with the coaching questions? | SC-004: scrolls to / reads section |
| Does the user complete the edit loop? | SC-005: fill → view → edit → resubmit |

**Post-session question (one question only)**:
> "Did the coaching questions help you think of something new about your story?"

Success signal for SC-002: affirmative answer.

**Duration**: 15–20 minutes per participant is sufficient to cover the full loop.

---

## Deploy to GitHub Pages

```bash
git checkout master
git merge 001-basic-story-form
git push origin master
```

GitHub Pages serves from the `master` branch root (configured in `_config.yml`).
The app will be live at `https://nyco.github.io/Lean-Storytelling/` after the Pages build
completes (typically under 1 minute).

> **Note**: GitHub Pages serves over HTTPS, so the service worker registers and offline mode
> works in production exactly as it does on `localhost`.
