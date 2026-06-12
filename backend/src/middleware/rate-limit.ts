/**
 * Redis-backed sliding-window rate limiter.
 * Usage: rateLimit({ key: (c) => c.req.header('x-forwarded-for') ?? 'ip', limit: 100, window: 60 })
 */
import type { MiddlewareHandler } from 'hono'
import { redis } from '../config/redis.js'
import { AppError } from '../lib/errors.js'

export interface RateLimitOptions {
  key: (c: { req: { header: (k: string) => string | undefined } }) => string
  limit: number
  windowSeconds: number
  scope?: string
}

export function rateLimit(opts: RateLimitOptions): MiddlewareHandler {
  return async (c, next) => {
    const id = opts.key(c)
    const scope = opts.scope ?? 'global'
    const bucket = Math.floor(Date.now() / 1000 / opts.windowSeconds)
    const redisKey = `rl:${scope}:${id}:${bucket}`

    const count = await redis.incr(redisKey)
    if (count === 1) {
      await redis.expire(redisKey, opts.windowSeconds)
    }

    c.header('X-RateLimit-Limit', String(opts.limit))
    c.header('X-RateLimit-Remaining', String(Math.max(0, opts.limit - count)))

    if (count > opts.limit) {
      c.header('Retry-After', String(opts.windowSeconds))
      throw new AppError(429, 'Too many requests. Please try again later.')
    }

    await next()
    return
  }
}
