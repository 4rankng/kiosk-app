import type { InvoiceDetail, BusinessEntity } from '@/types/api'
import { formatCurrency, formatNumber, formatDate } from '@/lib/format'

export function generateInvoiceHTML(invoice: InvoiceDetail, entity: BusinessEntity): string {
  const itemsRows = invoice.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #333;text-align:center">${i + 1}</td>
        <td style="padding:6px 10px;border:1px solid #333">${item.productName}</td>
        <td style="padding:6px 10px;border:1px solid #333;text-align:center">${item.unit}</td>
        <td style="padding:6px 10px;border:1px solid #333;text-align:right">${formatNumber(item.quantity)}</td>
        <td style="padding:6px 10px;border:1px solid #333;text-align:right">${formatCurrency(item.unitPrice)}</td>
        <td style="padding:6px 10px;border:1px solid #333;text-align:right">${formatCurrency(item.total)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn ${invoice.code}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: "Times New Roman", serif; font-size: 13px; color: #000; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .entity-name { font-size: 15px; font-weight: bold; text-transform: uppercase; }
    .entity-info { font-size: 12px; color: #444; margin-top: 2px; }
    .title { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; text-transform: uppercase; }
    .info-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f0f0f0; padding: 8px 10px; border: 1px solid #333; font-weight: bold; text-align: center; font-size: 12px; }
    .total-row td { font-weight: bold; border: 1px solid #333; padding: 8px 10px; }
    .signature { display: flex; justify-content: space-between; margin-top: 40px; }
    .signature-block { text-align: center; width: 40%; }
    .signature-label { font-weight: bold; margin-bottom: 60px; }
  </style>
</head>
<body>
  <div class="header">
    ${entity.headerLines.map((line) => `<div class="${line === entity.headerLines[0] ? 'entity-name' : 'entity-info'}">${line}</div>`).join('\n    ')}
  </div>

  <div class="title">HÓA ĐƠN BÁN HÀNG</div>

  <div class="info-row">
    <span><strong>Mã hóa đơn:</strong> ${invoice.code}</span>
    <span><strong>Ngày:</strong> ${formatDate(invoice.issuedAt)}</span>
  </div>
  <div class="info-row">
    <span><strong>Khách hàng:</strong> ${invoice.customerName}</span>
    <span></span>
  </div>

  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Tên hàng</th>
        <th>Đơn vị</th>
        <th>Số lượng</th>
        <th>Đơn giá</th>
        <th>Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
      <tr class="total-row">
        <td colspan="4"></td>
        <td style="text-align:right;padding:8px 10px;border:1px solid #333">Tổng cộng:</td>
        <td style="text-align:right;padding:8px 10px;border:1px solid #333">${formatCurrency(invoice.subtotal)}</td>
      </tr>
      ${invoice.discount > 0 ? `<tr class="total-row"><td colspan="4"></td><td style="text-align:right;padding:8px 10px;border:1px solid #333">Chiết khấu:</td><td style="text-align:right;padding:8px 10px;border:1px solid #333">${formatCurrency(invoice.discount)}</td></tr>` : ''}
      <tr class="total-row">
        <td colspan="4"></td>
        <td style="text-align:right;padding:8px 10px;border:1px solid #333;font-size:14px">Khách cần trả:</td>
        <td style="text-align:right;padding:8px 10px;border:1px solid #333;font-size:14px">${formatCurrency(invoice.total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="signature">
    <div class="signature-block">
      <div class="signature-label">Người mua hàng</div>
      <div>(Ký, ghi rõ họ tên)</div>
    </div>
    <div class="signature-block">
      <div class="signature-label">Người bán hàng</div>
      <div>(Ký, ghi rõ họ tên)</div>
    </div>
  </div>
</body>
</html>`
}
