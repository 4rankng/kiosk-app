/**
 * Redis client — used for refresh-token store, rate limiting, future job queue.
 */
import Redis from 'ioredis'
import { env, isProduction } from './env.js'
import { logger } from './logger.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  ...(isProduction ? {} : { password: undefined }),
})

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error')
})

redis.on('connect', () => {
  logger.info('Redis connected')
})

/**
 * Convenience helpers.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const payload = JSON.stringify(value)
  if (ttlSeconds) {
    await redis.set(key, payload, 'EX', ttlSeconds)
  } else {
    await redis.set(key, payload)
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length > 0) await redis.del(...keys)
}
