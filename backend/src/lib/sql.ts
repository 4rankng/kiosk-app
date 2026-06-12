/**
 * Small helpers for working with raw SQL via Drizzle's db.execute().
 */
import { sql } from 'drizzle-orm'
import type { DB } from '../config/db.js'

/**
 * Run a raw SQL query and return typed rows.
 */
export async function query<R = Record<string, unknown>>(
  db: DB,
  queryStr: ReturnType<typeof sql>
): Promise<R[]> {
  const res = await db.execute(queryStr)
  return res.rows as R[]
}

/**
 * Convenience: get the first row, or undefined.
 */
export async function queryOne<R = Record<string, unknown>>(
  db: DB,
  queryStr: ReturnType<typeof sql>
): Promise<R | undefined> {
  const rows = await query<R>(db, queryStr)
  return rows[0]
}
