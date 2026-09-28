import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './data-table'
import type { MobileCardConfig } from './mobile-card-types'

interface Row {
  id: string
  name: string
  code: string
  status: string
}

const rows: Row[] = [
  { id: '1', name: 'Quán Cô Ba', code: 'KH001', status: 'active' },
  { id: '2', name: 'Quán Hai Bà', code: 'KH002', status: 'inactive' },
]

const columns: ColumnDef<Row>[] = [
  { id: 'code', accessorKey: 'code', header: 'Mã' },
  { id: 'name', accessorKey: 'name', header: 'Tên' },
  { id: 'status', accessorKey: 'status', header: 'Trạng thái' },
]

const mobileConfig: MobileCardConfig = {
  code: { role: 'detail', label: 'Mã' },
  name: { role: 'title' },
  status: { role: 'status' },
}

async function renderTable(props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
  const onRetry = vi.fn()
  const merged = {
    data: rows,
    columns,
    mobileConfig,
    isLoading: false,
    isError: false,
    onRetry,
    errorTitle: 'Không tải được danh sách',
    search: { column: 'name', placeholder: 'Tìm khách hàng...' },
    facetedFilters: [{ column: 'status', title: 'Trạng thái', options: [{ label: 'Hoạt động', value: 'active' }] }],
    ...props,
  }
  const screen = await render(<DataTable<Row> {...(merged as React.ComponentProps<typeof DataTable<Row>>)} />)
  return { onRetry, screen }
}

describe('DataTable', () => {
  it('renders the loaded branch: rows, headers, search and filter', async () => {
    const { screen } = await renderTable()

    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    await expect.element(screen.getByText('Quán Hai Bà')).toBeInTheDocument()
    await expect.element(screen.getByText('Mã')).toBeInTheDocument()
    await expect.element(screen.getByRole('textbox', { name: 'Tìm khách hàng...' })).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: /Trạng thái/ })).toBeInTheDocument()
  })

  it('renders the loading branch and no table chrome', async () => {
    const { screen } = await renderTable({ isLoading: true })

    // The search box and headers must be gone while loading.
    expect(screen.container.querySelector('table')).toBeNull()
    expect(screen.container.querySelector('input')).toBeNull()
  })

  it('renders the error branch with the caller-supplied copy and retries on demand', async () => {
    const { screen, onRetry } = await renderTable({ isError: true })

    await expect.element(screen.getByText('Không tải được danh sách')).toBeInTheDocument()
    expect(screen.container.querySelector('table')).toBeNull()

    const retry = screen.getByRole('button', { name: 'Thử lại' })
    await userEvent.click(retry)
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows the empty row rather than an empty tbody when there is no data', async () => {
    const { screen } = await renderTable({ data: [] })

    await expect.element(screen.getByText('Không có dữ liệu.')).toBeInTheDocument()
  })

  it('filters rows through the search box', async () => {
    const { screen } = await renderTable()

    await userEvent.fill(screen.getByRole('textbox', { name: 'Tìm khách hàng...' }), 'Cô Ba')

    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    expect(screen.container.textContent).not.toContain('Quán Hai Bà')
  })

  it('omits the toolbar entirely when showToolbar is false', async () => {
    const { screen } = await renderTable({ showToolbar: false })

    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    expect(screen.container.querySelector('input')).toBeNull()
  })
})
