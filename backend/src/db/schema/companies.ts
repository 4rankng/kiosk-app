import { pgTable, text, uuid, boolean, timestamp, index } from 'drizzle-orm/pg-core'

/**
 * A "Công ty / Chuỗi" — the parent customer group. Always assigned a single
 * price list, which all its child branches inherit automatically.
 *
 * Note: FK to price_lists is defined in the SQL migration only (circular dep).
 */
export const companies = pgTable(
  'companies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    taxCode: text('tax_code'),
    priceListId: uuid('price_list_id'),
    address: text('address'),
    phone: text('phone'),
    email: text('email'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    nameIdx: index('companies_name_idx').on(t.name),
  })
)

export type Company = typeof companies.$inferSelect
export type NewCompany = typeof companies.$inferInsert
