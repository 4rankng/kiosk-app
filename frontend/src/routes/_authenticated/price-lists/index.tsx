import { createFileRoute } from '@tanstack/react-router'
import { PriceLists } from '@/features/price-lists'

export const Route = createFileRoute('/_authenticated/price-lists/')({
  component: PriceLists,
})
