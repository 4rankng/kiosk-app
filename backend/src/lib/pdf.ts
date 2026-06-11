/**
 * PDF helpers for invoice generation using pdfkit.
 *
 * Renders a single A5 invoice layout with:
 *   - Business-entity header (configurable per invoice)
 *   - Invoice metadata (code, date, customer)
 *   - Line items table
 *   - Subtotal / discount / total
 *   - Signature lines
 *
 * Usage:
 *   const buf = await renderInvoicePDF({ invoice, items, customer, businessEntity })
 *   res.headers.set('Content-Type', 'application/pdf')
 *   res.send(Buffer.from(buf))
 */
import PDFDocument from 'pdfkit'
import type { OrderItem } from '../db/schema/orders.js'

export interface InvoicePdfInput {
  invoiceCode: string
  issuedAt: string // ISO
  customer: { code: string; name: string; address?: string | null; phone?: string | null; taxId?: string | null }
  businessEntity: { name: string; headerLines: string[]; taxCode?: string | null; address?: string | null; phone?: string | null }
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  paidAmount: number
  notes?: string | null
}

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export async function renderInvoicePDF(input: InvoicePdfInput): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 36, info: { Title: input.invoiceCode, Author: input.businessEntity.name } })
    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c as Buffer))
    doc.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))))
    doc.on('error', reject)

    // -- Header (business entity) ---------------------------------------------
    doc.font('Helvetica-Bold').fontSize(16).text(input.businessEntity.name, { align: 'center' })
    doc.font('Helvetica').fontSize(9)
    for (const line of input.businessEntity.headerLines) {
      doc.text(line, { align: 'center' })
    }
    if (input.businessEntity.taxCode) doc.text(`MST: ${input.businessEntity.taxCode}`, { align: 'center' })
    doc.moveDown(0.5)

    // -- Title ---------------------------------------------------------------
    doc.moveTo(36, doc.y).lineTo(doc.page.width - 36, doc.y).stroke()
    doc.moveDown(0.4)
    doc.font('Helvetica-Bold').fontSize(14).text('HÓA ĐƠN BÁN HÀNG', { align: 'center' })
    doc.font('Helvetica').fontSize(9).text(`Số: ${input.invoiceCode}`, { align: 'center' })
    doc.text(`Ngày: ${fmtDate(input.issuedAt)}`, { align: 'center' })
    doc.moveDown(0.4)

    // -- Customer info -------------------------------------------------------
    doc.font('Helvetica-Bold').fontSize(10).text('Khách hàng:')
    doc.font('Helvetica').fontSize(9)
    doc.text(`Mã KH: ${input.customer.code}    Tên: ${input.customer.name}`)
    if (input.customer.address) doc.text(`Địa chỉ: ${input.customer.address}`)
    if (input.customer.phone) doc.text(`Điện thoại: ${input.customer.phone}`)
    if (input.customer.taxId) doc.text(`MST: ${input.customer.taxId}`)
    doc.moveDown(0.4)

    // -- Items table ---------------------------------------------------------
    const tableTop = doc.y
    const colX = { stt: 36, name: 70, unit: 240, qty: 290, price: 340, total: 420 }
    const colW = { stt: 34, name: 170, unit: 50, qty: 50, price: 80, total: 80 }
    const pageW = doc.page.width - 36

    doc.font('Helvetica-Bold').fontSize(9)
    doc.text('STT', colX.stt, tableTop, { width: colW.stt, align: 'center' })
    doc.text('Tên hàng', colX.name, tableTop, { width: colW.name })
    doc.text('ĐVT', colX.unit, tableTop, { width: colW.unit, align: 'center' })
    doc.text('SL', colX.qty, tableTop, { width: colW.qty, align: 'center' })
    doc.text('Đơn giá', colX.price, tableTop, { width: colW.price, align: 'right' })
    doc.text('Thành tiền', colX.total, tableTop, { width: colW.total, align: 'right' })
    doc.moveDown(0.2)
    doc.moveTo(36, doc.y).lineTo(pageW, doc.y).stroke()
    doc.moveDown(0.2)

    // Rows
    doc.font('Helvetica').fontSize(9)
    let stt = 1
    for (const it of input.items) {
      const y = doc.y
      doc.text(String(stt++), colX.stt, y, { width: colW.stt, align: 'center' })
      doc.text(it.productName, colX.name, y, { width: colW.name })
      doc.text(it.unit, colX.unit, y, { width: colW.unit, align: 'center' })
      doc.text(String(it.quantity), colX.qty, y, { width: colW.qty, align: 'center' })
      doc.text(fmtVND(Number(it.unitPrice)), colX.price, y, { width: colW.price, align: 'right' })
      doc.text(fmtVND(Number(it.totalPrice)), colX.total, y, { width: colW.total, align: 'right' })
      doc.moveDown(0.3)
    }
    doc.moveTo(36, doc.y).lineTo(pageW, doc.y).stroke()
    doc.moveDown(0.3)

    // -- Totals --------------------------------------------------------------
    const totalsX = pageW - 200
    const valX = pageW
    doc.font('Helvetica').fontSize(10)
    const totalRow = (label: string, value: number, bold = false) => {
      const y = doc.y
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').text(label, totalsX, y, { width: 100, align: 'right' })
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').text(fmtVND(value), valX, y, { width: 0, align: 'right' })
      doc.moveDown(0.2)
    }
    totalRow('Tổng tiền hàng:', input.subtotal)
    if (input.discount > 0) totalRow('Chiết khấu:', -input.discount)
    totalRow('Khách cần trả:', input.total, true)
    if (input.paidAmount > 0) totalRow('Đã thanh toán:', input.paidAmount)
    if (input.paidAmount < input.total) totalRow('Còn lại:', input.total - input.paidAmount)

    if (input.notes) {
      doc.moveDown(0.5)
      doc.font('Helvetica-Oblique').fontSize(9).text(`Ghi chú: ${input.notes}`)
    }

    // -- Signature -----------------------------------------------------------
    doc.moveDown(1.5)
    const sigY = doc.y
    doc.font('Helvetica-Bold').fontSize(10)
    doc.text('Người mua hàng', 36, sigY, { width: 200, align: 'center' })
    doc.text('Người bán hàng', pageW - 200, sigY, { width: 200, align: 'center' })
    doc.font('Helvetica-Oblique').fontSize(8)
    doc.text('(Ký, ghi rõ họ tên)', 36, sigY + 14, { width: 200, align: 'center' })
    doc.text('(Ký, ghi rõ họ tên)', pageW - 200, sigY + 14, { width: 200, align: 'center' })

    doc.end()
  })
}
