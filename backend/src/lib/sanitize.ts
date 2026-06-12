/**
 * Strip HTML tags and trim whitespace from string inputs.
 * Apply to all user-provided text fields before DB insert.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')  // strip HTML tags
    .trim()
    .slice(0, 1000)           // max length safety
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]): T {
  const result = { ...obj }
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = sanitizeString(result[field] as string) as T[keyof T]
    }
  }
  return result
}
