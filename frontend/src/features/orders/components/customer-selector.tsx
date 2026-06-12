import { useState, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCustomers } from '@/services/customers'
import { getCompanyById } from '@/services/companies'
import { getPriceListByCompany } from '@/services/price-lists'
import { Building2, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Customer } from '@/types'

interface CustomerSelectorProps {
  selectedCustomer: Customer | null
  onSelect: (customer: Customer, priceListId: string) => void
}

export function CustomerSelector({ selectedCustomer, onSelect }: CustomerSelectorProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers(),
  })
  const customers = customersData?.data ?? []

  const { data: company } = useQuery({
    queryKey: ['company', selectedCustomer?.companyId],
    queryFn: () => getCompanyById(selectedCustomer!.companyId),
    enabled: !!selectedCustomer?.companyId,
  })

  const { data: priceList } = useQuery({
    queryKey: ['price-list-by-company', selectedCustomer?.companyId],
    queryFn: () => getPriceListByCompany(selectedCustomer!.companyId),
    enabled: !!selectedCustomer?.companyId,
  })

  const filtered = useMemo(() => {
    if (!query) return customers
    const q = query.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q)
    )
  }, [customers, query])

  function handleSelect(customer: Customer) {
    setQuery('')
    setFocused(false)
    setSheetOpen(false)
    onSelect(customer, priceList?.id ?? '')
  }

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
    setFocused(true)
  }

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setFocused(false), 200)
  }

  if (selectedCustomer) {
    return (
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>{selectedCustomer.name}</span>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onSelect(null as unknown as Customer, '')}
            className='h-auto px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground'
          >
            Thay đổi
          </Button>
        </div>
        <div className='rounded-lg border bg-muted/50 p-3 space-y-1'>
          <p className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Building2 className='h-4 w-4' />
            Phân loại: {company?.name ?? 'Đang tải...'}
          </p>
          <p className='flex items-center gap-2 text-sm text-muted-foreground'>
            <FileText className='h-4 w-4' />
            Bảng giá tự động: {priceList?.name ?? 'BẢNG GIÁ CHUNG'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop: inline search with dropdown */}
      <div className='hidden sm:block relative'>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm khách hàng...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className='pl-8'
          />
        </div>
        {focused && filtered.length > 0 && (
          <div className='absolute top-full z-50 mt-1 max-h-[250px] w-full overflow-auto rounded-md border bg-background shadow-lg'>
            {filtered.map((c) => (
              <button
                key={c.id}
                className='flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent transition-colors'
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(c)}
              >
                <div>
                  <span className='font-medium'>{c.name}</span>
                  <span className='ml-2 text-xs text-muted-foreground'>({c.code})</span>
                </div>
                <span className='text-xs text-muted-foreground'>{c.phone}</span>
              </button>
            ))}
          </div>
        )}
        {focused && query.length >= 1 && filtered.length === 0 && (
          <div className='absolute top-full z-50 mt-1 w-full rounded-md border bg-background p-3 text-center text-sm text-muted-foreground shadow-lg'>
            Không tìm thấy khách hàng
          </div>
        )}
      </div>

      {/* Mobile: Sheet slide-up */}
      <div className='sm:hidden'>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant='outline' className='w-full'>
              <Search className='mr-2 h-4 w-4' />
              Chọn khách hàng
            </Button>
          </SheetTrigger>
          <SheetContent side='bottom' className='h-[70vh]'>
            <SheetHeader>
              <SheetTitle>Tìm kiếm khách hàng</SheetTitle>
            </SheetHeader>
            <div className='mt-4 space-y-2'>
              <Input
                placeholder='Gõ tên, mã hoặc số điện thoại...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className='max-h-[50vh] overflow-auto space-y-1'>
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    className='flex w-full items-center justify-between rounded-md px-3 py-3 text-left hover:bg-accent transition-colors'
                    onClick={() => handleSelect(c)}
                  >
                    <div>
                      <div className='font-medium'>{c.name}</div>
                      <div className='text-xs text-muted-foreground'>{c.code} · {c.phone}</div>
                    </div>
                  </button>
                ))}
                {query.length >= 1 && filtered.length === 0 && (
                  <p className='py-4 text-center text-sm text-muted-foreground'>
                    Không tìm thấy khách hàng
                  </p>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
