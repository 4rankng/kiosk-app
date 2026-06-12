/**
 * Drops all tables in the public schema and re-applies migrations + seed.
 * Intended for `make db-reset` (destructive). Will prompt unless FORCE=1.
 */
import '../config/dotenv.js'
import pg from 'pg'

const url =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`

const { Client } = pg

async function main() {
  if (!process.env.FORCE) {
    console.log('⚠ This will DROP all tables. Re-run with FORCE=1 to confirm.')
    process.exit(0)
  }

  const client = new Client({ connectionString: url })
  await client.connect()
  console.log('⏳ Dropping public schema…')
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
  await client.end()
  console.log('✅ Schema dropped. Running migrations…')

  // Delegate to migrate by spawning tsx
  const { spawnSync } = await import('node:child_process')
  const migrate = spawnSync('pnpm', ['db:migrate'], { stdio: 'inherit' })
  if (migrate.status !== 0) process.exit(migrate.status ?? 1)
  console.log('✅ Reset complete. Create an admin with: pnpm admin:create')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Reset failed:', err)
  process.exit(1)
})
