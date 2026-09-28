import { Button } from '@/components/base/buttons/button'
import { Plus } from '@untitledui/icons'
import { EntityScreen } from '@/components/entity-screen'
import { CompaniesProvider, useCompaniesContext } from './components/companies-provider'
import { CompaniesTable } from './components/companies-table'
import { CompaniesDialogs } from './components/companies-dialogs'

function CompaniesContent() {
  const { setOpen } = useCompaniesContext()
  return (
    <EntityScreen
      crumbs={['Khách hàng', 'Nhóm KH']}
      title='Nhóm khách hàng'
      description='Quản lý công ty, chuỗi nhà hàng và bảng giá áp dụng.'
      actions={
        <Button onPress={() => setOpen('add')} iconLeading={Plus}>
          Thêm
        </Button>
      }
      dialogs={<CompaniesDialogs />}
    >
      <CompaniesTable />
    </EntityScreen>
  )
}

export function Companies() {
  return (
    <CompaniesProvider>
      <CompaniesContent />
    </CompaniesProvider>
  )
}
