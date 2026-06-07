import { type Table, flexRender } from '@tanstack/react-table'
import { MobileCard } from './mobile-card'
import type { MobileCardConfig } from './mobile-card-types'

interface MobileCardViewProps<TData> {
  table: Table<TData>
  config: MobileCardConfig
  expandedId: string | null
  onToggle: (id: string) => void
}

/**
 * Generic mobile card view for standard TanStack Table pages.
 * Reads a MobileCardConfig to determine which columns fill which card slots.
 * Column resolution uses table.getColumn(key) which matches both accessorKey and id.
 */
export function MobileCardView<TData>({
  table,
  config,
  expandedId,
  onToggle,
}: MobileCardViewProps<TData>) {
  const rows = table.getRowModel().rows

  if (rows.length === 0) {
    return (
      <div className='flex h-24 items-center justify-center text-sm text-muted-foreground'>
        Không có dữ liệu.
      </div>
    )
  }

  // Pre-resolve columns from config keys
  const configEntries = Object.entries(config)
    .map(([key, cardConfig]) => {
      const column = table.getColumn(key)
      if (!column) return null
      return { key, cardConfig, column }
    })
    .filter(Boolean) as Array<{
    key: string
    cardConfig: NonNullable<MobileCardConfig[string]>
    column: ReturnType<typeof table.getColumn>
  }>

  // Separate columns by role
  const titleCol = configEntries.find((e) => e.cardConfig.role === 'title')
  const statusCol = configEntries.find((e) => e.cardConfig.role === 'status')
  const metricCol = configEntries.find((e) => e.cardConfig.role === 'metric')
  const detailCols = configEntries.filter(
    (e) =>
      e.cardConfig.role === 'detail' &&
      !e.cardConfig.hidden
  )
  const hiddenCols = new Set(
    configEntries.filter((e) => e.cardConfig.hidden).map((e) => e.key)
  )

  return (
    <div className='space-y-2'>
      {rows.map((row) => {
        const isExpanded = expandedId === row.id
        const cells = row.getVisibleCells()

        // Get cell content by column key
        function getCellContent(columnKey: string): React.ReactNode {
          const cell = cells.find(
            (c) => c.column.id === columnKey
          )
          if (!cell) return null
          return flexRender(cell.column.columnDef.cell, cell.getContext())
        }

        // Render detail fields (non-hidden, non-title/status/metric)
        const detailFields = detailCols
          .filter((e) => !hiddenCols.has(e.key))
          .map((e) => {
            const content = getCellContent(e.key)
            if (!content) return null
            const label =
              e.cardConfig.label ??
              (() => {
                const hdr = e.column?.columnDef?.header
                if (typeof hdr === 'function') {
                  const str = hdr.toString()
                  const m = str.match(/title:\s*['"`]([^'"`]+)['"`]/)
                  if (m) return m[1]
                }
                if (typeof hdr === 'string') return hdr
                return e.key
              })()
            return { key: e.key, label, content }
          })
          .filter((e): e is NonNullable<typeof e> => e !== null && e.content !== null)

        // Render action buttons (hidden columns are action columns)
        const actionCells = configEntries
          .filter((e) => e.cardConfig.hidden)
          .map((e) => getCellContent(e.key))
          .filter(Boolean)

        return (
          <MobileCard
            key={row.id}
            title={titleCol ? getCellContent(titleCol.key) : row.id}
            status={statusCol ? getCellContent(statusCol.key) : undefined}
            metric={metricCol ? getCellContent(metricCol.key) : undefined}
            expanded={isExpanded}
            onToggle={() => onToggle(row.id)}
            actions={
              actionCells.length > 0 ? <>{actionCells}</> : undefined
            }
          >
            {detailFields.length > 0 && (
              <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
                {detailFields.map((f) => (
                  <div key={f.key}>
                    <span className='text-xs text-muted-foreground'>{f.label}</span>
                    <p className='text-sm'>{f.content}</p>
                  </div>
                ))}
              </div>
            )}
          </MobileCard>
        )
      })}
    </div>
  )
}
