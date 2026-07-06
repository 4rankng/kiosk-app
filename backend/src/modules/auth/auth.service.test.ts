import { describe, it, expect, afterEach } from 'vitest'
import { authService } from './auth.service.js'
import { env } from '../../config/env.js'

/**
 * Unit tests for the access-allowlist rule that gates both local and Google
 * sign-in (isEmailAllowed). Pure business logic — no DB/Redis queries.
 */
describe('authService.isEmailAllowed', () => {
  const original = env.ALLOWED_EMAILS

  afterEach(() => {
    env.ALLOWED_EMAILS = original
  })

  it('an empty allowlist is open (permits any email)', () => {
    env.ALLOWED_EMAILS = []
    expect(authService.isEmailAllowed('anyone@example.com')).toBe(true)
  })

  it('permits an exact allowlisted email', () => {
    env.ALLOWED_EMAILS = ['admin@example.com']
    expect(authService.isEmailAllowed('admin@example.com')).toBe(true)
  })

  it('rejects an email not on the allowlist', () => {
    env.ALLOWED_EMAILS = ['admin@example.com']
    expect(authService.isEmailAllowed('stranger@example.com')).toBe(false)
  })

  it('matches case-insensitively and trims surrounding whitespace', () => {
    env.ALLOWED_EMAILS = ['admin@example.com']
    expect(authService.isEmailAllowed('  ADMIN@EXAMPLE.COM  ')).toBe(true)
  })
})
