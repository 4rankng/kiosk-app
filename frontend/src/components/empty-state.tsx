import { type ReactNode } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface EmptyStateProps {
  variant: 'loading' | 'error' | 'empty'
  /** Title for error/empty variants */
  title?: string
  /** Description for error/empty variants */
  description?: string
  /** Retry callback shown on the error variant */
  onRetry?: () => void
  /** Custom icon for the empty variant */
  icon?: ReactNode
  /** Number of skeleton rows for the loading variant (default 3) */
  rows?: number
  className?: string
}

/**
 * Shared empty-state component for consistent loading / error / empty UI.
 *
 * - loading: skeleton rows
 * - error: alert icon + title + description + retry button (calls refetch)
 * - empty: icon + title + description
 */
export function EmptyState({
  variant,
  title,
  description,
  onRetry,
  icon,
  rows = 3,
  className,
}: EmptyStateProps) {
  if (variant === 'loading') {
    return (
      <div className={className}>
        <div className='space-y-2'>
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className='h-10 w-full' />
          ))}
        </div>
      </div>
    )
  }

  const isWarning = variant === 'error'
  const defaultTitle = variant === 'error' ? 'Không tải được dữ liệu' : 'Không có dữ liệu'
  const fallbackIcon = isWarning ? (
    <AlertCircle className='h-10 w-10 text-destructive' strokeWidth={1.5} />
  ) : null

  return (
    <div
      role={isWarning ? 'alert' : undefined}
      className={`flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground ${className ?? ''}`}
    >
      {icon ?? fallbackIcon}
      <p className='text-sm font-medium text-foreground'>
        {title ?? defaultTitle}
      </p>
      {description && <p className='text-xs'>{description}</p>}
      {isWarning && onRetry && (
        <Button
          variant='outline'
          size='sm'
          className='mt-2'
          onClick={onRetry}
        >
          <Loader2 className='mr-2 h-4 w-4' />
          Thử lại
        </Button>
      )}
    </div>
  )
}
