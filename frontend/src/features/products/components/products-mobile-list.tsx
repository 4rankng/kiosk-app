import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface ProductsMobileListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductsMobileList({ products, onEdit, onDelete }: ProductsMobileListProps) {
  const batchSize = 30
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setVisibleCount(batchSize) }, [products.length])

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
      <div className='flex h-24 items-center justify-center text-sm text-muted-foreground'>
        Không có dữ liệu.
      </div>
    )
  }

  return (
    <div className='divide-y'>
      {visible.map((product) => (
        <div key={product.id} className='flex items-start gap-3 py-2.5'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5'>
              <span className='truncate text-sm font-medium'>{product.name}</span>
              <span className='shrink-0 rounded bg-muted px-1.5 py-px text-[10px] leading-tight text-muted-foreground'>
                {product.unit}
              </span>
            </div>
            <div className='mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
              <span className='font-mono'>{product.code}</span>
              <span>·</span>
              <span>{product.category}</span>
            </div>
          </div>
          <span className='shrink-0 pt-0.5 text-sm font-semibold tabular-nums'>
            {formatCurrency(product.defaultSalePrice)}
          </span>
          <div className='flex shrink-0 items-center gap-0.5 pt-0.5'>
            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => onEdit(product)}>
              <Pencil className='h-3.5 w-3.5' />
            </Button>
            <Button variant='ghost' size='icon' className='h-7 w-7 hover:text-destructive' onClick={() => onDelete(product)}>
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      ))}
      {visibleCount < products.length && (
        <div ref={sentinelRef} className='flex justify-center py-4'>
          <span className='text-xs text-muted-foreground'>Đang tải...</span>
        </div>
      )}
    </div>
  )
}
