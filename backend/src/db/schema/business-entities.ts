import { pgTable, text, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core'

/**
 * Hộ kinh doanh templates. Each one represents a legal entity (e.g. "Hộ KD
 * Phương Linh" or "Hộ KD Hồng Hạnh") and the header info that gets printed
 * at the top of an invoice PDF.
 *
 * `headerLines` is a free-form JSON array of strings, so the admin can put
 * address / tax-code / phone lines in any order they want on the print.
 */
export const businessEntities = pgTable('business_entities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  taxCode: text('tax_code'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  headerLines: jsonb('header_lines').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type BusinessEntity = typeof businessEntities.$inferSelect
export type NewBusinessEntity = typeof businessEntities.$inferInsert
