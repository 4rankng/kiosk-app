/**
 * Per-request access log.
 */
import type { MiddlewareHandler } from 'hono'
import { logger } from '../config/logger.js'

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path

  await next()

  const ms = Date.now() - start
  const status = c.res.status
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'

  logger[level](
    {
      method,
      path,
      status,
      ms,
      user: c.get?.('user')?.email,
    },
    `${method} ${path} ${status} ${ms}ms`
  )
}
