/**
 * Runs pending Drizzle migrations against DATABASE_URL.
 * Safe to run repeatedly — only unapplied migrations run.
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

async function main() {
  const url =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`

  const pool = new Pool({ connectionString: url, max: 1 })
  const db = drizzle(pool)

  console.log('⏳ Running migrations…')
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('✅ Migrations complete')

  await pool.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
