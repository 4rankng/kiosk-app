import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchCustomers, getCustomerById } from '@/services/customers'
import { getCompanyById } from '@/services/companies'
import { getPriceListByCompany } from '@/services/price-lists'
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
          <span className='text-sm'>🔍</span>
          <span className='font-medium'>{selectedCustomer.name}</span>
          <button
            onClick={() => onSelect(null as unknown as Customer, '')}
            className='text-xs text-muted-foreground hover:text-foreground'
          >
            ✕ Thay đổi
          </button>
        </div>
        <p className='text-sm text-muted-foreground'>
          🏢 Phân loại: {company?.name ?? 'Đang tải...'}
        </p>
        <p className='text-sm text-muted-foreground'>
          📜 Bảng giá tự động: {priceList?.name ?? 'BẢNG GIÁ CHUNG'}
        </p>
      </div>
    )
  }

  return (
    <div className='relative'>
      <Input
        placeholder='🔍 Tìm khách hàng...'
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowDropdown(true)
        }}
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && results.length > 0 && (
        <div className='absolute top-full z-50 mt-1 max-h-[200px] w-full overflow-auto rounded-md border bg-background shadow-lg'>
          {results.map((c) => (
            <button
              key={c.id}
              className='w-full px-3 py-2 text-left text-sm hover:bg-accent'
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
