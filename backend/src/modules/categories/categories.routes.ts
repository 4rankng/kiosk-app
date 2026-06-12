/**
 * Categories — self-referencing tree. Read returns nested tree; write is flat.
 * GET    /api/categories       — returns full tree
 * POST   /api/categories       — create (inline-create friendly)
 * PATCH  /api/categories/:id   — rename / re-parent
 * DELETE /api/categories/:id   — refuses if products or children exist
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { eq, sql } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { categories, products } from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { adminOnly, anyRole } from '../../middleware/rbac.js'
import { ok, created } from '../../lib/response.js'
import { Conflict, NotFound } from '../../lib/errors.js'

export const categoryRoutes = new Hono()
categoryRoutes.use('*', requireAuth, anyRole)

const createSchema = z.object({
  name: z.string().min(1).max(120),
  parentId: z.string().uuid().nullable().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  parentId: z.string().uuid().nullable().optional(),
})

categoryRoutes.get('/', async (c) => {
  const rows = await db.select().from(categories).orderBy(categories.name)
  // Build nested tree
  const byId = new Map(rows.map((r) => [r.id, { ...r, children: [] as typeof rows }]))
  const roots = [] as Array<typeof rows[number] & { children: unknown[] }>
  for (const r of rows) {
    if (r.parentId && byId.has(r.parentId)) {
      byId.get(r.parentId)!.children.push(r)
    } else {
      roots.push({ ...r, children: [] })
    }
  }
  return ok(c, { items: rows, tree: roots })
})

categoryRoutes.post('/', adminOnly, zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  if (body.parentId) {
    const [parent] = await db.select().from(categories).where(eq(categories.id, body.parentId)).limit(1)
    if (!parent) throw NotFound('Danh mục cha không tồn tại')
  }
  const [row] = await db
    .insert(categories)
    .values({ name: body.name, parentId: body.parentId ?? null, createdAt: new Date() })
    .returning()
  return created(c, row)
})

categoryRoutes.patch('/:id', adminOnly, zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
  if (!existing) throw NotFound('Danh mục không tồn tại')
  // prevent re-parenting to a descendant (would create a cycle)
  if (body.parentId === id) throw Conflict('Không thể đặt danh mục làm cha của chính nó')
  const [row] = await db
    .update(categories)
    .set({ name: body.name ?? existing.name, parentId: body.parentId === undefined ? existing.parentId : body.parentId })
    .where(eq(categories.id, id))
    .returning()
  return ok(c, row)
})

categoryRoutes.delete('/:id', adminOnly, async (c) => {
  const id = c.req.param('id')!
  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
  if (!existing) throw NotFound('Danh mục không tồn tại')
  const [{ prodCount = 0 } = { prodCount: 0 }] = await db
    .select({ prodCount: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.categoryId, id))
  const [{ childCount = 0 } = { childCount: 0 }] = await db
    .select({ childCount: sql<number>`count(*)::int` })
    .from(categories)
    .where(eq(categories.parentId, id))
  if (prodCount > 0) throw Conflict('Không thể xóa: danh mục đang chứa sản phẩm')
  if (childCount > 0) throw Conflict('Không thể xóa: danh mục đang chứa danh mục con')
  await db.delete(categories).where(eq(categories.id, id))
  return ok(c, { deleted: true })
})
