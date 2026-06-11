/**
 * Parse ?page= and ?pageSize= query params with sane defaults + max guards.
 */
import { z } from 'zod'
import { BadRequest } from './errors.js'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  q: z.string().trim().optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export function parsePagination(c: { req: { query: (key: string) => string | undefined } }): {
  page: number
  pageSize: number
  offset: number
  q?: string
} {
  const result = paginationQuerySchema.safeParse({
    page: c.req.query('page'),
    pageSize: c.req.query('pageSize'),
    q: c.req.query('q'),
  })

  if (!result.success) {
    throw BadRequest('Invalid pagination params', result.error.flatten().fieldErrors)
  }

  const { page, pageSize, q } = result.data
  return { page, pageSize, offset: (page - 1) * pageSize, q }
}
