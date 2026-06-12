import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { PriceListSelector } from './components/price-list-selector'
import { PriceListTable } from './components/price-list-table'
import type { PriceList } from '@/types/api'
import { getPriceListById } from '@/services/price-lists'
import { useQuery } from '@tanstack/react-query'

export function PriceLists() {
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null)

  // Fetch items for the selected price list
  const { data: itemsData } = useQuery({
    queryKey: ['price-list-items', selectedPriceList?.id],
    queryFn: () => getPriceListById(selectedPriceList!.id),
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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Quản lý bảng giá tùy chỉnh</h2>
            <p className='text-muted-foreground'>
              Thiết lập giá bán riêng cho từng đối tác.
            </p>
          </div>
        </div>
        <PriceListSelector
          selectedPriceList={selectedPriceList}
          onSelect={setSelectedPriceList}
        />
        {selectedPriceList && (
          <PriceListTable
            priceList={selectedPriceList}
            items={itemsData?.items ?? []}
          />
        )}
      </Main>
    </>
  )
}
