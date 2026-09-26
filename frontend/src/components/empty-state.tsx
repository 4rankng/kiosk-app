import { type ReactNode } from 'react'
import { AlertCircle, RefreshCw01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { EmptyState as UUIEmptyState } from '@/components/application/empty-state/empty-state'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  variant: 'loading' | 'empty' | 'error'
  /** Title for error/empty variants */
  title?: string
  /** Description for error/empty variants */
  description?: string
  /** Retry callback shown on the error variant */
  onRetry?: () => void
  /** Custom icon (any element) for the empty variant */
  icon?: ReactNode
  /** Number of skeleton rows for the loading variant (default 3) */
  rows?: number
  className?: string
}

/**
 * Shared empty-state component for consistent loading / error / empty UI,
 * built on the Untitled UI empty-state primitives.
 *
 * - loading: skeleton rows
 * - error: featured icon + title + description + retry button (calls refetch)
 * - empty: custom icon (or featured icon) + title + description
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
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className='h-10 w-full animate-pulse rounded-md bg-secondary' />
        ))}
      </div>
    )
  }

  const isWarning = variant === 'error'
  const defaultTitle = isWarning ? 'Không tải được dữ liệu' : 'Không có dữ liệu'

  return (
    <UUIEmptyState
      size='sm'
      role={isWarning ? 'alert' : undefined}
      className={cn('py-8', className)}
    >
      <UUIEmptyState.Header pattern='none'>
        {icon ? (
          <div className='relative z-10 flex items-center justify-center'>{icon}</div>
        ) : (
          <UUIEmptyState.FeaturedIcon
            color={isWarning ? 'error' : 'gray'}
            theme='light'
            icon={isWarning ? AlertCircle : undefined}
          />
        )}
      </UUIEmptyState.Header>
      <UUIEmptyState.Content>
        <UUIEmptyState.Title className='text-md'>{title ?? defaultTitle}</UUIEmptyState.Title>
        {description && <UUIEmptyState.Description>{description}</UUIEmptyState.Description>}
      </UUIEmptyState.Content>
      {isWarning && onRetry && (
        <UUIEmptyState.Footer>
          <Button
            color='secondary'
            size='sm'
            iconLeading={RefreshCw01}
            onPress={onRetry}
          >
            Thử lại
          </Button>
        </UUIEmptyState.Footer>
      )}
    </UUIEmptyState>
  )
}
