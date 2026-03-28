/* routes/stories.js — Stories CRUD */

import { getStories, createStory, deleteStory } from '../services/story-service.js'

export default async function storyRoutes(fastify) {
  // GET /api/stories
  fastify.get('/stories', { preHandler: fastify.authenticate }, async (request, reply) => {
    const stories = await getStories(request.user.sub)
    return reply.send(stories)
  })

  // POST /api/stories
  fastify.post('/stories', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { title, fields } = request.body || {}

    if (!title || typeof title !== 'string' || !title.trim()) {
      return reply.code(400).send({ error: 'validation_error', message: 'title is required.' })
    }
    if (title.trim().length > 100) {
      return reply.code(400).send({ error: 'validation_error', message: 'title must be 100 characters or fewer.' })
    }

    const story = await createStory(request.user.sub, title.trim(), fields || {})
    return reply.code(201).send(story)
  })

  // DELETE /api/stories/:storyId
  fastify.delete('/stories/:storyId', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { storyId } = request.params
    const deleted = await deleteStory(request.user.sub, storyId)
    if (!deleted) {
      return reply.code(404).send({ error: 'not_found', message: 'Story not found.' })
    }
    return reply.code(204).send()
  })
}
