import { pgTable, text, uuid, numeric, timestamp, index, integer } from 'drizzle-orm/pg-core'
import { customers } from './customers.js'
import { businessEntities } from './business-entities.js'
import { products } from './products.js'
import { users } from './users.js'
import { orderStatusEnum, paymentMethodEnum } from './enums.js'

/**
 * An order. A completed order spawns an invoice in the `invoices` table.
 * The `code` field is the human-readable identifier (DH000001, ...).
 */
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull().unique(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'restrict' }),
    businessEntityId: uuid('business_entity_id')
      .notNull()
      .references(() => businessEntities.id, { onDelete: 'restrict' }),
    status: orderStatusEnum('status').notNull().default('confirmed'),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    discount: numeric('discount', { precision: 15, scale: 2 }).notNull().default('0'),
    total: numeric('total', { precision: 15, scale: 2 }).notNull(),
    paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).notNull().default('0'),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    customerIdx: index('orders_customer_idx').on(t.customerId),
    createdAtIdx: index('orders_created_at_idx').on(t.createdAt),
    statusIdx: index('orders_status_idx').on(t.status),
  })
)

/**
 * Line items. `unitPrice` is the FINAL price used at order time (after
 * price-list resolution). We store it explicitly so historical invoices
 * are stable even if the price list later changes.
 */
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    productName: text('product_name').notNull(), // snapshot
    unit: text('unit').notNull(), // snapshot
    quantity: numeric('quantity', { precision: 15, scale: 3 }).notNull(),
    unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).notNull(),
    totalPrice: numeric('total_price', { precision: 15, scale: 2 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => ({
    orderIdx: index('order_items_order_idx').on(t.orderId),
    productIdx: index('order_items_product_idx').on(t.productId),
  })
)

/**
 * Payments against an order. An order can have multiple partial payments
 * (used for the "Tiền chưa thu" column in the debt report).
 */
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    method: paymentMethodEnum('method').notNull().default('cash'),
    paidAt: timestamp('paid_at', { withTimezone: true }).notNull().defaultNow(),
    note: text('note'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (t) => ({
    orderIdx: index('payments_order_idx').on(t.orderId),
  })
)

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
