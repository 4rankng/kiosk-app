import { Download01, Printer } from '@untitledui/icons'
import type { CustomerReportRow } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { exportToXlsx } from '@/lib/export'
import { Button } from '@/components/base/buttons/button'
import { Dropdown } from '@/components/base/dropdown/dropdown'

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
  const handleExportSpreadsheet = async () => {
    const rows = data.map((row) => ({
      ...row,
      totalRevenueDisplay: formatCurrency(row.totalRevenue),
      unpaidAmountDisplay: formatCurrency(row.unpaidAmount),
    }))
    await exportToXlsx(rows, HEADERS, `bao-cao-khach-hang-${companyName}`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dropdown.Root>
      <Button color='secondary' size='sm' iconLeading={Download01}>
        Xuất file
      </Button>
      <Dropdown.Popover placement='bottom end'>
        <Dropdown.Menu
          onAction={(key) => {
            if (key === 'xlsx') {
              void handleExportSpreadsheet()
            } else {
              handlePrint()
            }
          }}
        >
          <Dropdown.Item id='xlsx' icon={Download01}>
            Xuất tập tin bảng tính để gửi đối tác
          </Dropdown.Item>
          <Dropdown.Item id='print' icon={Printer}>
            Xuất tập tin tài liệu in
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  )
}
