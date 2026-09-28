/**
 * Shared dotenv loader — import this instead of 'dotenv/config'.
 *
 * Resolution is anchored to THIS MODULE's location, not process.cwd(). The
 * previous `resolve('.env')` lookup silently fell through to the zod defaults
 * whenever a launcher (e.g. `pnpm -r --parallel dev` from the repo root) did
 * not set cwd to backend/, which surfaced as "CORS origin: http://localhost:5173"
 * and an ephemeral JWT_SECRET at runtime while the file on disk was correct.
 *
 * Order (first hit wins): backend/.env, then the repo-root .env. The root file
 * is what Docker Compose reads, so it stays the documented fallback.
 */
import { config as dotenvConfig } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// backend/src/config/ -> backend/ -> repo root
const moduleDir = dirname(fileURLToPath(import.meta.url))
const backendRoot = resolve(moduleDir, '..', '..')
const repoRoot = resolve(backendRoot, '..')

const candidates = [resolve(backendRoot, '.env'), resolve(repoRoot, '.env')]
const envFile = candidates.find((path) => existsSync(path))

if (envFile) {
  dotenvConfig({ path: envFile })
}
