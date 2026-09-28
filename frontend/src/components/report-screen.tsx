import type { ReactNode } from 'react'
import type { DateRange } from 'react-aria-components'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/base/buttons/button'
import { Label } from '@/components/base/input/label'
import { DateRangePicker } from '@/components/application/date-picker/date-range-picker'
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs'
import { EmptyState } from '@/components/empty-state'
import { useDocumentTitle } from '@/hooks/use-document-title'

export interface ReportScreenProps {
  crumbs: string[]
  title: string
  description: string
  /** Browser tab title. */
  documentTitle: string
  dateRange: DateRange
  onDateRangeChange: (range: DateRange | null) => void
  onApply: () => void
  isLoading: boolean
  /** True when the query resolved with no rows. */
  isEmpty: boolean
  /** Extra filter fields, rendered next to the date range. */
  filters?: ReactNode
  /** Copy for the no-data state. */
  empty: { title: string; description: string; icon: ReactNode }
  /** Rendered when there is at least one row. */
  children: ReactNode
}

/**
 * Shared shell for the date-filtered report screens.
 *
 * Owns the header, the breadcrumb/page-header stack, the filter row, and the
 * loading / empty / loaded branching. Callers own their query, their KPI rollup
 * and their table.
 */
export function ReportScreen({
  crumbs,
  title,
  description,
  documentTitle,
  dateRange,
  onDateRangeChange,
  onApply,
  isLoading,
  isEmpty,
  filters,
  empty,
  children,
}: ReportScreenProps) {
  useDocumentTitle(documentTitle)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col gap-1'>
          <Breadcrumbs>
            {crumbs.map((crumb) => (
              <Breadcrumbs.Item key={crumb}>{crumb}</Breadcrumbs.Item>
            ))}
          </Breadcrumbs>
          <PageHeader title={title} description={description} />
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-end gap-3'>
          <div className='flex w-full flex-col gap-1.5 sm:w-64'>
            <Label>Khoảng thời gian</Label>
            <DateRangePicker
              value={dateRange}
              onChange={onDateRangeChange}
              onApply={onApply}
              aria-label='Khoảng thời gian báo cáo'
            />
          </div>
          {filters}
          <Button onPress={onApply} isDisabled={isLoading} isLoading={isLoading}>
            Lọc báo cáo
          </Button>
        </div>

        {isLoading && <EmptyState variant='loading' rows={6} />}

        {!isLoading && isEmpty && (
          <div className='rounded-lg border border-dashed border-primary bg-primary p-8'>
            <EmptyState
              variant='empty'
              icon={empty.icon}
              title={empty.title}
              description={empty.description}
            />
          </div>
        )}

        {!isLoading && !isEmpty && <div className='space-y-4'>{children}</div>}
      </Main>
    </>
  )
}
