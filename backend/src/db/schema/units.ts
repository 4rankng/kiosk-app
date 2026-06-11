import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

/**
 * Units of measure (Thùng, Cân, Gói, Hộp, Chai, Lon, ...).
 * Admin-managed so the dropdown is fully driven from DB.
 */
export const units = pgTable('units', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  abbreviation: text('abbreviation'),
  createdAt: text('created_at').notNull(),
})

export type Unit = typeof units.$inferSelect
export type NewUnit = typeof units.$inferInsert
