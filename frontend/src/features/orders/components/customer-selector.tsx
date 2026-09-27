import { useState, useRef, useMemo, useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCustomers } from '@/services/customers'
import { getCompanyById } from '@/services/companies'
import { getPriceListByCompany } from '@/services/price-lists'
import { Building05, Tag01, SearchMd } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { InputBase } from '@/components/base/input/input'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { CloseButton } from '@/components/base/buttons/close-button'
import type { Customer } from '@/types'

interface CustomerSelectorProps {
  selectedCustomer: Customer | null
  company?: { name: string }
  priceList?: { id: string; name: string }
  onSelect: (customer: Customer | null) => void
}

/**
 * Company + automatic price list of the selected customer. Both queries are
 * keyed by companyId and stay disabled until a customer with a company is
 * selected.
 */
export function useCustomerReferenceData(companyId: string | undefined) {
  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => {
      if (!companyId) throw new Error('Chưa chọn khách hàng')
      return getCompanyById(companyId)
    },
    enabled: !!companyId,
  })

  const { data: priceList } = useQuery({
    queryKey: ['price-list-by-company', companyId],
    queryFn: () => {
      if (!companyId) throw new Error('Chưa chọn khách hàng')
      return getPriceListByCompany(companyId)
    },
    enabled: !!companyId,
  })

  return { company, priceList }
}

/** Read-only summary shown once a customer is selected. */
function CustomerSummary({
  selectedCustomer,
  onSelect,
  company,
  priceList,
}: {
  selectedCustomer: Customer
  onSelect: CustomerSelectorProps['onSelect']
  company?: { name: string }
  priceList?: { id: string; name: string }
}) {
  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-2'>
        <span className='text-sm font-medium text-primary'>{selectedCustomer.name}</span>
        <Button
          color='link-gray'
          size='sm'
          onPress={() => onSelect(null)}
        >
          Thay đổi
        </Button>
      </div>
      <div className='space-y-1 rounded-lg bg-secondary p-3'>
        <p className='flex items-center gap-2 text-sm text-tertiary'>
          <Building05 className='size-4' />
          Phân loại: {company?.name ?? 'Đang tải...'}
        </p>
        <p className='flex items-center gap-2 text-sm text-tertiary'>
          <Tag01 className='size-4' />
          Bảng giá tự động: {priceList?.name ?? 'BẢNG GIÁ CHUNG'}
        </p>
      </div>
    </div>
  )
}

/** Desktop: inline search with dropdown. */
function CustomerDesktopSearch({
  query,
  setQuery,
  filtered,
  handleSelect,
  handleFocus,
  handleBlur,
  focused,
}: {
  query: string
  setQuery: (q: string) => void
  filtered: Customer[]
  handleSelect: (customer: Customer) => void
  handleFocus: () => void
  handleBlur: () => void
  focused: boolean
}) {
  return (
    <div className='hidden sm:block relative'>
      <InputBase
        size='sm'
        icon={SearchMd}
        placeholder='Tìm khách hàng...'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {focused && filtered.length > 0 && (
        <div className='absolute top-full z-50 mt-1 max-h-[250px] w-full overflow-auto rounded-lg bg-primary py-1 shadow-lg ring-1 ring-secondary_alt'>
          {filtered.map((c) => (
            <button
              key={c.id}
              className='flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-secondary'
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(c)}
            >
              <div className='min-w-0'>
                <span className='font-medium text-primary'>{c.name}</span>
                <span className='ml-2 text-xs text-tertiary'>({c.code})</span>
              </div>
              <span className='shrink-0 text-xs text-tertiary tabular-nums'>{c.phone}</span>
            </button>
          ))}
        </div>
      )}
      {focused && query.length >= 1 && filtered.length === 0 && (
        <div className='absolute top-full z-50 mt-1 w-full rounded-lg bg-primary p-3 text-center text-sm text-tertiary shadow-lg ring-1 ring-secondary_alt'>
          Không tìm thấy khách hàng
        </div>
      )}
    </div>
  )
}

/** Mobile: bottom sheet picker. */
function CustomerMobileSheet({
  sheetOpen,
  setSheetOpen,
  query,
  setQuery,
  filtered,
  handleSelect,
  mobileTitleId,
}: {
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  query: string
  setQuery: (q: string) => void
  filtered: Customer[]
  handleSelect: (customer: Customer) => void
  mobileTitleId: string
}) {
  return (
    <div className='sm:hidden'>
      <ModalOverlay isOpen={sheetOpen} onOpenChange={setSheetOpen} isDismissable>
        <Modal className='w-full'>
          <Dialog aria-labelledby={mobileTitleId}>
            <div className='flex flex-col gap-3 p-4'>
              <div className='flex items-center justify-between'>
                <h2 id={mobileTitleId} className='text-md font-semibold text-primary'>
                  Tìm kiếm khách hàng
                </h2>
                <CloseButton size='sm' onClick={() => setSheetOpen(false)} />
              </div>
              <InputBase
                size='sm'
                icon={SearchMd}
                autoFocus
                placeholder='Gõ tên, mã hoặc số điện thoại...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className='flex max-h-[50vh] flex-col gap-1 overflow-y-auto'>
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    className='flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-secondary'
                    onClick={() => handleSelect(c)}
                  >
                    <div className='min-w-0'>
                      <div className='text-sm font-medium text-primary'>{c.name}</div>
                      <div className='text-xs text-tertiary'>{c.code} · {c.phone}</div>
                    </div>
                  </button>
                ))}
                {query.length >= 1 && filtered.length === 0 && (
                  <p className='py-4 text-center text-sm text-tertiary'>
                    Không tìm thấy khách hàng
                  </p>
                )}
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  )
}

export function CustomerSelector({
  selectedCustomer,
  company,
  priceList,
  onSelect,
}: CustomerSelectorProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const mobileTitleId = useId()

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers(),
  })
  const customers = customersData?.data ?? []

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
    onSelect(customer)
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
      <CustomerSummary
        selectedCustomer={selectedCustomer}
        onSelect={onSelect}
        company={company}
        priceList={priceList}
      />
    )
  }

  return (
    <>
      <CustomerDesktopSearch
        query={query}
        setQuery={setQuery}
        filtered={filtered}
        handleSelect={handleSelect}
        handleFocus={handleFocus}
        handleBlur={handleBlur}
        focused={focused}
      />

      <CustomerMobileSheet
        sheetOpen={sheetOpen}
        setSheetOpen={setSheetOpen}
        query={query}
        setQuery={setQuery}
        filtered={filtered}
        handleSelect={handleSelect}
        mobileTitleId={mobileTitleId}
      />
    </>
  )
}
