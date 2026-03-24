/* app.js — Lean Storytelling main controller
   Vanilla ES2020 · Zero dependencies · AGPLv3
   ------------------------------------------- */

'use strict';

/* ============================================================
   PHASE 2 — FOUNDATIONAL
   ============================================================ */

/* --- Session Storage Wrapper ------------------------------ */

const SESSION_KEY = 'leanstory_session';
let _memoryFallback = null;  // in-memory store when sessionStorage unavailable
let _storageAvailable = true;

function _testStorage() {
  try {
    sessionStorage.setItem('__test__', '1');
    sessionStorage.removeItem('__test__');
    return true;
  } catch (_) {
    return false;
  }
}

function loadSession() {
  if (_memoryFallback) return Object.assign({}, _memoryFallback);

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return createStory();
    const parsed = JSON.parse(raw);
    return normaliseStory(parsed);
  } catch (_) {
    return createStory();
  }
}

function saveSession(story) {
  const clean = normaliseStory(story);
  if (_memoryFallback !== null) {
    _memoryFallback = Object.assign({}, clean);
    return;
  }
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(clean));
  } catch (_) {
    // quota or security error — fall back to memory
    _memoryFallback = Object.assign({}, clean);
    _storageAvailable = false;
    showStorageNotice();
  }
}

function showStorageNotice() {
  const el = document.getElementById('storage-notice');
  if (el) el.hidden = false;
}

/* --- Story Object Factory --------------------------------- */

function createStory() {
  return {
    target: '',        targetStatus: null,
    problem: '',       problemStatus: null,
    solution: '',      solutionStatus: null,
  };
}

/**
 * Trims all string fields.
 * Resets *Status to null if the paired content field is empty.
 */
function normaliseStory(story) {
  const s = Object.assign(createStory(), story);

  s.target  = (s.target  || '').trim();
  s.problem = (s.problem || '').trim();
  s.solution = (s.solution || '').trim();

  if (!s.target)   s.targetStatus  = null;
  if (!s.problem)  s.problemStatus = null;
  if (!s.solution) s.solutionStatus = null;

  // ensure valid status values only
  const VALID = new Set(['unsure', 'needs-review', 'confirmed', null]);
  if (!VALID.has(s.targetStatus))   s.targetStatus   = null;
  if (!VALID.has(s.problemStatus))  s.problemStatus  = null;
  if (!VALID.has(s.solutionStatus)) s.solutionStatus = null;

  return s;
}

/* --- View Router ------------------------------------------ */

let _currentView = 'form';
let _editMode = false;

function showView(view) {
  const formEl  = document.getElementById('form-view');
  const storyEl = document.getElementById('story-view');
  formEl.hidden  = (view !== 'form');
  storyEl.hidden = (view !== 'story');
  _currentView = view;
}


/* ============================================================
   PHASE 3 — USER STORY 1: Fill the Basic Story
   ============================================================ */

/* --- Form population -------------------------------------- */

function populateForm(story) {
  document.getElementById('target').value  = story.target  || '';
  document.getElementById('problem').value = story.problem || '';
  document.getElementById('solution').value = story.solution || '';

  // US2: also populate status selectors
  document.getElementById('target-status').value  = story.targetStatus  || '';
  document.getElementById('problem-status').value = story.problemStatus || '';
  document.getElementById('solution-status').value = story.solutionStatus || '';
}

/* --- Empty-state guard ------------------------------------ */

function showEmptyHint(msg) {
  const el = document.getElementById('empty-hint');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}

function clearEmptyHint() {
  const el = document.getElementById('empty-hint');
  if (el) { el.hidden = true; el.textContent = ''; }
}

/* --- Render story view ------------------------------------ */

const STATUS_LABELS = {
  'unsure':       'Unsure / Assumption',
  'needs-review': 'Needs review',
  'confirmed':    'Confirmed / Validated',
};

function renderField(sectionId, text, status) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const header = section.querySelector('.field-header') || section.querySelector('h2').parentElement;
  const h2 = section.querySelector('h2');
  const contentEl = section.querySelector('.field-content');

  // render content
  if (text) {
    contentEl.textContent = text;   // plain text only — no innerHTML — eliminates XSS
  } else {
    contentEl.innerHTML = '<em class="empty-placeholder">not yet filled</em>';
  }

  // render status badge (US2)
  const existingBadge = section.querySelector('.status-badge');
  if (existingBadge) existingBadge.remove();

  if (status && STATUS_LABELS[status]) {
    const badge = document.createElement('span');
    badge.className = `status-badge badge-${status}`;
    badge.textContent = STATUS_LABELS[status];
    // insert badge after h2 inside .field-header wrapper
    const fieldHeader = section.querySelector('.field-header');
    if (fieldHeader) {
      fieldHeader.appendChild(badge);
    } else {
      h2.insertAdjacentElement('afterend', badge);
    }
  }
}

function renderStoryView(story) {
  renderField('view-target',   story.target,   story.targetStatus);
  renderField('view-problem',  story.problem,  story.problemStatus);
  renderField('view-solution', story.solution, story.solutionStatus);

  // US3: consistency observations
  renderConsistency(story);

  // US5: coaching prompts
  renderCoaching(story);

  showView('story');
}

/* --- Submit handler --------------------------------------- */

function handleSubmit(event) {
  event.preventDefault();

  const story = normaliseStory({
    target:         document.getElementById('target').value,
    targetStatus:   document.getElementById('target-status').value || null,
    problem:        document.getElementById('problem').value,
    problemStatus:  document.getElementById('problem-status').value || null,
    solution:       document.getElementById('solution').value,
    solutionStatus: document.getElementById('solution-status').value || null,
  });

  // Empty-state guard
  if (!story.target && !story.problem && !story.solution) {
    showEmptyHint('Fill at least one field to build your story.');
    return;
  }

  saveSession(story);
  clearEmptyHint();

  if (_editMode) exitEditMode(true, story);
  else renderStoryView(story);
}


/* ============================================================
   PHASE 5 — USER STORY 3: Consistency Observations
   ============================================================ */

function renderConsistency(story) {
  const list = document.getElementById('consistency-list');
  if (!list) return;
  list.innerHTML = '';

  const observations = getObservations(story);  // from consistency.js

  observations.forEach(obs => {
    const li = document.createElement('li');
    li.className = `obs-${obs.type}`;

    const label = document.createElement('strong');
    label.textContent = obs.pair === 'target-problem' ? 'Target → Problem' : 'Problem → Solution';

    const msg = document.createElement('span');
    msg.textContent = obs.message.replace(/^[^:]+:\s*/, ''); // strip the pair prefix already in label

    li.appendChild(label);
    li.appendChild(msg);
    list.appendChild(li);
  });
}


/* ============================================================
   PHASE 6 — USER STORY 4: Review & Edit
   ============================================================ */

function enterEditMode() {
  _editMode = true;
  populateForm(loadSession());

  const cancelBtn = document.getElementById('cancel-btn');
  const submitBtn = document.getElementById('submit-btn');
  if (cancelBtn) cancelBtn.hidden = false;
  if (submitBtn) submitBtn.textContent = 'Update story';

  showView('form');
}

function exitEditMode(save, story) {
  _editMode = false;

  const cancelBtn = document.getElementById('cancel-btn');
  const submitBtn = document.getElementById('submit-btn');
  if (cancelBtn) cancelBtn.hidden = true;
  if (submitBtn) submitBtn.textContent = 'View my story';

  if (save && story) {
    renderStoryView(story);
  } else {
    renderStoryView(loadSession());
  }
}

function handleCancel() {
  exitEditMode(false, null);
}


/* ============================================================
   PHASE 7 — USER STORY 5: Coaching Prompts
   ============================================================ */

/**
 * Fisher-Yates shuffle (in-place). Uses content length as a simple
 * deterministic seed so prompts stay consistent within a session
 * for the same content, but vary across different content.
 */
function shuffleArray(arr, seed) {
  const a = arr.slice();
  let s = seed % (a.length || 1);
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectPrompts(story) {
  const result = {};
  const fields = ['target', 'problem', 'solution'];

  fields.forEach(field => {
    const content = story[field];
    if (!content) { result[field] = []; return; }

    const statusKey = story[`${field}Status`] || 'default';
    const bucket = (PROMPTS[field][statusKey] && PROMPTS[field][statusKey].length)
      ? PROMPTS[field][statusKey]
      : PROMPTS[field].default;

    const shuffled = shuffleArray(bucket, content.length);
    result[field] = shuffled.slice(0, 3);
  });

  return result;
}

function renderCoaching(story) {
  const fields = ['target', 'problem', 'solution'];
  const selected = selectPrompts(story);

  fields.forEach(field => {
    const container = document.getElementById(`coaching-${field}`);
    if (!container) return;

    const prompts = selected[field];
    if (!prompts || prompts.length === 0) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }

    const label = field.charAt(0).toUpperCase() + field.slice(1);
    const ul = document.createElement('ul');
    prompts.forEach(text => {
      const li = document.createElement('li');
      li.className = 'prompt-item';
      li.textContent = text;  // plain text — no innerHTML
      ul.appendChild(li);
    });

    container.innerHTML = '';
    const h3 = document.createElement('h3');
    h3.textContent = label;
    container.appendChild(h3);
    container.appendChild(ul);
    container.hidden = false;
  });
}


/* ============================================================
   INITIALISATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Set up storage (detect availability)
  _storageAvailable = _testStorage();
  if (!_storageAvailable) {
    _memoryFallback = createStory();
    showStorageNotice();
  }

  // Pre-fill form from session (handles page reload within session)
  populateForm(loadSession());

  // Wire up form submit
  const form = document.getElementById('story-form');
  if (form) form.addEventListener('submit', handleSubmit);

  // Clear empty-hint when user starts typing
  ['target', 'problem', 'solution'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', clearEmptyHint);
  });

  // Wire up Edit button
  const editBtn = document.getElementById('edit-btn');
  if (editBtn) editBtn.addEventListener('click', enterEditMode);

  // Wire up Cancel button
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // SW registration failure is non-fatal — app still works online
    });
  }

  // Start in form view
  showView('form');
});
