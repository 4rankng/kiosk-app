/**
 * Escape a string for safe interpolation into HTML text content or
 * quoted attribute values. Prevents stored-XSS when backend-derived
 * strings are embedded into HTML templates (e.g. invoice print documents).
 *
 * Escapes: & < > " '
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
