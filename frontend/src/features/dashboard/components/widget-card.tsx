import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WidgetCardProps {
  title?: ReactNode
  description?: ReactNode
  /** Classes for the card root (grid spans, width). */
  className?: string
  /** Classes for the body container (padding overrides). */
  contentClassName?: string
  children: ReactNode
}

/**
 * Untitled UI card shell shared by dashboard widgets: white surface,
 * neutral border, optional header block, padded body.
 */
export function WidgetCard({ title, description, className, contentClassName, children }: WidgetCardProps) {
  return (
    <div className={cn('rounded-lg border border-primary bg-primary', className)}>
      {title && (
        <div className='flex flex-col gap-0.5 px-4 pt-4'>
          <h3 className='text-md font-semibold text-primary'>{title}</h3>
          {description && <p className='text-xs text-tertiary'>{description}</p>}
        </div>
      )}
      <div className={cn('p-4', title && 'pt-3', contentClassName)}>{children}</div>
    </div>
  )
}
