import { pgTable, text, uuid, integer, numeric, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { categories } from './categories.js'
import { units } from './units.js'

/**
 * Product catalog. Stock is tracked only as a denormalized integer for
 * display ("Tồn kho") in the price-list management screen — the spec
 * explicitly excludes formal inventory management, so we don't track
 * stock movements or reservations.
 */
export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    unitId: uuid('unit_id').references(() => units.id, { onDelete: 'set null' }),
    purchasePrice: numeric('purchase_price', { precision: 15, scale: 2 }).notNull().default('0'),
    defaultSalePrice: numeric('default_sale_price', { precision: 15, scale: 2 }).notNull().default('0'),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    codeIdx: uniqueIndex('products_code_idx').on(t.code),
    nameIdx: index('products_name_idx').on(t.name),
    categoryIdx: index('products_category_idx').on(t.categoryId),
  })
)

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
