import type { Column } from '@tanstack/react-table'

/**
 * Map a TanStack Table column's sort state to the ARIA `aria-sort` value for
 * its `<th>` cell. Returns `undefined` for non-sortable columns so the
 * attribute is omitted entirely.
 */
export function getColumnAriaSort<TData, TValue>(
  column: Column<TData, TValue>
): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.getCanSort()) return undefined
  const dir = column.getIsSorted()
  if (dir === 'asc') return 'ascending'
  if (dir === 'desc') return 'descending'
  return 'none'
}
