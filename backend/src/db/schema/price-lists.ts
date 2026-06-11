import { pgTable, text, uuid, numeric, uniqueIndex, index, integer } from 'drizzle-orm/pg-core'
import { companies } from './companies.js'
import { products } from './products.js'

/**
 * A "price book". A row with companyId=NULL is the *general* price book
 * that backs retail and acts as the fallback for any product not overridden
 * in a company's specific book.
 */
export const priceLists = pgTable(
  'price_lists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    description: text('description'),
    isDefault: text('is_default').notNull().default('false'), // "true" for the general PL
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    companyIdx: index('price_lists_company_idx').on(t.companyId),
  })
)

/**
 * Per-product price override inside a price list. Resolution order at order
 * time: company-specific PL > general PL > product.defaultSalePrice.
 */
export const priceListItems = pgTable(
  'price_list_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    priceListId: uuid('price_list_id')
      .notNull()
      .references(() => priceLists.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    customPrice: numeric('custom_price', { precision: 15, scale: 2 }).notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    uniqProduct: uniqueIndex('price_list_items_pl_product_unique').on(t.priceListId, t.productId),
    productIdx: index('price_list_items_product_idx').on(t.productId),
  })
)

export type PriceList = typeof priceLists.$inferSelect
export type NewPriceList = typeof priceLists.$inferInsert
export type PriceListItem = typeof priceListItems.$inferSelect
export type NewPriceListItem = typeof priceListItems.$inferInsert
