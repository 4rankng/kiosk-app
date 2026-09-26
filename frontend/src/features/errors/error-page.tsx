import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ErrorPageProps {
  code?: string
  title: string
  description: ReactNode
  actions?: ReactNode
  className?: string
}

export function ErrorPage({ code, title, description, actions, className }: ErrorPageProps) {
  return (
    <div
      className={cn(
        'flex min-h-svh flex-col items-center justify-center bg-primary px-4 text-center',
        className,
      )}
    >
      {code && (
        <p className='font-heading text-display-lg font-semibold text-brand-secondary'>
          {code}
        </p>
      )}
      <h1 className='mt-2 font-heading text-display-xl font-semibold tracking-tight'>
        {title}
      </h1>
      <p className='mt-2 max-w-md text-sm text-tertiary'>{description}</p>
      {actions && <div className='mt-6 flex flex-wrap justify-center gap-3'>{actions}</div>}
    </div>
  )
}
