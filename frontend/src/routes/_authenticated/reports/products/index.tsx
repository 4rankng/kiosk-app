import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Code-split the reports/products feature (pulls in recharts) into a separate chunk.
const ProductReport = lazy(() =>
  import('@/features/reports/products').then((m) => ({ default: m.ProductReport }))
)

export const Route = createFileRoute('/_authenticated/reports/products/')({
  component: () => (
    <Suspense fallback={<Skeleton className='h-[200px] w-full' />}>
      <ProductReport />
    </Suspense>
  ),
})
