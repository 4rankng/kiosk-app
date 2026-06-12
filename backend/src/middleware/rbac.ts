/**
 * Role-Based Access Control middleware.
 *
 * Usage:
 *   import { adminOnly, anyRole } from '../../middleware/rbac.js'
 *   productRoutes.post('/', requireAuth, adminOnly, handler)
 *   productRoutes.get('/', requireAuth, anyRole, handler)
 */
import type { MiddlewareHandler } from 'hono'
import { Forbidden } from '../lib/errors.js'

type Role = 'admin' | 'staff'

export const requireRole = (...roles: Role[]): MiddlewareHandler => async (c, next) => {
  const user = c.get('user')
  if (!roles.includes(user.role as Role)) {
    throw Forbidden('Bạn không có quyền thực hiện thao tác này')
  }
  await next()
}

export const adminOnly = requireRole('admin')
export const anyRole = requireRole('admin', 'staff')
