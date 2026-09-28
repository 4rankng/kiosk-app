/**
 * Spreadsheet export.
 *
 * Uses ExcelJS rather than SheetJS (`xlsx`). SheetJS 0.18.5 is the last release
 * published to npm — the project moved to its own CDN — so its two open
 * advisories (prototype pollution and ReDoS, both in the *parse* path) have no
 * installable fix. This app only ever wrote files, never parsed untrusted
 * ones, so the practical exposure was low; but an unpatchable dependency in the
 * tree is a standing risk, and ExcelJS is maintained and audited.
 *
 * Dynamically imported so neither library lands in the initial bundle.
 */
export async function exportToXlsx(
  data: Record<string, string | number | null>[],
  headers: { key: string; label: string }[],
  filename: string
) {
  const ExcelJS = (await import('exceljs')).default

  const workbook = new ExcelJS.Workbook()
  // Times are written as local wall-clock time, matching the on-screen view.
  workbook.creator = 'TingTing Kiosk'
  workbook.created = new Date()
  const sheet = workbook.addWorksheet('Báo cáo')

  sheet.columns = headers.map((h) => ({
    header: h.label,
    key: h.key,
    width: Math.max(h.label.length + 2, ...data.map((r) => String(r[h.key] ?? '').length + 2), 12),
  }))

  for (const row of data) {
    sheet.addRow(headers.map((h) => row[h.key] ?? null))
  }

  // Bold the header row and freeze it so long reports stay readable.
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.alignment = { vertical: 'middle' }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  // Revoke on the next tick; revoking synchronously can cancel the download in
  // some browsers before it has started reading the blob.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function exportToCsv(
  data: Record<string, string | number | null>[],
  headers: { key: string; label: string }[],
  filename: string
) {
  // UTF-8 BOM so Excel opens Vietnamese diacritics correctly.
  const bom = '﻿'
  // Quote any field containing a delimiter, a quote, or a newline, and escape
  // embedded quotes by doubling them.
  const escape = (value: string) =>
    /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

  const headerLine = headers.map((h) => escape(h.label)).join(',')
  const rows = data.map((row) => headers.map((h) => escape(String(row[h.key] ?? ''))).join(','))
  const csv = bom + [headerLine, ...rows].join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
