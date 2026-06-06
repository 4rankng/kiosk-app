import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchProducts } from '@/services/products'
import { getPriceListById } from '@/services/price-lists'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Search } from 'lucide-react'

interface ProductSearchProps {
  priceListId: string
  onAddProduct: (product: { id: string; name: string; unit: string }, price: number) => void
}

export function ProductSearch({ priceListId, onAddProduct }: ProductSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const { data: results = [] } = useQuery({
    queryKey: ['search-products', query],
    queryFn: () => searchProducts(query),
    enabled: query.length >= 1,
  })

  const { data: priceList } = useQuery({
    queryKey: ['price-list', priceListId],
    queryFn: () => getPriceListById(priceListId),
    enabled: !!priceListId,
  })

  function getPrice(productId: string): number {
    if (priceList) {
      const item = priceList.items.find((i) => i.productId === productId)
      if (item) return item.customPrice
    }
    const product = results.find((p) => p.id === productId)
    return product?.defaultSalePrice ?? 0
  }

  const handleAdd = (product: { id: string; name: string; unit: string }) => {
    onAddProduct(product, getPrice(product.id))
    setQuery('')
  }

  return (
    <>
      {/* Desktop: inline search */}
      <div className='hidden sm:block relative'>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Gõ tên hàng để thêm...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='pl-8'
          />
        </div>
        {query.length >= 1 && results.length > 0 && (
          <div className='absolute top-full z-50 mt-1 max-h-[250px] w-full overflow-auto rounded-md border bg-background shadow-lg'>
            {results.slice(0, 10).map((p) => (
              <button
                key={p.id}
                className='flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent'
                onClick={() => handleAdd({ id: p.id, name: p.name, unit: p.unit })}
              >
                <div>
                  <span className='font-medium'>{p.name}</span>
                  <span className='ml-2 text-xs text-muted-foreground'>({p.unit})</span>
                </div>
                <Plus className='h-4 w-4 text-muted-foreground' />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: Sheet slide-up */}
      <div className='sm:hidden'>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant='outline' className='w-full'>
              <Plus className='mr-2 h-4 w-4' />
              Thêm hàng hóa
            </Button>
          </SheetTrigger>
          <SheetContent side='bottom' className='h-[70vh]'>
            <SheetHeader>
              <SheetTitle>Tìm kiếm hàng hóa</SheetTitle>
            </SheetHeader>
            <div className='mt-4 space-y-2'>
              <Input
                placeholder='Gõ tên hoặc mã hàng...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className='max-h-[50vh] overflow-auto space-y-1'>
                {query.length >= 1 && results.slice(0, 15).map((p) => (
                  <button
                    key={p.id}
                    className='flex w-full items-center justify-between rounded-md px-3 py-3 text-left hover:bg-accent'
                    onClick={() => {
                      handleAdd({ id: p.id, name: p.name, unit: p.unit })
                      setOpen(false)
                    }}
                  >
                    <div>
                      <div className='font-medium'>{p.name}</div>
                      <div className='text-xs text-muted-foreground'>{p.code} · {p.unit}</div>
                    </div>
                    <Plus className='h-5 w-5 text-muted-foreground' />
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
