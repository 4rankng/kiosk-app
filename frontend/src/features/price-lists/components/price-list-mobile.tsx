import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '@/lib/format'
import { NumberInput } from '@/components/number-input'
import type { PriceListItem } from '@/types/api'

/**
 * Incrementally reveal a list as its sentinel scrolls into view. The visible
 * count resets when the dataset length changes (adjusting state during render
 * avoids a cascading setState-in-effect render).
 */
function useIncrementalVisible(total: number, batchSize: number) {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const [prevLength, setPrevLength] = useState(total)
  const sentinelRef = useRef<HTMLDivElement>(null)

  if (total !== prevLength) {
    setPrevLength(total)
    setVisibleCount(batchSize)
  }

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + batchSize, total))
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [total, batchSize])

  return { visibleCount, sentinelRef }
}

/** Mobile card list for price list items — each card shows product info + editable price */
export function PriceListMobile({
  items,
  onUpdatePrice,
}: {
  items: PriceListItem[]
  onUpdatePrice: (productId: string, price: number) => void
}) {
  const batchSize = 20
  const { visibleCount, sentinelRef } = useIncrementalVisible(items.length, batchSize)
  const visibleItems = items.slice(0, visibleCount)

  if (items.length === 0) {
    return (
      <div className='flex h-24 items-center justify-center text-sm text-tertiary'>
        Không tìm thấy mặt hàng.
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {visibleItems.map((item) => (
        <div
          key={item.productId}
          className='rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset p-3 space-y-2'
        >
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{item.name}</p>
              <p className='text-xs text-tertiary'>
                {item.code} · {item.unit}
              </p>
            </div>
            <span className='shrink-0 text-xs text-tertiary tabular-nums'>
              Giá gốc: {formatCurrency(item.basePrice)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='shrink-0 text-xs text-tertiary'>Giá bán:</span>
            <NumberInput
              value={item.customPrice}
              onValueChange={(val) => onUpdatePrice(item.productId, val)}
              className='flex-1'
            />
          </div>
        </div>
      ))}
      {visibleCount < items.length && (
        <div ref={sentinelRef} className='flex justify-center py-4'>
          <span className='text-sm text-tertiary'>Đang tải...</span>
        </div>
      )}
    </div>
  )
}
