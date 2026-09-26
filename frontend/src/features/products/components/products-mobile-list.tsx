import { useEffect, useRef, useState } from 'react'
import { Pencil01, Trash01 } from '@untitledui/icons'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/base/buttons/button'

interface ProductsMobileListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductsMobileList({ products, onEdit, onDelete }: ProductsMobileListProps) {
  const batchSize = 30
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const [prevLength, setPrevLength] = useState(products.length)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset visible count when the dataset changes (adjusting state during render
  // avoids a cascading setState-in-effect render).
  if (products.length !== prevLength) {
    setPrevLength(products.length)
    setVisibleCount(batchSize)
  }

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + batchSize, products.length))
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [products.length])

  const visible = products.slice(0, visibleCount)

  if (products.length === 0) {
    return (
      <div className='flex h-24 items-center justify-center text-sm text-tertiary'>
        Không có dữ liệu.
      </div>
    )
  }

  return (
    <div className='divide-y divide-secondary'>
      {visible.map((product) => (
        <div key={product.id} className='flex items-start gap-3 py-2.5'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5'>
              <span className='truncate text-sm font-medium'>{product.name}</span>
              <span className='shrink-0 rounded bg-secondary px-1.5 py-px text-xs leading-tight text-tertiary'>
                {product.unitName ?? ''}
              </span>
            </div>
            <div className='mt-0.5 flex items-center gap-1.5 text-xs text-tertiary'>
              <span className='font-mono'>{product.code}</span>
              <span>·</span>
              <span>{product.categoryName ?? ''}</span>
            </div>
          </div>
          <span className='shrink-0 pt-0.5 text-sm font-semibold tabular-nums'>
            {formatCurrency(product.defaultSalePrice)}
          </span>
          <div className='flex shrink-0 items-center gap-1 pt-0.5'>
            <Button
              color='tertiary'
              iconLeading={Pencil01}
              className='min-h-[44px] min-w-[44px]'
              aria-label='Chỉnh sửa sản phẩm'
              onPress={() => onEdit(product)}
            />
            <Button
              color='tertiary'
              iconLeading={Trash01}
              className='min-h-[44px] min-w-[44px] hover:text-error-primary'
              aria-label='Xóa sản phẩm'
              onPress={() => onDelete(product)}
            />
          </div>
        </div>
      ))}
      {visibleCount < products.length && (
        <div ref={sentinelRef} role='status' aria-live='polite' className='flex justify-center py-4'>
          <span className='text-xs text-tertiary'>Đang tải...</span>
        </div>
      )}
    </div>
  )
}
