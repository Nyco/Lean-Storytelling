/* sidebar.js — Stories sidebar: accordion tree, CRUD operations
   Lean Storytelling v0.3 · ES module
*/

import { api } from './api-client.js'

const STORY_FIELDS = ['context', 'target', 'empathy', 'problem', 'consequences', 'solution', 'benefits', 'why']

let _collapsed = false

/* ============================================================
   INIT
   ============================================================ */

export async function loadSidebar() {
  const sidebar = document.getElementById('sidebar')
  if (!sidebar) return
  sidebar.hidden = false

  try {
    const stories = await api.get('/stories')
    _renderSidebar(stories)
  } catch (_) {
    _renderSidebarError()
  }
}

function _renderSidebar(stories) {
  const list = document.getElementById('sidebar-list')
  if (!list) return

  list.innerHTML = ''

  if (!stories || stories.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'sidebar-empty'
    empty.textContent = 'No stories yet. Click + New Story to get started.'
    list.appendChild(empty)
    return
  }

  for (const story of stories) {
    list.appendChild(_buildStoryItem(story))
  }
}

function _renderSidebarError() {
  const list = document.getElementById('sidebar-list')
  if (!list) return
  list.innerHTML = ''
  const p = document.createElement('p')
  p.className = 'sidebar-empty'
  p.textContent = 'Failed to load stories.'
  list.appendChild(p)
}

/* ============================================================
   STORY ITEM
   ============================================================ */

function _buildStoryItem(story) {
  const wrap = document.createElement('div')
  wrap.className = 'sidebar-story'
  wrap.dataset.storyId = story.id

  // Story row
  const row = document.createElement('div')
  row.className = 'sidebar-story-row'

  const arrow = document.createElement('span')
  arrow.className = 'sidebar-story-arrow'
  arrow.textContent = '▶'

  const titleEl = document.createElement('span')
  titleEl.className = 'sidebar-story-title'
  titleEl.textContent = story.title  // safe: textContent

  const meta = document.createElement('span')
  meta.className = 'sidebar-story-meta'
  meta.textContent = `v${story.latest_version?.version_number ?? 1}  ${_relativeTime(story.latest_version?.updated_at || story.created_at)}`

  row.appendChild(arrow)
  row.appendChild(titleEl)
  row.appendChild(meta)

  // Versions container (collapsed by default)
  const versionsWrap = document.createElement('div')
  versionsWrap.className = 'sidebar-versions'
  versionsWrap.hidden = true

  row.addEventListener('click', async () => {
    const expanded = !wrap.classList.contains('sidebar-story--expanded')
    wrap.classList.toggle('sidebar-story--expanded', expanded)
    arrow.textContent = expanded ? '▼' : '▶'
    versionsWrap.hidden = !expanded

    if (expanded && versionsWrap.children.length === 0) {
      await _loadVersions(story.id, versionsWrap)
    }
  })

  wrap.appendChild(row)
  wrap.appendChild(versionsWrap)

  return wrap
}

async function _loadVersions(storyId, container) {
  let versions
  try {
    versions = await api.get(`/stories/${storyId}/versions`)
  } catch (_) {
    return
  }

  container.innerHTML = ''

  // Versions list (newest first for display)
  for (const v of [...versions].reverse()) {
    container.appendChild(_buildVersionRow(storyId, v))
  }

  // Footer: + New version / Delete story
  const footer = document.createElement('div')
  footer.className = 'sidebar-footer'

  const newVersionBtn = document.createElement('button')
  newVersionBtn.className = 'btn btn--ghost btn--sm'
  newVersionBtn.textContent = '+ New version'
  newVersionBtn.addEventListener('click', async (e) => {
    e.stopPropagation()
    await _createNewVersion(storyId)
  })

  const deleteStoryBtn = document.createElement('button')
  deleteStoryBtn.className = 'btn btn--ghost btn--sm'
  deleteStoryBtn.style.color = '#dc2626'
  deleteStoryBtn.textContent = 'Delete story'
  deleteStoryBtn.addEventListener('click', async (e) => {
    e.stopPropagation()
    await _deleteStory(storyId)
  })

  footer.appendChild(newVersionBtn)
  footer.appendChild(deleteStoryBtn)
  container.appendChild(footer)
}

function _buildVersionRow(storyId, version) {
  const row = document.createElement('div')
  row.className = 'sidebar-version-row'

  const label = document.createElement('span')
  label.className = 'sidebar-version-label'
  label.textContent = `v${version.version_number}  ${_relativeTime(version.updated_at)}`

  const actions = document.createElement('span')
  actions.className = 'sidebar-version-actions'

  const editBtn = document.createElement('button')
  editBtn.className = 'sidebar-version-btn'
  editBtn.textContent = 'Edit'
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    document.dispatchEvent(new CustomEvent('story:open', {
      detail: { storyId, versionId: version.id }
    }))
  })

  const forkBtn = document.createElement('button')
  forkBtn.className = 'sidebar-version-btn'
  forkBtn.textContent = 'Fork'
  forkBtn.addEventListener('click', async (e) => {
    e.stopPropagation()
    await _forkVersion(storyId, version.id)
  })

  const delBtn = document.createElement('button')
  delBtn.className = 'sidebar-version-btn sidebar-version-btn--danger'
  delBtn.textContent = 'Del'
  delBtn.addEventListener('click', async (e) => {
    e.stopPropagation()
    await _deleteVersion(storyId, version.id)
  })

  actions.appendChild(editBtn)
  actions.appendChild(forkBtn)
  actions.appendChild(delBtn)

  row.appendChild(label)
  row.appendChild(actions)

  return row
}

/* ============================================================
   OPERATIONS
   ============================================================ */

async function _createNewStory() {
  const title = await _promptTitle('Name your story')
  if (!title) return

  try {
    const result = await api.post('/stories', { title })
    await loadSidebar()
    document.dispatchEvent(new CustomEvent('story:open', {
      detail: { storyId: result.id, versionId: result.version.id }
    }))
  } catch (_) {}
}

async function _createNewVersion(storyId) {
  try {
    const version = await api.post(`/stories/${storyId}/versions`)
    await loadSidebar()
    document.dispatchEvent(new CustomEvent('story:open', {
      detail: { storyId, versionId: version.id }
    }))
  } catch (_) {}
}

async function _forkVersion(storyId, versionId) {
  const title = await _promptTitle('Name the forked story')
  if (!title) return

  try {
    const result = await api.post(`/stories/${storyId}/versions/${versionId}/fork`, { title })
    await loadSidebar()
    document.dispatchEvent(new CustomEvent('story:open', {
      detail: { storyId: result.id, versionId: result.version.id }
    }))
  } catch (_) {}
}

async function _deleteVersion(storyId, versionId) {
  const confirmed = await _confirm('Delete this version? This cannot be undone.')
  if (!confirmed) return

  try {
    await api.delete(`/stories/${storyId}/versions/${versionId}`)
    await loadSidebar()
  } catch (err) {
    if (err?.status === 409) {
      _showConfirmModal('Cannot delete', 'Delete the story instead to remove the last version.', null)
    }
  }
}

async function _deleteStory(storyId) {
  const confirmed = await _confirm('Delete this story and all its versions? This cannot be undone.')
  if (!confirmed) return

  try {
    await api.delete(`/stories/${storyId}`)
    await loadSidebar()
    document.dispatchEvent(new CustomEvent('story:clear'))
  } catch (_) {}
}

/* ============================================================
   SIDEBAR TOGGLE
   ============================================================ */

function _toggleSidebar() {
  _collapsed = !_collapsed
  const sidebar = document.getElementById('sidebar')
  const toggle = document.getElementById('sidebar-toggle')
  if (sidebar) sidebar.classList.toggle('sidebar--collapsed', _collapsed)
  if (toggle) toggle.textContent = _collapsed ? '›' : '‹'
  document.body.classList.toggle('sidebar-open', !_collapsed)
}

/* ============================================================
   MODAL HELPERS
   ============================================================ */

function _promptTitle(heading) {
  return new Promise((resolve) => {
    const modal = document.getElementById('title-modal')
    const titleEl = document.getElementById('title-modal-title')
    const input = document.getElementById('title-modal-input')
    const form = document.getElementById('title-form')
    if (!modal || !input || !form) { resolve(null); return }

    if (titleEl) titleEl.textContent = heading  // safe

    input.value = ''
    modal.hidden = false
    input.focus()

    function cleanup() {
      modal.hidden = true
      form.removeEventListener('submit', onSubmit)
    }

    function onSubmit(e) {
      e.preventDefault()
      const val = input.value.trim()
      cleanup()
      resolve(val || null)
    }

    form.addEventListener('submit', onSubmit)
  })
}

function _confirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal')
    const bodyEl = document.getElementById('confirm-modal-body')
    const yesBtn = document.getElementById('btn-confirm-yes')
    const noBtn = document.getElementById('btn-confirm-no')

    if (!modal) { resolve(false); return }
    if (bodyEl) bodyEl.textContent = message  // safe

    modal.hidden = false

    function cleanup() {
      modal.hidden = true
      yesBtn?.removeEventListener('click', onYes)
      noBtn?.removeEventListener('click', onNo)
    }

    function onYes() { cleanup(); resolve(true) }
    function onNo() { cleanup(); resolve(false) }

    yesBtn?.addEventListener('click', onYes)
    noBtn?.addEventListener('click', onNo)
  })
}

function _showConfirmModal(title, message, onYes) {
  const modal = document.getElementById('confirm-modal')
  const titleEl = document.getElementById('confirm-modal-title')
  const bodyEl = document.getElementById('confirm-modal-body')
  const yesBtn = document.getElementById('btn-confirm-yes')
  const noBtn = document.getElementById('btn-confirm-no')

  if (!modal) return
  if (titleEl) titleEl.textContent = title  // safe
  if (bodyEl) bodyEl.textContent = message  // safe
  if (yesBtn) yesBtn.hidden = onYes === null

  modal.hidden = false

  if (noBtn) {
    noBtn.onclick = () => { modal.hidden = true }
  }
  if (yesBtn && onYes) {
    yesBtn.onclick = () => { modal.hidden = true; onYes() }
  }
}

/* ============================================================
   UTILS
   ============================================================ */

function _relativeTime(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'yesterday'
  if (day < 7) return `${day} days ago`
  return new Date(isoStr).toLocaleDateString()
}

/* ============================================================
   INIT
   ============================================================ */

// Wire "+ New Story" button
document.getElementById('btn-new-story')?.addEventListener('click', _createNewStory)

// Wire sidebar toggle
document.getElementById('sidebar-toggle')?.addEventListener('click', _toggleSidebar)

// Load sidebar on auth login
document.addEventListener('auth:login', () => loadSidebar())

// Reload on auth logout
document.addEventListener('auth:logout', () => {
  const sidebar = document.getElementById('sidebar')
  if (sidebar) sidebar.hidden = true
})
