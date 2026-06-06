import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
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
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Nhóm khách hàng</h2>
            <p className='text-muted-foreground'>Quản lý công ty, chuỗi nhà hàng và bảng giá áp dụng.</p>
          </div>
          <Button onClick={() => setOpen('add')}>
            <Plus className='mr-1 h-4 w-4' />
            Thêm mới
          </Button>
        </div>
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
