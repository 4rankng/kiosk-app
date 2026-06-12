/**
 * Bootstrap the first admin user.
 *
 * Usage:
 *   pnpm admin:create -- --email=you@example.com --password=strongpass --name="Your Name"
 *
 *   or with env vars:
 *   BOOTSTRAP_ADMIN_EMAIL=you@example.com \
 *   BOOTSTRAP_ADMIN_PASSWORD=strongpass \
 *   BOOTSTRAP_ADMIN_NAME="Your Name" \
 *     pnpm admin:create
 *
 * Refuses to run if any user already exists. Idempotent / safe.
 */
import '../config/dotenv.js'
import { eq, sql } from 'drizzle-orm'
import { db, pool } from '../config/db.js'
import { users } from '../db/schema/users.js'
import { hashPassword } from '../lib/password.js'
import { queryOne } from '../lib/sql.js'

function parseArgs(): { email: string; password: string; name: string; role: 'admin' | 'staff' } {
  const argv = process.argv.slice(2)
  const fromArgs = Object.fromEntries(
    argv
      .filter((a) => a.startsWith('--'))
      .map((a) => {
        const [k, v] = a.replace(/^--/, '').split('=')
        return [k, v ?? '']
      })
  )

  const email = (fromArgs.email || process.env.BOOTSTRAP_ADMIN_EMAIL || '').toLowerCase().trim()
  const password = fromArgs.password || process.env.BOOTSTRAP_ADMIN_PASSWORD || ''
  const name = fromArgs.name || process.env.BOOTSTRAP_ADMIN_NAME || ''
  const role = (fromArgs.role as 'admin' | 'staff') || (process.env.BOOTSTRAP_ADMIN_ROLE as 'admin' | 'staff') || 'admin'

  const errors: string[] = []
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('--email must be a valid email address')
  if (!password || password.length < 8) errors.push('--password must be at least 8 characters')
  if (!name) errors.push('--name is required')
  if (role !== 'admin' && role !== 'staff') errors.push('--role must be "admin" or "staff"')
  if (errors.length > 0) {
    console.error('❌ Invalid arguments:')
    for (const e of errors) console.error('   - ' + e)
    console.error('')
    console.error('Usage:')
    console.error('  pnpm admin:create -- --email=you@example.com --password=strongpass --name="Your Name" [--role=admin]')
    process.exit(1)
  }

  return { email, password, name, role }
}

async function main() {
  const { email, password, name, role } = parseArgs()

  // Refuse to run if any users already exist
  const r = await queryOne<{ count: number }>(db, sql`SELECT count(*)::int AS count FROM users`)
  const count = Number(r?.count ?? 0)
  if (count > 0) {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    if (existing) {
      console.error(`❌ User with email "${email}" already exists. Aborting.`)
      process.exit(1)
    }
    console.error('❌ A user already exists in the system. New admins must be created by an existing admin via POST /api/auth/register.')
    console.error('   (This CLI is only for first-time bootstrap.)')
    process.exit(1)
  }

  const passwordHash = await hashPassword(password)
  const inserted = await db
    .insert(users)
    .values([
      {
        email,
        name,
        passwordHash,
        role,
        isActive: true,
      },
    ])
    .returning()
  const u = inserted[0]!

  console.log('✅ Admin user created:')
  console.log(`   ID:    ${u!.id}`)
  console.log(`   Email: ${u!.email}`)
  console.log(`   Name:  ${u!.name}`)
  console.log(`   Role:  ${u!.role}`)
  console.log('')
  console.log('You can now sign in at /api/auth/login')
  await pool.end()
  process.exit(0)
}

main().catch(async (err) => {
  console.error('❌ Failed to create admin:', err)
  await pool.end().catch(() => {})
  process.exit(1)
})
