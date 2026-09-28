import type { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs'

export interface EntityScreenProps {
  /** Breadcrumb trail, outermost first. Omit for screens that sit at the root. */
  crumbs?: string[]
  title: string
  description?: ReactNode
  /** Primary action, usually a "Thêm" button wired to the screen's own context. */
  actions?: ReactNode
  /** Page content, rendered under the page header. */
  children: ReactNode
  /** Dialogs. Rendered outside `<Main>` so an open dialog is never a flex child
   *  of the scrolling content column. */
  dialogs?: ReactNode
}

/**
 * Shared shell for every list screen (customers, companies, products, invoices,
 * price lists).
 *
 * Owns the fixed header with global search / notifications / account menu, the
 * `Main` column, and the breadcrumb + page-header stack. Screens supply their
 * own copy, their own action, their content, and their dialogs.
 *
 * This exists because the shell was copy-pasted across eight screens, which is
 * how the dialogs ended up inside `<Main>` on some screens and outside it on
 * others. Keep it that way here: dialogs belong outside the content column.
 */
export function EntityScreen({ crumbs, title, description, actions, children, dialogs }: EntityScreenProps) {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {crumbs && crumbs.length > 0 ? (
          <div className='flex flex-col gap-1'>
            <Breadcrumbs>
              {crumbs.map((crumb) => (
                <Breadcrumbs.Item key={crumb}>{crumb}</Breadcrumbs.Item>
              ))}
            </Breadcrumbs>
            <PageHeader title={title} description={description} actions={actions} />
          </div>
        ) : (
          <PageHeader title={title} description={description} actions={actions} />
        )}
        {children}
      </Main>
      {dialogs}
    </>
  )
}
