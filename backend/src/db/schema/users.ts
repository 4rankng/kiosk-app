import { pgTable, text, timestamp, uuid, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { userRoleEnum } from './enums.js'

/**
 * Application users. Can sign in with email+password or Google OAuth.
 * Access is gated by env.ALLOWED_EMAILS — non-allowlisted users can be created
 * but will be rejected at login.
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash'), // null for OAuth-only users
  googleSub: text('google_sub').unique(), // null for password-only users
  role: userRoleEnum('role').notNull().default('staff'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
