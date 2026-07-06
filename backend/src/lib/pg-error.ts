/**
 * Narrow an unknown caught value to a PostgreSQL error — an object carrying a
 * string `.code` such as '23503' (foreign-key violation) or '23505' (unique
 * violation). Use after `catch (e: unknown)` instead of `e: any`.
 */
export function isPgError(e: unknown): e is { code: string } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    typeof (e as { code: unknown }).code === 'string'
  )
}
