import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Printer } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { CustomerReportRow } from '@/services/reports'

function exportCSV(data: CustomerReportRow[], companyName: string) {
  const headers = ['Mã KH', 'Tên Chi Nhánh', 'Tổng Tiền Hàng', 'Tiền Chưa Thu']
  const rows = data.map((r) => [r.customerCode, r.customerName, r.totalRevenue, r.unpaidAmount])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bao-cao-khach-hang-${companyName}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportActions({ data, companyName }: { data: CustomerReportRow[]; companyName: string }) {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' onClick={() => exportCSV(data, companyName)} disabled={data.length === 0}>
        <FileSpreadsheet className='mr-2 h-4 w-4' />
        Xuất tập tin bảng tính để gửi đối tác
      </Button>
      <Button variant='outline' onClick={() => window.print()} disabled={data.length === 0}>
        <Printer className='mr-2 h-4 w-4' />
        Xuất tập tin tài liệu in
      </Button>
    </div>
  )
}
