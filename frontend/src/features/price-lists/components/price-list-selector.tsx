import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPriceLists, createPriceList } from '@/services/price-lists'
import type { PriceList as PriceListType } from '@/types/api'
import { getCompanies } from '@/services/companies'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface PriceListSelectorProps {
  selectedPriceList: PriceListType | null
  onSelect: (pl: PriceListType) => void
}

export function PriceListSelector({ selectedPriceList, onSelect }: PriceListSelectorProps) {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCompanyId, setNewCompanyId] = useState('')

  const { data: priceLists = [] } = useQuery({
    queryKey: ['price-lists'],
    queryFn: () => getPriceLists(),
  })

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
      <div className='flex items-center gap-2'>
        <span className='text-sm font-medium'>Chọn bảng giá:</span>
        <Select
          value={selectedPriceList?.id ?? ''}
          onValueChange={(val) => {
            const pl = priceLists.find((p) => p.id === val)
            if (pl) onSelect(pl)
          }}
        >
          <SelectTrigger className='w-full sm:w-[300px]'>
            <SelectValue placeholder='Chọn bảng giá...' />
          </SelectTrigger>
          <SelectContent>
            {priceLists.map((pl) => (
              <SelectItem key={pl.id} value={pl.id}>
                {pl.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant='outline' size='sm' onClick={() => setShowCreate(true)}>
        <Plus className='mr-1 h-4 w-4' />
        Thêm bảng giá mới
      </Button>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo bảng giá mới</DialogTitle>
            <DialogDescription>Nhập thông tin bảng giá mới.</DialogDescription>
          </DialogHeader>
          <form id='price-list-create' onSubmit={(e) => { e.preventDefault(); createMutation.mutate() }} className='grid gap-3 py-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Tên bảng giá</Label>
                <Input
                  id='name'
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder='VD: BẢNG GIÁ CHUỖI ABC'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='company'>Công ty</Label>
                <Select value={newCompanyId} onValueChange={setNewCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn công ty...' />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowCreate(false)}>
              Hủy bỏ
            </Button>
            <Button
              type='submit'
              form='price-list-create'
              disabled={!newName.trim() || !newCompanyId || createMutation.isPending}
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo bảng giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
