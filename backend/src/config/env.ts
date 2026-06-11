/**
 * Validated, typed environment configuration.
 * Throws at boot if anything required is missing or malformed.
 */
import 'dotenv/config'
import { z } from 'zod'
import crypto from 'node:crypto'
import { logger } from './logger.js'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
  POSTGRES_PASSWORD: z.string().default(''),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),
  DATABASE_URL: z.string().url().optional(),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET: z.string().default(''),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  ALLOWED_EMAILS: z
    .string()
    .default('')
    .transform((s) => s.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(10),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

// In development, generate an ephemeral JWT secret if none was provided, and
// warn loudly. In production, refuse to start without one.
if (!env.JWT_SECRET) {
  if (env.NODE_ENV === 'production') {
    console.error('❌ JWT_SECRET is required in production. Generate one with: openssl rand -base64 48')
    process.exit(1)
  }
  env.JWT_SECRET = crypto.randomBytes(48).toString('base64')
  logger.warn('⚠ JWT_SECRET not set — generated an ephemeral dev secret. All tokens will be invalidated on restart.')
}

// Derived
export const databaseUrl =
  env.DATABASE_URL ||
  `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

export const googleOAuthConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
