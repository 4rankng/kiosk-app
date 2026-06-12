/**
 * Shared dotenv loader — looks for .env in cwd (backend/) then project root (../).
 * Import this instead of 'dotenv/config' so CLI scripts work from the backend/ dir
 * while Docker Compose reads the root .env.
 */
import { config as dotenvConfig } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const localEnv = resolve('.env')
const rootEnv = resolve('..', '.env')
if (existsSync(localEnv)) {
  dotenvConfig({ path: localEnv })
} else if (existsSync(rootEnv)) {
  dotenvConfig({ path: rootEnv })
}
