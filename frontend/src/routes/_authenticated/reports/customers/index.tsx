import { createFileRoute } from '@tanstack/react-router'
import { CustomerReport } from '@/features/reports/customers'

export const Route = createFileRoute('/_authenticated/reports/customers/')({
  component: CustomerReport,
})
