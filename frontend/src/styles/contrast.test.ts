import { describe, expect, it } from 'vitest'
// Loads the app stylesheet chain (tailwind → untitledui → theme) so the
// semantic custom properties exist in the test page.
import './index.css'

/**
 * WCAG 2.x contrast enforcement for the semantic color tokens.
 *
 * Each pair is a combination the app actually renders: foreground text
 * tokens against the surfaces they appear on (white cards, the paper page
 * canvas, and bg-secondary fills). The browser resolves oklch() values to
 * sRGB via a 1×1 canvas, so the measurement matches what users see.
 * A token change or surface change that breaks 4.5:1 fails `pnpm test`.
 */

const TEXT_MIN = 4.5

function readPixel(color: string): [number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context unavailable')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2]]
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(fg: [number, number, number], bg: [number, number, number]): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

function token(name: string): [number, number, number] {
  const probe = document.createElement('span')
  probe.style.display = 'none'
  document.body.appendChild(probe)
  const raw = getComputedStyle(probe).getPropertyValue(name).trim()
  probe.remove()
  if (!raw) throw new Error(`unknown token: ${name}`)
  return readPixel(raw)
}

const WHITE: [number, number, number] = [255, 255, 255]

/** [foreground token, background, background resolution, minimum ratio] */
const PAIRS: Array<[string, string, [number, number, number] | string, number]> = [
  // White card surfaces (cards, dialogs, table bodies)
  ['--color-text-primary', 'white', WHITE, TEXT_MIN],
  ['--color-text-secondary', 'white', WHITE, TEXT_MIN],
  ['--color-text-tertiary', 'white', WHITE, TEXT_MIN],
  ['--color-text-quaternary', 'white', WHITE, TEXT_MIN],
  ['--color-text-warning-primary', 'white', WHITE, TEXT_MIN],
  ['--color-text-success-primary', 'white', WHITE, TEXT_MIN],
  ['--color-text-error-primary', 'white', WHITE, TEXT_MIN],
  // Paper page canvas (page titles, descriptions, breadcrumbs)
  ['--color-text-primary', 'paper', '--color-paper', TEXT_MIN],
  ['--color-text-tertiary', 'paper', '--color-paper', TEXT_MIN],
  ['--color-text-secondary', 'paper', '--color-paper', TEXT_MIN],
  ['--color-text-warning-primary', 'paper', '--color-paper', TEXT_MIN],
  ['--color-text-success-primary', 'paper', '--color-paper', TEXT_MIN],
  ['--color-text-error-primary', 'paper', '--color-paper', TEXT_MIN],
  // Brand text tokens. These resolve from the brand ramp, so any future brand
  // recolour is gated here — brand-600 in particular is both the primary button
  // fill and text-brand-tertiary, and it has to hold up as text on paper.
  ['--color-text-brand-primary', 'white', WHITE, TEXT_MIN],
  ['--color-text-brand-secondary', 'white', WHITE, TEXT_MIN],
  ['--color-text-brand-tertiary', 'white', WHITE, TEXT_MIN],
  ['--color-text-brand-primary', 'paper', '--color-paper', TEXT_MIN],
  ['--color-text-brand-secondary', 'paper', '--color-paper', TEXT_MIN],
  ['--color-text-brand-tertiary', 'paper', '--color-paper', TEXT_MIN],
  ['--color-text-brand-tertiary', 'bg-secondary', '--color-bg-secondary', TEXT_MIN],
  // bg-secondary fills (table headers, chips, muted rows)
  ['--color-text-primary', 'bg-secondary', '--color-bg-secondary', TEXT_MIN],
  ['--color-text-tertiary', 'bg-secondary', '--color-bg-secondary', TEXT_MIN],
  ['--color-text-warning-primary', 'bg-secondary', '--color-bg-secondary', TEXT_MIN],
]

describe('WCAG contrast — semantic token pairs (≥4.5:1)', () => {
  it.each(PAIRS)('%s on %s', (fgName, bgLabel, bgSource, min) => {
    const fg = token(fgName)
    const bg = typeof bgSource === 'string' ? token(bgSource) : bgSource
    const ratio = contrast(fg, bg)
    expect(ratio, `${fgName} on ${bgLabel} measures ${ratio.toFixed(2)}:1 (min ${min}:1)`)
      .toBeGreaterThanOrEqual(min)
  })
})
