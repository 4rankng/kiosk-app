import type { ComponentType } from 'react'
import { CheckCircle2, DollarSign, Clock, XCircle, type LucideProps } from 'lucide-react'
import type { InvoiceStatus } from '@/types/api'

export interface InvoiceStatusMeta {
  /** lucide-react icon component */
  icon: ComponentType<LucideProps>
  /** Vietnamese label */
  label: string
  /** Tailwind classes for the status pill */
  className: string
  /** Whether this status represents a destructive/error state */
  destructive?: boolean
}

/**
 * Resolve a semantic status descriptor for an invoice.
 *
 * Completed invoices are split into paid (success) / unpaid (destructive).
 * Pending invoices use a warning amber style; cancelled uses destructive.
 */
export function statusMeta(
  status: InvoiceStatus,
  isPaid: boolean
): InvoiceStatusMeta {
  if (status === 'completed') {
    return isPaid
      ? { icon: CheckCircle2, label: 'Đã thanh toán', className: 'bg-emerald-50 text-emerald-600' }
      : { icon: DollarSign, label: 'Chưa thanh toán', className: 'bg-destructive/10 text-destructive', destructive: true }
  }
  if (status === 'pending') {
    return { icon: Clock, label: 'Đang xử lý', className: 'bg-amber-50 text-amber-600' }
  }
  return { icon: XCircle, label: 'Đã hủy', className: 'bg-destructive/10 text-destructive', destructive: true }
}
