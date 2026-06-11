/**
 * JWT auth middleware. Verifies Authorization: Bearer <token>.
 * Stores decoded payload in c.var.user.
 */
import type { Context, MiddlewareHandler } from 'hono'
import { verifyAccessToken, type AccessTokenPayload } from '../lib/jwt.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: AccessTokenPayload
  }
}

export const requireAuth: MiddlewareHandler = async (c: Context, next) => {
  const header = c.req.header('authorization')
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return c.json({ error: { message: 'Missing Authorization header' } }, 401)
  }
  const token = header.slice(7).trim()
  const payload = verifyAccessToken(token)
  c.set('user', payload)
  await next()
  return
}
