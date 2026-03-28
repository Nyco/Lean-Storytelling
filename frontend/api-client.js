/* api-client.js — Thin fetch wrapper for Lean Storytelling API
   All requests include cookies (credentials: 'include').
   On 401: saves current Story Builder state and fires auth:expired event.
*/

'use strict'

const BASE = '/api'

async function request(method, path, body) {
  const options = {
    method,
    credentials: 'include',
    headers: {}
  }

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const response = await fetch(BASE + path, options)

  if (response.status === 401) {
    // Save current Story Builder state before losing session
    _preserveStoryBuilderState()
    document.dispatchEvent(new CustomEvent('auth:expired'))
    throw new ApiError(401, 'unauthorized', 'Authentication required.')
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const msg = data?.message || `HTTP ${response.status}`
    throw new ApiError(response.status, data?.error || 'unknown', msg)
  }

  return data
}

function _preserveStoryBuilderState() {
  // Read current textarea values and store in sessionStorage
  const fields = ['context', 'target', 'empathy', 'problem', 'consequences', 'solution', 'benefits', 'why']
  const state = {}
  let hasContent = false
  for (const field of fields) {
    const el = document.getElementById(field)
    if (el && el.value.trim()) {
      state[field] = el.value
      hasContent = true
    }
  }
  if (hasContent) {
    try {
      sessionStorage.setItem('leanstory_session_expired_backup', JSON.stringify(state))
    } catch (_) {}
  }
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path, body) => request('DELETE', path, body)
}
