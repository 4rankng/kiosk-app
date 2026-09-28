import { describe, expect, it } from 'vitest'
import { formatCurrency, toNumber } from './format'

/**
 * Regression cover for the class of bug this helper exists to stop.
 *
 * Every money column in this app is `numeric(15,2)` in Postgres, and Drizzle
 * returns those as **strings**. The failure mode is nasty because it is silent
 * in two directions at once: `Intl.NumberFormat` coerces the string, so
 * individual amounts *look* right, while `+` concatenates instead of adding —
 * `0 + "30000.00" + "38000.00"` is `"030000.0038000.00"`, and subtracting a
 * discount from that yields NaN, which then rendered as a literal
 * "NaN đ" in the order summary.
 */
describe('toNumber', () => {
  it('passes real numbers through', () => {
    expect(toNumber(30000)).toBe(30000)
    expect(toNumber(0)).toBe(0)
    expect(toNumber(-1500)).toBe(-1500)
  })

  it('parses the string form a numeric(15,2) column arrives as', () => {
    expect(toNumber('30000.00')).toBe(30000)
    expect(toNumber('0.00')).toBe(0)
    expect(toNumber('1234.56')).toBe(1234.56)
    expect(toNumber('-500.25')).toBe(-500.25)
  })

  it('collapses missing and unparseable values to 0 rather than NaN', () => {
    expect(toNumber(null)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
    expect(toNumber('')).toBe(0)
    expect(toNumber('   ')).toBe(0)
    expect(toNumber('abc')).toBe(0)
    expect(toNumber(Number.NaN)).toBe(0)
    expect(toNumber(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('stops a string price from poisoning a sum', () => {
    // The exact shape of the POS bug.
    const items = [{ total: '30000.00' }, { total: '38000.00' }]
    const subtotal = items.reduce((s, i) => s + toNumber(i.total), 0)
    expect(subtotal).toBe(68000)
    expect(Number.isNaN(subtotal)).toBe(false)
  })
})

describe('formatCurrency', () => {
  it('formats both numbers and string amounts identically', () => {
    expect(formatCurrency(30000)).toBe('30.000 đ')
    expect(formatCurrency('30000.00')).toBe('30.000 đ')
  })

  it('never renders NaN', () => {
    expect(formatCurrency(Number.NaN)).toBe('0 đ')
    expect(formatCurrency(undefined)).toBe('0 đ')
    expect(formatCurrency(null)).toBe('0 đ')
    expect(formatCurrency('not-a-number')).toBe('0 đ')
  })
})
