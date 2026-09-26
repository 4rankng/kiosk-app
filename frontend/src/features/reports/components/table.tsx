import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Dense table primitives styled with Untitled UI semantic tokens
 * (ui/table cannot be imported outside the chart wrapper in migrated code).
 * Same DOM shape as the shadcn table so TanStack render code ports 1:1.
 */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className='relative w-full overflow-x-auto'>
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('[&_tr]:border-b [&_tr]:border-primary', className)} {...props} />
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('border-b border-primary transition-colors hover:bg-secondary', className)} {...props} />
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-9 px-2 text-start align-middle text-xs font-medium whitespace-nowrap text-tertiary',
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-2 py-1.5 align-middle whitespace-nowrap', className)} {...props} />
}
