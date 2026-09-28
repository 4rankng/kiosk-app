const currencyFormatter = new Intl.NumberFormat('vi-VN')
const numberFormatter = new Intl.NumberFormat('vi-VN')

/**
 * Coerce a money value to a real number.
 *
 * Every money column in this app is `numeric(15,2)` in Postgres, and Drizzle
 * returns `numeric` as a **string** to preserve precision. So `purchasePrice`,
 * `defaultSalePrice`, `customPrice`, `subtotal`, `total` and friends arrive as
 * `"38000.00"`, not `38000`.
 *
 * That is a trap, because the failure is silent in two directions:
 *   - `Intl.NumberFormat` coerces the string, so displays look right;
 *   - `+` concatenates instead of adding, so `0 + "30000.00" + "38000.00"`
 *     yields `"030000.0038000.00"`, and `subtotal - discount` is then NaN.
 *
 * Always run money through this before doing arithmetic on it. Undefined,
 * null, empty strings and unparseable values all collapse to 0 rather than
 * poisoning a total with NaN.
 */
export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value !== 'string' || value.trim() === '') return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function formatCurrency(amount: number | string | null | undefined): string {
  return `${currencyFormatter.format(toNumber(amount))} đ`
}

/** Format a number in Vietnamese locale (X.XXX) without currency suffix */
export function formatNumber(value: number | string | null | undefined): string {
  return numberFormatter.format(toNumber(value))
}

/** Parse a formatted number string back to a plain number (strips dots/spaces) */
export function parseFormattedNumber(formatted: string): number {
  return parseInt(formatted.replace(/[^\d]/g, ''), 10) || 0
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
