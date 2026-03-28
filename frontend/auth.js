/* auth.js — Authentication, session state, and sessionStorage migration
   Lean Storytelling v0.3 · ES module · no external dependencies
*/

import { api, ApiError } from './api-client.js'

/* ============================================================
   SESSION STATE
   ============================================================ */

let _currentUser = null  // null = anonymous; object = authenticated

export function isAuthenticated() {
  return _currentUser !== null
}

export function getCurrentUser() {
  return _currentUser
}

/* ============================================================
   UI STATE TOGGLE
   ============================================================ */

function _applyAuthUI() {
  const authed = isAuthenticated()

  // Top bar
  const anonNav = document.querySelector('.auth-nav--anon')
  const authedNav = document.querySelector('.auth-nav--authed')
  if (anonNav) anonNav.hidden = authed
  if (authedNav) authedNav.hidden = !authed

  // Save button: disabled when not authenticated
  const btnSave = document.getElementById('btn-save')
  if (btnSave && !authed) btnSave.disabled = true

  // Sidebar
  const sidebar = document.getElementById('sidebar')
  if (sidebar) sidebar.hidden = !authed

  // Sync indicator
  const syncIndicator = document.getElementById('sync-indicator')
  if (syncIndicator) syncIndicator.hidden = !authed
}

/* ============================================================
   AUTH MODAL
   ============================================================ */

export function openAuthModal() {
  const modal = document.getElementById('auth-modal')
  if (!modal) return
  _resetAuthModalBody()
  modal.hidden = false
  document.getElementById('auth-email')?.focus()
}

function _closeAuthModal() {
  const modal = document.getElementById('auth-modal')
  if (modal) modal.hidden = true
}

function _resetAuthModalBody() {
  const body = document.getElementById('auth-modal-body')
  if (!body) return
  body.innerHTML = `
    <form id="auth-form">
      <label for="auth-email">Email address</label>
      <input id="auth-email" type="email" required placeholder="you@example.com" autocomplete="email">
      <button type="submit" class="btn btn--primary">Send me a link</button>
    </form>
  `
  document.getElementById('auth-form')?.addEventListener('submit', _handleAuthSubmit)
}

async function _handleAuthSubmit(e) {
  e.preventDefault()
  const emailInput = document.getElementById('auth-email')
  const email = emailInput?.value.trim()
  if (!email) return

  const submitBtn = e.target.querySelector('[type="submit"]')
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…' }

  try {
    await api.post('/auth/magic-link', { email })
    _showAuthCheckInbox(email)
  } catch (err) {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send me a link' }
    if (err instanceof ApiError && err.status === 429) {
      _showAuthMessage('Too many attempts. Please wait before requesting a new link.')
    } else if (err instanceof ApiError && err.status === 503) {
      _showAuthMessage("We couldn't send the email. Please try again.", true)
    } else {
      _showAuthMessage("We couldn't send the email. Please try again.", true)
    }
  }
}

function _showAuthCheckInbox(email) {
  const body = document.getElementById('auth-modal-body')
  if (!body) return
  const emailText = document.createElement('p')
  emailText.textContent = 'Check your inbox. The link expires in 15 minutes.'
  const resendBtn = document.createElement('button')
  resendBtn.className = 'btn btn--ghost btn--sm'
  resendBtn.textContent = 'Resend'
  resendBtn.addEventListener('click', () => {
    body.innerHTML = ''
    body.appendChild(emailText)
    body.appendChild(resendBtn)
    _sendMagicLink(email, resendBtn)
  })
  body.innerHTML = ''
  body.appendChild(emailText)
  body.appendChild(resendBtn)
}

async function _sendMagicLink(email, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…' }
  try {
    await api.post('/auth/magic-link', { email })
    if (btn) { btn.disabled = false; btn.textContent = 'Resend' }
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      _showAuthMessage('Too many attempts. Please wait before requesting a new link.')
    } else {
      if (btn) { btn.disabled = false; btn.textContent = 'Resend' }
    }
  }
}

function _showAuthMessage(text, withRetry = false) {
  const body = document.getElementById('auth-modal-body')
  if (!body) return
  body.innerHTML = ''
  const p = document.createElement('p')
  p.textContent = text
  body.appendChild(p)
  if (withRetry) {
    const retryBtn = document.createElement('button')
    retryBtn.className = 'btn btn--primary'
    retryBtn.textContent = 'Try again'
    retryBtn.addEventListener('click', _resetAuthModalBody)
    body.appendChild(retryBtn)
  }
}

/* ============================================================
   AUTH CALLBACK (page load with ?auth= param)
   ============================================================ */

async function _handleAuthCallback() {
  const params = new URLSearchParams(location.search)
  const authResult = params.get('auth')
  const authError = params.get('auth_error')

  // Clean up URL
  if (authResult || authError) {
    const clean = new URL(location.href)
    clean.searchParams.delete('auth')
    clean.searchParams.delete('auth_error')
    history.replaceState(null, '', clean.toString())
  }

  if (authError) {
    openAuthModal()
    const body = document.getElementById('auth-modal-body')
    if (!body) return
    body.innerHTML = ''
    const p = document.createElement('p')
    const btn = document.createElement('button')
    btn.className = 'btn btn--primary'
    btn.textContent = 'Send a new link'
    btn.addEventListener('click', _resetAuthModalBody)
    if (authError === 'expired') {
      p.textContent = 'This link has expired.'
    } else if (authError === 'used') {
      p.textContent = 'This link has already been used.'
    } else {
      p.textContent = 'This link is invalid.'
    }
    body.appendChild(p)
    body.appendChild(btn)
    return
  }

  if (authResult === 'success') {
    await _onLoginSuccess()
  }
}

/* ============================================================
   LOGIN SUCCESS FLOW
   ============================================================ */

async function _onLoginSuccess() {
  // Fetch user profile
  try {
    _currentUser = await api.get('/me')
  } catch (_) {
    return
  }

  _applyAuthUI()
  _closeAuthModal()

  // sessionStorage migration
  await _migrateSessionStorage()

  // Onboarding modal (first login)
  if (!_currentUser.onboarded_at) {
    _showOnboardingModal()
  }

  // Notify sidebar to load
  document.dispatchEvent(new CustomEvent('auth:login', { detail: { user: _currentUser } }))
}

/* ============================================================
   SESSION STORAGE MIGRATION (T029–T031)
   ============================================================ */

const STORY_FIELDS = ['context', 'target', 'empathy', 'problem', 'consequences', 'solution', 'benefits', 'why']
const BACKUP_KEY = 'leanstory_session_expired_backup'
const SESSION_KEY_MAIN = 'leanstory_session'

async function _migrateSessionStorage() {
  // Read story data from either the main session or the expired backup key
  let storyData = null
  for (const key of [SESSION_KEY_MAIN, BACKUP_KEY]) {
    try {
      const raw = sessionStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        const hasContent = STORY_FIELDS.some(f => parsed[f] && parsed[f].trim())
        if (hasContent) { storyData = parsed; break }
      }
    } catch (_) {}
  }

  if (!storyData) return

  // Determine title: new account (<5s old) vs existing
  const createdAt = new Date(_currentUser.created_at).getTime()
  const isNewAccount = Date.now() - createdAt < 10_000  // 10s buffer
  const title = isNewAccount ? 'My first story' : 'Imported story'

  // Build fields object (non-empty only)
  const fields = {}
  for (const f of STORY_FIELDS) {
    if (storyData[f] && storyData[f].trim()) fields[f] = storyData[f]
  }

  try {
    const result = await api.post('/stories', { title, fields })
    // Clear sessionStorage
    try {
      sessionStorage.removeItem(SESSION_KEY_MAIN)
      sessionStorage.removeItem(BACKUP_KEY)
    } catch (_) {}
    // Signal app.js to open the migrated story
    if (result?.id && result?.version?.id) {
      document.dispatchEvent(new CustomEvent('story:open', {
        detail: { storyId: result.id, versionId: result.version.id }
      }))
    }
  } catch (_) {
    // Migration failed silently — story data remains in sessionStorage
  }
}

/* ============================================================
   ONBOARDING MODAL (T048)
   ============================================================ */

function _showOnboardingModal() {
  const modal = document.getElementById('onboarding-modal')
  if (modal) modal.hidden = false
}

async function _handleOnboardingSave() {
  const jobTitle = document.getElementById('onboarding-job-title')?.value.trim()
  const intent = document.getElementById('onboarding-intent')?.value.trim()
  await _completeOnboarding(jobTitle, intent)
}

async function _handleOnboardingSkip() {
  await _completeOnboarding('', '')
}

async function _completeOnboarding(jobTitle, intent) {
  const payload = { onboarded: true }
  if (jobTitle) payload.job_title = jobTitle
  if (intent) payload.intent = intent
  try {
    _currentUser = await api.patch('/me', payload)
  } catch (_) {}
  const modal = document.getElementById('onboarding-modal')
  if (modal) modal.hidden = true
}

/* ============================================================
   LOGOUT (T027)
   ============================================================ */

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch (_) {}
  _currentUser = null
  _applyAuthUI()
  // Clear story builder fields
  document.dispatchEvent(new CustomEvent('auth:logout'))
}

/* ============================================================
   SESSION EXPIRY HANDLER (T057)
   ============================================================ */

document.addEventListener('auth:expired', () => {
  _currentUser = null
  _applyAuthUI()
  openAuthModal()
  const body = document.getElementById('auth-modal-body')
  if (body) {
    body.innerHTML = ''
    const p = document.createElement('p')
    p.textContent = 'Your session has expired. Log in again to continue.'
    body.appendChild(p)
    const form = document.createElement('form')
    form.id = 'auth-form'
    form.innerHTML = `
      <label for="auth-email">Email address</label>
      <input id="auth-email" type="email" required placeholder="you@example.com" autocomplete="email">
      <button type="submit" class="btn btn--primary">Send me a link</button>
    `
    form.addEventListener('submit', _handleAuthSubmit)
    body.appendChild(form)
  }
})

/* ============================================================
   INIT
   ============================================================ */

async function init() {
  // Try to restore session (check if already logged in via cookie)
  try {
    _currentUser = await api.get('/me')
    _applyAuthUI()
    document.dispatchEvent(new CustomEvent('auth:login', { detail: { user: _currentUser } }))
  } catch (_) {
    // Not authenticated — anonymous state
    _applyAuthUI()
  }

  // Handle ?auth= callback from magic link email
  await _handleAuthCallback()

  // Wire top bar buttons
  document.getElementById('btn-login-signup')?.addEventListener('click', openAuthModal)
  document.getElementById('btn-logout')?.addEventListener('click', logout)
  document.getElementById('auth-modal-close')?.addEventListener('click', () => {
    document.getElementById('auth-modal').hidden = true
  })

  // Onboarding modal buttons
  document.getElementById('btn-onboarding-save')?.addEventListener('click', _handleOnboardingSave)
  document.getElementById('btn-onboarding-skip')?.addEventListener('click', _handleOnboardingSkip)

  // Auth form (initial load)
  document.getElementById('auth-form')?.addEventListener('submit', _handleAuthSubmit)
}

init()
