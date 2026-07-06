import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useDocumentTitle } from '@/hooks/use-document-title'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Shared page header. Renders the page <h1> in the heading font (Manrope) at
 * the h1 type scale, and sets the browser tab title. Drop at the top of a
 * feature page for a consistent title / description / actions layout.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  useDocumentTitle(title)
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-2', className)}>
      <div className='min-w-0'>
        <h1 className='font-heading text-h1 font-semibold tracking-tight'>{title}</h1>
        {description && <p className='text-sm text-muted-foreground'>{description}</p>}
      </div>
      {actions && <div className='flex shrink-0 items-center gap-2'>{actions}</div>}
    </div>
  )
}
