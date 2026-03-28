/* auth-service.js — Magic link token lifecycle + user upsert */

import crypto from 'node:crypto'
import sql from '../db/client.js'

const TOKEN_EXPIRY_MS = 15 * 60 * 1000  // 15 minutes

export function generateToken() {
  return crypto.randomBytes(32).toString('hex')  // 64-char hex
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

export async function createMagicLinkToken(email) {
  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS)

  await sql`
    INSERT INTO magic_link_tokens (email, token_hash, expires_at)
    VALUES (${email.toLowerCase()}, ${tokenHash}, ${expiresAt})
  `

  return rawToken  // only the raw token leaves this function — never the hash
}

export async function validateMagicLinkToken(rawToken) {
  const tokenHash = hashToken(rawToken)
  const now = new Date()

  const rows = await sql`
    SELECT id, email, expires_at, used_at
    FROM magic_link_tokens
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `

  if (rows.length === 0) return { valid: false, reason: 'not_found' }

  const token = rows[0]
  if (token.used_at) return { valid: false, reason: 'used' }
  if (token.expires_at < now) return { valid: false, reason: 'expired' }

  // Mark as used
  await sql`
    UPDATE magic_link_tokens SET used_at = NOW() WHERE id = ${token.id}
  `

  return { valid: true, email: token.email }
}

export async function createOrGetUser(email) {
  const lower = email.toLowerCase()

  // Upsert: insert if not exists, return the row either way
  const rows = await sql`
    INSERT INTO users (email)
    VALUES (${lower})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id, email, job_title, intent, created_at, onboarded_at
  `

  return rows[0]
}
