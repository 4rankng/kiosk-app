import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Code-split the Invoices feature module so its dependencies
// (print dialog, invoice HTML generation) stay out of the initial bundle.
const Invoices = lazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.Invoices }))
)

export const Route = createFileRoute('/_authenticated/invoices/')({
  component: () => (
    <Suspense fallback={<Skeleton className='h-[200px] w-full' />}>
      <Invoices />
    </Suspense>
  ),
})
