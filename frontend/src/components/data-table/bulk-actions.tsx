import { useEffect, useRef, useState } from 'react'
import { X } from '@untitledui/icons'
import { type Table } from '@tanstack/react-table'
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { cn } from '@/lib/utils'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  entityName: string
  children: React.ReactNode
}

/**
 * Floating toolbar shown when table rows are selected. Keyboard navigation
 * (arrow keys / Home / End / Escape) and the screen-reader live region are
 * preserved from the previous implementation; visuals now use Untitled UI
 * tokens.
 */
export function DataTableBulkActions<TData>({
  table,
  entityName,
  children,
}: DataTableBulkActionsProps<TData>): React.ReactNode | null {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [announcement, setAnnouncement] = useState('')

  // Announce selection changes to screen readers
  useEffect(() => {
    if (selectedCount > 0) {
      const message = `Đã chọn ${selectedCount} ${entityName}. Bảng hành động hàng loạt khả dụng.`

      // Use queueMicrotask to defer state update and avoid cascading renders
      queueMicrotask(() => {
        setAnnouncement(message)
      })

      // Clear announcement after a delay
      const timer = setTimeout(() => setAnnouncement(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [selectedCount, entityName])

  const handleClearSelection = () => {
    table.resetRowSelection()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const buttons = toolbarRef.current?.querySelectorAll('button')
    if (!buttons) return

    const currentIndex = Array.from(buttons).findIndex(
      (button) => button === document.activeElement
    )

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % buttons.length
        buttons[nextIndex]?.focus()
        break
      }
      case 'ArrowLeft': {
        event.preventDefault()
        const prevIndex =
          currentIndex === 0 ? buttons.length - 1 : currentIndex - 1
        buttons[prevIndex]?.focus()
        break
      }
      case 'Home':
        event.preventDefault()
        buttons[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        buttons[buttons.length - 1]?.focus()
        break
      case 'Escape': {
        // If focus is inside an open dropdown menu (which closes on Escape),
        // let the menu handle the key and keep the row selection.
        const target = event.target as HTMLElement
        const activeElement = document.activeElement as HTMLElement

        const isFromDropdown =
          target?.closest('[role="menu"]') ||
          activeElement?.closest('[role="menu"]')

        if (isFromDropdown) {
          return
        }

        event.preventDefault()
        handleClearSelection()
        break
      }
    }
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
        role='status'
      >
        {announcement}
      </div>

      <div
        ref={toolbarRef}
        role='toolbar'
        aria-label={`Hành động hàng loạt cho ${selectedCount} ${entityName} đã chọn`}
        aria-describedby='bulk-actions-description'
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-primary p-2 shadow-lg ring-1 ring-secondary_alt',
          'flex items-center gap-x-2',
          'transition-all duration-200 ease-out',
          'focus-visible:ring-2 focus-visible:ring-brand'
        )}
      >
        <Button
          color='secondary'
          iconLeading={X}
          onPress={handleClearSelection}
          className='size-9'
          aria-label='Xóa lựa chọn'
        />
        <span className='h-5 w-px bg-border-secondary' aria-hidden='true' />
        <div
          className='flex items-center gap-x-1.5 text-sm'
          id='bulk-actions-description'
        >
          <Badge type='color' size='sm' color='brand' aria-label={`${selectedCount} đã chọn`}>
            {selectedCount}
          </Badge>
          <span className='hidden sm:inline'>
            {entityName} đã chọn
          </span>
        </div>
        <span className='h-5 w-px bg-border-secondary' aria-hidden='true' />
        {children}
      </div>
    </>
  )
}
