/* auto-save.js — Debounced field auto-save + offline queue
   Lean Storytelling v0.3 · ES module
*/

import { api } from './api-client.js'

const DEBOUNCE_MS = 2000
const QUEUE_KEY = 'leanstory_autosave_queue'
const QUEUE_MAX = 50
const STORY_FIELDS = ['context', 'target', 'empathy', 'problem', 'consequences', 'solution', 'benefits', 'why']

let _activeStoryId = null
let _activeVersionId = null
const _timers = {}
const _dirtyFields = new Set()

/* ============================================================
   DIRTY STATE
   ============================================================ */

export function getIsDirty() {
  return _dirtyFields.size > 0
}

function _markDirty(field) {
  _dirtyFields.add(field)
  document.dispatchEvent(new CustomEvent('autosave:dirtychange', { detail: { dirty: true } }))
}

function _markClean(field) {
  _dirtyFields.delete(field)
  if (_dirtyFields.size === 0) {
    document.dispatchEvent(new CustomEvent('autosave:dirtychange', { detail: { dirty: false } }))
  }
}

export async function manualSave() {
  if (!_activeStoryId || !_activeVersionId || !getIsDirty()) return
  const fields = {}
  for (const fieldName of STORY_FIELDS) {
    const el = document.getElementById(fieldName)
    if (el) fields[fieldName] = el.value
  }
  _setIndicator('Saving…')
  try {
    await api.patch(`/stories/${_activeStoryId}/versions/${_activeVersionId}`, fields)
    _dirtyFields.clear()
    document.dispatchEvent(new CustomEvent('autosave:dirtychange', { detail: { dirty: false } }))
    _setIndicator('Saved')
    // Cancel any pending auto-save timers since we just saved everything
    for (const key of Object.keys(_timers)) {
      clearTimeout(_timers[key])
      delete _timers[key]
    }
  } catch (_) {
    _setIndicator('⚠ Not saved')
  }
}

/* ============================================================
   ACTIVE STORY TRACKING
   ============================================================ */

export function setActiveStory(storyId, versionId) {
  _activeStoryId = storyId
  _activeVersionId = versionId
}

export function clearActiveStory() {
  _activeStoryId = null
  _activeVersionId = null
}

/* ============================================================
   SYNC INDICATOR
   ============================================================ */

function _setIndicator(text) {
  const el = document.getElementById('sync-indicator')
  if (!el) return
  el.hidden = _activeStoryId === null
  el.textContent = text
}

/* ============================================================
   AUTO-SAVE: ATTACH LISTENERS
   ============================================================ */

export function attachAutoSave() {
  for (const fieldName of STORY_FIELDS) {
    const el = document.getElementById(fieldName)
    if (!el) continue

    el.addEventListener('input', () => {
      _markDirty(fieldName)
      if (!_activeStoryId || !_activeVersionId) return

      clearTimeout(_timers[fieldName])
      _setIndicator('Saving…')

      const storyId = _activeStoryId
      const versionId = _activeVersionId
      const value = el.value

      _timers[fieldName] = setTimeout(() => _save(storyId, versionId, fieldName, value), DEBOUNCE_MS)
    })
  }
}

async function _save(storyId, versionId, field, value) {
  try {
    await api.patch(`/stories/${storyId}/versions/${versionId}`, { [field]: value })
    _markClean(field)
    _setIndicator('Saved')
  } catch (_) {
    _setIndicator('⚠ Not saved')
    _enqueue(storyId, versionId, field, value)
  }
}

/* ============================================================
   OFFLINE QUEUE
   ============================================================ */

function _enqueue(storyId, versionId, field, value) {
  let queue = _readQueue()
  queue.push({ storyId, versionId, field, value })
  if (queue.length > QUEUE_MAX) {
    queue = queue.slice(queue.length - QUEUE_MAX)  // keep newest QUEUE_MAX
  }
  _writeQueue(queue)
}

function _readQueue() {
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (_) {
    return []
  }
}

function _writeQueue(queue) {
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch (_) {}
}

async function _flushQueue() {
  const queue = _readQueue()
  if (queue.length === 0) return

  // Clear queue before replaying (avoid duplicate replays)
  _writeQueue([])

  for (const item of queue) {
    try {
      await api.patch(`/stories/${item.storyId}/versions/${item.versionId}`, { [item.field]: item.value })
    } catch (_) {
      // Silently discard — don't re-enqueue to avoid infinite loops
    }
  }
}

/* ============================================================
   INIT
   ============================================================ */

// Flush queue on reconnect
window.addEventListener('online', _flushQueue)

// Listen for story:open and autosave:setActive events to start tracking
document.addEventListener('story:open', (e) => {
  const { storyId, versionId } = e.detail || {}
  setActiveStory(storyId, versionId)
})

document.addEventListener('autosave:setActive', (e) => {
  const { storyId, versionId } = e.detail || {}
  setActiveStory(storyId, versionId)
})

// Clear on auth:logout
document.addEventListener('auth:logout', () => {
  clearActiveStory()
  _setIndicator('')
})

// Attach listeners on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _init)
} else {
  _init()
}

function _init() {
  attachAutoSave()

  // Wire Save button
  const btnSave = document.getElementById('btn-save')
  if (btnSave) {
    btnSave.addEventListener('click', manualSave)
  }

  // Sync Save button disabled state with dirty flag (only active for authenticated users with a story open)
  document.addEventListener('autosave:dirtychange', (e) => {
    const btn = document.getElementById('btn-save')
    if (btn) btn.disabled = !e.detail.dirty || !_activeStoryId
  })
}
