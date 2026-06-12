/**
 * Products — CRUD with optional `priceListId` query param.
 * When ?priceListId= is provided, products get an `effectivePrice` field
 * resolved as: company PL > general PL > defaultSalePrice.
 *
 * Auto-creates a price-list-item in the GENERAL price list on POST
 * (matches the spec: "khi sản phẩm được lưu, tạo bản ghi Bảng giá chung mới").
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { adminOnly, anyRole } from '../../middleware/rbac.js'
import { ok, created, paginated } from '../../lib/response.js'
import { parsePagination } from '../../lib/pagination.js'
import { productService } from './products.service.js'

export const productRoutes = new Hono()
productRoutes.use('*', requireAuth, anyRole)

const baseSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  categoryId: z.string().uuid().nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  purchasePrice: z.coerce.number().min(0),
  defaultSalePrice: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().int().default(0),
})

const createSchema = baseSchema
const updateSchema = baseSchema.partial()

// ---------------------------------------------------------------------------
productRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const categoryId = c.req.query('categoryId')
  const priceListId = c.req.query('priceListId') || null
  const { items, total } = await productService.list({ page, pageSize, offset, q, categoryId, priceListId })
  return paginated(c, items, total, page, pageSize)
})

productRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const priceListId = c.req.query('priceListId') || null
  const row = await productService.getById(id, priceListId)
  return ok(c, row)
})

productRoutes.post('/', adminOnly, zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const row = await productService.create(body)
  return created(c, row)
})

productRoutes.patch('/:id', adminOnly, zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const row = await productService.update(id, body)
  return ok(c, row)
})

productRoutes.delete('/:id', adminOnly, async (c) => {
  const id = c.req.param('id')!
  const result = await productService.remove(id)
  return ok(c, result)
})
