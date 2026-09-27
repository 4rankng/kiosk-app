import { useMemo } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { Invoice } from '@/types'
import { useInvoicesContext, InvoicesProvider } from './invoices-provider'
import { getInvoicesColumns } from './invoices-columns'

function baseInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-1',
    code: 'HD0001',
    orderId: 'ord-1',
    customerId: 'cu-1',
    customerName: 'Quán Cô Ba',
    businessEntityId: 'be-1',
    status: 'completed',
    subtotal: 1250000,
    discount: 0,
    total: 1250000,
    paidAmount: 1250000,
    isPaid: true,
    issuedAt: '2026-09-26T09:30:00.000Z',
    ...overrides,
  }
}

function ContextProbe() {
  const { open, selectedInvoice } = useInvoicesContext()
  return (
    <div>
      <span>open={String(open)}</span>
      <span>selected={selectedInvoice?.code ?? 'none'}</span>
    </div>
  )
}

function ColumnsHarness({ invoices }: { invoices: Invoice[] }) {
  const columns = useMemo(() => getInvoicesColumns(), [])
  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <>
      <ContextProbe />
      <table>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

async function renderColumns(invoices: Invoice[]) {
  return await render(
    <InvoicesProvider>
      <ColumnsHarness invoices={invoices} />
    </InvoicesProvider>
  )
}

describe('getInvoicesColumns', () => {
  it('renders money and date through the shared formatters', async () => {
    const screen = await renderColumns([baseInvoice()])
    await expect.element(screen.getByText('1.250.000 đ')).toBeInTheDocument()
    const expected = new Date('2026-09-26T09:30:00.000Z').toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    await expect.element(screen.getByText(expected)).toBeInTheDocument()
  })

  it.each([
    { name: 'shows paid badge when completed and isPaid', overrides: { status: 'completed' as const, isPaid: true, paidAmount: 1250000 }, badge: 'Đã thanh toán' },
    { name: 'shows partially-paid badge for partial payment', overrides: { status: 'completed' as const, isPaid: false, paidAmount: 500000 }, badge: 'Thanh toán 1 phần' },
    { name: 'shows unpaid badge when nothing is paid', overrides: { status: 'completed' as const, isPaid: false, paidAmount: 0 }, badge: 'Chưa thanh toán' },
    { name: 'shows pending badge for pending status', overrides: { status: 'pending' as const, isPaid: false, paidAmount: 0 }, badge: 'Đang xử lý' },
    { name: 'shows cancelled badge for cancelled status', overrides: { status: 'cancelled' as const, isPaid: false, paidAmount: 0 }, badge: 'Đã hủy' },
  ])('$name', async ({ overrides, badge }) => {
    const screen = await renderColumns([baseInvoice(overrides)])
    await expect.element(screen.getByText(badge)).toBeInTheDocument()
  })

  it('shows both print and collect actions for an unpaid invoice', async () => {
    const screen = await renderColumns([
      baseInvoice({ isPaid: false, paidAmount: 0 }),
    ])
    await expect
      .element(screen.getByRole('button', { name: 'In hóa đơn' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Thu tiền' }))
      .toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Thu tiền' }))
    await expect.element(screen.getByText('open=payment')).toBeInTheDocument()
    await expect.element(screen.getByText('selected=HD0001')).toBeInTheDocument()
  })

  it('hides the collect action for paid invoices', async () => {
    const screen = await renderColumns([baseInvoice({ isPaid: true, paidAmount: 1250000 })])
    await expect
      .element(screen.getByRole('button', { name: 'In hóa đơn' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Thu tiền' }))
      .not.toBeInTheDocument()
  })

  it('hides the collect action for cancelled invoices', async () => {
    const screen = await renderColumns([
      baseInvoice({ status: 'cancelled', isPaid: false, paidAmount: 0 }),
    ])
    await expect
      .element(screen.getByRole('button', { name: 'Thu tiền' }))
      .not.toBeInTheDocument()
  })
})
