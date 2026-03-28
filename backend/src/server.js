import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { runMigrations } from './db/migrate.js'
import { jwtPlugin } from './plugins/jwt.js'
import { corsPlugin } from './plugins/cors.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import storyRoutes from './routes/stories.js'
import versionRoutes from './routes/versions.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
// In Docker: __dirname = /app/src, frontend mounted at /app/frontend
// In dev: __dirname = backend/src, frontend is at ../../frontend
const FRONTEND_DIR = process.env.FRONTEND_DIR || join(__dirname, '../../frontend')

const fastify = Fastify({ logger: true })

// Plugins
await fastify.register(corsPlugin)
await fastify.register(jwtPlugin)

// Static frontend
await fastify.register(fastifyStatic, {
  root: FRONTEND_DIR,
  prefix: '/'
})

// Health check
fastify.get('/api/health', async () => ({ status: 'ok' }))

// API routes
await fastify.register(authRoutes, { prefix: '/api/auth' })
await fastify.register(userRoutes, { prefix: '/api' })
await fastify.register(storyRoutes, { prefix: '/api' })
await fastify.register(versionRoutes, { prefix: '/api' })

// SPA fallback — serve index.html for any non-API GET
fastify.setNotFoundHandler(async (request, reply) => {
  if (!request.url.startsWith('/api')) {
    return reply.sendFile('index.html')
  }
  reply.code(404).send({ error: 'not_found', message: 'Not found.' })
})

// Start
try {
  await runMigrations()
  await fastify.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
