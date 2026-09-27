import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { ProductReportTable } from './product-report-table'
import type { ProductReportRow } from '@/services/reports'

const rows: ProductReportRow[] = [
  {
    productId: 'p1',
    productCode: 'SP001',
    productName: 'Tôm sú',
    unit: 'kg',
    totalQuantity: 1250,
    totalRevenue: 156250000,
    details: [
      {
        invoiceCode: 'INV-2026-001',
        date: '2026-09-05T10:30:00.000Z',
        customerName: 'Nhà hàng Hoa Sứ',
        quantity: 2,
        unitPrice: 125000,
        total: 250000,
      },
    ],
  },
]

describe('ProductReportTable', () => {
  it('renders rows with formatted revenue and quantity', async () => {
    const screen = await render(<ProductReportTable data={rows} />)

    await expect.element(screen.getByText('Mã hàng')).toBeInTheDocument()
    await expect.element(screen.getByText('SP001')).toBeInTheDocument()
    await expect.element(screen.getByText('Tôm sú')).toBeInTheDocument()
    await expect
      .element(screen.getByText('156.250.000 đ'))
      .toBeInTheDocument()
    // Quantity cell renders the raw number (formatNumber is only used in details)
    await expect
      .element(screen.getByText('1250', { exact: true }))
      .toBeInTheDocument()
  })

  it('expands row details on click and collapses on second click', async () => {
    const screen = await render(<ProductReportTable data={rows} />)

    await expect.element(screen.getByText('Tôm sú')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Chi tiết lịch sử tiêu thụ'))
      .not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Tôm sú'))
    await expect
      .element(screen.getByText('Chi tiết lịch sử tiêu thụ'))
      .toBeInTheDocument()
    await expect.element(screen.getByText('INV-2026-001')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Nhà hàng Hoa Sứ'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('250.000 đ', { exact: true }))
      .toBeInTheDocument()

    await userEvent.click(screen.getByText('Tôm sú'))
    await expect
      .element(screen.getByText('Chi tiết lịch sử tiêu thụ'))
      .not.toBeInTheDocument()
  })

  it('shows the empty-state row when there is no data', async () => {
    const screen = await render(<ProductReportTable data={[]} />)

    await expect
      .element(screen.getByText('Không có dữ liệu.'))
      .toBeInTheDocument()
  })
})
