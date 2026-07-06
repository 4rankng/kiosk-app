import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { PriceListSelector } from './components/price-list-selector'
import { PriceListTable } from './components/price-list-table'
import { EmptyState } from '@/components/empty-state'
import type { PriceList } from '@/types/api'
import { getPriceListById } from '@/services/price-lists'
import { useQuery } from '@tanstack/react-query'

export function PriceLists() {
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null)

  // Fetch items for the selected price list
  const { data: itemsData, isLoading: isItemsLoading } = useQuery({
    queryKey: ['price-list-items', selectedPriceList?.id],
    queryFn: () => {
      const id = selectedPriceList?.id
      if (!id) throw new Error('Chưa chọn bảng giá')
      return getPriceListById(id)
    },
    enabled: !!selectedPriceList,
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='Quản lý bảng giá tùy chỉnh' description='Thiết lập giá bán riêng cho từng đối tác.' />
        <PriceListSelector
          selectedPriceList={selectedPriceList}
          onSelect={setSelectedPriceList}
        />
        {selectedPriceList && isItemsLoading && (
          <EmptyState variant='loading' rows={6} />
        )}
        {selectedPriceList && !isItemsLoading && (
          <PriceListTable
            priceList={selectedPriceList}
            items={itemsData?.items ?? []}
          />
        )}
      </Main>
    </>
  )
}
