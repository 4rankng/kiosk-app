import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag01 } from '@untitledui/icons'
import { EntityScreen } from '@/components/entity-screen'
import { PriceListSelector } from './components/price-list-selector'
import { PriceListTable } from './components/price-list-table'
import { EmptyState } from '@/components/empty-state'
import type { PriceList } from '@/types/api'
import { getPriceListById, getPriceLists } from '@/services/price-lists'

export function PriceLists() {
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null)

  const { data: priceLists = [], isLoading: isListsLoading } = useQuery({
    queryKey: ['price-lists'],
    queryFn: () => getPriceLists(),
  })

  // Derive effective price list: user-selected or auto-fallback to default/first
  const effectivePriceList =
    selectedPriceList ??
    (priceLists.length > 0 ? (priceLists.find((p) => p.isDefault) || priceLists[0]) : null)

  // Fetch items for the selected price list
  const { data: itemsData, isLoading: isItemsLoading } = useQuery({
    queryKey: ['price-list-items', effectivePriceList?.id],
    queryFn: () => {
      const id = effectivePriceList?.id
      if (!id) throw new Error('Chưa chọn bảng giá')
      return getPriceListById(id)
    },
    enabled: !!effectivePriceList,
  })

  return (
    <EntityScreen crumbs={['Hàng hóa', 'Bảng giá']} title='Quản lý bảng giá tùy chỉnh' description='Thiết lập giá bán riêng cho từng đối tác.'>
      <PriceListSelector
        selectedPriceList={effectivePriceList}
        onSelect={setSelectedPriceList}
        priceLists={priceLists}
      />
      {isListsLoading && <EmptyState variant='loading' rows={6} />}
      {!isListsLoading && effectivePriceList && isItemsLoading && <EmptyState variant='loading' rows={6} />}
      {!isListsLoading && effectivePriceList && !isItemsLoading && (
        <PriceListTable
          priceList={effectivePriceList}
          items={itemsData?.items ?? []}
        />
      )}
      {!isListsLoading && !effectivePriceList && (
        <div className='rounded-xl border border-dashed border-secondary bg-primary p-8'>
          <EmptyState
            variant='empty'
            icon={<Tag01 className='size-10 text-quaternary' />}
            title='Chưa chọn bảng giá'
            description='Chọn một bảng giá từ danh sách trên để xem chi tiết các mặt hàng và cấu hình giá.'
          />
        </div>
      )}
    </EntityScreen>
  )
}
