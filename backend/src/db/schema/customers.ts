import { pgTable, text, uuid, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { companies } from './companies.js'

/**
 * A "Chi nhánh / Nhà hàng" — a single delivery point. Must belong to a
 * company so it inherits the company's price list.
 */
export const customers = pgTable(
  'customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'restrict' }),
    phone: text('phone'),
    email: text('email'),
    taxId: text('tax_id'),
    address: text('address'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    codeIdx: uniqueIndex('customers_code_idx').on(t.code),
    nameIdx: index('customers_name_idx').on(t.name),
    companyIdx: index('customers_company_idx').on(t.companyId),
  })
)

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
