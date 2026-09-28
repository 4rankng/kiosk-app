import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency, toNumber } from '@/lib/format'
import { AlertFullWidth } from '@/components/application/alerts/alerts'

/**
 * Surfaces the single most important business number on the dashboard: how much
 * money customers still owe, and to how many of them.
 *
 * It sat buried inside the "Công nợ" widget until now, so the only way to see
 * the total was to scroll past two chart widgets. This renders above them.
 *
 * Colour is `brand`, not `warning` — deliberately. Amber is reserved for the
 * partial-payment badge, and a warning-coloured total made "money owed"
 * indistinguishable from "partially paid". See the note in
 * `outstanding-debts.tsx` for the same reasoning.
 */
export function DebtAlert() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  // No alert while loading, and none when nothing is owed — a zero-debt banner
  // is noise, not reassurance.
  if (isLoading) return null

  const debts = data?.outstandingDebts ?? []
  if (debts.length === 0) return null

  const totalDebt = debts.reduce((sum, d) => sum + toNumber(d.amount), 0)
  const customerCount = debts.length

  return (
    <AlertFullWidth
      color='brand'
      title='Công nợ chưa thu'
      description={`${customerCount} khách hàng còn nợ tổng cộng ${formatCurrency(totalDebt)}.`}
      confirmLabel='Xem công nợ'
      onConfirm={() => navigate({ to: '/invoices' })}
    />
  )
}
