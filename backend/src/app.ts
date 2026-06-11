/**
 * App factory — builds a Hono app with all middleware + routes wired.
 * Used by server.ts (real HTTP server) and tests (superfetch).
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error.js'
import { requestLogger } from './middleware/logger.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { productRoutes } from './modules/products/products.routes.js'
import { categoryRoutes } from './modules/categories/categories.routes.js'
import { unitRoutes } from './modules/units/units.routes.js'
import { priceListRoutes } from './modules/price-lists/price-lists.routes.js'
import { companyRoutes } from './modules/companies/companies.routes.js'
import { customerRoutes } from './modules/customers/customers.routes.js'
import { orderRoutes } from './modules/orders/orders.routes.js'
import { invoiceRoutes } from './modules/invoices/invoices.routes.js'
import { reportRoutes } from './modules/reports/reports.routes.js'
import { businessEntityRoutes } from './modules/business-entities/business-entities.routes.js'
import { healthRoutes } from './modules/health/health.routes.js'
import { NotFound } from './lib/errors.js'

export function createApp() {
  const app = new Hono()

  // Global middleware
  app.use('*', secureHeaders())
  app.use(
    '*',
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    })
  )
  app.use('*', requestLogger)

  // Health (no auth)
  app.route('/api/health', healthRoutes)

  // Auth (login + Google OAuth are public; refresh + me + logout are authed)
  app.route('/api/auth', authRoutes)

  // Authenticated modules
  app.route('/api/products', productRoutes)
  app.route('/api/categories', categoryRoutes)
  app.route('/api/units', unitRoutes)
  app.route('/api/price-lists', priceListRoutes)
  app.route('/api/companies', companyRoutes)
  app.route('/api/customers', customerRoutes)
  app.route('/api/orders', orderRoutes)
  app.route('/api/invoices', invoiceRoutes)
  app.route('/api/reports', reportRoutes)
  app.route('/api/business-entities', businessEntityRoutes)

  // 404
  app.notFound((c) => {
    throw NotFound(`Route not found: ${c.req.method} ${c.req.path}`)
  })

  // Global error handler (must be last)
  app.onError(errorHandler)

  return app
}

export type App = ReturnType<typeof createApp>
