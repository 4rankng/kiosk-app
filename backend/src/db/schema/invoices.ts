import { pgTable, text, uuid, numeric, timestamp, index } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'
import { customers } from './customers.js'
import { businessEntities } from './business-entities.js'
import { invoiceStatusEnum } from './enums.js'

/**
 * Invoices — a stable, printable view of a completed order. Mirrors the
 * order header + items; intentionally a separate table for fast history
 * queries and to allow future "credit-note" / "void" flows without
 * rewriting order history.
 */
export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull().unique(), // HD000001
    orderId: uuid('order_id')
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: 'restrict' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'restrict' }),
    businessEntityId: uuid('business_entity_id')
      .notNull()
      .references(() => businessEntities.id, { onDelete: 'restrict' }),
    status: invoiceStatusEnum('status').notNull().default('completed'),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    discount: numeric('discount', { precision: 15, scale: 2 }).notNull().default('0'),
    total: numeric('total', { precision: 15, scale: 2 }).notNull(),
    paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).notNull().default('0'),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    customerIdx: index('invoices_customer_idx').on(t.customerId),
    issuedAtIdx: index('invoices_issued_at_idx').on(t.issuedAt),
  })
)

export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
