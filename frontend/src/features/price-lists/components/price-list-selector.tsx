import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from '@untitledui/icons'
import { getPriceLists, createPriceList } from '@/services/price-lists'
import type { PriceList as PriceListType } from '@/types/api'
import { getCompanies } from '@/services/companies'
import { Button } from '@/components/base/buttons/button'
import { Select } from '@/components/base/select/select'
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal'
import { InputBase } from '@/components/base/input/input'
import { Label } from '@/components/base/input/label'
import { toast } from 'sonner'

interface PriceListSelectorProps {
  selectedPriceList: PriceListType | null
  onSelect: (pl: PriceListType) => void
  priceLists?: PriceListType[]
}

export function PriceListSelector({ selectedPriceList, onSelect, priceLists: priceListsProp }: PriceListSelectorProps) {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCompanyId, setNewCompanyId] = useState('')

  const { data: fetchedLists = [] } = useQuery({
    queryKey: ['price-lists'],
    queryFn: () => getPriceLists(),
    enabled: !priceListsProp,
  })
  const priceLists = priceListsProp || fetchedLists

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await getCompanies()
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: () => createPriceList({ name: newName, companyId: newCompanyId }),
    onSuccess: (pl) => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] })
      toast.success('Tạo bảng giá thành công!')
      setShowCreate(false)
      setNewName('')
      setNewCompanyId('')
      onSelect(pl)
    },
  })

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='text-sm font-medium text-secondary'>Chọn bảng giá:</span>
        <div className='w-full sm:w-[300px]'>
          <Select
            size='sm'
            aria-label='Chọn bảng giá'
            placeholder='Chọn bảng giá...'
            selectedKey={selectedPriceList?.id ?? null}
            onSelectionChange={(key) => {
              if (key === null) return
              const pl = priceLists.find((p) => p.id === key)
              if (pl) onSelect(pl)
            }}
          >
            {priceLists.map((pl) => (
              <Select.Item key={pl.id} id={pl.id}>{pl.name}</Select.Item>
            ))}
          </Select>
        </div>
      </div>

      <Button color='secondary' size='sm' iconLeading={Plus} onPress={() => setShowCreate(true)}>
        Thêm bảng giá mới
      </Button>

      <ModalOverlay isOpen={showCreate} onOpenChange={(o) => setShowCreate(o)}>
      <Modal className='w-full max-w-md'>
        <Dialog aria-labelledby='price-list-create-title'>
          <div className='flex flex-col gap-4 p-5 sm:p-6'>
            <div className='flex flex-col gap-1'>
              <h2 id='price-list-create-title' className='text-md font-semibold text-primary'>Tạo bảng giá mới</h2>
              <p className='text-sm text-tertiary'>Nhập thông tin bảng giá mới.</p>
            </div>
            <form id='price-list-create' onSubmit={(e) => { e.preventDefault(); createMutation.mutate() }} className='flex flex-col gap-3'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='name'>Tên bảng giá</Label>
                  <InputBase
                    id='name'
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder='VD: BẢNG GIÁ CHUỖI ABC'
                  />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='company'>Công ty</Label>
                  <Select
                    size='sm'
                    aria-label='Công ty'
                    placeholder='Chọn công ty...'
                    selectedKey={newCompanyId || null}
                    onSelectionChange={(key) => setNewCompanyId(key ? String(key) : '')}
                  >
                    {companies.map((c) => (
                      <Select.Item key={c.id} id={c.id}>{c.name}</Select.Item>
                    ))}
                  </Select>
                </div>
              </div>
            </form>
            <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
              <Button color='secondary' onPress={() => setShowCreate(false)}>Hủy bỏ</Button>
              <Button
                type='submit'
                form='price-list-create'
                isLoading={createMutation.isPending}
                isDisabled={!newName.trim() || !newCompanyId}
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo bảng giá'}
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
    </div>
  )
}
