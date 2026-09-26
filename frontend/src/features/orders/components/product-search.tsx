import { useState, useRef, useCallback, useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchProducts } from '@/services/products'
import { getPriceListById } from '@/services/price-lists'
import { InputBase } from '@/components/base/input/input'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { CloseButton } from '@/components/base/buttons/close-button'
import { SearchMd, PlusCircle } from '@untitledui/icons'
import { formatCurrency } from '@/lib/format'

interface ProductSearchProps {
  priceListId: string
  onAddProduct: (product: { id: string; name: string; unit: string }, price: number) => void
}

export function ProductSearch({ priceListId, onAddProduct }: ProductSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const mobileTitleId = useId()

  const { data: results = [] } = useQuery({
    queryKey: ['search-products', query],
    queryFn: () => searchProducts(query),
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

  const handleAdd = useCallback((product: { id: string; name: string; unit: string }) => {
    onAddProduct(product, getPrice(product.id))
    setQuery('')
  }, [onAddProduct, priceList, results])

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
    setFocused(true)
  }

  const handleBlur = () => {
    // Delay blur so a click on a dropdown item registers first
    blurTimeout.current = setTimeout(() => setFocused(false), 200)
  }

  const showDropdown = focused && results.length > 0

  const listRowClasses =
    'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-secondary'

  return (
    <>
      {/* Desktop: inline search with dropdown */}
      <div className='hidden sm:block relative'>
        <InputBase
          size='sm'
          icon={SearchMd}
          placeholder='Gõ tên hàng để thêm...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {showDropdown && (
          <div className='absolute top-full z-50 mt-1 max-h-[250px] w-full overflow-auto rounded-lg bg-primary py-1 shadow-lg ring-1 ring-secondary_alt'>
            {results.slice(0, 10).map((p) => (
              <button
                key={p.id}
                className={listRowClasses}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAdd({ id: p.id, name: p.name, unit: p.unitName ?? '' })}
              >
                <div className='min-w-0'>
                  <span className='font-medium text-primary'>{p.name}</span>
                  <span className='ml-2 text-xs text-tertiary'>({p.unitName ?? ''})</span>
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                  <span className='text-xs text-tertiary tabular-nums'>{formatCurrency(getPrice(p.id))}</span>
                  <PlusCircle className='size-4 text-fg-quaternary' />
                </div>
              </button>
            ))}
          </div>
        )}
        {focused && query.length >= 1 && results.length === 0 && (
          <div className='absolute top-full z-50 mt-1 w-full rounded-lg bg-primary p-3 text-center text-sm text-tertiary shadow-lg ring-1 ring-secondary_alt'>
            Không tìm thấy hàng hóa
          </div>
        )}
      </div>

      {/* Mobile: bottom sheet */}
      <div className='sm:hidden'>
        <ModalOverlay isOpen={open} onOpenChange={setOpen} isDismissable>
          <Modal className='w-full'>
            <Dialog aria-labelledby={mobileTitleId}>
              <div className='flex flex-col gap-3 p-4'>
                <div className='flex items-center justify-between'>
                  <h2 id={mobileTitleId} className='text-md font-semibold text-primary'>
                    Tìm kiếm hàng hóa
                  </h2>
                  <CloseButton size='sm' onClick={() => setOpen(false)} />
                </div>
                <InputBase
                  size='sm'
                  icon={SearchMd}
                  autoFocus
                  placeholder='Gõ tên hoặc mã hàng...'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className='flex max-h-[50vh] flex-col gap-1 overflow-y-auto'>
                  {results.slice(0, 15).map((p) => (
                    <button
                      key={p.id}
                      className={listRowClasses}
                      onClick={() => {
                        handleAdd({ id: p.id, name: p.name, unit: p.unitName ?? '' })
                        setOpen(false)
                      }}
                    >
                      <div className='min-w-0'>
                        <div className='text-sm font-medium text-primary'>{p.name}</div>
                        <div className='text-xs text-tertiary'>{p.code} · {p.unitName ?? ''}</div>
                      </div>
                      <PlusCircle className='size-5 shrink-0 text-fg-quaternary' />
                    </button>
                  ))}
                  {query.length >= 1 && results.length === 0 && (
                    <p className='py-4 text-center text-sm text-tertiary'>
                      Không tìm thấy hàng hóa
                    </p>
                  )}
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </div>
    </>
  )
}
