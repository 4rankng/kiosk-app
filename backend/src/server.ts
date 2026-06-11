/**
 * HTTP server entry point. Listens on env.PORT.
 * Graceful shutdown on SIGINT/SIGTERM.
 */
import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { pool } from './config/db.js'
import { redis } from './config/redis.js'

const app = createApp()

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info(`🚀 Kiosk API ready at http://localhost:${info.port}`)
    logger.info(`   Environment: ${env.NODE_ENV}`)
    logger.info(`   CORS origin: ${env.CORS_ORIGIN}`)
  }
)

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully…`)
  server.close()
  await pool.end().catch(() => {})
  await redis.quit().catch(() => {})
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection')
})
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')
  process.exit(1)
})
