import { createFileRoute } from '@tanstack/react-router'
import { ProductReport } from '@/features/reports/products'

export const Route = createFileRoute('/_authenticated/reports/products/')({
  component: ProductReport,
})
