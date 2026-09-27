import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Invoice } from '@/types'
import { markInvoiceAsPaid } from '@/services/invoices'
import { InvoicesProvider, useInvoicesContext } from './invoices-provider'
import { PaymentDialog } from './payment-dialog'

vi.mock('@/services/invoices', () => ({ markInvoiceAsPaid: vi.fn() }))

const mockedMarkPaid = vi.mocked(markInvoiceAsPaid)

const invoice: Invoice = {
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
  paidAmount: 500000,
  isPaid: false,
  issuedAt: '2026-09-26T09:30:00.000Z',
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function Harness({ selected }: { selected: Invoice | null }) {
  const { setOpen, setSelectedInvoice } = useInvoicesContext()
  return (
    <>
      <button
        type='button'
        onClick={() => {
          setSelectedInvoice(selected)
          if (selected) setOpen('payment')
        }}
      >
        mở-thanh-toan
      </button>
      <PaymentDialog />
    </>
  )
}

async function renderDialog(selected: Invoice | null) {
  const queryClient = makeQueryClient()
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <InvoicesProvider>
        <Harness selected={selected} />
      </InvoicesProvider>
    </QueryClientProvider>
  )
  return { screen, invalidateSpy }
}

describe('PaymentDialog', () => {
  it('renders nothing when no invoice is selected', async () => {
    const { screen } = await renderDialog(null)
    await userEvent.click(screen.getByRole('button', { name: 'mở-thanh-toan' }))
    await expect
      .element(screen.getByRole('heading', { name: 'Thu tiền hóa đơn' }))
      .not.toBeInTheDocument()
  })

  it('shows totals with the remaining balance for the selected invoice', async () => {
    const { screen } = await renderDialog(invoice)
    await userEvent.click(screen.getByRole('button', { name: 'mở-thanh-toan' }))

    await expect
      .element(screen.getByRole('heading', { name: 'Thu tiền hóa đơn' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Hóa đơn HD0001 — Quán Cô Ba'))
      .toBeInTheDocument()
    const rows = screen.getByText('Tổng tiền').element().parentElement!
    expect(rows.textContent).toContain('1.250.000 đ')
    const paidRow = screen.getByText('Đã thanh toán').element().parentElement!
    expect(paidRow.textContent).toContain('500.000 đ')
    const remainingRow = screen.getByText('Còn lại').element().parentElement!
    expect(remainingRow.textContent).toContain('750.000 đ')
  })

  it('calls markInvoiceAsPaid with the invoice id on confirm', async () => {
    mockedMarkPaid.mockResolvedValue({ ...invoice, isPaid: true, paidAmount: 1250000, items: [], businessEntityName: null })
    const { screen, invalidateSpy } = await renderDialog(invoice)
    await userEvent.click(screen.getByRole('button', { name: 'mở-thanh-toan' }))
    await expect
      .element(screen.getByRole('heading', { name: 'Thu tiền hóa đơn' }))
      .toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Thanh toán toàn bộ' }))

    // onSuccess invalidates, toasts, then closes the dialog.
    await expect
      .element(screen.getByRole('heading', { name: 'Thu tiền hóa đơn' }))
      .not.toBeInTheDocument()
    expect(mockedMarkPaid).toHaveBeenCalledWith('inv-1', expect.anything())
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['invoices'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dashboard-stats'] })
  })

  it('shows an error toast and keeps the dialog open on failure', async () => {
    mockedMarkPaid.mockRejectedValueOnce(new Error('boom'))
    const { screen } = await renderDialog(invoice)
    await userEvent.click(screen.getByRole('button', { name: 'mở-thanh-toan' }))
    await expect
      .element(screen.getByRole('heading', { name: 'Thu tiền hóa đơn' })
      .first()).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Thanh toán toàn bộ' }))
    await vi.waitFor(() => {
      expect(mockedMarkPaid).toHaveBeenCalled()
    })
    await expect
      .element(screen.getByRole('heading', { name: 'Thu tiền hóa đơn' }))
      .toBeInTheDocument()
  })
})
