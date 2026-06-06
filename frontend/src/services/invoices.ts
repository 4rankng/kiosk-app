import type { Invoice } from '@/types/invoice'
import { invoices } from '@/mock/invoices'
import { sleep } from '@/lib/utils'

export async function getInvoices(): Promise<Invoice[]> {
  await sleep(300)
  return [...invoices]
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  await sleep(200)
  return invoices.find((inv) => inv.id === id)
}

export async function markInvoiceAsPaid(id: string): Promise<Invoice> {
  await sleep(300)
  const inv = invoices.find((i) => i.id === id)
  if (!inv) throw new Error('Không tìm thấy hóa đơn.')
  inv.isPaid = true
  inv.paidAmount = inv.total
  return { ...inv }
}
