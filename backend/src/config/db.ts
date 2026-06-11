/**
 * Drizzle ORM client — single shared pg.Pool across the app.
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { databaseUrl, isProduction } from './env.js'
import { logger } from './logger.js'
import * as schema from '../db/schema/index.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString: databaseUrl,
  max: isProduction ? 20 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected pg pool error')
})

export const db = drizzle(pool, {
  schema,
  casing: 'snake_case',
  logger: false, // set to true for SQL debug
})

export type DB = typeof db
