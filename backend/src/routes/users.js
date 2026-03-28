/* routes/users.js — User profile CRUD */

import sql from '../db/client.js'
import { clearSessionCookie } from '../plugins/jwt.js'

export default async function userRoutes(fastify) {
  const auth = { preHandler: fastify.authenticate }

  // GET /api/me
  fastify.get('/me', auth, async (request, reply) => {
    const [user] = await sql`
      SELECT id, email, job_title, intent, created_at, onboarded_at
      FROM users WHERE id = ${request.user.sub}
    `
    if (!user) return reply.code(404).send({ error: 'not_found', message: 'User not found.' })
    return reply.send(user)
  })

  // PATCH /api/me
  fastify.patch('/me', auth, async (request, reply) => {
    const { job_title, intent, onboarded } = request.body || {}

    // Validate lengths
    if (job_title !== undefined && job_title !== null && typeof job_title === 'string' && job_title.length > 100) {
      return reply.code(400).send({ error: 'validation_error', fields: { job_title: 'max 100 characters' } })
    }
    if (intent !== undefined && intent !== null && typeof intent === 'string' && intent.length > 200) {
      return reply.code(400).send({ error: 'validation_error', fields: { intent: 'max 200 characters' } })
    }

    const setClauses = []
    const values = []

    if (job_title !== undefined) { setClauses.push('job_title'); values.push(job_title || null) }
    if (intent !== undefined) { setClauses.push('intent'); values.push(intent || null) }

    // Build update query
    if (setClauses.length === 0 && onboarded !== true) {
      const [user] = await sql`SELECT id, email, job_title, intent, created_at, onboarded_at FROM users WHERE id = ${request.user.sub}`
      return reply.send(user)
    }

    // Use conditional fragments: update job_title/intent only if provided, always update onboarded_at if requested
    const [user] = await sql`
      UPDATE users
      SET
        job_title = CASE WHEN ${job_title !== undefined} THEN ${job_title || null} ELSE job_title END,
        intent = CASE WHEN ${intent !== undefined} THEN ${intent || null} ELSE intent END,
        onboarded_at = CASE WHEN ${onboarded === true} AND onboarded_at IS NULL THEN NOW() ELSE onboarded_at END
      WHERE id = ${request.user.sub}
      RETURNING id, email, job_title, intent, created_at, onboarded_at
    `
    return reply.send(user)
  })

  // DELETE /api/me
  fastify.delete('/me', auth, async (request, reply) => {
    const { confirm } = request.body || {}
    if (confirm !== 'DELETE') {
      return reply.code(400).send({ error: 'validation_error', message: 'confirm field must be exactly "DELETE".' })
    }

    await sql`DELETE FROM users WHERE id = ${request.user.sub}`
    clearSessionCookie(reply)
    return reply.send({ message: 'Account deleted.' })
  })
}
