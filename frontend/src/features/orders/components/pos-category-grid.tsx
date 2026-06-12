import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/products'
import { getPriceListById } from '@/services/price-lists'
import { formatCurrency } from '@/lib/format'
import { PlusCircle } from 'lucide-react'

interface POSCategoryGridProps {
  priceListId: string
  onAddProduct: (product: { id: string; name: string; unit: string }, price: number) => void
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

  // Filtered products for active category
  const filteredProducts = useMemo(() => {
    const entry = categories.find(([cat]) => cat === currentCategory)
    return entry?.[1] ?? []
  }, [categories, currentCategory])

  function getPrice(productId: string, defaultSalePrice: number): number {
    if (priceList) {
      const item = priceList.items.find((i) => i.productId === productId)
      if (item) return item.customPrice
    }
    return defaultSalePrice
  }

  function handleAdd(product: { id: string; name: string; unitName: string | null; defaultSalePrice: number }) {
    onAddProduct(
      { id: product.id, name: product.name, unit: product.unitName ?? '' },
      getPrice(product.id, product.defaultSalePrice)
    )
  }

  return (
    <div className='space-y-3'>
      {/* Category tabs — horizontal scroll */}
      <div className='flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none'>
        {categories.map(([cat]) => (
          <button
            key={cat}
            type='button'
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
              cat === currentCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className='grid grid-cols-2 gap-2'>
        {filteredProducts.map((p) => (
          <button
            key={p.id}
            type='button'
            onClick={() => handleAdd({ ...p, unitName: p.unitName ?? null })}
            className='flex items-center justify-between rounded-lg border bg-card p-3 text-left transition-colors active:bg-accent min-h-[44px]'
          >
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-medium truncate'>{p.name}</div>
              <div className='text-xs text-muted-foreground'>
                {p.unitName ?? ''} · {formatCurrency(getPrice(p.id, p.defaultSalePrice))}
              </div>
            </div>
            <PlusCircle className='ml-2 h-5 w-5 shrink-0 text-muted-foreground' />
          </button>
        ))}
      </div>
    </div>
  )
}
