import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { savePriceList } from '@/services/price-lists'
import type { PriceList, PriceListItem } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

interface PriceListTableProps {
  priceList: PriceList
}

export function PriceListTable({ priceList }: PriceListTableProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<PriceListItem[]>(priceList.items)

  // Sync items when priceList changes
  useMemo(() => {
    setItems(priceList.items)
  }, [priceList.id])

  const filteredItems = items.filter(
    (item) =>
      item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.code.toLowerCase().includes(search.toLowerCase())
  )

  const saveMutation = useMutation({
    mutationFn: () => savePriceList({ ...priceList, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] })
      toast.success('Lưu bảng giá thành công!')
    },
  })

  function updateCustomPrice(productId: string, value: string) {
    const price = parseInt(value.replace(/\D/g, ''), 10) || 0
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, customPrice: price } : item
      )
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='Tìm kiếm mặt hàng...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='h-9 w-[300px]'
        />
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Mã hàng</TableHead>
              <TableHead>Tên mặt hàng</TableHead>
              <TableHead className='w-[130px] text-right'>Giá gốc</TableHead>
              <TableHead className='w-[160px] text-right'>Giá tùy chỉnh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.productId}>
                <TableCell className='font-mono text-sm'>{item.product.code}</TableCell>
                <TableCell>
                  {item.product.name}
                  <span className='ml-2 text-xs text-muted-foreground'>({item.product.unit})</span>
                </TableCell>
                <TableCell className='text-right text-muted-foreground'>
                  {formatCurrency(item.product.defaultSalePrice)}
                </TableCell>
                <TableCell className='text-right'>
                  <Input
                    type='text'
                    inputMode='numeric'
                    value={item.customPrice.toLocaleString('vi-VN')}
                    onChange={(e) => updateCustomPrice(item.productId, e.target.value)}
                    className='h-8 w-[130px] text-right'
                  />
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  Không tìm thấy mặt hàng.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-end'>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className='mr-2 h-4 w-4' />
          {saveMutation.isPending ? 'Đang lưu...' : 'Lưu bảng giá'}
        </Button>
      </div>
    </div>
  )
}
