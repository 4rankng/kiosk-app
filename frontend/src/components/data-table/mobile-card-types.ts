export type CardRole = 'title' | 'status' | 'metric' | 'detail'

export interface CardColumnConfig {
  role: CardRole
  /** Custom label override (defaults to column header) */
  label?: string
  /** Hide this column on mobile cards entirely (e.g., action columns) */
  hidden?: boolean
}

/**
 * Map from column accessorKey or id to mobile card config.
 * Keys must match either `accessorKey` or `id` on the column definition.
 * Example: { name: { role: 'title' }, total: { role: 'metric' }, actions: { hidden: true } }
 */
export type MobileCardConfig<T extends string = string> = Partial<Record<T, CardColumnConfig>>
