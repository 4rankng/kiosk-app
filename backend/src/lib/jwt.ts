/**
 * JWT helpers — issue + verify access & refresh tokens.
 * Refresh tokens are stored in Redis (key: refresh:<jti>) and rotated on use.
 */
import jwt, { type SignOptions } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../config/env.js'
import { redis } from '../config/redis.js'
import { Unauthorized } from './errors.js'

export interface AccessTokenPayload {
  sub: string // user id
  email: string
  name: string
  role: string
}

export interface RefreshTokenPayload {
  sub: string
  jti: string
}

const ACCESS_SECRET = env.JWT_SECRET
const REFRESH_SECRET = env.JWT_SECRET + '.refresh'

const REFRESH_PREFIX = 'refresh:'

function ttlToSeconds(ttl: string): number {
  // naive parser for "15m" / "7d" / "30s" / "1h"
  const m = /^(\d+)([smhd])$/.exec(ttl)
  if (!m) return 3600
  const n = Number(m[1])
  switch (m[2]) {
    case 's': return n
    case 'm': return n * 60
    case 'h': return n * 3600
    case 'd': return n * 86400
    default: return 3600
  }
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as SignOptions)
}

export async function issueRefreshToken(userId: string): Promise<{ token: string; jti: string }> {
  const jti = uuidv4()
  const token = jwt.sign({ sub: userId, jti } satisfies RefreshTokenPayload, REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  } as SignOptions)
  const ttl = ttlToSeconds(env.JWT_REFRESH_TTL)
  await redis.set(REFRESH_PREFIX + jti, userId, 'EX', ttl)
  return { token, jti }
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload
  } catch {
    throw Unauthorized('Invalid or expired access token')
  }
}

export async function rotateRefreshToken(oldToken: string): Promise<{ userId: string; newToken: string }> {
  let decoded: RefreshTokenPayload
  try {
    decoded = jwt.verify(oldToken, REFRESH_SECRET) as RefreshTokenPayload
  } catch {
    throw Unauthorized('Invalid refresh token')
  }

  const stored = await redis.get(REFRESH_PREFIX + decoded.jti)
  if (!stored || stored !== decoded.sub) {
    throw Unauthorized('Refresh token revoked')
  }

  // Rotate: invalidate old, issue new
  await redis.del(REFRESH_PREFIX + decoded.jti)
  const { token } = await issueRefreshToken(decoded.sub)
  return { userId: decoded.sub, newToken: token }
}

export async function revokeRefreshToken(jti: string): Promise<void> {
  await redis.del(REFRESH_PREFIX + jti)
}
