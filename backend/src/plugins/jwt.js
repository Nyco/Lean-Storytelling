import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'

const COOKIE_NAME = 'ls_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

export async function jwtPlugin(fastify) {
  await fastify.register(fastifyCookie)

  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: COOKIE_NAME,
      signed: false
    }
  })

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ error: 'unauthorized', message: 'Authentication required.' })
    }
  })
}

export function setSessionCookie(reply, token) {
  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  })
}

export function clearSessionCookie(reply) {
  reply.clearCookie(COOKIE_NAME, { path: '/' })
}
