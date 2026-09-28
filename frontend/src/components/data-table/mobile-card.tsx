import { ChevronDown, ChevronRight } from '@untitledui/icons'
import { cn } from '@/lib/utils'

interface MobileCardProps {
  title: React.ReactNode
  status?: React.ReactNode
  metric?: React.ReactNode
  expanded?: boolean
  onToggle?: () => void
  children?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * Tappable row-card used by mobile table/report views. Visuals follow the
 * Untitled UI card recipe (bg-primary surface + secondary ring); tap targets
 * stay within the 44px contract.
 */
export function MobileCard({
  title,
  status,
  metric,
  expanded,
  onToggle,
  children,
  actions,
  className,
}: MobileCardProps) {
  const hasDetail = !!children

  return (
    <div className={cn('rounded-lg bg-primary shadow-xs ring-1 ring-secondary ring-inset', className)}>
      {/* Card header — always visible */}
      {hasDetail ? (
        /* Expandable: whole header is a tappable button */
        <button
          type='button'
          className='flex w-full items-start gap-3 p-3 text-left cursor-pointer'
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 min-w-0'>
                <span className='truncate text-sm font-medium text-secondary'>{title}</span>
                {status}
              </div>
              {metric && (
                <span className='shrink-0 text-sm tabular-nums text-primary'>{metric}</span>
              )}
            </div>
          </div>
          <span className='mt-0.5 shrink-0 text-quaternary'>
            {expanded ? (
              <ChevronDown className='size-4' />
            ) : (
              <ChevronRight className='size-4' />
            )}
          </span>
        </button>
      ) : (
        /* Flat: title + inline actions, no expand */
        <div className='flex w-full items-center gap-3 p-3'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 min-w-0'>
                <span className='truncate text-sm font-medium text-secondary'>{title}</span>
                {status}
              </div>
              {metric && (
                <span className='shrink-0 text-sm tabular-nums text-primary'>{metric}</span>
              )}
            </div>
          </div>
          {actions && (
            <div className='flex items-center gap-1 shrink-0'>{actions}</div>
          )}
        </div>
      )}

      {/* Expanded detail — accordion */}
      {expanded && hasDetail && (
        <div className='border-t border-primary px-3 pb-3 pt-2 space-y-2'>
          {children}
          {actions && (
            <div className='flex items-center justify-end gap-3 pt-1'>{actions}</div>
          )}
        </div>
      )}
    </div>
  )
}
