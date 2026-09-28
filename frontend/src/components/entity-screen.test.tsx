import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { EntityScreen } from './entity-screen'

// `Header` pulls in the search/sidebar/layout contexts and react-aria runtime.
// None of that is EntityScreen's concern — the header's own behaviour is
// covered by the feature tests. Stub it so these tests assert the primitive's
// actual responsibility: where the main column, the page header and the
// dialogs land in the tree.
vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children?: React.ReactNode }) => <header data-testid='app-header'>{children}</header>,
}))
vi.mock('@/components/search', () => ({ Search: () => <input aria-label='Tìm kiếm' /> }))
vi.mock('@/components/notification-bell', () => ({ NotificationBell: () => null }))
vi.mock('@/components/profile-dropdown', () => ({ ProfileDropdown: () => null }))

/**
 * The shell these screens share used to be copy-pasted eight times, which is
 * how dialogs ended up inside `<Main>` on some screens and outside it on
 * others. These tests pin the contract that replaced it: the header chrome is
 * always present, breadcrumbs are optional, and dialogs always render outside
 * the scrollable content column.
 */

async function renderScreen(props: Partial<React.ComponentProps<typeof EntityScreen>> = {}) {
  return await render(
    <EntityScreen title='Danh sách đối tác' description='Quản lý khách hàng.' {...props}>
      <div data-testid='screen-content'>Nội dung</div>
    </EntityScreen>
  )
}

describe('EntityScreen', () => {
  it('renders the header chrome and the page title', async () => {
    const screen = await renderScreen()

    await expect.element(screen.getByText('Danh sách đối tác')).toBeInTheDocument()
    await expect.element(screen.getByText('Quản lý khách hàng.')).toBeInTheDocument()
    expect(screen.container.querySelector('main')).not.toBeNull()
  })

  it('renders the breadcrumb trail when crumbs are supplied', async () => {
    const screen = await renderScreen({ crumbs: ['Khách hàng', 'Danh sách KH'] })

    // A crumb renders as a link plus a label, so one string can match more
    // than one node. Assert on the breadcrumb landmark and its items instead.
    const nav = screen.container.querySelector('nav[aria-label="Breadcrumbs"]')
    expect(nav).not.toBeNull()
    expect(nav?.textContent).toContain('Khách hàng')
    expect(nav?.textContent).toContain('Danh sách KH')
  })

  it('omits the breadcrumb trail when crumbs are absent, as the invoices screen does', async () => {
    const screen = await renderScreen()

    expect(screen.container.querySelector('nav[aria-label], [data-slot="breadcrumbs"]')).toBeNull()
    // The title must still render.
    await expect.element(screen.getByText('Danh sách đối tác')).toBeInTheDocument()
  })

  it('renders the action in the page header', async () => {
    const screen = await renderScreen({
      actions: <button type='button'>Thêm</button>,
    })

    await expect.element(screen.getByRole('button', { name: 'Thêm' })).toBeInTheDocument()
  })

  it('renders children inside the main content column', async () => {
    const screen = await renderScreen()

    await expect.element(screen.getByText('Nội dung')).toBeInTheDocument()
  })

  it('renders dialogs outside <Main> so an open dialog is not a flex child of the scroll column', async () => {
    const screen = await renderScreen({
      dialogs: <div data-testid='dialog-host'>dialog</div>,
    })

    const main = screen.container.querySelector('main')
    // `.element()` resolves the locator to a real DOM node, which is what
    // Node.contains() needs.
    const dialog = screen.getByTestId('dialog-host').element()
    expect(main).not.toBeNull()
    // The dialog must be a sibling of <main>, never inside it.
    expect(main?.contains(dialog)).toBe(false)
  })
})
