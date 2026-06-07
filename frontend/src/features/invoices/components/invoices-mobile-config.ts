import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const invoicesCardConfig: MobileCardConfig = {
  code: { role: 'title' },
  date: { role: 'detail', label: 'Ngày' },
  customerName: { role: 'metric', label: 'Khách hàng' },
  total: { role: 'detail', label: 'Tổng tiền' },
  status: { role: 'status' },
  paymentStatus: { role: 'detail', label: 'Thanh toán' },
  actions: { role: 'detail', hidden: true },
}
