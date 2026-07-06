import { describe, it, expect } from 'vitest'
import { createApp } from './app.js'

/**
 * Foundational integration tests for the Hono app factory.
 * Exercises routing, global middleware, the response envelope, and the
 * defense-in-depth requireAuth guard — no persistent data is mutated.
 */
describe('app factory (createApp)', () => {
  const app = createApp()

  it('GET /api/health → 200 with { data } envelope', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)
    const body = (await res.json()) as { data: { status: string; service: string }; error?: unknown }
    expect(body.data).toMatchObject({ status: 'ok', service: 'kiosk-backend' })
    expect(body.error).toBeUndefined()
  })

  it('GET /api/health/ready → 200 with checks envelope', async () => {
    const res = await app.request('/api/health/ready')
    expect([200, 503]).toContain(res.status)
    const body = (await res.json()) as { data: { status: string; checks: unknown } }
    expect(body.data).toHaveProperty('status')
    expect(body.data).toHaveProperty('checks')
  })

  it('global requireAuth rejects protected routes without a token (defense-in-depth)', async () => {
    const res = await app.request('/api/products')
    expect(res.status).toBe(401)
    const body = (await res.json()) as { error: { message: string } }
    expect(body.error).toBeTruthy()
  })

  it('unknown path outside /api falls through to the 404 handler', async () => {
    const res = await app.request('/nope')
    expect(res.status).toBe(404)
  })
})
