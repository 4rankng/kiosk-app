import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { parseDate } from '@internationalized/date'
import { ReportScreen } from './report-screen'

/**
 * ReportScreen replaced a shell that two report screens had copy-pasted from
 * each other (96% and 84% duplication). These tests pin the branching that used
 * to be duplicated: loading, no-data, and loaded.
 *
 * The date picker is stubbed out — it is a react-aria popover and is not what
 * this test is about. The hook that owns the range has its own test file.
 */

vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children?: React.ReactNode }) => <header data-testid='app-header'>{children}</header>,
}))
vi.mock('@/components/search', () => ({ Search: () => null }))
vi.mock('@/components/notification-bell', () => ({ NotificationBell: () => null }))
vi.mock('@/components/profile-dropdown', () => ({ ProfileDropdown: () => null }))
vi.mock('@/components/application/date-picker/date-range-picker', () => ({
  DateRangePicker: () => <div data-testid='date-range-picker' />,
}))

const emptyState = { title: 'Không có dữ liệu', description: 'Hãy thử nới rộng khoảng thời gian.', icon: <span /> }

function baseProps(): Omit<React.ComponentProps<typeof ReportScreen>, 'children'> {
  return {
    crumbs: ['Báo cáo', 'Khách hàng'],
    title: 'Báo cáo doanh thu',
    description: 'Thống kê theo kỳ.',
    documentTitle: 'Báo cáo',
    dateRange: { start: parseDate('2026-01-01'), end: parseDate('2026-03-31') },
    onDateRangeChange: vi.fn(),
    onApply: vi.fn(),
    isLoading: false,
    isEmpty: false,
    empty: emptyState,
  }
}

async function renderScreen(props: Partial<React.ComponentProps<typeof ReportScreen>> = {}) {
  return await render(
    <ReportScreen {...baseProps()} {...props}>
      <div data-testid='report-content'>KPI + bảng</div>
    </ReportScreen>
  )
}

describe('ReportScreen', () => {
  it('renders the loaded branch: breadcrumbs, filter row and content', async () => {
    const screen = await renderScreen()

    await expect.element(screen.getByText('Báo cáo doanh thu')).toBeInTheDocument()
    const nav = screen.container.querySelector('nav[aria-label="Breadcrumbs"]')
    expect(nav?.textContent).toContain('Khách hàng')
    await expect.element(screen.getByTestId('date-range-picker')).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Lọc báo cáo' })).toBeInTheDocument()
    await expect.element(screen.getByTestId('report-content')).toBeInTheDocument()
  })

  it('renders the loading branch with skeletons and hides the content', async () => {
    const screen = await renderScreen({ isLoading: true })

    expect(screen.container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    expect(screen.container.querySelector('[data-testid="report-content"]')).toBeNull()
    // The empty state must not appear alongside the skeletons.
    expect(screen.container.textContent).not.toContain('Không có dữ liệu')
  })

  it('disables the apply button while loading', async () => {
    const screen = await renderScreen({ isLoading: true })

    await expect.element(screen.getByRole('button', { name: 'Lọc báo cáo' })).toBeDisabled()
  })

  it('renders the empty branch and hides the content', async () => {
    const screen = await renderScreen({ isEmpty: true })

    await expect.element(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
    expect(screen.container.querySelector('[data-testid="report-content"]')).toBeNull()
  })

  it('renders caller-supplied extra filter fields beside the date range', async () => {
    const screen = await renderScreen({
      filters: <div data-testid='extra-filter'>Bộ lọc công ty</div>,
    })

    await expect.element(screen.getByTestId('extra-filter')).toBeInTheDocument()
    await expect.element(screen.getByTestId('date-range-picker')).toBeInTheDocument()
  })

  it('calls onApply when the filter button is pressed', async () => {
    const onApply = vi.fn()
    const screen = await renderScreen({ onApply })

    await screen.getByRole('button', { name: 'Lọc báo cáo' }).click()

    expect(onApply).toHaveBeenCalledOnce()
  })
})
