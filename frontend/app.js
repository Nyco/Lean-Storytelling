/* app.js — Lean Storytelling main controller
   Vanilla ES2020 · Zero dependencies · AGPLv3
   ------------------------------------------- */

'use strict';

/* ============================================================
   SESSION STORAGE
   ============================================================ */

const SESSION_KEY = 'leanstory_session';
let _memoryFallback = null;
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
    return normaliseStory(JSON.parse(raw));
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
    _memoryFallback = Object.assign({}, clean);
    _storageAvailable = false;
    showStorageNotice();
  }
}

function showStorageNotice() {
  const el = document.getElementById('storage-notice');
  if (el) el.hidden = false;
}

/* ============================================================
   STORY SCHEMA
   ============================================================ */

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

const VALID_STATUSES = new Set(['unsure', 'needs-review', 'confirmed', null]);
const CONTENT_FIELDS = ['target', 'problem', 'solution', 'empathy', 'consequences', 'benefits', 'context', 'why'];

function normaliseStory(story) {
  const s = Object.assign(createStory(), story);
  CONTENT_FIELDS.forEach(field => {
    s[field] = (s[field] || '').trim();
    const statusKey = field + 'Status';
    if (!s[field]) {
      s[statusKey] = null;
    } else if (!VALID_STATUSES.has(s[statusKey])) {
      s[statusKey] = null;
    }
  });
  s.storyTitle = (s.storyTitle || '').trim();
  return s;
}

/* ============================================================
   STORY TITLE
   ============================================================ */

const TITLE_POOL = [
  "The Resilient Leader's Turning Point",
  "A Market Waiting for Its Hero",
  "When Pressure Becomes Clarity",
  "The Problem No One Named",
  "Quiet Friction, Loud Consequences",
  "A Solution Built from Empathy",
  "The Moment Everything Changed",
  "Complexity Reduced to One Truth",
  "The Gap Between Vision and Reality",
  "Where the Story Begins",
];

function renderStoryTitle(title) {
  const display = document.getElementById('story-title-display');
  const input = document.getElementById('story-title-input');
  if (!display || !input) return;
  display.textContent = title || '';
  display.hidden = false;
  input.hidden = true;
}

/* ============================================================
   WAVE ROUTER
   ============================================================ */

let _currentWave = 'basic';

function setWave(wave) {
  _currentWave = wave;

  // Hide all form sections, show active
  ['basic', 'detailed', 'full'].forEach(w => {
    const section = document.getElementById(`${w}-form`);
    if (section) section.hidden = (w !== wave);
  });

  // Update active card class and aria-pressed
  document.querySelectorAll('.wave-card').forEach(card => {
    const isActive = card.dataset.wave === wave;
    card.classList.toggle('wave-card--active', isActive);
    card.setAttribute('aria-pressed', String(isActive));
  });

  // Collapse all advice <details>
  document.querySelectorAll('.field-advice').forEach(d => d.removeAttribute('open'));

  // Populate active form from session
  populateForm(loadSession());

  // Re-render right pane and progress
  updateRightPane();
  updateWaveProgress();
}

/* ============================================================
   FORM POPULATION
   ============================================================ */

function populateForm(story) {
  // Basic fields — always present in DOM across all waves
  [
    ['target', 'targetStatus'],
    ['problem', 'problemStatus'],
    ['solution', 'solutionStatus'],
    ['empathy', 'empathyStatus'],
    ['consequences', 'consequencesStatus'],
    ['benefits', 'benefitsStatus'],
    ['context', 'contextStatus'],
    ['why', 'whyStatus'],
  ].forEach(([field, statusField]) => {
    const textarea = document.getElementById(field);
    const select = document.getElementById(`${field}-status`);
    if (textarea) textarea.value = story[field] || '';
    if (select) select.value = story[statusField] || '';
  });
}

/* ============================================================
   SESSION READ-FROM-DOM
   ============================================================ */

function readStoryFromDOM() {
  const s = loadSession();
  CONTENT_FIELDS.forEach(field => {
    const textarea = document.getElementById(field);
    const select = document.getElementById(`${field}-status`);
    if (textarea) s[field] = textarea.value;
    if (select) s[field + 'Status'] = select.value || null;
  });
  return s;
}

/* ============================================================
   RIGHT-PANE PREVIEW
   ============================================================ */

const STATUS_EMOJI = {
  unsure: '🤔',
  'needs-review': '🔄',
  confirmed: '✅',
};

const FIELD_LABELS = {
  target: 'Target',
  problem: 'Problem',
  solution: 'Solution',
  empathy: 'Empathy',
  consequences: 'Consequences',
  benefits: 'Benefits',
  context: 'Context',
  why: 'Why',
};

const WAVE_FIELDS = {
  basic:    ['target', 'problem', 'solution'],
  detailed: ['target', 'empathy', 'problem', 'consequences', 'solution', 'benefits'],
  full:     ['context', 'target', 'empathy', 'problem', 'consequences', 'solution', 'benefits', 'why'],
};

function updateRightPane() {
  const story = loadSession();
  const narrative = document.querySelector('.preview-narrative');
  if (!narrative) return;

  const fields = WAVE_FIELDS[_currentWave];
  const allEmpty = fields.every(f => !story[f]);

  narrative.innerHTML = '';

  if (allEmpty) {
    const p = document.createElement('p');
    p.className = 'preview-placeholder-text';
    p.textContent = 'Your story will appear here — fill the form on the left to get started.';
    narrative.appendChild(p);
    return;
  }

  fields.forEach(field => {
    const text = story[field];
    const status = story[field + 'Status'];

    const block = document.createElement('div');
    block.className = 'preview-block';
    block.id = `preview-${field}`;

    const label = document.createElement('h3');
    label.className = 'preview-label';
    label.textContent = FIELD_LABELS[field];
    block.appendChild(label);

    if (status && STATUS_EMOJI[status]) {
      const badge = document.createElement('span');
      badge.className = 'status-badge';
      badge.textContent = STATUS_EMOJI[status];
      block.appendChild(badge);
    }

    if (text) {
      const content = document.createElement('p');
      content.className = 'preview-content';
      content.textContent = text;  // plain text — no innerHTML — XSS safe
      block.appendChild(content);
    } else {
      const placeholder = document.createElement('p');
      placeholder.className = 'preview-placeholder';
      placeholder.textContent = '—';
      block.appendChild(placeholder);
    }

    narrative.appendChild(block);
  });
}

/* ============================================================
   WAVE PROGRESS BARS
   ============================================================ */

const WAVE_STEP_FIELDS = {
  basic:    ['target', 'problem', 'solution'],
  detailed: ['empathy', 'consequences', 'benefits'],
  full:     ['context', 'why'],
};

function updateWaveProgress() {
  const story = loadSession();

  Object.entries(WAVE_STEP_FIELDS).forEach(([wave, fields]) => {
    fields.forEach(field => {
      const step = document.querySelector(`.wave-step[data-wave="${wave}"][data-field="${field}"]`);
      if (!step) return;

      const filled = Boolean(story[field]);
      const status = story[field + 'Status'];
      const fieldLabel = FIELD_LABELS[field];

      const statusEl = step.querySelector('.wave-step__status');

      step.classList.toggle('wave-step--filled', filled);

      if (statusEl) {
        statusEl.textContent = (filled && status && STATUS_EMOJI[status]) ? STATUS_EMOJI[status] : '';
      }

      if (!filled) {
        step.setAttribute('aria-label', `${fieldLabel}: empty`);
      } else if (status && STATUS_EMOJI[status]) {
        const stateMap = { unsure: 'unsure', 'needs-review': 'needs review', confirmed: 'confirmed' };
        step.setAttribute('aria-label', `${fieldLabel}: filled, ${stateMap[status]}`);
      } else {
        step.setAttribute('aria-label', `${fieldLabel}: filled`);
      }
    });

    // Toggle wave-card--complete when all steps in this wave are filled
    const card = document.querySelector(`.wave-card[data-wave="${wave}"]`);
    if (card) {
      const allFilled = fields.every(f => Boolean(story[f]));
      card.classList.toggle('wave-card--complete', allFilled);
    }
  });
}

/* ============================================================
   INITIALISATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Set up storage
  _storageAvailable = _testStorage();
  if (!_storageAvailable) {
    _memoryFallback = createStory();
    showStorageNotice();
  }

  // Load session; assign random title on first load
  let session = loadSession();
  if (!session.storyTitle) {
    session.storyTitle = TITLE_POOL[Math.floor(Math.random() * TITLE_POOL.length)];
    saveSession(session);
  }
  renderStoryTitle(session.storyTitle);

  // Initialise wave to basic
  setWave('basic');

  // Wire wave card clicks and keyboard activation
  document.querySelectorAll('.wave-card').forEach(card => {
    card.addEventListener('click', () => setWave(card.dataset.wave));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setWave(card.dataset.wave);
      }
    });
  });

  // Wire all textarea input and select change events
  CONTENT_FIELDS.forEach(field => {
    const textarea = document.getElementById(field);
    const select = document.getElementById(`${field}-status`);

    if (textarea) {
      textarea.addEventListener('input', () => {
        saveSession(readStoryFromDOM());
        updateRightPane();
        updateWaveProgress();
      });
    }

    if (select) {
      select.addEventListener('change', () => {
        saveSession(readStoryFromDOM());
        updateRightPane();
        updateWaveProgress();
      });
    }
  });

  // Wire story title edit mode
  const titleDisplay = document.getElementById('story-title-display');
  const titleInput = document.getElementById('story-title-input');

  if (titleDisplay && titleInput) {
    let _previousTitle = session.storyTitle;

    titleDisplay.addEventListener('click', () => {
      _previousTitle = loadSession().storyTitle;
      titleInput.value = _previousTitle;
      titleDisplay.hidden = true;
      titleInput.hidden = false;
      titleInput.focus();
      titleInput.select();
    });

    const commitTitle = () => {
      const newTitle = titleInput.value.trim();
      if (!newTitle) {
        renderStoryTitle(_previousTitle);
        return;
      }
      _previousTitle = newTitle;
      const s = loadSession();
      s.storyTitle = newTitle;
      saveSession(s);
      renderStoryTitle(newTitle);
    };

    titleInput.addEventListener('blur', commitTitle);

    titleInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitTitle();
      } else if (e.key === 'Escape') {
        renderStoryTitle(_previousTitle);
      }
    });
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // SW registration failure is non-fatal
    });
  }

  // Listen for story:open events (from sidebar, migration, etc.)
  document.addEventListener('story:open', async (e) => {
    const { storyId, versionId } = e.detail || {};
    if (storyId && versionId) {
      await loadVersion(storyId, versionId);
    }
  });

  // Listen for story:clear (story deleted)
  document.addEventListener('story:clear', () => {
    clearStoryBuilder();
  });

  // Listen for auth:logout (clear story builder)
  document.addEventListener('auth:logout', () => {
    clearStoryBuilder();
  });

  // Wire fork button on readonly banner
  document.getElementById('btn-fork-from-banner')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('sidebar:fork-active'));
  });

  // Wire Profile page
  document.getElementById('btn-profile')?.addEventListener('click', (e) => {
    e.preventDefault();
    showProfile();
  });

  document.getElementById('btn-profile-save')?.addEventListener('click', saveProfile);

  document.getElementById('btn-delete-account')?.addEventListener('click', () => {
    document.getElementById('delete-account-modal').hidden = false;
    document.getElementById('delete-confirm-input').value = '';
    document.getElementById('btn-delete-confirm').disabled = true;
  });

  document.getElementById('delete-confirm-input')?.addEventListener('input', (e) => {
    document.getElementById('btn-delete-confirm').disabled = e.target.value !== 'DELETE';
  });

  document.getElementById('btn-delete-confirm')?.addEventListener('click', deleteAccount);
  document.getElementById('btn-delete-cancel')?.addEventListener('click', () => {
    document.getElementById('delete-account-modal').hidden = true;
  });
});

/* ============================================================
   VERSION LOADING (T038)
   ============================================================ */

async function loadVersion(storyId, versionId) {
  let version;
  try {
    const resp = await fetch(`/api/stories/${storyId}/versions/${versionId}`, { credentials: 'include' });
    if (!resp.ok) return;
    version = await resp.json();
  } catch (_) {
    return;
  }

  const FIELDS = ['context', 'target', 'empathy', 'problem', 'consequences', 'solution', 'benefits', 'why'];
  FIELDS.forEach(field => {
    const el = document.getElementById(field);
    if (el) el.value = version[field] || '';
  });

  updateRightPane();
  updateWaveProgress();

  // Read-only mode for non-latest versions (T043)
  const readonlyBanner = document.getElementById('readonly-banner');
  if (readonlyBanner) readonlyBanner.hidden = version.is_latest !== false;
  FIELDS.forEach(field => {
    const el = document.getElementById(field);
    if (el) el.disabled = !version.is_latest;
  });

  // Update active story tracking for auto-save
  document.dispatchEvent(new CustomEvent('autosave:setActive', {
    detail: { storyId, versionId }
  }));
}

function clearStoryBuilder() {
  const FIELDS = ['context', 'target', 'empathy', 'problem', 'consequences', 'solution', 'benefits', 'why'];
  FIELDS.forEach(field => {
    const el = document.getElementById(field);
    if (el) { el.value = ''; el.disabled = false; }
  });
  updateRightPane();
  updateWaveProgress();

  const readonlyBanner = document.getElementById('readonly-banner');
  if (readonlyBanner) readonlyBanner.hidden = true;
}

/* ============================================================
   PROFILE (T050)
   ============================================================ */

async function showProfile() {
  const section = document.getElementById('profile-section');
  if (!section) return;
  section.hidden = false;

  try {
    const resp = await fetch('/api/me', { credentials: 'include' });
    if (!resp.ok) return;
    const user = await resp.json();
    const jobTitleInput = document.getElementById('profile-job-title');
    const intentInput = document.getElementById('profile-intent');
    if (jobTitleInput) jobTitleInput.value = user.job_title || '';
    if (intentInput) intentInput.value = user.intent || '';
  } catch (_) {}
}

async function saveProfile() {
  const jobTitle = document.getElementById('profile-job-title')?.value.trim();
  const intent = document.getElementById('profile-intent')?.value.trim();
  try {
    await fetch('/api/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_title: jobTitle || null, intent: intent || null })
    });
    document.getElementById('btn-profile-save').textContent = 'Saved!';
    setTimeout(() => {
      document.getElementById('btn-profile-save').textContent = 'Save changes';
    }, 2000);
  } catch (_) {}
}

async function deleteAccount() {
  try {
    const resp = await fetch('/api/me', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'DELETE' })
    });
    if (resp.ok) {
      document.getElementById('delete-account-modal').hidden = true;
      document.dispatchEvent(new CustomEvent('auth:logout'));
      location.href = '/';
    }
  } catch (_) {}
}
