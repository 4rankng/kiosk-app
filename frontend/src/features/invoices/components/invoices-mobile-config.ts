import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const invoicesCardConfig: MobileCardConfig = {
  code: { role: 'detail', label: 'Mã HĐ' },
  customerName: { role: 'title' },
  date: { role: 'detail', label: 'Ngày' },
  total: { role: 'metric' },
  status: { role: 'status' },
  paymentStatus: { role: 'detail', label: 'Thanh toán' },
  actions: { role: 'detail', hidden: true },
}
