// In-memory rate limiter for magic link endpoint
// 5 requests per email per hour

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 5

// Map<email, number[]> of request timestamps
const store = new Map()

export function checkRateLimit(email) {
  const now = Date.now()
  const key = email.toLowerCase()
  const timestamps = (store.get(key) || []).filter(t => now - t < WINDOW_MS)

  if (timestamps.length >= MAX_REQUESTS) {
    store.set(key, timestamps)
    return false
  }

  timestamps.push(now)
  store.set(key, timestamps)
  return true
}
