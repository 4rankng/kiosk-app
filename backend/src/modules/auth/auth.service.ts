/**
 * Auth service — business logic extracted from routes.
 */
import { eq, sql } from 'drizzle-orm'
import { OAuth2Client } from 'google-auth-library'
import { v4 as uuidv4 } from 'uuid'

import { db } from '../../config/db.js'
import { env, googleOAuthConfigured } from '../../config/env.js'
import { users } from '../../db/schema/index.js'
import { hashPassword, verifyPassword } from '../../lib/password.js'
import { queryOne } from '../../lib/sql.js'
import {
  issueRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  verifyAccessToken,
  revokeRefreshToken,
  type AccessTokenPayload,
} from '../../lib/jwt.js'
import { BadRequest, Conflict, Forbidden, Unauthorized } from '../../lib/errors.js'
import { logger } from '../../config/logger.js'

export const authService = {
  /** Check if an email is in the ALLOWED_EMAILS list (open if list is empty). */
  isEmailAllowed(email: string): boolean {
    if (env.ALLOWED_EMAILS.length === 0) return true // empty allowlist = open
    return env.ALLOWED_EMAILS.includes(email.toLowerCase().trim())
  },

  /** Count total users in the database. */
  async countUsers(): Promise<number> {
    const r = await queryOne<{ count: number }>(db, sql`SELECT count(*)::int AS count FROM users`)
    return Number(r?.count ?? 0)
  },

  /** Issue access + refresh token pair for a user. */
  async issueTokensForUser(user: { id: string; email: string; name: string; role: string }) {
    const accessPayload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    const accessToken = signAccessToken(accessPayload)
    const { token: refreshToken } = await issueRefreshToken(user.id)
    return { accessToken, refreshToken }
  },

  /** Authenticate a user with email + password. */
  async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user || !user.passwordHash) {
      throw Unauthorized('Email hoặc mật khẩu không đúng')
    }
    if (!user.isActive) {
      throw Forbidden('Tài khoản đã bị vô hiệu hóa')
    }
    if (!authService.isEmailAllowed(user.email)) {
      throw Forbidden('Tài khoản không có quyền truy cập hệ thống')
    }
    const okPw = await verifyPassword(password, user.passwordHash)
    if (!okPw) throw Unauthorized('Email hoặc mật khẩu không đúng')

    const tokens = await authService.issueTokensForUser(user)
    logger.info({ user: user.email }, 'User logged in')

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatarUrl },
      ...tokens,
    }
  },

  /** Rotate a refresh token and return new token pair. */
  async refresh(refreshToken: string) {
    const { userId, newToken } = await rotateRefreshToken(refreshToken)

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user || !user.isActive) throw Unauthorized()

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    return { accessToken, refreshToken: newToken }
  },

  /** Generate a Google OAuth authorization URL. */
  async getGoogleOAuthUrl() {
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
    return { url }
  },

  /** Exchange a Google OAuth code for user tokens (login or auto-provision). */
  async googleLogin(code: string) {
    if (!googleOAuthConfigured) throw BadRequest('Google OAuth chưa được cấu hình')

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
    if (!authService.isEmailAllowed(email)) {
      throw Forbidden('Tài khoản Google này không có quyền truy cập hệ thống')
    }

    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) {
      const isFirst = (await authService.countUsers()) === 0
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

    const tk = await authService.issueTokensForUser(user)
    logger.info({ user: user.email }, 'User logged in via Google')

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatarUrl },
      ...tk,
    }
  },

  /** Revoke a refresh token (best-effort). */
  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const decoded = JSON.parse(Buffer.from(refreshToken.split('.')[1] ?? '', 'base64').toString())
        if (decoded?.jti) {
          await revokeRefreshToken(decoded.jti)
        }
      } catch {
        // ignore — logout is best-effort
      }
    }
  },

  /** Register a new user. First user is always admin. Subsequent users require admin auth. */
  async register(
    body: { email: string; name: string; password: string; role: 'admin' | 'staff' },
    authHeader?: string
  ) {
    const totalUsers = await authService.countUsers()

    if (totalUsers > 0) {
      if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        throw Unauthorized('Yêu cầu đăng nhập')
      }
      const token = authHeader.slice(7).trim()
      const me = verifyAccessToken(token)
      if (me.role !== 'admin') {
        throw Forbidden('Chỉ quản trị viên mới có thể tạo người dùng')
      }
    }

    if (!authService.isEmailAllowed(body.email)) {
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

    return { id: u!.id, email: u!.email, name: u!.name, role: u!.role }
  },
}
