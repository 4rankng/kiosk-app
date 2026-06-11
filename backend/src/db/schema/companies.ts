import { pgTable, text, uuid, index } from 'drizzle-orm/pg-core'

/**
 * A "Công ty / Chuỗi" — the parent customer group. Always assigned a single
 * price list, which all its child branches inherit automatically.
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
    isActive: text('is_active').notNull().default('true'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    nameIdx: index('companies_name_idx').on(t.name),
  })
)

export type Company = typeof companies.$inferSelect
export type NewCompany = typeof companies.$inferInsert
