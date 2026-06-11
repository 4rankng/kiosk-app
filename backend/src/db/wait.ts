/**
 * Polls the database until it's ready to accept connections, or exits after
 * a timeout. Used by `make dev` to avoid race conditions between the
 * `docker compose up` and the migration step.
 */
import pg from 'pg'
import 'dotenv/config'

const { Client } = pg

const MAX_ATTEMPTS = 30
const DELAY_MS = 2000

async function main() {
  const url =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`

  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    const client = new Client({ connectionString: url, connectionTimeoutMillis: 3000 })
    try {
      await client.connect()
      await client.query('SELECT 1')
      await client.end()
      console.log(`✅ Database ready (attempt ${i})`)
      process.exit(0)
    } catch (err) {
      await client.end().catch(() => {})
      if (i === MAX_ATTEMPTS) {
        console.error(`❌ Database not ready after ${MAX_ATTEMPTS} attempts:`, err)
        process.exit(1)
      }
      process.stdout.write('.')
      await new Promise((r) => setTimeout(r, DELAY_MS))
    }
  }
}

main()
