/**
 * Auth module: local email+password login, Google OAuth, refresh, logout, me,
 * and user registration.
 *
 * Public (no auth):  POST /api/auth/login
 *                    GET  /api/auth/google/url
 *                    POST /api/auth/google
 *                    POST /api/auth/refresh
 *                    POST /api/auth/register       ← open only when DB has zero users
 *                                                  (first-user bootstrap);
 *                                                  otherwise requires admin.
 * Private:           GET  /api/auth/me
 *                    POST /api/auth/logout
 *
 * Access control:
 *   - If ALLOWED_EMAILS is non-empty, only those emails can sign in.
 *   - Otherwise, the first user becomes the admin and creates all others.
 *   - Google sign-in: same rules apply; new Google users are auto-provisioned
 *     only if their email is allowlisted (or allowlist is empty).
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

import { ok, created } from '../../lib/response.js'
import { requireAuth } from '../../middleware/auth.js'
import { rateLimit } from '../../middleware/rate-limit.js'
import { authService } from './auth.service.js'

export const authRoutes = new Hono()

// ---------------------------------------------------------------------------
//  Schemas
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1),
})

const refreshSchema = z.object({ refreshToken: z.string().min(10) })

const googleExchangeSchema = z.object({ code: z.string().min(10) })

const registerSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  name: z.string().min(1).max(160),
  password: z.string().min(8).max(120),
  role: z.enum(['admin', 'staff']).default('staff'),
})

const logoutSchema = z.object({ refreshToken: z.string().optional() })

// ---------------------------------------------------------------------------
//  POST /api/auth/login
// ---------------------------------------------------------------------------
authRoutes.post(
  '/login',
  rateLimit({
    scope: 'login',
    key: (c) => c.req.header('x-forwarded-for') ?? 'ip',
    limit: 10,
    windowSeconds: 900, // 15 min
  }),
  zValidator('json', loginSchema),
  async (c) => {
    const { email, password } = c.req.valid('json')
    const result = await authService.login(email, password)
    return ok(c, result)
  }
)

// ---------------------------------------------------------------------------
//  POST /api/auth/refresh
// ---------------------------------------------------------------------------
authRoutes.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json')
  const result = await authService.refresh(refreshToken)
  return ok(c, result)
})

// ---------------------------------------------------------------------------
//  GET /api/auth/google/url   →  start OAuth flow
// ---------------------------------------------------------------------------
authRoutes.get('/google/url', async (c) => {
  const result = await authService.getGoogleOAuthUrl()
  return ok(c, result)
})

// ---------------------------------------------------------------------------
//  POST /api/auth/google   →  exchange code for tokens, login/register user
// ---------------------------------------------------------------------------
authRoutes.post(
  '/google',
  rateLimit({ scope: 'google', key: (c) => c.req.header('x-forwarded-for') ?? 'ip', limit: 10, windowSeconds: 900 }),
  zValidator('json', googleExchangeSchema),
  async (c) => {
    const { code } = c.req.valid('json')
    const result = await authService.googleLogin(code)
    return ok(c, result)
  }
)

// ---------------------------------------------------------------------------
//  GET /api/auth/me   (authed)
// ---------------------------------------------------------------------------
authRoutes.get('/me', requireAuth, async (c) => {
  const u = c.get('user')
  return ok(c, { id: u.sub, email: u.email, name: u.name, role: u.role })
})

// ---------------------------------------------------------------------------
//  POST /api/auth/logout   (authed)   →  revoke refresh token if provided
// ---------------------------------------------------------------------------
authRoutes.post('/logout', requireAuth, zValidator('json', logoutSchema.optional()), async (c) => {
  const body = c.req.valid('json')
  await authService.logout(body?.refreshToken)
  return ok(c, { loggedOut: true })
})

// ---------------------------------------------------------------------------
//  POST /api/auth/register
//
//  Behavior:
//    • If NO users exist in the database  → open (first-user bootstrap).
//      The first user is always created as `admin` regardless of `role` field.
//    • If users exist                     → requires an authenticated admin.
//      New users created by admin can be `admin` or `staff`.
//    • Email must be in ALLOWED_EMAILS (if the allowlist is non-empty).
// ---------------------------------------------------------------------------
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')
  const authHeader = c.req.header('authorization')
  const result = await authService.register(body, authHeader)
  return created(c, result)
})
