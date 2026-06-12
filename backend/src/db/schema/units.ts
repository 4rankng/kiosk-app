import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'

/**
 * Units of measure (Thùng, Cân, Gói, Hộp, Chai, Lon, ...).
 * Admin-managed so the dropdown is fully driven from DB.
 */
export const units = pgTable('units', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  abbreviation: text('abbreviation'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Unit = typeof units.$inferSelect
export type NewUnit = typeof units.$inferInsert
