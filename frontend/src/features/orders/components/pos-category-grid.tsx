import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/products'
import { getPriceListById } from '@/services/price-lists'
import { formatCurrency, toNumber } from '@/lib/format'
import { Plus } from '@untitledui/icons'
import { cx } from '@/utils/cx'

interface POSCategoryGridProps {
  priceListId: string
  onAddProduct: (product: { id: string; name: string; unit: string }, price: number | string) => void
}

export function POSCategoryGrid({ priceListId, onAddProduct }: POSCategoryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('')

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const { data: priceList } = useQuery({
    queryKey: ['price-list', priceListId],
    queryFn: () => getPriceListById(priceListId),
    enabled: !!priceListId,
  })

  // Group products by category
  const categories = useMemo(() => {
    const map = new Map<string, typeof products>()
    for (const p of products) {
      const cat = p.categoryName || 'Khác'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(p)
    }
    return Array.from(map.entries())
  }, [products])

  // Set default active category
  const currentCategory = activeCategory || categories[0]?.[0] || ''

  // Filtered products for the active category
  const filteredProducts = useMemo(() => {
    const entry = categories.find(([cat]) => cat === currentCategory)
    return entry?.[1] ?? []
  }, [categories, currentCategory])

  // Prices come from numeric(15,2) columns and can be strings. Coerce here so
  // every caller gets a real number.
  function getPrice(productId: string, defaultSalePrice: number | string): number {
    if (priceList) {
      const item = priceList.items.find((i) => i.productId === productId)
      if (item && item.customPrice !== null && item.customPrice !== undefined) {
        return toNumber(item.customPrice)
      }
    }
    return toNumber(defaultSalePrice)
  }

  function handleAdd(product: { id: string; name: string; unitName: string | null; defaultSalePrice: number | string }) {
    onAddProduct(
      { id: product.id, name: product.name, unit: product.unitName ?? '' },
      getPrice(product.id, product.defaultSalePrice)
    )
  }

  return (
    <div className='space-y-3'>
      {/* Category pills — horizontal scroll */}
      <div className='flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none'>
        {categories.map(([cat]) => (
          <button
            key={cat}
            type='button'
            onClick={() => setActiveCategory(cat)}
            className={cx(
              'min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              cat === currentCategory
                ? 'bg-brand-solid text-white'
                : 'bg-secondary text-tertiary hover:bg-secondary_hover'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid — name gets the full tile width, price sits beneath it.
          Side-by-side, the shrink-0 price and the + icon left the name ~20px on
          a 390px screen and it truncated to "Ba…". */}
      <div className='grid grid-cols-2 gap-2'>
        {filteredProducts.map((p) => (
          <button
            key={p.id}
            type='button'
            onClick={() => handleAdd({ ...p, unitName: p.unitName ?? null })}
            className='flex min-h-11 flex-col items-start justify-center gap-0.5 rounded-lg bg-primary px-3 py-1.5 text-left ring-1 ring-secondary_alt transition-colors active:bg-secondary'
          >
            <span className='w-full truncate text-sm font-medium text-primary'>{p.name}</span>
            <span className='flex w-full items-center justify-between gap-1.5'>
              <span className='min-w-0 truncate text-xs text-tertiary tabular-nums'>
                {formatCurrency(getPrice(p.id, p.defaultSalePrice))}
                {p.unitName ? ` · ${p.unitName}` : ''}
              </span>
              <Plus className='size-4 shrink-0 text-quaternary' />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
