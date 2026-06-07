import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchCustomers } from '@/services/customers'
import { getCompanyById } from '@/services/companies'
import { getPriceListByCompany } from '@/services/price-lists'
import { Search, Building2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Customer } from '@/types'
import { Input } from '@/components/ui/input'

interface CustomerSelectorProps {
  selectedCustomer: Customer | null
  onSelect: (customer: Customer, priceListId: string) => void
}

export function CustomerSelector({ selectedCustomer, onSelect }: CustomerSelectorProps) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: results = [] } = useQuery({
    queryKey: ['search-customers', query],
    queryFn: () => searchCustomers(query),
    enabled: query.length >= 2,
  })

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

  async function handleSelect(customer: Customer) {
    setQuery('')
    setShowDropdown(false)
    const pl = priceList
    onSelect(customer, pl?.id ?? '')
  }

  if (selectedCustomer) {
    return (
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <Search className='h-4 w-4 text-muted-foreground' />
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
    <div className='relative'>
      <div className='relative'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Tìm khách hàng...'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          className='pl-8'
        />
      </div>
      {showDropdown && results.length > 0 && (
        <div className='absolute top-full z-50 mt-1 max-h-[200px] w-full overflow-auto rounded-md border bg-background shadow-lg'>
          {results.map((c) => (
            <button
              key={c.id}
              className='w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors'
              onClick={() => handleSelect(c)}
            >
              <div className='font-medium'>{c.name}</div>
              <div className='text-xs text-muted-foreground'>{c.code} · {c.phone}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
