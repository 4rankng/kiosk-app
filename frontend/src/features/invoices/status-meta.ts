import type { FC } from 'react'
import { CheckCircle, Clock, CurrencyDollar, XCircle } from '@untitledui/icons'
import type { BadgeColor } from '@/components/base/badges/badges'
import type { InvoiceStatus } from '@/types/api'

export interface InvoiceStatusMeta {
  /** Untitled UI icon component */
  icon: FC<{ className?: string; strokeWidth?: string | number }>
  /** Vietnamese label */
  label: string
  /** UUI Badge color semantics for the status pill */
  badgeColor: BadgeColor<'pill-color'>
  /** Whether this status represents a destructive/error state */
  destructive?: boolean
}

/**
 * Resolve a semantic status descriptor for an invoice.
 *
 * Completed invoices are split into paid (success) / unpaid (error).
 * Partially-paid and pending use the warning style; cancelled is muted.
 */
export function statusMeta(
  status: InvoiceStatus,
  isPaid: boolean,
  partiallyPaid?: boolean
): InvoiceStatusMeta {
  if (status === 'completed') {
    if (isPaid) {
      return {
        icon: CheckCircle,
        label: 'Đã thanh toán',
        badgeColor: 'success',
      }
    }
    if (partiallyPaid) {
      return {
        icon: Clock,
        label: 'Thanh toán 1 phần',
        badgeColor: 'warning',
      }
    }
    return {
      icon: CurrencyDollar,
      label: 'Chưa thanh toán',
      badgeColor: 'error',
      destructive: true,
    }
  }
  if (status === 'pending') {
    return {
      icon: Clock,
      label: 'Đang xử lý',
      badgeColor: 'warning',
    }
  }
  return {
    icon: XCircle,
    label: 'Đã hủy',
    badgeColor: 'gray',
    destructive: true,
  }
}
