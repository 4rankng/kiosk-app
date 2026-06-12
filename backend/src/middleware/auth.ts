/**
 * JWT auth middleware. Verifies Authorization: Bearer <token>.
 * Stores decoded payload in c.var.user.
 */
import type { MiddlewareHandler } from 'hono'
import { verifyAccessToken, type AccessTokenPayload } from '../lib/jwt.js'
import { Unauthorized } from '../lib/errors.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: AccessTokenPayload
  }
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('authorization')
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    throw Unauthorized('Missing Authorization header')
  }
  const token = header.slice(7).trim()
  const payload = verifyAccessToken(token)
  c.set('user', payload)
  await next()
}
