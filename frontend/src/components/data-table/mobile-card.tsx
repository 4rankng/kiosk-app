import * as React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
    <div className={cn('rounded-md border bg-card', className)}>
      {/* Card header — always visible */}
      {hasDetail ? (
        /* Expandable: whole row is a button */
        <button
          type='button'
          className='flex w-full items-start gap-3 p-3 text-left cursor-pointer'
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 min-w-0'>
                <span className='truncate text-sm font-medium'>{title}</span>
                {status}
              </div>
              {metric && (
                <span className='shrink-0 text-sm tabular-nums'>{metric}</span>
              )}
            </div>
          </div>
          <span className='mt-0.5 shrink-0 text-muted-foreground'>
            {expanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </span>
        </button>
      ) : (
        /* Flat: title + inline actions, no expand */
        <div className='flex w-full items-center gap-3 p-3'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 min-w-0'>
                <span className='truncate text-sm font-medium'>{title}</span>
                {status}
              </div>
              {metric && (
                <span className='shrink-0 text-sm tabular-nums'>{metric}</span>
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
        <div className='border-t px-3 pb-3 pt-2 space-y-2'>
          {children}
          {actions && (
            <div className='flex items-center gap-2 pt-1'>{actions}</div>
          )}
        </div>
      )}
    </div>
  )
}
