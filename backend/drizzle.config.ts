import type { Config } from 'drizzle-kit'
import { config as dotenvConfig } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Load .env from cwd (backend/) first, then project root (../)
const localEnv = resolve('.env')
const rootEnv = resolve('..', '.env')
if (existsSync(localEnv)) {
  dotenvConfig({ path: localEnv })
} else if (existsSync(rootEnv)) {
  dotenvConfig({ path: rootEnv })
}

const user = process.env.POSTGRES_USER || 'postgres'
const pass = process.env.POSTGRES_PASSWORD || 'postgres'
const host = process.env.POSTGRES_HOST || 'localhost'
const port = process.env.POSTGRES_PORT || '5432'
const name = process.env.POSTGRES_DB || 'kiosk_db'

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || `postgresql://${user}:${pass}@${host}:${port}/${name}`,
  },
  strict: true,
  verbose: true,
} satisfies Config
