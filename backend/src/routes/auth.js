/* routes/auth.js — Authentication: magic link + verify + logout */

import { createMagicLinkToken, validateMagicLinkToken, createOrGetUser } from '../services/auth-service.js'
import { sendMagicLink, checkRateLimit } from '../services/email-service.js'
import { setSessionCookie, clearSessionCookie } from '../plugins/jwt.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function authRoutes(fastify) {
  // POST /api/auth/magic-link
  fastify.post('/magic-link', async (request, reply) => {
    const { email } = request.body || {}

    if (!email || !EMAIL_RE.test(email)) {
      return reply.code(400).send({ error: 'validation_error', message: 'Invalid email address.' })
    }

    const lower = email.toLowerCase()

    if (!checkRateLimit(lower)) {
      return reply.code(429).send({
        error: 'too_many_requests',
        message: 'Too many attempts. Please wait before requesting a new link.'
      })
    }

    let rawToken
    try {
      rawToken = await createMagicLinkToken(lower)
    } catch (err) {
      fastify.log.error(err, 'Failed to create magic link token')
      return reply.code(503).send({ error: 'service_unavailable', message: "We couldn't send the email. Please try again." })
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const verifyUrl = `${frontendUrl}/api/auth/verify?token=${rawToken}`

    try {
      await sendMagicLink(lower, verifyUrl)
    } catch (err) {
      fastify.log.error(err, 'Failed to send magic link email')
      return reply.code(503).send({ error: 'service_unavailable', message: "We couldn't send the email. Please try again." })
    }

    return reply.send({ message: 'Check your inbox. The link expires in 15 minutes.' })
  })

  // GET /api/auth/verify?token=TOKEN
  fastify.get('/verify', async (request, reply) => {
    const { token } = request.query || {}
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    if (!token) {
      return reply.redirect(`${frontendUrl}/?auth_error=invalid`)
    }

    const result = await validateMagicLinkToken(token)

    if (!result.valid) {
      const reason = result.reason === 'used' ? 'used' : 'expired'
      return reply.redirect(`${frontendUrl}/?auth_error=${reason}`)
    }

    let user
    try {
      user = await createOrGetUser(result.email)
    } catch (err) {
      fastify.log.error(err, 'Failed to create/get user on verify')
      return reply.redirect(`${frontendUrl}/?auth_error=expired`)
    }

    const jwtToken = fastify.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '30d' }
    )
    setSessionCookie(reply, jwtToken)

    return reply.redirect(`${frontendUrl}/?auth=success`)
  })

  // POST /api/auth/logout
  fastify.post('/logout', async (request, reply) => {
    clearSessionCookie(reply)
    return reply.send({ message: 'Logged out' })
  })
}
