import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save01, SearchMd } from '@untitledui/icons'
import { bulkUpsertPriceListItems } from '@/services/price-lists'
import type { PriceList, PriceListItem } from '@/types/api'
import { formatCurrency } from '@/lib/format'
import { InputBase } from '@/components/base/input/input'
import { NumberInput } from '@/components/number-input'
import { Button } from '@/components/base/buttons/button'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { PriceListMobile } from './price-list-mobile'

interface PriceListTableProps {
  priceList: PriceList
  items: PriceListItem[]
}

/** Desktop editable table of price list items. */
function PriceListDesktopTable({
  items,
  onUpdatePrice,
}: {
  items: PriceListItem[]
  onUpdatePrice: (productId: string, price: number) => void
}) {
  return (
    <div className='overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='bg-secondary'>
            <th scope='col' className='w-[100px] px-3 py-2.5 text-start text-xs font-medium text-tertiary'>Mã hàng</th>
            <th scope='col' className='px-3 py-2.5 text-start text-xs font-medium text-tertiary'>Tên mặt hàng</th>
            <th scope='col' className='w-[130px] px-3 py-2.5 text-end text-xs font-medium text-tertiary'>Giá gốc</th>
            <th scope='col' className='w-[160px] px-3 py-2.5 text-end text-xs font-medium text-tertiary'>Giá tùy chỉnh</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId} className='border-b border-secondary transition-colors last:border-b-0 hover:bg-primary_hover'>
              <td className='px-3 py-2.5 font-mono text-sm'>{item.code}</td>
              <td className='px-3 py-2.5'>
                {item.name}
                <span className='ml-2 text-xs text-tertiary'>({item.unit})</span>
              </td>
              <td className='px-3 py-2.5 text-end text-tertiary tabular-nums'>{formatCurrency(item.basePrice)}</td>
              <td className='px-3 py-2.5 text-end'>
                <div className='flex justify-end'>
                  <NumberInput
                    value={item.customPrice}
                    onValueChange={(val) => onUpdatePrice(item.productId, val)}
                    className='w-[130px]'
                  />
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className='h-24 text-center text-tertiary'>Không tìm thấy mặt hàng.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function PriceListTable({ priceList, items: initialItems }: PriceListTableProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<PriceListItem[]>(initialItems)
  const [prevPriceListId, setPrevPriceListId] = useState(priceList.id)
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems)
  const isMobile = useIsMobile()

  // Sync local items when the price list or its source items change (adjusting
  // state during render avoids a cascading setState-in-effect render).
  if (priceList.id !== prevPriceListId || initialItems !== prevInitialItems) {
    setPrevPriceListId(priceList.id)
    setPrevInitialItems(initialItems)
    setItems(initialItems)
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
  )

  const saveMutation = useMutation({
    mutationFn: () =>
      bulkUpsertPriceListItems(
        priceList.id,
        items.map((item) => ({ productId: item.productId, customPrice: item.customPrice }))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] })
      queryClient.invalidateQueries({ queryKey: ['price-list-items'] })
      // Invalidate POS price lookups so edited prices are reflected immediately
      // (reads use ['price-list', id] and ['price-list-by-company', companyId]).
      queryClient.invalidateQueries({ queryKey: ['price-list'] })
      queryClient.invalidateQueries({ queryKey: ['price-list-by-company'] })
      toast.success('Lưu bảng giá thành công!')
    },
  })

  function updateCustomPrice(productId: string, price: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, customPrice: price } : item
      )
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className={isMobile ? 'w-full' : 'w-[300px]'}>
          <InputBase
            size='sm'
            icon={SearchMd}
            wrapperClassName='h-9'
            placeholder='Tìm kiếm mặt hàng...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isMobile ? (
        <PriceListMobile
          items={filteredItems}
          onUpdatePrice={updateCustomPrice}
        />
      ) : (
        <PriceListDesktopTable
          items={filteredItems}
          onUpdatePrice={updateCustomPrice}
        />
      )}

      <div className='flex justify-end'>
        <Button iconLeading={Save01} onPress={() => saveMutation.mutate()} isDisabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Đang lưu...' : 'Lưu bảng giá'}
        </Button>
      </div>
    </div>
  )
}
