/**
 * Shared database helpers — existence and uniqueness assertions.
 * Uses a constrained generic to access `.id` and `.code` columns
 * without resorting to `as any` casts.
 */
import { eq, and, ne } from 'drizzle-orm'
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core'
import { db } from '../config/db.js'
import { NotFound, Conflict } from './errors.js'

/** Any Drizzle table that has a UUID `id` column. */
type TableWithId = PgTableWithColumns<{
  columns: { id: PgColumn }
  dialect: 'pg'
  schema: string | undefined
  name: string
}>

/** Any Drizzle table that has `id` and `code` columns. */
type TableWithIdAndCode = PgTableWithColumns<{
  columns: { id: PgColumn; code: PgColumn }
  dialect: 'pg'
  schema: string | undefined
  name: string
}>

/** Assert that a row with the given ID exists. Throws NotFound if not. */
export async function assertExists(
  table: TableWithId,
  id: string,
  errorMsg: string
): Promise<void> {
  const [row] = await db.select({ id: table.id }).from(table).where(eq(table.id, id)).limit(1)
  if (!row) throw NotFound(errorMsg)
}

/** Assert that no row with the given code exists (for uniqueness checks). Throws Conflict if found. */
export async function assertUniqueCode(
  table: TableWithIdAndCode,
  code: string,
  errorMsg: string,
  excludeId?: string
): Promise<void> {
  const conditions = [eq(table.code, code)]
  if (excludeId) {
    conditions.push(ne(table.id, excludeId))
  }
  const [existing] = await db.select({ id: table.id }).from(table).where(and(...conditions)).limit(1)
  if (existing) throw Conflict(errorMsg)
}
