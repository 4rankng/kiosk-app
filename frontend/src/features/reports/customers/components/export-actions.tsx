import { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import type { CustomerReportRow } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { exportToXlsx } from '@/lib/export'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExportActionsProps {
  data: CustomerReportRow[]
  companyName: string
}

const HEADERS = [
  { key: 'customerCode', label: 'Mã KH' },
  { key: 'customerName', label: 'Tên Chi Nhánh' },
  { key: 'companyName', label: 'Công Ty' },
  { key: 'totalRevenueDisplay', label: 'Tổng Tiền Hàng' },
  { key: 'unpaidAmountDisplay', label: 'Tiền Chưa Thu' },
]

export function ExportActions({ data, companyName }: ExportActionsProps) {
  const [open, setOpen] = useState(false)

  const handleExportSpreadsheet = () => {
    const rows = data.map((row) => ({
      ...row,
      totalRevenueDisplay: formatCurrency(row.totalRevenue),
      unpaidAmountDisplay: formatCurrency(row.unpaidAmount),
    }))
    exportToXlsx(rows, HEADERS, `bao-cao-khach-hang-${companyName}`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm'>
          <Download className='mr-2 h-4 w-4' />
          Xuất file
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleExportSpreadsheet}>
          <Download className='mr-2 h-4 w-4' />
          Xuất tập tin bảng tính để gửi đối tác
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className='mr-2 h-4 w-4' />
          Xuất tập tin tài liệu in
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
