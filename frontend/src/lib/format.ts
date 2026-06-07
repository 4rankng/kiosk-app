const currencyFormatter = new Intl.NumberFormat('vi-VN')
const numberFormatter = new Intl.NumberFormat('vi-VN')

export function formatCurrency(amount: number): string {
  return `${currencyFormatter.format(amount)} đ`
}

/** Format a number in Vietnamese locale (X.XXX) without currency suffix */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
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
