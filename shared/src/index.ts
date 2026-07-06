/**
 * @kiosk/shared — Zod input schemas shared between the frontend and backend.
 *
 * These are the create/update PAYLOAD contracts (what crosses the wire on
 * mutations). The backend validates incoming requests against them; the
 * frontend can derive its mutation types from them via `z.infer`. Keeping
 * them in one place means the two apps can never drift on input shape.
 *
 * Response/entity types are intentionally NOT shared here: money columns are
 * `numeric` (string) at the DB/wire layer but `number` in the frontend, an
 * impedance mismatch that needs its own resolution. Input payloads use
 * `z.coerce.number()` for money, which is clean on both sides.
 *
 * Single file (no relative imports) so the compiled `dist/index.js` is
 * self-contained and Node-ESM-safe for the backend's `node dist/server.js`
 * production runtime.
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
//  Customers
// ---------------------------------------------------------------------------
export const customerBaseSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(160),
  companyId: z.string().uuid(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  taxId: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})
export const customerCreateSchema = customerBaseSchema
export const customerUpdateSchema = customerBaseSchema.partial().omit({ companyId: true })

// ---------------------------------------------------------------------------
//  Companies
// ---------------------------------------------------------------------------
export const companyBaseSchema = z.object({
  name: z.string().min(1).max(160),
  taxCode: z.string().optional(),
  priceListId: z.string().uuid().nullable().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
})
export const companyCreateSchema = companyBaseSchema
export const companyUpdateSchema = companyBaseSchema.partial()

// ---------------------------------------------------------------------------
//  Products
// ---------------------------------------------------------------------------
export const productBaseSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  categoryId: z.string().uuid().nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  purchasePrice: z.coerce.number().min(0),
  defaultSalePrice: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().int().default(0),
})
export const productCreateSchema = productBaseSchema
export const productUpdateSchema = productBaseSchema.partial()

// ---------------------------------------------------------------------------
//  Categories
// ---------------------------------------------------------------------------
export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(120),
  parentId: z.string().uuid().nullable().optional(),
})
export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  parentId: z.string().uuid().nullable().optional(),
})

// ---------------------------------------------------------------------------
//  Units
// ---------------------------------------------------------------------------
export const unitCreateSchema = z.object({
  name: z.string().min(1).max(40),
  abbreviation: z.string().max(10).optional(),
})

// ---------------------------------------------------------------------------
//  Business entities
// ---------------------------------------------------------------------------
export const businessEntityCreateSchema = z.object({
  name: z.string().min(1).max(160),
  taxCode: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  headerLines: z.array(z.string().max(200)).max(20).default([]),
})
export const businessEntityUpdateSchema = businessEntityCreateSchema.partial()

// ---------------------------------------------------------------------------
//  Price lists
// ---------------------------------------------------------------------------
export const priceListCreateSchema = z.object({
  name: z.string().min(1).max(160),
  companyId: z.string().uuid().nullable().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
})
export const priceListBulkUpsertItemSchema = z.object({
  productId: z.string().uuid(),
  customPrice: z.coerce.number().min(0),
})
export const priceListBulkUpsertSchema = z.object({
  items: z.array(priceListBulkUpsertItemSchema).max(5000),
})

// ---------------------------------------------------------------------------
//  Orders
// ---------------------------------------------------------------------------
export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0).optional(),
})
export const orderCreateSchema = z.object({
  customerId: z.string().uuid(),
  businessEntityId: z.string().uuid(),
  items: z.array(orderItemSchema).min(1).max(500),
  discount: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'card', 'other']).default('cash'),
  notes: z.string().max(500).optional(),
  generateInvoice: z.boolean().default(true),
})
export const orderStatusSchema = z.object({
  status: z.enum(['draft', 'confirmed', 'completed', 'cancelled']),
})
export const orderPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(['cash', 'bank_transfer', 'card', 'other']).default('cash'),
  note: z.string().max(200).optional(),
})

// ---------------------------------------------------------------------------
//  Derived input types (for frontend mutation payloads).
//  `z.input` is used (not `z.infer`/`z.output`) so fields with `.default()`
//  stay OPTIONAL in the payload — callers may omit them and the backend
//  applies the default during validation.
// ---------------------------------------------------------------------------
export type CustomerCreateInput = z.input<typeof customerCreateSchema>
export type CustomerUpdateInput = z.input<typeof customerUpdateSchema>
export type CompanyCreateInput = z.input<typeof companyCreateSchema>
export type CompanyUpdateInput = z.input<typeof companyUpdateSchema>
export type ProductCreateInput = z.input<typeof productCreateSchema>
export type ProductUpdateInput = z.input<typeof productUpdateSchema>
export type CategoryCreateInput = z.input<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.input<typeof categoryUpdateSchema>
export type UnitCreateInput = z.input<typeof unitCreateSchema>
export type BusinessEntityCreateInput = z.input<typeof businessEntityCreateSchema>
export type BusinessEntityUpdateInput = z.input<typeof businessEntityUpdateSchema>
export type PriceListCreateInput = z.input<typeof priceListCreateSchema>
export type PriceListBulkUpsertInput = z.input<typeof priceListBulkUpsertSchema>
export type OrderCreateInput = z.input<typeof orderCreateSchema>
export type OrderStatusInput = z.input<typeof orderStatusSchema>
export type OrderPaymentInput = z.input<typeof orderPaymentSchema>
