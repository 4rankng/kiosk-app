import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { savePriceList } from '@/services/price-lists'
import type { PriceList, PriceListItem } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/number-input'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface PriceListTableProps {
  priceList: PriceList
}

export function PriceListTable({ priceList }: PriceListTableProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<PriceListItem[]>(priceList.items)
  const isMobile = useIsMobile()

  // Sync items when priceList changes
  useEffect(() => {
    setItems(priceList.items)
  }, [priceList.id])

  const filteredItems = items.filter(
    (item) =>
      item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.code.toLowerCase().includes(search.toLowerCase())
  )

  const saveMutation = useMutation({
    mutationFn: () => savePriceList({ ...priceList, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] })
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
        <Input
          placeholder='Tìm kiếm mặt hàng...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={isMobile ? 'h-9 w-full' : 'h-9 w-[300px]'}
        />
      </div>

      {isMobile ? (
        <MobilePriceList
          items={filteredItems}
          onUpdatePrice={updateCustomPrice}
        />
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[100px]'>Mã hàng</TableHead>
                <TableHead>Tên mặt hàng</TableHead>
                <TableHead className='w-[130px] text-right'>Giá gốc</TableHead>
                <TableHead className='w-[160px] text-right'>Giá tùy chỉnh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className='font-mono text-sm'>{item.product.code}</TableCell>
                  <TableCell>
                    {item.product.name}
                    <span className='ml-2 text-xs text-muted-foreground'>({item.product.unit})</span>
                  </TableCell>
                  <TableCell className='text-right text-muted-foreground'>
                    {formatCurrency(item.product.defaultSalePrice)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <NumberInput
                      value={item.customPrice}
                      onValueChange={(val) => updateCustomPrice(item.productId, val)}
                      className='h-8 w-[130px]'
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    Không tìm thấy mặt hàng.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className='flex justify-end'>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className='mr-2 h-4 w-4' />
          {saveMutation.isPending ? 'Đang lưu...' : 'Lưu bảng giá'}
        </Button>
      </div>
    </div>
  )
}

/** Mobile card list for price list items — each card shows product info + editable price */
function MobilePriceList({
  items,
  onUpdatePrice,
}: {
  items: PriceListItem[]
  onUpdatePrice: (productId: string, price: number) => void
}) {
  const batchSize = 20
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset when items change
  useMemo(() => { setVisibleCount(batchSize) }, [items.length])

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + batchSize, items.length))
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [items.length])

  const visibleItems = items.slice(0, visibleCount)

  if (items.length === 0) {
    return (
      <div className='flex h-24 items-center justify-center text-sm text-muted-foreground'>
        Không tìm thấy mặt hàng.
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {visibleItems.map((item) => (
        <div
          key={item.productId}
          className='rounded-md border bg-card p-3 space-y-2'
        >
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{item.product.name}</p>
              <p className='text-xs text-muted-foreground'>
                {item.product.code} · {item.product.unit}
              </p>
            </div>
            <span className='shrink-0 text-xs text-muted-foreground'>
              Giá gốc: {formatCurrency(item.product.defaultSalePrice)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='shrink-0 text-xs text-muted-foreground'>Giá bán:</span>
            <NumberInput
              value={item.customPrice}
              onValueChange={(val) => onUpdatePrice(item.productId, val)}
              className='h-8 flex-1'
            />
          </div>
        </div>
      ))}
      {visibleCount < items.length && (
        <div ref={sentinelRef} className='flex justify-center py-4'>
          <span className='text-sm text-muted-foreground'>Đang tải...</span>
        </div>
      )}
    </div>
  )
}
