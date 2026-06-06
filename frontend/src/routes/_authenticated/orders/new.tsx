import { createFileRoute } from '@tanstack/react-router'
import { OrderCreate } from '@/features/orders/components/order-create'

export const Route = createFileRoute('/_authenticated/orders/new')({
  component: OrderCreate,
})
