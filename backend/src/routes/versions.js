/* routes/versions.js — StoryVersion CRUD */

import {
  getVersions,
  getVersion,
  createVersion,
  patchVersion,
  deleteVersion,
  forkVersion
} from '../services/story-service.js'

export default async function versionRoutes(fastify) {
  const auth = { preHandler: fastify.authenticate }

  // GET /api/stories/:storyId/versions
  fastify.get('/stories/:storyId/versions', auth, async (request, reply) => {
    const { storyId } = request.params
    try {
      const versions = await getVersions(request.user.sub, storyId)
      return reply.send(versions)
    } catch (err) {
      if (err.code === 'not_found') return reply.code(404).send({ error: 'not_found', message: 'Story not found.' })
      throw err
    }
  })

  // GET /api/stories/:storyId/versions/:versionId
  fastify.get('/stories/:storyId/versions/:versionId', auth, async (request, reply) => {
    const { storyId, versionId } = request.params
    try {
      const version = await getVersion(request.user.sub, storyId, versionId)
      if (!version) return reply.code(404).send({ error: 'not_found', message: 'Version not found.' })
      return reply.send(version)
    } catch (err) {
      if (err.code === 'not_found') return reply.code(404).send({ error: 'not_found', message: 'Story not found.' })
      throw err
    }
  })

  // POST /api/stories/:storyId/versions (new +1 copy)
  fastify.post('/stories/:storyId/versions', auth, async (request, reply) => {
    const { storyId } = request.params
    try {
      const version = await createVersion(request.user.sub, storyId)
      return reply.code(201).send(version)
    } catch (err) {
      if (err.code === 'not_found') return reply.code(404).send({ error: 'not_found', message: 'Story not found.' })
      throw err
    }
  })

  // PATCH /api/stories/:storyId/versions/:versionId
  fastify.patch('/stories/:storyId/versions/:versionId', auth, async (request, reply) => {
    const { storyId, versionId } = request.params
    try {
      const result = await patchVersion(request.user.sub, storyId, versionId, request.body || {})
      if (result.forbidden) return reply.code(403).send({ error: 'forbidden', message: 'Version is not the latest — read-only.' })
      if (result.noop) return reply.send({ updated_at: null })
      return reply.send(result)
    } catch (err) {
      if (err.code === 'not_found') return reply.code(404).send({ error: 'not_found', message: 'Story not found.' })
      throw err
    }
  })

  // DELETE /api/stories/:storyId/versions/:versionId
  fastify.delete('/stories/:storyId/versions/:versionId', auth, async (request, reply) => {
    const { storyId, versionId } = request.params
    try {
      const result = await deleteVersion(request.user.sub, storyId, versionId)
      if (result.conflict) return reply.code(409).send({ error: 'conflict', message: 'Cannot delete the only version — delete the story instead.' })
      if (!result.deleted) return reply.code(404).send({ error: 'not_found', message: 'Version not found.' })
      return reply.code(204).send()
    } catch (err) {
      if (err.code === 'not_found') return reply.code(404).send({ error: 'not_found', message: 'Story not found.' })
      throw err
    }
  })

  // POST /api/stories/:storyId/versions/:versionId/fork
  fastify.post('/stories/:storyId/versions/:versionId/fork', auth, async (request, reply) => {
    const { storyId, versionId } = request.params
    const { title } = request.body || {}

    if (!title || typeof title !== 'string' || !title.trim()) {
      return reply.code(400).send({ error: 'validation_error', message: 'title is required.' })
    }

    try {
      const result = await forkVersion(request.user.sub, storyId, versionId, title.trim())
      if (!result) return reply.code(404).send({ error: 'not_found', message: 'Version not found.' })
      return reply.code(201).send(result)
    } catch (err) {
      if (err.code === 'not_found') return reply.code(404).send({ error: 'not_found', message: 'Story not found.' })
      throw err
    }
  })
}
