import fastifyCors from '@fastify/cors'

export async function corsPlugin(fastify) {
  await fastify.register(fastifyCors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  })
}
