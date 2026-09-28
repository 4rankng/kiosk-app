import { describe, expect, it } from 'vitest'

/**
 * Regression test for the boot-blocking blank-optional-var bug.
 *
 * The shipped .env leaves the Google OAuth keys blank (`GOOGLE_REDIRECT_URI=`).
 * dotenv materialises that as an empty string, and `z.string().url().optional()`
 * rejects `""` — an empty string is a *string*, not `undefined` — so the server
 * called process.exit(1) at boot even though Google sign-in is entirely
 * optional. Blank must mean "not configured".
 */

// Seeded before importing env.ts, which parses process.env at module load and
// exits the process on failure. Static import cannot work here: imports are
// hoisted, so the required keys could not be set first.
process.env.POSTGRES_USER ||= 'postgres'
process.env.POSTGRES_DB ||= 'kiosk_dev'
const { envSchema } = await import('./env.js')

const base = { POSTGRES_USER: 'postgres', POSTGRES_DB: 'kiosk_dev' }

describe('env schema — blank optional values', () => {
  it('treats a blank GOOGLE_REDIRECT_URI as unset instead of failing the parse', () => {
    const parsed = envSchema.safeParse({
      ...base,
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      GOOGLE_REDIRECT_URI: '',
    })
    expect(parsed.success, JSON.stringify(parsed.error?.flatten().fieldErrors ?? {})).toBe(true)
    expect(parsed.success && parsed.data.GOOGLE_REDIRECT_URI).toBeUndefined()
    expect(parsed.success && parsed.data.GOOGLE_CLIENT_ID).toBeUndefined()
  })

  it('treats a whitespace-only optional var as unset', () => {
    const parsed = envSchema.safeParse({ ...base, GOOGLE_REDIRECT_URI: '   ' })
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.GOOGLE_REDIRECT_URI).toBeUndefined()
  })

  it('treats a blank DATABASE_URL as unset so the derived connection string is used', () => {
    const parsed = envSchema.safeParse({ ...base, DATABASE_URL: '' })
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.DATABASE_URL).toBeUndefined()
  })

  it('still rejects a malformed non-blank URL', () => {
    const parsed = envSchema.safeParse({ ...base, GOOGLE_REDIRECT_URI: 'not-a-url' })
    expect(parsed.success).toBe(false)
  })

  it('keeps a real optional URL intact', () => {
    const parsed = envSchema.safeParse({
      ...base,
      GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/google/callback',
    })
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.GOOGLE_REDIRECT_URI).toBe(
      'http://localhost:3000/api/auth/google/callback'
    )
  })
})
