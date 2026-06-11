/**
 * Schema barrel — single import for drizzle-kit, the runtime client,
 * and relations.
 */
import { relations } from 'drizzle-orm'
import { users } from './users.js'
import { businessEntities } from './business-entities.js'
import { categories } from './categories.js'
import { units } from './units.js'
import { products } from './products.js'
import { priceLists, priceListItems } from './price-lists.js'
import { companies } from './companies.js'
import { customers } from './customers.js'
import { orders, orderItems, payments } from './orders.js'
import { invoices } from './invoices.js'

// Relations -----------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  payments: many(payments),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: 'parent' }),
  children: many(categories, { relationName: 'parent' }),
  products: many(products),
}))

export const unitsRelations = relations(units, ({ many }) => ({
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  unit: one(units, { fields: [products.unitId], references: [units.id] }),
  priceListItems: many(priceListItems),
  orderItems: many(orderItems),
}))

export const priceListsRelations = relations(priceLists, ({ one, many }) => ({
  company: one(companies, { fields: [priceLists.companyId], references: [companies.id] }),
  items: many(priceListItems),
}))

export const priceListItemsRelations = relations(priceListItems, ({ one }) => ({
  priceList: one(priceLists, { fields: [priceListItems.priceListId], references: [priceLists.id] }),
  product: one(products, { fields: [priceListItems.productId], references: [products.id] }),
}))

export const companiesRelations = relations(companies, ({ one, many }) => ({
  priceList: one(priceLists, { fields: [companies.priceListId], references: [priceLists.id] }),
  customers: many(customers),
}))

export const customersRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, { fields: [customers.companyId], references: [companies.id] }),
  orders: many(orders),
  invoices: many(invoices),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  businessEntity: one(businessEntities, { fields: [orders.businessEntityId], references: [businessEntities.id] }),
  createdByUser: one(users, { fields: [orders.createdBy], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
  invoice: one(invoices, { fields: [orders.id], references: [invoices.orderId] }),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  createdByUser: one(users, { fields: [payments.createdBy], references: [users.id] }),
}))

export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, { fields: [invoices.orderId], references: [orders.id] }),
  customer: one(customers, { fields: [invoices.customerId], references: [customers.id] }),
  businessEntity: one(businessEntities, { fields: [invoices.businessEntityId], references: [businessEntities.id] }),
}))

export const businessEntitiesRelations = relations(businessEntities, ({ many }) => ({
  orders: many(orders),
  invoices: many(invoices),
}))

// Re-exports ----------------------------------------------------------------
export * from './enums.js'
export * from './users.js'
export * from './business-entities.js'
export * from './categories.js'
export * from './units.js'
export * from './products.js'
export * from './price-lists.js'
export * from './companies.js'
export * from './customers.js'
export * from './orders.js'
export * from './invoices.js'
