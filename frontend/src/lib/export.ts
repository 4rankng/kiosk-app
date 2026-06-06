import * as XLSX from 'xlsx'

export function exportToXlsx(
  data: Record<string, any>[],
  headers: { key: string; label: string }[],
  filename: string
) {
  const rows = data.map((row) => {
    const obj: Record<string, any> = {}
    for (const h of headers) {
      obj[h.label] = row[h.key]
    }
    return obj
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo')

  // Auto-size columns
  const colWidths = headers.map((h) => ({
    wch: Math.max(
      h.label.length,
      ...rows.map((r) => String(r[h.label] ?? '').length + 2, 15)
    ),
  }))
  ws['!cols'] = colWidths

  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

export function exportToCsv(
  data: Record<string, any>[],
  headers: { key: string; label: string }[],
  filename: string
) {
  const bom = '﻿'
  const headerLine = headers.map((h) => h.label).join(',')
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = String(row[h.key] ?? '')
        return val.includes(',') || val.includes('"')
          ? `"${val.replace(/"/g, '""')}"`
          : val
      })
      .join(',')
  )
  const csv = bom + [headerLine, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
