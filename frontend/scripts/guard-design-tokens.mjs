#!/usr/bin/env node
/**
 * Design-token guard for the Fresh Market system.
 *
 * Bans, in app code (shadcn primitives in src/components/ui are exempt):
 *   1. palette-numbered Tailwind color utilities (text-emerald-600-style) —
 *      semantic tokens (text-success, bg-warning/10, ...) only;
 *   2. `dark:` variants — the app is light-only;
 *   3. display-size text utilities (text-xl and up) — the type contract is
 *      11px/12px via theme.css tokens.
 *
 * Exit 1 lists every violation with file:line. Run via `pnpm lint:tokens`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const FRONTEND_ROOT = fileURLToPath(new URL('..', import.meta.url))
const SCAN_DIRS = [
  'src/features',
  'src/components',
  'src/context',
  'src/routes',
  'src/hooks',
  'src/lib',
  'src/services',
]
// Untitled UI component source (third-party, semantic classes by design) is
// exempt; everything else in app code stays subject to the contract.
const EXEMPT_DIRS = [
  'src/components/ui',
  'src/components/base',
  'src/components/application',
  'src/components/foundations',
]
const EXTENSIONS = new Set(['.ts', '.tsx'])
const SKIP_FILE = /\.test\.(ts|tsx)$/

const RULES = [
  {
    name: 'palette-numbered color utility (use semantic tokens, e.g. text-success)',
    re: /(?:text|bg|border|ring|fill|stroke|from|to|via|divide|outline|accent|caret|placeholder|decoration|shadow)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/g,
  },
  {
    name: 'dark: variant (app is light-only)',
    re: /\bdark:/g,
  },
  {
    name: 'display-size text utility (11/12px type contract; use text-sm/text-display)',
    re: /\btext-(?:xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g,
  },
]

const violations = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const rel = full.replaceAll('\\', '/').slice(FRONTEND_ROOT.length)
    if (statSync(full).isDirectory()) {
      if (EXEMPT_DIRS.some((exempt) => rel === exempt || rel.startsWith(exempt + '/'))) continue
      walk(full)
      continue
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue
    if (SKIP_FILE.test(entry)) continue
    const lines = readFileSync(full, 'utf8').split('\n')
    lines.forEach((line, i) => {
      for (const rule of RULES) {
        rule.re.lastIndex = 0
        const m = rule.re.exec(line)
        if (m) violations.push(`${rel}:${i + 1}  [${rule.name}]  ${line.trim().slice(0, 120)}`)
      }
    })
  }
}

SCAN_DIRS.forEach((dir) => {
  try {
    walk(join(FRONTEND_ROOT, dir))
  } catch {
    // dir absent — fine
  }
})

if (violations.length > 0) {
  console.error(`design-token guard: ${violations.length} violation(s)\n`)
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log('design-token guard: clean (semantic tokens, light-only, 11/12px contract respected)')
