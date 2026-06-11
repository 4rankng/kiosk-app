/**
 * Drizzle schema — split into files for readability, re-exported from index.ts.
 */
import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['admin', 'staff'])
export const orderStatusEnum = pgEnum('order_status', ['draft', 'confirmed', 'completed', 'cancelled'])
export const invoiceStatusEnum = pgEnum('invoice_status', ['pending', 'completed', 'cancelled'])
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'bank_transfer', 'card', 'other'])
