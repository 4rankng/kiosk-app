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
  const hasExpandableContent = !!children || !!actions

  return (
    <div className={cn('rounded-md border bg-card', className)}>
      {/* Card header — always visible, acts as touch target */}
      <button
        type='button'
        className={cn(
          'flex w-full items-start gap-3 p-3 text-left',
          hasExpandableContent && 'cursor-pointer'
        )}
        onClick={hasExpandableContent ? onToggle : undefined}
        aria-expanded={hasExpandableContent ? expanded : undefined}
      >
        <div className='min-w-0 flex-1 space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='truncate text-sm font-medium'>{title}</span>
            {status}
          </div>
          {metric && (
            <p className='text-xs text-muted-foreground'>{metric}</p>
          )}
        </div>
        {hasExpandableContent && (
          <span className='mt-0.5 shrink-0 text-muted-foreground'>
            {expanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </span>
        )}
      </button>

      {/* Expanded content — accordion */}
      {expanded && hasExpandableContent && (
        <div className='border-t px-3 pb-3 pt-2 space-y-3'>
          {children}
          {actions && (
            <div className='flex items-center gap-2 pt-1'>{actions}</div>
          )}
        </div>
      )}
    </div>
  )
}
