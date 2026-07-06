import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Code-split the reports/customers feature (pulls in xlsx) into a separate chunk.
const CustomerReport = lazy(() =>
  import('@/features/reports/customers').then((m) => ({ default: m.CustomerReport }))
)

export const Route = createFileRoute('/_authenticated/reports/customers/')({
  component: () => (
    <Suspense fallback={<Skeleton className='h-[200px] w-full' />}>
      <CustomerReport />
    </Suspense>
  ),
})
