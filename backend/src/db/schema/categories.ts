import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

/**
 * Self-referencing product category tree. Supports the multi-level grouping
 * the spec calls for (e.g. Gia vị > Bột > Bột chiên xù).
 */
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  parentId: uuid('parent_id'),
  createdAt: text('created_at').notNull(),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
