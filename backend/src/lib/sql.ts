/**
 * Small helpers for working with raw SQL results from drizzle's
 * `db.execute()`. The result has a `.rows` array we want to type.
 */
import { sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

/**
 * Run a query and return typed rows. Throws if there is no `rows` array
 * (which shouldn't happen for SELECTs).
 */
export async function query<R = Record<string, unknown>>(q: SQL): Promise<R[]> {
  const res = await (q as unknown as { execute: () => Promise<{ rows: R[] }> }).execute()
  return res.rows
}

/**
 * Convenience: get the first row, or undefined.
 */
export async function queryOne<R = Record<string, unknown>>(q: SQL): Promise<R | undefined> {
  const rows = await query<R>(q)
  return rows[0]
}
