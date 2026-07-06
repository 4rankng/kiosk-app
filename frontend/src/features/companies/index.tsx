import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CompaniesProvider, useCompaniesContext } from './components/companies-provider'
import { CompaniesTable } from './components/companies-table'
import { CompaniesDialogs } from './components/companies-dialogs'

function CompaniesContent() {
  const { setOpen } = useCompaniesContext()
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title='Nhóm khách hàng'
          description='Quản lý công ty, chuỗi nhà hàng và bảng giá áp dụng.'
          actions={
            <Button onClick={() => setOpen('add')}>
              <Plus className='mr-2 h-4 w-4' />
              Thêm mới
            </Button>
          }
        />
        <CompaniesTable />
        <CompaniesDialogs />
      </Main>
    </>
  )
}

export function Companies() {
  return (
    <CompaniesProvider>
      <CompaniesContent />
    </CompaniesProvider>
  )
}
