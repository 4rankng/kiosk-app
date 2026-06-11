import { Hono } from 'hono'
import { db, pool } from '../../config/db.js'
import { redis } from '../../config/redis.js'
import { ok } from '../../lib/response.js'

export const healthRoutes = new Hono()

healthRoutes.get('/', (c) =>
  ok(c, {
    status: 'ok',
    service: 'kiosk-backend',
    timestamp: new Date().toISOString(),
  })
)

healthRoutes.get('/ready', async (c) => {
  const checks: Record<string, 'ok' | 'error'> = { db: 'ok', redis: 'ok' }
  try {
    await pool.query('SELECT 1')
  } catch {
    checks.db = 'error'
  }
  try {
    await redis.ping()
  } catch {
    checks.redis = 'error'
  }
  const ready = Object.values(checks).every((v) => v === 'ok')
  return c.json({ status: ready ? 'ready' : 'degraded', checks }, ready ? 200 : 503)
})
