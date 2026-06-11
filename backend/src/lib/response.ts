/**
 * Standard JSON response envelope used by all successful endpoints.
 *
 *   { data: T, meta?: { ... } }
 */
import type { Context } from 'hono'

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function ok<T>(c: Context, data: T, meta?: Record<string, unknown>) {
  return c.json({ data, ...(meta ? { meta } : {}) }, 200)
}

export function created<T>(c: Context, data: T) {
  return c.json({ data }, 201)
}

export function noContent(c: Context) {
  return c.body(null, 204)
}

export function paginated<T>(c: Context, items: T[], total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return c.json(
    {
      data: items,
      meta: { page, pageSize, total, totalPages } satisfies PaginationMeta,
    },
    200
  )
}
