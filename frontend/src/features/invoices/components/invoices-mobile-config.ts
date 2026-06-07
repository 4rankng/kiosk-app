import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const invoicesCardConfig: MobileCardConfig = {
  code: { role: 'title' },
  date: { role: 'detail', label: 'Thời gian' },
  customerName: { role: 'detail', label: 'Khách hàng' },
  total: { role: 'metric', label: 'Tổng tiền' },
  status: { role: 'status' },
  paymentStatus: { role: 'detail', label: 'Thanh toán' },
  actions: { role: 'detail', hidden: true },
}
