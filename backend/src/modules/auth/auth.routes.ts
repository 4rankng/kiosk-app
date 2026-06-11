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
import { eq, sql } from 'drizzle-orm'
import { OAuth2Client } from 'google-auth-library'
import { db } from '../../config/db.js'
import { env, googleOAuthConfigured } from '../../config/env.js'
import { users } from '../../db/schema/index.js'
import { hashPassword, verifyPassword } from '../../lib/password.js'
import { queryOne } from '../../lib/sql.js'
import {
  issueRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  type AccessTokenPayload,
} from '../../lib/jwt.js'
import { BadRequest, Conflict, Forbidden, Unauthorized } from '../../lib/errors.js'
import { ok, created } from '../../lib/response.js'
import { requireAuth } from '../../middleware/auth.js'
import { verifyAccessToken } from '../../lib/jwt.js'
import { rateLimit } from '../../middleware/rate-limit.js'
import { logger } from '../../config/logger.js'
import { v4 as uuidv4 } from 'uuid'

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

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------
function isEmailAllowed(email: string): boolean {
  if (env.ALLOWED_EMAILS.length === 0) return true // empty allowlist = open
  return env.ALLOWED_EMAILS.includes(email.toLowerCase().trim())
}

async function countUsers(): Promise<number> {
  const r = await queryOne<{ count: number }>(sql`SELECT count(*)::int AS count FROM users`)
  return Number(r?.count ?? 0)
}

async function issueTokensForUser(user: { id: string; email: string; name: string; role: string }) {
  const accessPayload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
  const accessToken = signAccessToken(accessPayload)
  const { token: refreshToken } = await issueRefreshToken(user.id)
  return { accessToken, refreshToken }
}

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

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user || !user.passwordHash) {
      throw Unauthorized('Email hoặc mật khẩu không đúng')
    }
    if (!user.isActive) {
      throw Forbidden('Tài khoản đã bị vô hiệu hóa')
    }
    if (!isEmailAllowed(user.email)) {
      throw Forbidden('Tài khoản không có quyền truy cập hệ thống')
    }
    const okPw = await verifyPassword(password, user.passwordHash)
    if (!okPw) throw Unauthorized('Email hoặc mật khẩu không đúng')

    const tokens = await issueTokensForUser(user)
    logger.info({ user: user.email }, 'User logged in')

    return ok(c, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatarUrl },
      ...tokens,
    })
  }
)

// ---------------------------------------------------------------------------
//  POST /api/auth/refresh
// ---------------------------------------------------------------------------
authRoutes.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json')
  const { userId, newToken } = await rotateRefreshToken(refreshToken)

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user || !user.isActive) throw Unauthorized()

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  return ok(c, { accessToken, refreshToken: newToken })
})

// ---------------------------------------------------------------------------
//  GET /api/auth/google/url   →  start OAuth flow
// ---------------------------------------------------------------------------
authRoutes.get('/google/url', (c) => {
  if (!googleOAuthConfigured) {
    throw BadRequest(
      'Google OAuth chưa được cấu hình. Vui lòng đặt GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env.'
    )
  }
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI)
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
    state: uuidv4(),
  })
  return ok(c, { url })
})

// ---------------------------------------------------------------------------
//  POST /api/auth/google   →  exchange code for tokens, login/register user
// ---------------------------------------------------------------------------
authRoutes.post(
  '/google',
  rateLimit({ scope: 'google', key: (c) => c.req.header('x-forwarded-for') ?? 'ip', limit: 10, windowSeconds: 900 }),
  zValidator('json', googleExchangeSchema),
  async (c) => {
    if (!googleOAuthConfigured) throw BadRequest('Google OAuth chưa được cấu hình')
    const { code } = c.req.valid('json')

    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI)
    const { tokens } = await client.getToken(code)
    if (!tokens.id_token) throw BadRequest('Google did not return an id_token')

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload?.email || !payload.email_verified) {
      throw Unauthorized('Google email chưa được xác minh')
    }

    const email = payload.email.toLowerCase().trim()
    if (!isEmailAllowed(email)) {
      throw Forbidden('Tài khoản Google này không có quyền truy cập hệ thống')
    }

    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) {
      const isFirst = (await countUsers()) === 0
      if (!isFirst) {
        throw Forbidden(
          'Tài khoản Google này chưa được đăng ký. Vui lòng liên hệ quản trị viên để được thêm vào hệ thống.'
        )
      }
      // First-ever user via Google becomes admin
      const inserted = await db
        .insert(users)
        .values({
          email,
          name: payload.name ?? email,
          avatarUrl: payload.picture ?? null,
          googleSub: payload.sub,
          role: 'admin',
          isActive: true,
          passwordHash: null,
        })
        .returning()
      user = inserted[0]!
    } else if (!user.googleSub) {
      await db
        .update(users)
        .set({ googleSub: payload.sub, avatarUrl: payload.picture ?? user.avatarUrl })
        .where(eq(users.id, user.id))
    }

    if (!user.isActive) throw Forbidden('Tài khoản đã bị vô hiệu hóa')

    const tk = await issueTokensForUser(user)
    logger.info({ user: user.email }, 'User logged in via Google')

    return ok(c, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatarUrl },
      ...tk,
    })
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
const logoutSchema = z.object({ refreshToken: z.string().optional() })

authRoutes.post('/logout', requireAuth, zValidator('json', logoutSchema.optional()), async (c) => {
  const body = c.req.valid('json')
  if (body?.refreshToken) {
    try {
      const decoded = JSON.parse(Buffer.from(body.refreshToken.split('.')[1] ?? '', 'base64').toString())
      if (decoded?.jti) {
        const { revokeRefreshToken } = await import('../../lib/jwt.js')
        await revokeRefreshToken(decoded.jti)
      }
    } catch {
      // ignore — logout is best-effort
    }
  }
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
  const totalUsers = await countUsers()

  if (totalUsers > 0) {
    const header = c.req.header('authorization')
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      throw Unauthorized('Yêu cầu đăng nhập')
    }
    const token = header.slice(7).trim()
    const me = verifyAccessToken(token)
    if (me.role !== 'admin') {
      throw Forbidden('Chỉ quản trị viên mới có thể tạo người dùng')
    }
  }

  if (!isEmailAllowed(body.email)) {
    throw BadRequest('Email này không nằm trong danh sách được phép truy cập')
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1)
  if (existing) throw Conflict('Email đã tồn tại')

  const passwordHash = await hashPassword(body.password)
  const inserted = await db
    .insert(users)
    .values([
      {
        email: body.email,
        name: body.name,
        passwordHash,
        role: (totalUsers === 0 ? 'admin' : body.role) as 'admin' | 'staff',
        isActive: true,
      },
    ])
    .returning()
  const u = inserted[0]!

  logger.info({ user: u!.email, byAdmin: totalUsers > 0 }, 'User registered')

  return created(c, { id: u!.id, email: u!.email, name: u!.name, role: u!.role })
})
