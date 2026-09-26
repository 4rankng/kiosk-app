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
 * Partially-paid and pending use the warning (amber) style; cancelled is muted.
 */
export function statusMeta(
  status: InvoiceStatus,
  isPaid: boolean,
  partiallyPaid?: boolean
): InvoiceStatusMeta {
  if (status === 'completed') {
    if (isPaid) {
      return {
        icon: CheckCircle2,
        label: 'Đã thanh toán',
        className: 'bg-success/10 text-success border border-success/20',
      }
    }
    if (partiallyPaid) {
      return {
        icon: Clock,
        label: 'Thanh toán 1 phần',
        className: 'bg-warning/10 text-warning border border-warning/20',
      }
    }
    return {
      icon: DollarSign,
      label: 'Chưa thanh toán',
      className: 'bg-destructive/10 text-destructive border border-destructive/20',
      destructive: true,
    }
  }
  if (status === 'pending') {
    return {
      icon: Clock,
      label: 'Đang xử lý',
      className: 'bg-warning/10 text-warning border border-warning/20',
    }
  }
  return {
    icon: XCircle,
    label: 'Đã hủy',
    className: 'bg-muted text-muted-foreground border border-border',
    destructive: true,
  }
}
